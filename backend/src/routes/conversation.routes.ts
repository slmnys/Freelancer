import express from 'express';
import { ConversationController } from '../controllers/conversation.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = express.Router();

// Mesajlaşma route'ları
router.get('/:projectId', authMiddleware, ConversationController.getConversation);
router.post('/:projectId/messages', authMiddleware, ConversationController.sendMessage);
router.get('/:projectId/messages', authMiddleware, ConversationController.getMessages);
router.put('/messages/:messageId/read', authMiddleware, ConversationController.markAsRead);

export default router; 