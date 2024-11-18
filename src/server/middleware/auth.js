import { jwtVerify } from 'jose';
import { db } from '../../db/index.js';
import { users } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
);

export async function authenticate(req, res, next) {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ 
        status: 'error',
        code: 'AUTH_REQUIRED',
        message: 'Authentication required' 
      });
    }

    let payload;
    try {
      const result = await jwtVerify(token, JWT_SECRET);
      payload = result.payload;
    } catch (jwtError) {
      return res.status(401).json({ 
        status: 'error',
        code: 'INVALID_TOKEN',
        message: 'Invalid or expired token' 
      });
    }
    
    // Get user from database
    const user = await db.select()
      .from(users)
      .where(eq(users.id, payload.sub))
      .limit(1);

    if (!user.length) {
      return res.status(401).json({ 
        status: 'error',
        code: 'USER_NOT_FOUND',
        message: 'User not found' 
      });
    }

    // Check if user is active
    if (user[0].status !== 'active') {
      return res.status(403).json({ 
        status: 'error',
        code: 'ACCOUNT_INACTIVE',
        message: 'Account is not active' 
      });
    }

    // Attach user to request
    req.user = user[0];
    next();
  } catch (error) {
    console.error('Auth Error:', error);
    res.status(500).json({ 
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Internal server error' 
    });
  }
}

export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Insufficient permissions' });
    }

    next();
  };
}
