import { pool } from '../config/database';
import crypto from 'crypto';

export class PasswordResetModel {
    static async create(userId: number) {
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 1); // 1 saat geçerli

        const query = `
            INSERT INTO password_resets (user_id, token, expires_at)
            VALUES ($1, $2, $3)
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [userId, token, expiresAt]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByToken(token: string) {
        const query = `
            SELECT pr.*, u.email 
            FROM password_resets pr
            JOIN users u ON u.id = pr.user_id
            WHERE pr.token = $1 AND pr.expires_at > NOW()
        `;
        
        try {
            const result = await pool.query(query, [token]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async deleteByUserId(userId: number) {
        const query = 'DELETE FROM password_resets WHERE user_id = $1';
        try {
            await pool.query(query, [userId]);
        } catch (error) {
            throw error;
        }
    }
} 