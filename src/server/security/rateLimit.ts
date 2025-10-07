import { RateLimiterMemory } from 'rate-limiter-flexible';

/**
 * Advanced rate limiting with brute-force protection
 * Implements graduated cooldown and account locking
 */

// Configuration from environment
const RATE_LIMIT_CONFIG = {
  // Basic rate limits
  loginAttemptsPerMinute: parseInt(process.env.LOGIN_RATE_LIMIT_MIN || '5'),
  loginAttemptsPerDay: parseInt(process.env.LOGIN_RATE_LIMIT_DAY || '50'),
  registrationAttemptsPerMinute: parseInt(process.env.REG_RATE_LIMIT_MIN || '3'),
  
  // Brute force protection
  accountLockThreshold: parseInt(process.env.ACCOUNT_LOCK_THRESHOLD || '10'),
  accountLockDurationMs: parseInt(process.env.ACCOUNT_LOCK_DURATION_MS || '3600000'), // 1 hour
  
  // Progressive delay
  progressiveDelayMs: parseInt(process.env.PROGRESSIVE_DELAY_MS || '1000'),
} as const;

// Rate limiters for different scenarios
class SecurityRateLimiters {
  private loginByIp: RateLimiterMemory;
  private loginByAccount: RateLimiterMemory;
  private registrationByIp: RateLimiterMemory;
  private accountLock: RateLimiterMemory;
  private consecutiveFailures: Map<string, number> = new Map();

  constructor() {
    // Login attempts by IP (per minute)
    this.loginByIp = new RateLimiterMemory({
      points: RATE_LIMIT_CONFIG.loginAttemptsPerMinute,
      duration: 60, // 1 minute
      blockDuration: 60, // Block for 1 minute
    });

    // Login attempts by account (per day)
    this.loginByAccount = new RateLimiterMemory({
      points: RATE_LIMIT_CONFIG.loginAttemptsPerDay,
      duration: 86400, // 24 hours
      blockDuration: 3600, // Block for 1 hour initially
    });

    // Registration by IP
    this.registrationByIp = new RateLimiterMemory({
      points: RATE_LIMIT_CONFIG.registrationAttemptsPerMinute,
      duration: 60, // 1 minute
      blockDuration: 300, // Block for 5 minutes
    });

    // Account lock for repeated failures
    this.accountLock = new RateLimiterMemory({
      points: RATE_LIMIT_CONFIG.accountLockThreshold,
      duration: RATE_LIMIT_CONFIG.accountLockDurationMs / 1000,
      blockDuration: RATE_LIMIT_CONFIG.accountLockDurationMs / 1000,
    });
  }

  /**
   * Check if login attempt is allowed
   */
  async checkLoginAttempt(ip: string, accountKey: string): Promise<{
    allowed: boolean;
    msBeforeNext?: number;
    reason?: string;
  }> {
    try {
      // Check IP-based rate limit
      await this.loginByIp.consume(ip);
      
      // Check account-based rate limit
      await this.loginByAccount.consume(accountKey);
      
      // Check if account is locked due to repeated failures
      await this.accountLock.consume(accountKey);
      
      return { allowed: true };
    } catch (rateLimiterRes: any) {
      if (rateLimiterRes instanceof Error) {
        throw rateLimiterRes;
      }

      const msBeforeNext = rateLimiterRes.msBeforeNext;
      let reason = 'Rate limit exceeded';
      
      if (rateLimiterRes.remainingPoints === 0) {
        reason = 'Too many attempts';
      }

      return {
        allowed: false,
        msBeforeNext,
        reason,
      };
    }
  }

  /**
   * Record failed login attempt with progressive penalties
   */
  async recordFailedLogin(ip: string, accountKey: string): Promise<void> {
    // Increment consecutive failures for this account
    const failures = (this.consecutiveFailures.get(accountKey) || 0) + 1;
    this.consecutiveFailures.set(accountKey, failures);

    // Record failure in account lock tracker
    try {
      await this.accountLock.consume(accountKey);
    } catch (error) {
      // Account is now locked
    }

    // Apply progressive delay based on consecutive failures
    const delayMs = Math.min(
      RATE_LIMIT_CONFIG.progressiveDelayMs * Math.pow(2, failures - 1),
      30000 // Max 30 seconds
    );

    if (delayMs > 0) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  /**
   * Record successful login (reset failure counters)
   */
  async recordSuccessfulLogin(accountKey: string): Promise<void> {
    // Reset consecutive failures
    this.consecutiveFailures.delete(accountKey);
    
    // Reset account lock counter
    await this.accountLock.delete(accountKey);
  }

  /**
   * Check registration rate limit
   */
  async checkRegistrationAttempt(ip: string): Promise<{
    allowed: boolean;
    msBeforeNext?: number;
  }> {
    try {
      await this.registrationByIp.consume(ip);
      return { allowed: true };
    } catch (rateLimiterRes: any) {
      if (rateLimiterRes instanceof Error) {
        throw rateLimiterRes;
      }

      return {
        allowed: false,
        msBeforeNext: rateLimiterRes.msBeforeNext,
      };
    }
  }

  /**
   * Check if account is currently locked
   */
  async isAccountLocked(accountKey: string): Promise<{
    locked: boolean;
    msBeforeNext?: number;
  }> {
    try {
      const res = await this.accountLock.get(accountKey);
      if (res && res.remainingPoints === 0) {
        return {
          locked: true,
          msBeforeNext: res.msBeforeNext,
        };
      }
      return { locked: false };
    } catch (error) {
      return { locked: false };
    }
  }

  /**
   * Admin function to unlock account (TODO: integrate with admin interface)
   */
  async unlockAccount(accountKey: string): Promise<void> {
    await this.accountLock.delete(accountKey);
    this.consecutiveFailures.delete(accountKey);
  }

  /**
   * Get remaining attempts info for monitoring
   */
  async getRemainingAttempts(ip: string, accountKey: string): Promise<{
    ipAttempts: number;
    accountAttempts: number;
    accountLocked: boolean;
  }> {
    const [ipRes, accountRes, lockRes] = await Promise.all([
      this.loginByIp.get(ip),
      this.loginByAccount.get(accountKey),
      this.accountLock.get(accountKey),
    ]);

    return {
      ipAttempts: ipRes ? ipRes.remainingPoints : RATE_LIMIT_CONFIG.loginAttemptsPerMinute,
      accountAttempts: accountRes ? accountRes.remainingPoints : RATE_LIMIT_CONFIG.loginAttemptsPerDay,
      accountLocked: lockRes ? lockRes.remainingPoints === 0 : false,
    };
  }
}

// Export singleton instance
export const rateLimiters = new SecurityRateLimiters();

/**
 * Middleware factory for different rate limiting scenarios
 */
export function createRateLimitMiddleware(type: 'login' | 'registration' | '2fa') {
  return async (req: any, res: any, next: any) => {
    const ip = req.ip || req.connection.remoteAddress || 'unknown';
    const accountKey = req.body?.email || req.user?.id || ip;

    try {
      let result;
      
      switch (type) {
        case 'login':
          result = await rateLimiters.checkLoginAttempt(ip, accountKey);
          break;
        case 'registration':
          result = await rateLimiters.checkRegistrationAttempt(ip);
          break;
        case '2fa':
          // Use same limits as login for 2FA attempts
          result = await rateLimiters.checkLoginAttempt(ip, accountKey);
          break;
        default:
          throw new Error('Invalid rate limit type');
      }

      if (!result.allowed) {
        return res.status(429).json({
          error: 'Rate limit exceeded',
          details: 'Too many attempts',
          retryAfter: Math.ceil((result.msBeforeNext || 0) / 1000),
        });
      }

      next();
    } catch (error) {
      // Swallow rate limiter internal error but log via structured logger
      try {
  const { logger } = await import('../../lib/logger.server.js');
        logger.warn({ error }, 'Rate limiting error');
      } catch (e) {
        // Intentionally ignored: optional logger import failure should not block request flow.
        // TODO: consider debug-level instrumentation if recurring.
      }
      // Don't block on rate limiter errors
      next();
    }
  };
}