import express from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { pool } from '../config/database';
import { Request, Response } from 'express';

interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

const router = express.Router();

// Message controller fonksiyonları
const messageController = {
    sendMessage: async (req: AuthRequest, res: Response) => {
        try {
            const { content, projectId, recipientId } = req.body;
            const senderId = req.user?.id;

            if (!senderId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı kimliği bulunamadı'
                });
            }

            const result = await pool.query(
                `INSERT INTO messages (message_content, project_id, sender_id, recipient_id, created_at)
                 VALUES ($1, $2, $3, $4, NOW())
                 RETURNING *`,
                [content, projectId, senderId, recipientId]
            );

            res.json({
                success: true,
                data: result.rows[0]
            });
        } catch (error) {
            console.error('Mesaj gönderme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Mesaj gönderilemedi'
            });
        }
    },

    getProjectMessages: async (req: AuthRequest, res: Response) => {
        try {
            const { projectId } = req.params;
            const userId = req.user?.id;

            console.log('Mesaj getirme isteği:', { projectId, userId });

            // Proje kontrolü
            const projectCheck = await pool.query(
                `SELECT * FROM projects WHERE id = $1`,
                [projectId]
            );

            console.log('Proje bilgileri:', projectCheck.rows[0]);

            if (projectCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proje bulunamadı'
                });
            }

            const project = projectCheck.rows[0];

            // Erişim kontrolü
            const hasAccess = project.creator_id === userId || project.customer_id === userId;
            console.log('Erişim kontrolü:', {
                userId,
                creatorId: project.creator_id,
                customerId: project.customer_id,
                hasAccess
            });

            if (!hasAccess) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu projeye erişim yetkiniz yok'
                });
            }

            // Mesajları getir
            const result = await pool.query(
                `SELECT m.*, 
                        u.first_name as sender_name, 
                        u.email as sender_email,
                        m.message_content as content
                 FROM messages m
                 JOIN users u ON m.sender_id = u.id
                 WHERE m.project_id = $1
                 AND (m.sender_id = $2 OR m.recipient_id = $2)
                 ORDER BY m.created_at ASC`,
                [projectId, userId]
            );

            console.log('Bulunan mesajlar:', {
                count: result.rows.length,
                firstMessage: result.rows[0]
            });

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Mesaj getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Mesajlar getirilemedi'
            });
        }
    }
};

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/project/:projectId', authMiddleware, messageController.getProjectMessages);

export default router; 