import { Router } from 'express';
import { PasswordResetController } from '../controllers/password-reset.controller';

const router = Router();

router.post('/request', PasswordResetController.requestReset);
router.post('/reset', PasswordResetController.resetPassword);

export default router; 