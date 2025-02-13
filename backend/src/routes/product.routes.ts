import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authMiddleware, isFreelancer } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/', ProductController.getAllProducts);
router.get('/search', ProductController.searchProducts);
router.get('/popular', ProductController.getPopularProducts);
router.get('/:id', ProductController.getProductById);
router.get('/price-range', ProductController.getPriceRange);

// Protected routes
router.post('/', [authMiddleware, isFreelancer], ProductController.createProduct);
router.put('/:id', [authMiddleware, isFreelancer], ProductController.updateProduct);

export default router; 