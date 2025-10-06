/**
 * Simple in-memory rate limiter for registration attempts
 */
interface RateLimitEntry {
  count: number;
  resetTime: number;
}

class InMemoryRateLimiter {
  private attempts = new Map<string, RateLimitEntry>();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number = 5, windowMs: number = 15 * 60 * 1000) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => this.cleanup(), 5 * 60 * 1000);
  }

  /**
   * Check if an IP is rate limited
   */
  isRateLimited(ip: string): boolean {
    const now = Date.now();
    const entry = this.attempts.get(ip);

    if (!entry || now >= entry.resetTime) {
      return false;
    }

    return entry.count >= this.maxAttempts;
  }

  /**
   * Record an attempt for an IP
   */
  recordAttempt(ip: string): void {
    const now = Date.now();
    const entry = this.attempts.get(ip);

    if (!entry || now >= entry.resetTime) {
      this.attempts.set(ip, {
        count: 1,
        resetTime: now + this.windowMs,
      });
    } else {
      entry.count++;
    }
  }

  /**
   * Get remaining time until rate limit resets (in seconds)
   */
  getResetTime(ip: string): number {
    const entry = this.attempts.get(ip);
    if (!entry) return 0;
    
    const remaining = entry.resetTime - Date.now();
    return Math.max(0, Math.ceil(remaining / 1000));
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [ip, entry] of this.attempts.entries()) {
      if (now >= entry.resetTime) {
        this.attempts.delete(ip);
      }
    }
  }
}

// Export singleton instance
export const registrationRateLimiter = new InMemoryRateLimiter(5, 15 * 60 * 1000); // 5 attempts per 15 minutes