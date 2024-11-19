const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { z } = require('zod');

// Environment variables (should be in .env file)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/),
  name: z.string().min(2),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'You must accept the terms and conditions',
  }),
});

class AuthService {
  constructor(userModel) {
    this.userModel = userModel;
  }

  async register(userData) {
    try {
      // Validate input
      const validatedData = registerSchema.parse(userData);

      // Check if user already exists
      const existingUser = await this.userModel.findOne({ email: validatedData.email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      // Hash password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(validatedData.password, salt);

      // Create user
      const user = await this.userModel.create({
        ...validatedData,
        password: hashedPassword,
      });

      // Generate token
      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async login({ email, password }) {
    try {
      // Validate input
      const validatedData = loginSchema.parse({ email, password });

      // Find user
      const user = await this.userModel.findOne({ email: validatedData.email });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(validatedData.password, user.password);
      if (!isValidPassword) {
        throw new Error('Invalid credentials');
      }

      // Generate token
      const token = this.generateToken(user);

      return {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
        },
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async resetPasswordRequest(email) {
    try {
      const user = await this.userModel.findOne({ email });
      if (!user) {
        throw new Error('User not found');
      }

      // Generate reset token
      const resetToken = jwt.sign(
        { userId: user.id },
        JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Save reset token to user (implement this in your user model)
      user.resetToken = resetToken;
      user.resetTokenExpiry = Date.now() + 3600000; // 1 hour
      await user.save();

      // Send email with reset link (implement email service)
      // await emailService.sendPasswordReset(email, resetToken);

      return { message: 'Password reset email sent' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  async resetPassword(token, newPassword) {
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Find user
      const user = await this.userModel.findOne({
        _id: decoded.userId,
        resetToken: token,
        resetTokenExpiry: { $gt: Date.now() },
      });

      if (!user) {
        throw new Error('Invalid or expired reset token');
      }

      // Hash new password
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash(newPassword, salt);

      // Update password and clear reset token
      user.password = hashedPassword;
      user.resetToken = undefined;
      user.resetTokenExpiry = undefined;
      await user.save();

      return { message: 'Password reset successful' };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  generateToken(user) {
    return jwt.sign(
      { userId: user.id },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyToken(token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      return decoded;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }
}

module.exports = AuthService;
