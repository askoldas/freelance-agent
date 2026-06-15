import type { SupabaseClient } from "@supabase/supabase-js";
import type { JobNotificationStore } from "@/use-cases/notify-job-vacancy";

export class JobNotificationRepository implements JobNotificationStore {
  constructor(private readonly client: SupabaseClient) {}

  async reserveJobNotification(input: {
    jobVacancyId: string;
    channel: "telegram";
    recipient: string;
  }): Promise<boolean> {
    const { error } = await this.client.from("job_notification_states").insert({
      job_vacancy_id: input.jobVacancyId,
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

  async markJobNotificationSent(input: {
    jobVacancyId: string;
    channel: "telegram";
    recipient: string;
    providerMessageId?: string;
  }): Promise<void> {
    const { error } = await this.client
      .from("job_notification_states")
      .update({
        status: "sent",
        sent_at: new Date().toISOString(),
        provider_message_id: input.providerMessageId,
        updated_at: new Date().toISOString()
      })
      .eq("job_vacancy_id", input.jobVacancyId)
      .eq("channel", input.channel)
      .eq("recipient", input.recipient);

    if (error) {
      throw error;
    }
  }

  async markJobNotificationFailed(input: {
    jobVacancyId: string;
    channel: "telegram";
    recipient: string;
    failureReason: string;
  }): Promise<void> {
    const { error } = await this.client
      .from("job_notification_states")
      .update({
        status: "failed",
        failure_reason: input.failureReason,
        updated_at: new Date().toISOString()
      })
      .eq("job_vacancy_id", input.jobVacancyId)
      .eq("channel", input.channel)
      .eq("recipient", input.recipient);

    if (error) {
      throw error;
    }
  }
}
