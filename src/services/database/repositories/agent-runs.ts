import type { SupabaseClient } from "@supabase/supabase-js";
import type { AgentType } from "@/domain/agents/schema";
import type { AgentRunWriter } from "@/use-cases/run-project-search";

export class AgentRunRepository implements AgentRunWriter {
  constructor(private readonly client: SupabaseClient) {}

  async startRun(input: {
    runType: "search";
    agentType?: AgentType;
    correlationId: string;
    metadata?: Record<string, unknown>;
  }): Promise<string> {
    const { data, error } = await this.client
      .from("agent_runs")
      .insert({
        run_type: input.runType,
        agent_type: input.agentType ?? "freelance",
        correlation_id: input.correlationId,
        status: "running",
        metadata: input.metadata ?? {}
      })
      .select("id")
      .single();

    if (error) {
      throw error;
    }

    return data.id as string;
  }

  async finishRun(
    runId: string,
    input: {
      status: "completed" | "partial_failure" | "failed";
      metadata?: Record<string, unknown>;
      errorCode?: string;
      errorMessageRedacted?: string;
    }
  ): Promise<void> {
    const { error } = await this.client
      .from("agent_runs")
      .update({
        status: input.status,
        finished_at: new Date().toISOString(),
        metadata: input.metadata ?? {},
        error_code: input.errorCode,
        error_message_redacted: input.errorMessageRedacted
      })
      .eq("id", runId);

    if (error) {
      throw error;
    }
  }
}
