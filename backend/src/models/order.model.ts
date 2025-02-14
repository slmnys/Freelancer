import { pool } from '../config/database';

export interface OrderItem {
    product_id: number;
    quantity: number;
    price: number;
}

export interface Order {
    id?: number;
    user_id: number;
    total_amount: number;
    status?: string;
    developer_approval?: boolean;
    items: OrderItem[];
}

export class OrderModel {
    static async create(order: Order) {
        const client = await pool.connect();
        
        try {
            await client.query('BEGIN');
            
            // Ana sipariş kaydı
            const orderQuery = `
                INSERT INTO orders (user_id, total_amount, status)
                VALUES ($1, $2, $3)
                RETURNING *
            `;
            const orderValues = [order.user_id, order.total_amount, 'pending'];
            const orderResult = await client.query(orderQuery, orderValues);
            const newOrder = orderResult.rows[0];

            // Sipariş detaylarını kaydet
            for (const item of order.items) {
                const itemQuery = `
                    INSERT INTO order_items (order_id, product_id, quantity, price)
                    VALUES ($1, $2, $3, $4)
                `;
                const itemValues = [newOrder.id, item.product_id, item.quantity, item.price];
                await client.query(itemQuery, itemValues);

                // Stok güncelleme
                const updateStockQuery = `
                    UPDATE products 
                    SET stock = stock - $1 
                    WHERE id = $2
                `;
                await client.query(updateStockQuery, [item.quantity, item.product_id]);
            }

            await client.query('COMMIT');
            return newOrder;
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    }

    static async findByUserId(userId: number) {
        const query = `
            SELECT 
                o.*,
                json_agg(
                    json_build_object(
                        'product_id', oi.product_id,
                        'quantity', oi.quantity,
                        'price', oi.price
                    )
                ) as items
            FROM orders o
            LEFT JOIN order_items oi ON o.id = oi.order_id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.created_at DESC
        `;
        
        try {
            const result = await pool.query(query, [userId]);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async updateStatus(orderId: number, status: string, developerApproval?: boolean) {
        const query = `
            UPDATE orders
            SET status = $1, developer_approval = $2
            WHERE id = $3
            RETURNING *
        `;
        
        try {
            const result = await pool.query(query, [status, developerApproval, orderId]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
} 