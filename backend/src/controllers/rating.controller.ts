import { Request, Response } from 'express';

export class RatingController {
    static async getRatingCriteria(req: Request, res: Response) {
        res.json({ message: 'Rating criteria' });
    }

    static async getProductRatings(req: Request, res: Response) {
        const { productId } = req.params;
        res.json({ message: `Ratings for product ${productId}` });
    }

    static async addRating(req: Request, res: Response) {
        res.json({ message: 'Rating added' });
    }

    static async getUserRatings(req: Request, res: Response) {
        const { productId } = req.params;
        res.json({ message: `User ratings for product ${productId}` });
    }
}