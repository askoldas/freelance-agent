import { z } from "zod";

export const agentTypeSchema = z.enum(["freelance", "jobs"]);

export type AgentType = z.infer<typeof agentTypeSchema>;
