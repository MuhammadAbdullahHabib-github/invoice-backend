import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { ErrorResponse } from '../utils/error';
import { CustomerDocument } from '../models/Customer';

export const auth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new ErrorResponse('No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'test-secret') as { id: string };
    
    const user = await User.findById(decoded.id);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }

    (req as any).user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new ErrorResponse('Invalid token', 401));
    } else {
      next(error);
    }
  }
};

export const isAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = (req as any).user;
    if (!user.isAdmin) {
      throw new ErrorResponse('Admin access required', 403);
    }
    next();
  } catch (error) {
    next(error);
  }
};

function mapCustomer(doc: CustomerDocument) {
  if (!doc) return null;
  const obj = doc.toObject();
  obj.id = obj._id.toString();
  delete obj._id;
  delete obj.__v;
  return obj;
} 