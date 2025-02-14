import { pool } from '../config/database';

export interface Category {
    id?: number;
    name: string;
    description?: string;
    parent_id?: number;
    status?: string;
}

export class CategoryModel {
    static async create(category: Category) {
        const query = `
            INSERT INTO categories (name, description, parent_id, status)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        const values = [
            category.name,
            category.description,
            category.parent_id,
            category.status || 'active'
        ];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async findAll() {
        const query = `
            SELECT c.*, 
                   p.name as parent_name,
                   (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            WHERE c.status = 'active'
            ORDER BY c.name
        `;
        try {
            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    static async findById(id: number) {
        const query = `
            SELECT c.*, 
                   p.name as parent_name,
                   (SELECT COUNT(*) FROM products WHERE category_id = c.id) as product_count
            FROM categories c
            LEFT JOIN categories p ON c.parent_id = p.id
            WHERE c.id = $1
        `;
        try {
            const result = await pool.query(query, [id]);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async update(id: number, category: Partial<Category>) {
        const query = `
            UPDATE categories 
            SET name = COALESCE($1, name),
                description = COALESCE($2, description),
                parent_id = COALESCE($3, parent_id),
                status = COALESCE($4, status),
                updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *
        `;
        const values = [
            category.name,
            category.description,
            category.parent_id,
            category.status,
            id
        ];
        
        try {
            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
} 