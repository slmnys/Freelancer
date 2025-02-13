import pool from '../config/db.config';

export interface User {
    id?: number;
    email: string;
    password: string;
    first_name?: string;
    last_name?: string;
    role?: string;
}

export interface UserProfile {
    first_name?: string;
    last_name?: string;
    email?: string;
    phone?: string;
    address?: string;
}

export class UserModel {
    static async create(user: User) {
        const query = `
            INSERT INTO users (email, password, first_name, last_name, role)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [user.email, user.password, user.first_name, user.last_name, user.role];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findByEmail(email: string) {
        const query = 'SELECT * FROM users WHERE email = $1';
        
        try {
            const result = await pool.query(query, [email]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async updatePassword(userId: number, newPassword: string) {
        const query = `
            UPDATE users 
            SET password = $1, 
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $2
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [newPassword, userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async updateProfile(userId: number, profileData: UserProfile) {
        const query = `
            UPDATE users 
            SET 
                first_name = COALESCE($1, first_name),
                last_name = COALESCE($2, last_name),
                email = COALESCE($3, email),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING id, email, first_name, last_name, role
        `;
        
        const values = [
            profileData.first_name,
            profileData.last_name,
            profileData.email,
            userId
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getProfile(userId: number) {
        const query = `
            SELECT id, email, first_name, last_name, role, created_at
            FROM users
            WHERE id = $1
        `;
        
        try {
            const result = await pool.query(query, [userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
} 