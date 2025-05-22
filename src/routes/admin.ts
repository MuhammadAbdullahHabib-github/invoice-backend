import { Router } from 'express';
import * as adminController from '../controllers/adminController';
import { auth, isAdmin } from '../middlewares/auth';
import { param } from 'express-validator';
import { handleValidationErrors } from '../middlewares/validation';

const router = Router();

router.use(auth);
router.use(isAdmin);

router.post(
  '/users/:id/make-admin',
  [
    param('id').isUUID().withMessage('Invalid user ID'),
    handleValidationErrors,
  ],
  adminController.makeAdmin
);

export default router; 