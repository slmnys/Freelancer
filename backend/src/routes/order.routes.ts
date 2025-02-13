import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';

const router = Router();

// Temel sipariş rotaları
router.get('/', (req, res) => {
    res.json({ message: 'Siparişler listesi' });
});

router.post('/', OrderController.createOrder);
router.get('/user/:userId', OrderController.getUserOrders);
router.put('/:id/status', OrderController.updateOrderStatus);

export default router; 