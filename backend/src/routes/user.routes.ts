import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/register', UserController.register);
router.put('/:id', authMiddleware, UserController.updateProfile);
router.post('/:id/profile-image', authMiddleware, UserController.uploadProfileImage);

export default router;