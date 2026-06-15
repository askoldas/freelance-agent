import { z } from "zod";

export const telegramUserSchema = z.object({
  id: z.number(),
  is_bot: z.boolean().optional(),
  first_name: z.string().optional(),
  username: z.string().optional()
});

export const telegramMessageSchema = z.object({
  message_id: z.number(),
  from: telegramUserSchema.optional(),
  chat: z.object({
    id: z.number(),
    type: z.string()
  }),
  text: z.string().optional()
});

export const telegramCallbackQuerySchema = z.object({
  id: z.string(),
  from: telegramUserSchema,
  message: telegramMessageSchema.optional(),
  data: z.string().min(1)
});

export const telegramUpdateSchema = z.object({
  update_id: z.number(),
  message: telegramMessageSchema.optional(),
  callback_query: telegramCallbackQuerySchema.optional()
});

export const telegramActionSchema = z.enum(["save", "reject", "details", "proposal"]);

export const telegramCallbackDataSchema = z.object({
  action: telegramActionSchema,
  opportunityId: z.uuid()
});

export type TelegramUpdate = z.infer<typeof telegramUpdateSchema>;
export type TelegramCallbackData = z.infer<typeof telegramCallbackDataSchema>;
