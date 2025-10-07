import 'express';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      email: string;
      username?: string;
      role?: string;
    };
    validatedBody?: any; // Narrow per-route as needed
  }
}
