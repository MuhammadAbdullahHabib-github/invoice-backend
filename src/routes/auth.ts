import express, { Request, Response } from 'express';
import authController from '../controllers/authController';
import { loginValidation } from '../middlewares/validation';
import { auth } from '../middlewares/auth';

const router = express.Router();

router.post('/register', authController.register);
router.post('/login', loginValidation, (req: Request, res: Response) => authController.login(req, res));
router.post('/logout', auth, (req: Request, res: Response) => authController.logout(req, res));
router.post('/refresh', (req: Request, res: Response) => authController.refresh(req, res));

export default router; 