import pool from '../config/db.config';

export interface RatingCriteria {
    id?: number;
    name: string;
    description?: string;
    status?: string;
}

export interface ProductRating {
    id?: number;
    user_id: number;
    product_id: number;
    criteria_id: number;
    rating: number;
}

export class RatingModel {
    static async getAllCriteria() {
        const query = `
            SELECT * FROM rating_criteria 
            WHERE status = 'active'
            ORDER BY name
        `;
        
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async addRating(rating: ProductRating) {
        const query = `
            INSERT INTO product_ratings (user_id, product_id, criteria_id, rating)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, product_id, criteria_id)
            DO UPDATE SET rating = $4
            RETURNING *
        `;
        
        const values = [
            rating.user_id,
            rating.product_id,
            rating.criteria_id,
            rating.rating
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getProductRatings(productId: number) {
        const query = `
            SELECT 
                rc.name as criteria_name,
                rc.description as criteria_description,
                AVG(pr.rating)::numeric(10,1) as average_rating,
                COUNT(pr.id) as total_ratings
            FROM rating_criteria rc
            LEFT JOIN product_ratings pr ON rc.id = pr.criteria_id
            WHERE pr.product_id = $1 AND rc.status = 'active'
            GROUP BY rc.id, rc.name, rc.description
            ORDER BY rc.name
        `;
        
        try {
            const result = await pool.query(query, [productId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getUserRatings(userId: number, productId: number) {
        const query = `
            SELECT 
                pr.id,
                pr.rating,
                rc.id as criteria_id,
                rc.name as criteria_name
            FROM rating_criteria rc
            LEFT JOIN product_ratings pr ON rc.id = pr.criteria_id
            AND pr.user_id = $1 AND pr.product_id = $2
            WHERE rc.status = 'active'
            ORDER BY rc.name
        `;
        
        try {
            const result = await pool.query(query, [userId, productId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getOverallProductRating(productId: number) {
        const query = `
            SELECT 
                AVG(rating)::numeric(10,1) as overall_rating,
                COUNT(DISTINCT user_id) as total_users
            FROM product_ratings
            WHERE product_id = $1
        `;
        
        try {
            const result = await pool.query(query, [productId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
} 