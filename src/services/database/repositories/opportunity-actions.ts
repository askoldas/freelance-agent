import type { SupabaseClient } from "@supabase/supabase-js";
import type { TelegramActionStore } from "@/use-cases/handle-telegram-update";

export class OpportunityActionRepository implements TelegramActionStore {
  constructor(private readonly client: SupabaseClient) {}

  async saveOpportunity(opportunityId: string): Promise<void> {
    await this.updateStatus(opportunityId, "saved");
  }

  async rejectOpportunity(opportunityId: string): Promise<void> {
    await this.updateStatus(opportunityId, "rejected");
  }

  private async updateStatus(opportunityId: string, status: "saved" | "rejected") {
    const { error } = await this.client
      .from("opportunities")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", opportunityId);

    if (error) {
      throw error;
    }
  }
}
