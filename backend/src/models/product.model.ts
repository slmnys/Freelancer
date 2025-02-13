import { pool } from '../config/database';

export interface Product {
    id: number;
    title: string;           // Hizmet başlığı
    description: string;     // Detaylı açıklama
    category_id: number;     // Yazılım kategorisi (Web, Mobil, Desktop vs.)
    base_price: number;      // Başlangıç fiyatı
    developer_id: number;    // Yazılımcı ID
    features: string[];      // Sunulan özellikler
    delivery_time: number;   // Tahmini teslim süresi (gün)
    status: 'active' | 'inactive';
}

interface SearchFilters {
    name?: string;
    category_id?: number;
    min_price?: number;
    max_price?: number;
    sort_by?: string;
    sort_direction?: 'ASC' | 'DESC';
    page?: number;
    limit?: number;
}

export class ProductModel {
    static async findAll() {
        const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC');
        return result.rows;
    }

    static async findById(id: number) {
        const result = await pool.query(`
            SELECT 
                p.*,
                c.name as category_name,
                COALESCE(AVG(r.rating), 0) as average_rating
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE p.id = $1
            GROUP BY p.id, c.name
        `, [id]);
        return result.rows[0];
    }

    static async create(product: Product) {
        const result = await pool.query(
            `INSERT INTO products (
                name, description, price, stock, 
                category_id, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6) 
            RETURNING *`,
            [
                product.title,
                product.description,
                product.base_price,
                product.developer_id,
                product.features,
                product.delivery_time,
                product.status
            ]
        );
        return result.rows[0];
    }

    static async update(id: number, product: Partial<Product>) {
        const setClause = Object.keys(product)
            .map((key, index) => `${key} = $${index + 1}`)
            .join(', ');
        
        const values = [...Object.values(product), id];
        
        const result = await pool.query(
            `UPDATE products 
            SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
            WHERE id = $${values.length} 
            RETURNING *`,
            values
        );
        return result.rows[0];
    }

    static async search(filters: SearchFilters) {
        let query = `
            SELECT 
                p.*,
                c.name as category_name,
                COALESCE(AVG(r.rating), 0) as average_rating
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN reviews r ON p.id = r.product_id
            WHERE 1=1
        `;
        
        const params: any[] = [];
        
        if (filters.name) {
            params.push(`%${filters.name}%`);
            query += ` AND p.name ILIKE $${params.length}`;
        }
        
        if (filters.category_id) {
            params.push(filters.category_id);
            query += ` AND p.category_id = $${params.length}`;
        }
        
        if (filters.min_price) {
            params.push(filters.min_price);
            query += ` AND p.price >= $${params.length}`;
        }
        
        if (filters.max_price) {
            params.push(filters.max_price);
            query += ` AND p.price <= $${params.length}`;
        }
        
        query += ` GROUP BY p.id, c.name`;
        
        if (filters.sort_by) {
            const direction = filters.sort_direction || 'ASC';
            query += ` ORDER BY ${filters.sort_by} ${direction}`;
        } else {
            query += ` ORDER BY p.created_at DESC`;
        }
        
        if (filters.limit) {
            const offset = ((filters.page || 1) - 1) * filters.limit;
            params.push(filters.limit);
            query += ` LIMIT $${params.length}`;
            params.push(offset);
            query += ` OFFSET $${params.length}`;
        }
        
        const result = await pool.query(query, params);
        return result.rows;
    }

    static async getPopularProducts(limit: number = 5) {
        const query = `
            SELECT 
                p.*,
                c.name as category_name,
                COALESCE(AVG(r.rating), 0) as average_rating,
                COUNT(DISTINCT o.id) as order_count
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN reviews r ON p.id = r.product_id
            LEFT JOIN order_items o ON p.id = o.product_id
            GROUP BY p.id, c.name
            ORDER BY order_count DESC, average_rating DESC
            LIMIT $1
        `;
        const result = await pool.query(query, [limit]);
        return result.rows;
    }

    static async delete(id: number) {
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );
        return result.rows[0];
    }
}