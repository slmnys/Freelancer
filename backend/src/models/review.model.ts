import pool from '../config/db.config';

export interface Review {
    id?: number;
    user_id: number;
    product_id: number;
    rating: number;
    comment?: string;
    status?: string;
}

export class ReviewModel {
    static async create(review: Review) {
        const query = `
            INSERT INTO reviews (user_id, product_id, rating, comment, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [
            review.user_id,
            review.product_id,
            review.rating,
            review.comment,
            review.status || 'pending'
        ];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByProductId(productId: number) {
        const query = `
            SELECT 
                r.*,
                u.first_name,
                u.last_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1 AND r.status = 'approved'
            ORDER BY r.created_at DESC
        `;
        
        try {
            const result = await pool.query(query, [productId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async findByUserId(userId: number) {
        const query = `
            SELECT 
                r.*,
                p.name as product_name
            FROM reviews r
            JOIN products p ON r.product_id = p.id
            WHERE r.user_id = $1
            ORDER BY r.created_at DESC
        `;
        
        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, status: string) {
        const query = `
            UPDATE reviews
            SET status = $1, updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [status, id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getAverageRating(productId: number) {
        const query = `
            SELECT 
                AVG(rating)::numeric(10,1) as average_rating,
                COUNT(*) as total_reviews
            FROM reviews
            WHERE product_id = $1 AND status = 'approved'
        `;
        
        try {
            const result = await pool.query(query, [productId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
} 