import { z } from 'zod';

export const UserBaseSchema = z.object({
  username: z.string().min(3).max(32).regex(/^[a-zA-Z0-9_]+$/),
  displayName: z.string().min(1).max(64).optional(),
  aboutMe: z.string().max(500).optional(),
  age: z.number().int().min(13),
});

export const UserCreateSchema = UserBaseSchema.extend({
  email: z.string().email(),
});

export type UserBase = z.infer<typeof UserBaseSchema>;
export type UserCreate = z.infer<typeof UserCreateSchema>;
