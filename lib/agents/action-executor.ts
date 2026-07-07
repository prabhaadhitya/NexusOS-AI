// MOCKED SEND: this writes to the notifications table to simulate the action. Real WhatsApp/email/SMS integration is a post-hackathon step — see README.
import { supabase } from '../supabase';

export type ActionItem = {
  type: string;
  channel: string;
  target: string;
  customer_id?: string | null;
  subject?: string | null;
  message: string;
  reason: string;
};

export async function executeActions(businessId: string, actions: ActionItem[]): Promise<{ executed: ActionItem[]; failed: ActionItem[] }> {
  const executed: ActionItem[] = [];
  const failed: ActionItem[] = [];

  for (const action of actions) {
    try {
      const { error } = await supabase.from('notifications').insert({
        business_id: businessId,
        customer_id: action.customer_id || null,
        channel: action.channel,
        subject: action.subject || null,
        message: action.message,
        status: 'sent', // mocked
        triggered_by: 'ceo_ai'
      });

      if (error) {
        console.error("Failed to insert notification:", error);
        failed.push(action);
      } else {
        executed.push(action);
      }
    } catch (err) {
      console.error("Exception executing action:", err);
      failed.push(action);
    }
  }

  return { executed, failed };
}
