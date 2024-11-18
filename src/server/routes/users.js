import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { db } from '../../db/index.js';
import { users, dreamPatterns } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const router = Router();

// Get current user profile
router.get('/profile', async (req, res) => {
  const { passwordHash, ...user } = req.user;
  res.json(user);
});

// Update user profile
router.put('/profile', async (req, res, next) => {
  try {
    const { password, ...updateData } = req.body;
    
    // If password is being updated, hash it
    if (password) {
      updateData.passwordHash = await bcrypt.hash(password, 12);
    }

    const [updatedUser] = await db.update(users)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id))
      .returning();

    const { passwordHash, ...user } = updatedUser;
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Update user preferences
router.put('/preferences', async (req, res, next) => {
  try {
    const [updatedUser] = await db.update(users)
      .set({
        preferencesJson: JSON.stringify(req.body),
        updatedAt: new Date(),
      })
      .where(eq(users.id, req.user.id))
      .returning();

    const { passwordHash, ...user } = updatedUser;
    res.json(user);
  } catch (error) {
    next(error);
  }
});

// Get user's dream patterns
router.get('/dream-patterns', async (req, res, next) => {
  try {
    const patterns = await db.select()
      .from(dreamPatterns)
      .where(eq(dreamPatterns.userId, req.user.id))
      .orderBy(dreamPatterns.lastOccurred);

    res.json(patterns);
  } catch (error) {
    next(error);
  }
});

// Delete account
router.delete('/account', async (req, res, next) => {
  try {
    await db.update(users)
      .set({
        status: 'deleted',
        deletedAt: new Date(),
      })
      .where(eq(users.id, req.user.id));

    res.clearCookie('token');
    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    next(error);
  }
});

export const usersRouter = router;
