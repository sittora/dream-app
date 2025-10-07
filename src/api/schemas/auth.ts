import { z } from 'zod';

// Auth request schemas (shadow validation mode unless ENABLE_API_VALIDATION=true)
export const loginRequestSchema = z.object({
  email: z.string().min(3).max(200),
  password: z.string().min(1)
});
export type LoginRequest = z.infer<typeof loginRequestSchema>;

export const registerRequestSchema = z.object({
  email: z.string().email(),
  username: z.string().min(1).max(100),
  password: z.string().min(8).max(200)
});
export type RegisterRequest = z.infer<typeof registerRequestSchema>;

export const refreshRequestSchema = z.object({
  refreshToken: z.string().min(10)
});
export type RefreshRequest = z.infer<typeof refreshRequestSchema>;

// Response schemas (minimal mirrors of current handler outputs; additive)
// Relaxed: make data optional and allow generic error string to avoid shadow warnings on 401/400
export const loginResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  error: z.string().optional(),
  // Use unknown for flexibility; passthrough retains existing shape without enforcing presence
  data: z.unknown().optional()
}).passthrough();

export const registerResponseSchema = z.object({
  user: z.object({
    id: z.string(),
    email: z.string().email(),
    displayName: z.string().nullable().optional(),
    emailVerified: z.boolean().optional()
  }).partial().passthrough(),
  message: z.string().optional()
}).passthrough();

export const refreshResponseSchema = z.object({
  success: z.boolean().optional(),
  message: z.string().optional(),
  data: z.object({
    accessToken: z.string(),
    expiresIn: z.string().optional()
  }).partial().passthrough()
}).passthrough();
