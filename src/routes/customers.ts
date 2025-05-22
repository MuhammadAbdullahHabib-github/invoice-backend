import { Router } from 'express';
import * as customerController from '../controllers/customerController';
import { auth } from '../middlewares/auth';
import { customerValidation } from '../middlewares/validation';

const router = Router();

router.use(auth);

router.get('/', customerController.getAll);
router.get('/search', customerController.search);
router.get('/:id', customerValidation.id, customerController.getOne);
router.post('/', customerValidation.create, customerController.create);
router.patch('/:id', customerValidation.id, customerValidation.update, customerController.update);
router.delete('/:id', customerValidation.id, customerController.remove);

export default router; 