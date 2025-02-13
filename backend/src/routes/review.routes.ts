import { Router } from 'express';
import { ReviewController } from '../controllers/review.controller';
import { authMiddleware, isAdmin } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/product/:productId', ReviewController.getProductReviews);

// Protected routes
router.post('/', authMiddleware, ReviewController.createReview);
router.get('/user', authMiddleware, ReviewController.getUserReviews);
router.put('/:id/status', [authMiddleware, isAdmin], ReviewController.updateReviewStatus);

export default router; 