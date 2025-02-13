import { Request, Response } from 'express';
import { OrderModel, Order } from '../models/order.model';

export class OrderController {
    static async createOrder(req: Request, res: Response) {
        try {
            const orderData: Order = req.body;
            const newOrder = await OrderModel.create(orderData);
            res.status(201).json({ 
                message: 'Sipariş başarıyla oluşturuldu', 
                order: newOrder 
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getUserOrders(req: Request, res: Response) {
        try {
            const userId = parseInt(req.params.userId);
            const orders = await OrderModel.findByUserId(userId);
            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async updateOrderStatus(req: Request, res: Response) {
        try {
            const orderId = parseInt(req.params.id);
            const { status, developer_approval } = req.body;
            
            const updatedOrder = await OrderModel.updateStatus(
                orderId, 
                status, 
                developer_approval
            );
            
            if (!updatedOrder) {
                return res.status(404).json({ message: 'Sipariş bulunamadı' });
            }
            
            res.status(200).json({ 
                message: 'Sipariş durumu güncellendi', 
                order: updatedOrder 
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 