import { NotificationModel, Notification } from '../models/notification.model';

export class NotificationService {
    static async sendOrderStatusNotification(userId: number, orderId: number, status: string) {
        const notification: Notification = {
            user_id: userId,
            title: 'Sipariş Durumu Güncellendi',
            message: `Sipariş #${orderId} durumu "${status}" olarak güncellendi.`,
            type: 'order_status'
        };
        
        return await NotificationModel.create(notification);
    }

    static async sendReviewApprovedNotification(userId: number, productName: string) {
        const notification: Notification = {
            user_id: userId,
            title: 'Yorum Onaylandı',
            message: `"${productName}" ürünü için yaptığınız yorum onaylandı.`,
            type: 'review_approved'
        };
        
        return await NotificationModel.create(notification);
    }

    static async sendPriceDropNotification(userId: number, productName: string, newPrice: number) {
        const notification: Notification = {
            user_id: userId,
            title: 'Fiyat Düşüşü',
            message: `"${productName}" ürününün fiyatı ${newPrice}₺'ye düştü!`,
            type: 'price_drop'
        };
        
        return await NotificationModel.create(notification);
    }

    static async sendStockNotification(userId: number, productName: string) {
        const notification: Notification = {
            user_id: userId,
            title: 'Ürün Stokta',
            message: `"${productName}" ürünü tekrar stokta!`,
            type: 'stock_alert'
        };
        
        return await NotificationModel.create(notification);
    }
} 