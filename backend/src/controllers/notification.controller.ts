import { Response } from 'express';
import { NotificationModel } from '../models/notification.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export class NotificationController {
    static async getUserNotifications(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            const notifications = await NotificationModel.getUserNotifications(userId);
            const unreadCount = await NotificationModel.getUnreadCount(userId);
            
            res.status(200).json({
                notifications,
                unread_count: unreadCount
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async markAsRead(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            const notificationId = parseInt(req.params.id);
            const notification = await NotificationModel.markAsRead(notificationId, userId);
            
            if (!notification) {
                return res.status(404).json({ message: 'Bildirim bulunamadı' });
            }

            res.status(200).json({
                message: 'Bildirim okundu olarak işaretlendi',
                notification
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async markAllAsRead(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            await NotificationModel.markAllAsRead(userId);
            
            res.status(200).json({
                message: 'Tüm bildirimler okundu olarak işaretlendi'
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async deleteNotification(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            const notificationId = parseInt(req.params.id);
            const notification = await NotificationModel.deleteNotification(notificationId, userId);
            
            if (!notification) {
                return res.status(404).json({ message: 'Bildirim bulunamadı' });
            }

            res.status(200).json({
                message: 'Bildirim silindi',
                notification
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 