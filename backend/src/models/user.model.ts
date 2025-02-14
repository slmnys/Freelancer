import { pool } from '../config/database';

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    password: string;
}

export interface UserProfile {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
}

export class UserModel {
    static async findById(id: number): Promise<User | null> {
        const result = await pool.query(
            'SELECT id, email, first_name, last_name, role FROM users WHERE id = $1',
            [id]
        );
        return result.rows[0] || null;
    }

    static async findByEmail(email: string) {
        const result = await pool.query(
            'SELECT id, email, password, first_name, last_name, role FROM users WHERE email = $1',
            [email]
        );
        return result.rows[0];
    }

    static async create(user: User): Promise<User> {
        const result = await pool.query(
            `INSERT INTO users (email, password, first_name, last_name, role) 
             VALUES ($1, $2, $3, $4, $5) 
             RETURNING *`,
            [user.email, user.password, user.first_name, user.last_name, user.role]
        );
        return result.rows[0];
    }

    static async updatePassword(userId: number, newPassword: string): Promise<void> {
        await pool.query(
            'UPDATE users SET password = $1 WHERE id = $2',
            [newPassword, userId]
        );
    }

    static async update(userId: number, profileData: Partial<UserProfile>): Promise<UserProfile> {
        const result = await pool.query(
            `UPDATE users 
             SET email = COALESCE($1, email),
                 first_name = COALESCE($2, first_name),
                 last_name = COALESCE($3, last_name)
             WHERE id = $4
             RETURNING id, email, first_name, last_name, role`,
            [profileData.email, profileData.first_name, profileData.last_name, userId]
        );
        return result.rows[0];
    }
}

export default UserModel; 