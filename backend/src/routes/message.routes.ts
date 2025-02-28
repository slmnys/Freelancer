import express from 'express';
import { authMiddleware } from '../middleware/auth';
import { 
    sendMessage, 
    getChatHistory, 
    getUnreadMessages, 
    markAsRead 
} from '../controllers/message.controller';
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
    getChatHistory: async (req: AuthRequest, res: Response) => {
        try {
            const { projectId, recipientId } = req.params;
            const userId = req.user?.id;

            console.log('Chat geçmişi isteği:', {
                userId,
                recipientId,
                projectId
            });

            // Önce projeyi kontrol et
            const projectCheck = await pool.query(
                `SELECT creator_id, customer_id FROM projects WHERE id = $1`,
                [projectId]
            );

            if (projectCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proje bulunamadı'
                });
            }

            const project = projectCheck.rows[0];

            // Kullanıcının bu projeye erişim yetkisi var mı kontrol et
            if (userId !== project.creator_id && userId !== project.customer_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu projeye erişim yetkiniz yok'
                });
            }

            // İki yönlü mesajlaşmayı getir
            const result = await pool.query(
                `SELECT 
                    m.*,
                    CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                    CASE WHEN m.sender_id = $1 THEN true ELSE false END as is_sender
                FROM messages m
                JOIN users u ON m.sender_id = u.id
                WHERE m.project_id = $3
                AND (
                    (m.sender_id = $1 AND m.recipient_id = $2)
                    OR 
                    (m.sender_id = $2 AND m.recipient_id = $1)
                )
                ORDER BY m.created_at ASC`,
                [userId, recipientId, projectId]
            );

            console.log('Bulunan mesaj sayısı:', result.rows.length);

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Chat geçmişi hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Mesajlar getirilemedi'
            });
        }
    },

    sendMessage: async (req: AuthRequest, res: Response) => {
        try {
            const { content, projectId, recipientId } = req.body;
            const senderId = req.user?.id;

            // Proje kontrolü
            const projectCheck = await pool.query(
                `SELECT creator_id, customer_id FROM projects WHERE id = $1`,
                [projectId]
            );

            if (projectCheck.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proje bulunamadı'
                });
            }

            const project = projectCheck.rows[0];

            // Kullanıcının bu projeye mesaj gönderme yetkisi var mı kontrol et
            if (senderId !== project.creator_id && senderId !== project.customer_id) {
                return res.status(403).json({
                    success: false,
                    message: 'Bu projeye mesaj gönderme yetkiniz yok'
                });
            }

            const result = await pool.query(
                `INSERT INTO messages 
                 (content, project_id, sender_id, recipient_id, created_at)
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

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı kimliği bulunamadı'
                });
            }

            // Tüm mesajları getir, proje kontrolü olmadan
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
    },

    getUnreadMessages: async (req: AuthRequest, res: Response) => {
        try {
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı kimliği bulunamadı'
                });
            }

            // Tüm okunmamış mesajları getir
            const result = await pool.query(
                `SELECT * FROM messages WHERE recipient_id = $1 AND read = false`,
                [userId]
            );

            res.json({
                success: true,
                data: result.rows
            });
        } catch (error) {
            console.error('Okunmamış mesajlar getirme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Okunmamış mesajlar getirilemedi'
            });
        }
    },

    markAsRead: async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;
            const userId = req.user?.id;

            if (!userId) {
                return res.status(401).json({
                    success: false,
                    message: 'Kullanıcı kimliği bulunamadı'
                });
            }

            // Mesajı okundu olarak işaretle
            const result = await pool.query(
                'UPDATE messages SET read = true WHERE id = $1 AND recipient_id = $2 RETURNING *',
                [id, userId]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Mesaj bulunamadı veya işaretleme yetkisi yok'
                });
            }

            res.json({ success: true, message: 'Mesaj işaretlendi' });
        } catch (error) {
            console.error('Mesaj işaretleme hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Mesaj işaretlenemedi'
            });
        }
    }
};

// deleteMessage fonksiyonunu ekle
const deleteMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.user?.id;

        const result = await pool.query(
            'DELETE FROM messages WHERE id = $1 AND sender_id = $2 RETURNING *',
            [id, userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Mesaj bulunamadı veya silme yetkisi yok'
            });
        }

        res.json({ success: true, message: 'Mesaj silindi' });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Mesaj silinemedi'
        });
    }
};

router.post('/', authMiddleware, messageController.sendMessage);
router.get('/project/:projectId', authMiddleware, messageController.getProjectMessages);
router.get('/unread', authMiddleware, messageController.getUnreadMessages);
router.put('/:id/read', authMiddleware, messageController.markAsRead);
router.get('/chat/:projectId/:recipientId', authMiddleware, messageController.getChatHistory);

export default router; 