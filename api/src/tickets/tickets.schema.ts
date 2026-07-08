import { z } from 'zod';

const ticketStatusSchema = z.enum(['open', 'in_progress', 'resolved', 'closed']);

export const ticketIdParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export const listTicketsQuerySchema = z.object({
  status: ticketStatusSchema.optional(),
  assigneeId: z
    .union([z.literal('unassigned'), z.coerce.number().int().positive()])
    .optional(),
});

export type ListTicketsQuery = z.infer<typeof listTicketsQuerySchema>;

export const createTicketSchema = z.object({
  subject: z.string().min(1).max(200),
  description: z.string().min(1),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  assigneeId: z.number().int().positive().nullable().default(null),
  slaHours: z.number().int().positive().default(8),
});

export const updateStatusSchema = z.object({
  status: ticketStatusSchema,
});
