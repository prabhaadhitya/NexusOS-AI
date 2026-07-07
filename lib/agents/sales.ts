import { getSalesContext } from '../data/business-context';
import { callAgent, AGENT_MODELS } from '../openrouter';
import { SALES_PROMPT } from '../prompts/sales';
import { supabase } from '../supabase';

export async function run(businessId: string, userQuery: string): Promise<string> {
  const contextString = await getSalesContext(supabase, businessId);
  const userMessage = `Business data:\n${contextString}\n\nOwner's question: ${userQuery}`;
  return callAgent({
    model: AGENT_MODELS.sales,
    systemPrompt: SALES_PROMPT,
    userMessage
  });
}
