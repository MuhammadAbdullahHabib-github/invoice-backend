import { Router } from 'express';
import * as invoiceController from '../controllers/invoiceController';
import { auth } from '../middlewares/auth';
import { invoiceValidation } from '../middlewares/validation';

const router = Router();

router.use(auth);

router.get('/', invoiceController.getAll);
router.get('/:id', invoiceValidation.id, invoiceController.getOne);
router.post('/', invoiceValidation.create, invoiceController.create);
router.patch('/:id', invoiceValidation.update, invoiceController.update);
router.delete('/:id', invoiceValidation.id, invoiceController.remove);
router.post('/:id/send', invoiceValidation.id, invoiceController.send);
router.post('/:id/mark-paid', invoiceValidation.id, invoiceController.markPaid);

export default router; 