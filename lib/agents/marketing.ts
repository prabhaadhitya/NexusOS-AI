import { getMarketingContext } from '../data/business-context';
import { callAgent, AGENT_MODELS } from '../openrouter';
import { MARKETING_PROMPT } from '../prompts/marketing';
import { supabase } from '../supabase';

export async function run(businessId: string, userQuery: string): Promise<string> {
  const contextString = await getMarketingContext(supabase, businessId);
  const userMessage = `Business data:\n${contextString}\n\nOwner's question: ${userQuery}`;
  return callAgent({
    model: AGENT_MODELS.marketing,
    systemPrompt: MARKETING_PROMPT,
    userMessage
  });
}
