import { getSupportContext } from '../data/business-context';
import { callAgent, AGENT_MODELS } from '../openrouter';
import { SUPPORT_PROMPT } from '../prompts/support';
import { supabase } from '../supabase';

export async function run(businessId: string, userQuery: string): Promise<string> {
  const contextString = await getSupportContext(supabase, businessId);
  const userMessage = `Business data:\n${contextString}\n\nOwner's question: ${userQuery}`;
  return callAgent({
    model: AGENT_MODELS.support,
    systemPrompt: SUPPORT_PROMPT,
    userMessage
  });
}
