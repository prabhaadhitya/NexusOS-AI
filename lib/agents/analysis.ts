import { getAnalysisContext } from '../data/business-context';
import { callAgent, AGENT_MODELS } from '../openrouter';
import { ANALYSIS_PROMPT } from '../prompts/analysis';
import { supabase } from '../supabase';

export async function run(businessId: string, userQuery: string): Promise<string> {
  const contextString = await getAnalysisContext(supabase, businessId);
  const userMessage = `Business data:\n${contextString}\n\nOwner's question: ${userQuery}`;
  return callAgent({
    model: AGENT_MODELS.analysis,
    systemPrompt: ANALYSIS_PROMPT,
    userMessage
  });
}
