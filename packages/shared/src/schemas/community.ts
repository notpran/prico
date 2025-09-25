import { z } from 'zod';

export const CommunityCreateSchema = z.object({
  name: z.string().min(3).max(64),
  description: z.string().max(500).optional(),
  visibility: z.enum(['public', 'private']).default('public'),
});

export type CommunityCreate = z.infer<typeof CommunityCreateSchema>;
