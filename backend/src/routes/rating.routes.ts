import { Router } from 'express';
import { RatingController } from '../controllers/rating.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

// Public routes
router.get('/criteria', RatingController.getRatingCriteria);
router.get('/product/:productId', RatingController.getProductRatings);

// Protected routes
router.post('/', authMiddleware, RatingController.addRating);
router.get('/user/product/:productId', authMiddleware, RatingController.getUserRatings);

export const ratingRoutes = router;