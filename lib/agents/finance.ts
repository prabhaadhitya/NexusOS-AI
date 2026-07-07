import { getFinanceContext } from '../data/business-context';
import { callAgent, AGENT_MODELS } from '../openrouter';
import { FINANCE_PROMPT } from '../prompts/finance';
import { supabase } from '../supabase';

export async function run(businessId: string, userQuery: string): Promise<string> {
  const contextString = await getFinanceContext(supabase, businessId);
  const userMessage = `Business data:\n${contextString}\n\nOwner's question: ${userQuery}`;
  return callAgent({
    model: AGENT_MODELS.finance,
    systemPrompt: FINANCE_PROMPT,
    userMessage
  });
}
