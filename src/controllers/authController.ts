import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User, { UserDocument } from '../models/User';
import logger from '../utils/logger';

interface LoginRequest extends Request {
  body: {
    username: string;
    password: string;
  };
}

interface RegisterRequest extends Request {
  body: {
    username: string;
    email: string;
    password: string;
  };
}

interface RefreshRequest extends Request {
  body: {
    refreshToken: string;
  };
}

function mapUser(doc: any) {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
}

const authController = {
  async register(req: RegisterRequest, res: Response) {
    try {
      const { username, email, password } = req.body;

      // Check if user already exists
      const existingUser = await User.findOne({
        $or: [{ username }, { email }],
      });

      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }

      // Create new user
      const user = await User.create({
        username,
        email,
        password,
        isAdmin: false,
      });

      logger.info(`User ${username} registered successfully`);

      return res.status(201).json({
        message: 'User registered successfully',
        user: mapUser(user),
      });
    } catch (error) {
      logger.error('Registration error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async login(req: LoginRequest, res: Response) {
    try {
      const { username, password } = req.body;
      console.log(username, password);

      const user = await User.findOne({ username }) as UserDocument | null;

      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const isValidPassword = await user.comparePassword(password);
      if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const id = (user._id as unknown as string | { toString(): string }).toString();
      const accessToken = jwt.sign(
        { id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const refreshToken = jwt.sign(
        { id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '7d' }
      );

      user.refreshToken = refreshToken;
      await user.save();

      logger.info(`User ${username} logged in successfully`);

      return res.json({
        token: accessToken,
        refreshToken,
        user: mapUser(user),
      });
    } catch (error) {
      logger.error('Login error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async logout(req: Request, res: Response) {
    try {
      const userId = (req as any).user.id;
      const user = await User.findById(userId) as UserDocument | null;

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      user.refreshToken = null;
      await user.save();

      logger.info(`User ${user.username} logged out successfully`);

      return res.json({ message: 'Logged out successfully' });
    } catch (error) {
      logger.error('Logout error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  },

  async refresh(req: RefreshRequest, res: Response) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({ message: 'Refresh token required' });
      }

      const user = await User.findOne({ refreshToken }) as UserDocument | null;

      if (!user) {
        return res.status(401).json({ message: 'Invalid refresh token' });
      }

      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET || 'test-secret') as { id: string };

      const accessToken = jwt.sign(
        { id: decoded.id },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      logger.info(`Access token refreshed for user ${user.username}`);

      return res.json({ token: accessToken });
    } catch (error) {
      logger.error('Token refresh error:', error);
      return res.status(401).json({ message: 'Invalid refresh token' });
    }
  },
};

export default authController; 