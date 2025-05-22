import { Router } from 'express';
import * as pdfTemplateSettingsController from '../controllers/pdfTemplateSettingsController';
import { auth } from '../middlewares/auth';

const router = Router();
router.use(auth);

router.get('/:userId', pdfTemplateSettingsController.getSettings);
router.post('/:userId', pdfTemplateSettingsController.saveSettings);

export default router; 