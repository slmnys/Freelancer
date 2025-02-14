import { pool } from '../config/database';

export interface Notification {
    id?: number;
    user_id: number;
    title: string;
    message: string;
    type: string;
    read?: boolean;
}

export class NotificationModel {
    static async create(notification: Notification) {
        const query = `
            INSERT INTO notifications (user_id, title, message, type)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const values = [
            notification.user_id,
            notification.title,
            notification.message,
            notification.type
        ];

        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getUserNotifications(userId: number, limit = 20) {
        const query = `
            SELECT *
            FROM notifications
            WHERE user_id = $1
            ORDER BY created_at DESC
            LIMIT $2
        `;
        
        try {
            const result = await pool.query(query, [userId, limit]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async getUnreadCount(userId: number) {
        const query = `
            SELECT COUNT(*)
            FROM notifications
            WHERE user_id = $1 AND read = false
        `;
        
        try {
            const result = await pool.query(query, [userId]);
            return parseInt(result.rows[0].count);
        } catch (error) {
            throw error;
        }
    }

    static async markAsRead(notificationId: number, userId: number) {
        const query = `
            UPDATE notifications
            SET read = true
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [notificationId, userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async markAllAsRead(userId: number) {
        const query = `
            UPDATE notifications
            SET read = true
            WHERE user_id = $1 AND read = false
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async deleteNotification(notificationId: number, userId: number) {
        const query = `
            DELETE FROM notifications
            WHERE id = $1 AND user_id = $2
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [notificationId, userId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
} 