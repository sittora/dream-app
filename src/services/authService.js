import { db } from '../db';
import { users } from '../db/schema';
import { auth } from '../utils/auth';
import { eq } from 'drizzle-orm';
import { generateId } from '../utils/ids';

export const authService = {
  async register({ email, password, name }) {
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existingUser.length > 0) {
      throw new Error('User already exists');
    }

    // Hash password and create user
    const hashedPassword = await auth.hashPassword(password);
    const userId = generateId('user');

    const user = {
      id: userId,
      email,
      name,
      password: hashedPassword,
    };

    await db.insert(users).values(user);

    // Generate token
    const token = auth.generateToken(userId);

    return {
      user: { id: userId, email, name },
      token,
    };
  },

  async login({ email, password }) {
    // Find user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      throw new Error('Invalid credentials');
    }

    const user = result[0];

    // Verify password
    const isValid = await auth.comparePassword(password, user.password);
    if (!isValid) {
      throw new Error('Invalid credentials');
    }

    // Generate token
    const token = auth.generateToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
      token,
    };
  },

  async resetPassword({ email, token, newPassword }) {
    // Find user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      throw new Error('User not found');
    }

    const user = result[0];

    // Verify reset token
    if (user.resetToken !== token) {
      throw new Error('Invalid reset token');
    }

    // Check if token is expired
    if (user.resetTokenExpiry && new Date() > new Date(user.resetTokenExpiry)) {
      throw new Error('Reset token expired');
    }

    // Update password
    const hashedPassword = await auth.hashPassword(newPassword);
    await db
      .update(users)
      .set({
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      })
      .where(eq(users.id, user.id));

    return true;
  },

  async requestPasswordReset(email) {
    // Find user
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (result.length === 0) {
      throw new Error('User not found');
    }

    const user = result[0];

    // Generate reset token
    const resetToken = auth.generateResetToken();
    const resetTokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Save reset token
    await db
      .update(users)
      .set({
        resetToken,
        resetTokenExpiry,
      })
      .where(eq(users.id, user.id));

    // In a real application, you would send this token via email
    return resetToken;
  },
};
