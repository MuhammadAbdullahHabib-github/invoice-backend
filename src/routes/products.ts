import { Router } from 'express';
import * as productController from '../controllers/productController';
import { auth } from '../middlewares/auth';

const router = Router();
router.use(auth);

router.get('/', productController.getAll);
router.get('/:id', productController.getOne);
router.post('/', productController.create);
router.put('/:id', productController.update);
router.delete('/:id', productController.remove);

export default router; 