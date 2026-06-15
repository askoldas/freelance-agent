import type { SupabaseClient } from "@supabase/supabase-js";
import type { NotificationStore } from "@/use-cases/notify-opportunity";

export class NotificationRepository implements NotificationStore {
  constructor(private readonly client: SupabaseClient) {}

  async reserveNotification(input: {
    opportunityId: string;
    channel: "telegram";
    recipient: string;
  }): Promise<boolean> {
    const { error } = await this.client.from("notification_states").insert({
      opportunity_id: input.opportunityId,
      channel: input.channel,
      recipient: input.recipient,
      status: "pending"
    });

    if (!error) {
      return true;
    }

    if (error.code === "23505") {
      return false;
    }

    throw error;
  }

  async markNotificationSent(input: {
    opportunityId: string;
    channel: "telegram";
    recipient: string;
    providerMessageId?: string;
  }): Promise<void> {
    const { error } = await this.client
      .from("notification_states")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_message_id: input.providerMessageId,
        updated_at: new Date().toISOString()
      })
      .eq("opportunity_id", input.opportunityId)
      .eq("channel", input.channel)
      .eq("recipient", input.recipient);

    if (error) {
      throw error;
    }
  }

  async markNotificationFailed(input: {
    opportunityId: string;
    channel: "telegram";
    recipient: string;
    failureReason: string;
  }): Promise<void> {
    const { error } = await this.client
      .from("notification_states")
      .update({
        status: "failed",
        failure_reason: input.failureReason,
        updated_at: new Date().toISOString()
      })
      .eq("opportunity_id", input.opportunityId)
      .eq("channel", input.channel)
      .eq("recipient", input.recipient);

    if (error) {
      throw error;
    }
  }
}
