/**
 * Extended Express types for authentication and security
 */


declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role?: string;
        [key: string]: any;
      };
      
      // Session data
      session?: {
        id: string;
        userId?: string;
        challengeId?: string;
        [key: string]: any;
      };
      
      // Rate limiting info
      rateLimitInfo?: {
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

export {};