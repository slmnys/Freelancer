import { Request, Response } from 'express';
import { pool } from '../config/database';
import { CustomRequest } from '../types';

export class ConversationController {
    // Mesaj gönder
    static async sendMessage(req: CustomRequest, res: Response) {
        try {
            const { projectId } = req.params;
            const { message } = req.body;
            const sender_id = req.user?.id;

            // Önce konuşmayı bul
            const conversationResult = await pool.query(
                'SELECT * FROM conversations WHERE project_id = $1',
                [projectId]
            );

            if (conversationResult.rows.length === 0) {
                return res.status(404).json({ message: 'Konuşma bulunamadı' });
            }

            const conversation = conversationResult.rows[0];
            const receiver_id = sender_id === conversation.customer_id 
                ? conversation.developer_id 
                : conversation.customer_id;

            // Mesajı kaydet
            const result = await pool.query(
                `INSERT INTO messages 
                (conversation_id, sender_id, receiver_id, message)
                VALUES ($1, $2, $3, $4)
                RETURNING *`,
                [conversation.id, sender_id, receiver_id, message]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Mesaj gönderilirken hata:', error);
            res.status(500).json({ message: 'Sunucu hatası' });
        }
    }

    // Mesajları getir
    static async getMessages(req: CustomRequest, res: Response) {
        try {
            const { projectId } = req.params;
            const user_id = req.user?.id;

            const result = await pool.query(
                `SELECT m.*, 
                    u1.first_name as sender_name,
                    u2.first_name as receiver_name
                FROM messages m
                LEFT JOIN users u1 ON m.sender_id = u1.id
                LEFT JOIN users u2 ON m.receiver_id = u2.id
                LEFT JOIN conversations c ON m.conversation_id = c.id
                WHERE c.project_id = $1 
                AND (c.customer_id = $2 OR c.developer_id = $2)
                ORDER BY m.created_at ASC`,
                [projectId, user_id]
            );

            res.json(result.rows);
        } catch (error) {
            console.error('Mesajlar alınırken hata:', error);
            res.status(500).json({ message: 'Sunucu hatası' });
        }
    }

    static async getConversation(req: Request, res: Response) {
        try {
            const { projectId } = req.params;
            res.json({ message: 'Not implemented' });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async markAsRead(req: Request, res: Response) {
        try {
            const { messageId } = req.params;
            res.json({ message: 'Not implemented' });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 