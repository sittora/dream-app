interface RateLimitEntry {
  count: number;
  timestamp: number;
}

class RateLimiter {
  private limits: Map<string, RateLimitEntry> = new Map();
  private readonly maxAttempts: number;
  private readonly windowMs: number;

  constructor(maxAttempts: number, windowMs: number) {
    this.maxAttempts = maxAttempts;
    this.windowMs = windowMs;
  }

  async checkLimit(key: string): Promise<void> {
    const now = Date.now();
    const entry = this.limits.get(key);

    if (!entry) {
      this.limits.set(key, { count: 1, timestamp: now });
      return;
    }

    if (now - entry.timestamp > this.windowMs) {
      // Reset if window has passed
      this.limits.set(key, { count: 1, timestamp: now });
      return;
    }

    if (entry.count >= this.maxAttempts) {
      throw new Error('Too many attempts. Please try again later.');
    }

    entry.count++;
    this.limits.set(key, entry);
  }

  clearExpired(): void {
    const now = Date.now();
    for (const [key, entry] of this.limits.entries()) {
      if (now - entry.timestamp > this.windowMs) {
        this.limits.delete(key);
      }
    }
  }
}

// Create rate limiter instance with 5 attempts per 60 seconds
const rateLimiter = new RateLimiter(5, 60 * 1000);

// Clean up expired entries every minute
setInterval(() => rateLimiter.clearExpired(), 60 * 1000);

export const rateLimit = {
  async checkLimit(key: string): Promise<void> {
    try {
      await rateLimiter.checkLimit(key);
    } catch (error) {
      throw new Error('Too many attempts. Please try again later.');
    }
  }
};