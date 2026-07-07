import { supabase } from '../supabase';
import { callAgent, AGENT_MODELS, InsufficientCreditsError } from '../openrouter';
import { CEO_ROUTER_PROMPT } from '../prompts/ceo-router';
import { CEO_SYNTHESIZER_PROMPT } from '../prompts/ceo-synthesizer';
import { CEO_ACTION_PLANNER_PROMPT } from '../prompts/ceo-action-planner';
import { CEO_CONVERSATIONAL_PROMPT } from '../prompts/ceo-conversational';
import { executeActions, ActionItem } from './action-executor';

import * as salesAgent from './sales';
import * as financeAgent from './finance';
import * as inventoryAgent from './inventory';
import * as marketingAgent from './marketing';
import * as supportAgent from './support';
import * as analysisAgent from './analysis';

export type OrchestrationEvent = 
  | { type: "agents_selected"; agents: string[] }
  | { type: "agent_complete"; agent: string }
  | { type: "final"; finalResponse: string; agentsInvoked: string[]; agentResponses: Record<string, string> }
  | { type: "actions_taken"; executed: ActionItem[]; failed: ActionItem[] };

const AGENT_MODULES: Record<string, { run: (bId: string, query: string) => Promise<string> }> = {
  sales: salesAgent,
  finance: financeAgent,
  inventory: inventoryAgent,
  marketing: marketingAgent,
  support: supportAgent,
  analysis: analysisAgent,
};

export async function orchestrate(
  businessId: string, 
  userQuery: string,
  onEvent?: (event: OrchestrationEvent) => void
): Promise<{
  finalResponse: string;
  agentsInvoked: string[];
  agentResponses: Record<string, string>;
}> {
  // Step 1 & 2: Call CEO router to determine which agents are needed, with 1 retry for network/JSON issues
  let agentsNeeded: string[] = ["analysis"];
  let mode = "business_query";
  
  for (let attempt = 1; attempt <= 2; attempt++) {
    try {
      const routerOutput = await callAgent({
        model: AGENT_MODELS.ceo,
        systemPrompt: CEO_ROUTER_PROMPT,
        userMessage: userQuery,
        temperature: 0.1
      });
      
      const cleanOutput = routerOutput.replace(/```json/gi, '').replace(/```/gi, '').trim();
      if (cleanOutput) {
        const parsed = JSON.parse(cleanOutput);
        if (parsed.mode) {
          mode = parsed.mode;
        }
        if (Array.isArray(parsed.agents_needed)) {
          agentsNeeded = parsed.agents_needed;
        }
        break; // Success, exit retry loop
      }
    } catch (err) {
      if (err instanceof InsufficientCreditsError) {
        const fallback = "Our AI workforce is temporarily unavailable — please try again shortly";
        if (onEvent) {
          onEvent({ type: "final", finalResponse: fallback, agentsInvoked: [], agentResponses: {} });
        }
        return { finalResponse: fallback, agentsInvoked: [], agentResponses: {} };
      }
      console.warn(`Router attempt ${attempt} failed:`, err);
    }
  }

  if (mode === "conversational") {
    if (onEvent) {
      onEvent({ type: "agents_selected", agents: [] });
    }
    let finalResponse = "";
    try {
      finalResponse = await callAgent({
        model: AGENT_MODELS.ceo,
        systemPrompt: CEO_CONVERSATIONAL_PROMPT,
        userMessage: userQuery,
        temperature: 0.7
      });
    } catch (err) {
      console.error("Conversational response failed:", err);
      finalResponse = "Hello! I am currently experiencing high network traffic on the free tier, but I am here and ready to help you analyze your business once the connection stabilizes.";
    }
    if (onEvent) {
      onEvent({ type: "final", finalResponse, agentsInvoked: [], agentResponses: {} });
    }
    return { finalResponse, agentsInvoked: [], agentResponses: {} };
  }

  // Filter only valid configured agents
  const validAgents = agentsNeeded.filter((a) => !!AGENT_MODULES[a]);
  if (validAgents.length === 0) {
    validAgents.push("analysis"); // Safety fallback
  }

  if (onEvent) {
    onEvent({ type: "agents_selected", agents: validAgents });
  }

  // Step 3 & 4: Call needed agents in PARALLEL using their module run() function
  const agentPromises = validAgents.map(async (agentName) => {
    const agentModule = AGENT_MODULES[agentName];
    const response = await agentModule.run(businessId, userQuery);
    if (onEvent) {
      onEvent({ type: "agent_complete", agent: agentName });
    }
    return { agentName, response };
  });

  const settledResults = await Promise.allSettled(agentPromises);

  // Step 5: For any agent that failed, exclude it from synthesis but log which one failed
  const agentResponses: Record<string, string> = {};
  for (const result of settledResults) {
    if (result.status === 'fulfilled') {
      agentResponses[result.value.agentName] = result.value.response;
    } else {
      console.error("Agent failed during parallel execution:", result.reason);
    }
  }

  // Handle case where all agents fail
  const allAgentsFailed = Object.keys(agentResponses).length === 0;

  // Step 6: Call CEO synthesizer with the original query + labeled agent responses
  let synthesisInput = "";
  if (allAgentsFailed) {
    synthesisInput = `User Query: "${userQuery}"\n\nNo department data could be retrieved. Provide a brief honest response to the owner explaining that live data is temporarily unavailable, without mentioning technical/API details.`;
  } else {
    synthesisInput = `User Query: "${userQuery}"\n\n`;
    for (const [agent, response] of Object.entries(agentResponses)) {
      synthesisInput += `${agent.toUpperCase()} AI SAID:\n${response}\n\n`;
    }
  }

  let finalResponse = "";
  try {
    finalResponse = await callAgent({
      model: AGENT_MODELS.ceo,
      systemPrompt: CEO_SYNTHESIZER_PROMPT,
      userMessage: synthesisInput,
      temperature: 0.5
    });
  } catch (err) {
    console.error("Synthesizer failed:", err);
    finalResponse = "Error: The CEO synthesizer failed to generate a response. Please try again later.";
  }

  // Step 7: (Omitted - no orchestration_logs table requested)

  // Step 8: Return the final output payload
  const result = {
    finalResponse,
    agentsInvoked: validAgents,
    agentResponses
  };

  if (onEvent) {
    onEvent({ type: "final", ...result });
  }

  // Step 9: Action Planning
  try {
    const plannerInput = `Original Query: "${userQuery}"\n\nCEO Response:\n${finalResponse}`;
    const plannerOutput = await callAgent({
      model: AGENT_MODELS.ceo,
      systemPrompt: CEO_ACTION_PLANNER_PROMPT,
      userMessage: plannerInput,
      temperature: 0.1
    });

    let actionsToExecute: ActionItem[] = [];
    try {
      const cleanOutput = plannerOutput.replace(/```json/gi, '').replace(/```/gi, '').trim();
      if (cleanOutput) {
        const parsed = JSON.parse(cleanOutput);
        if (Array.isArray(parsed.actions)) {
          actionsToExecute = parsed.actions;
        }
      }
    } catch (err) {
      console.warn("Failed to parse action planner JSON:", plannerOutput, err);
    }

    if (actionsToExecute.length > 0) {
      const { executed, failed } = await executeActions(businessId, actionsToExecute);
      if (onEvent) {
        onEvent({ type: "actions_taken", executed, failed });
      }
    } else {
      if (onEvent) {
        onEvent({ type: "actions_taken", executed: [], failed: [] });
      }
    }
  } catch (err) {
    console.error("Action planner failed:", err);
    if (onEvent) {
      onEvent({ type: "actions_taken", executed: [], failed: [] });
    }
  }

  return result;
}
