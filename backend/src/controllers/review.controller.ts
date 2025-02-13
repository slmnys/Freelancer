import { Request, Response } from 'express';
import { ReviewModel, Review } from '../models/review.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ReviewController {
    static async createReview(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            const reviewData: Review = {
                ...req.body,
                user_id: userId
            };

            const newReview = await ReviewModel.create(reviewData);
            res.status(201).json({
                message: 'Yorumunuz başarıyla kaydedildi ve onay için gönderildi',
                review: newReview
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getProductReviews(req: Request, res: Response) {
        try {
            const productId = parseInt(req.params.productId);
            const reviews = await ReviewModel.findByProductId(productId);
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getUserReviews(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            const reviews = await ReviewModel.findByUserId(userId);
            res.status(200).json(reviews);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async updateReviewStatus(req: AuthRequest, res: Response) {
        try {
            if (req.user?.role !== 'admin') {
                return res.status(403).json({ message: 'Bu işlem için yetkiniz yok' });
            }

            const id = parseInt(req.params.id);
            const { status } = req.body;

            const updatedReview = await ReviewModel.update(id, status);
            if (!updatedReview) {
                return res.status(404).json({ message: 'Yorum bulunamadı' });
            }

            res.status(200).json({
                message: 'Yorum durumu güncellendi',
                review: updatedReview
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 