import { getInventoryContext } from '../data/business-context';
import { callAgent, AGENT_MODELS } from '../openrouter';
import { INVENTORY_PROMPT } from '../prompts/inventory';
import { supabase } from '../supabase';

export async function run(businessId: string, userQuery: string): Promise<string> {
  const contextString = await getInventoryContext(supabase, businessId);
  const userMessage = `Business data:\n${contextString}\n\nOwner's question: ${userQuery}`;
  return callAgent({
    model: AGENT_MODELS.inventory,
    systemPrompt: INVENTORY_PROMPT,
    userMessage
  });
}
