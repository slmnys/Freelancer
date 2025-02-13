import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', CategoryController.getAllCategories);
router.get('/:id', CategoryController.getCategoryById);

// Protected routes (only admin)
router.post('/', [authMiddleware, isAdmin], CategoryController.createCategory);
router.put('/:id', [authMiddleware, isAdmin], CategoryController.updateCategory);

export default router; 