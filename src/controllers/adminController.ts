import { Request, Response } from 'express';
import User from '../models/User';
import { ErrorResponse } from '../utils/error';

export const makeAdmin = async (req: Request<{ id: string }>, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      throw new ErrorResponse('User not found', 404);
    }
    

    user.isAdmin = true;
    await user.save();
    res.json({ message: 'User has been made admin successfully', user });
  } catch (error) {
    const err = error instanceof ErrorResponse ? error : new ErrorResponse('Failed to make user admin');
    res.status(err.statusCode).json({ message: err.message });
  }
}; 