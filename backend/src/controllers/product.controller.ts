import { Request, Response } from 'express';
import { ProductModel, Product } from '../models/product.model';
import { pool } from '../config/database';

export class ProductController {
    static async createProduct(req: Request, res: Response) {
        try {
            const product: Product = req.body;
            const newProduct = await ProductModel.create(product);
            res.status(201).json({ message: 'Ürün başarıyla oluşturuldu', product: newProduct });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getAllProducts(req: Request, res: Response) {
        try {
            const {
                category_id,
                search,
                min_price,
                max_price,
                sort
            } = req.query;
    
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
    
            // Kategori filtresi
            if (category_id) {
                params.push(category_id);
                query += ` AND p.category_id = $${params.length}`;
            }
    
            // Arama filtresi
            if (search) {
                const searchStr = search as string;
                params.push(`%${searchStr.toLowerCase()}%`);
                query += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.description) LIKE $${params.length})`;
            }
    
            // Fiyat filtresi
            if (min_price) {
                params.push(min_price);
                query += ` AND p.price >= $${params.length}`;
            }
            if (max_price) {
                params.push(max_price);
                query += ` AND p.price <= $${params.length}`;
            }
    
            query += ` GROUP BY p.id, c.name`;
    
            // Sıralama
            switch (sort) {
                case 'name_desc':
                    query += ` ORDER BY p.name DESC`;
                    break;
                case 'price_asc':
                    query += ` ORDER BY p.price ASC`;
                    break;
                case 'price_desc':
                    query += ` ORDER BY p.price DESC`;
                    break;
                case 'rating_desc':
                    query += ` ORDER BY average_rating DESC`;
                    break;
                case 'rating_asc':
                    query += ` ORDER BY average_rating ASC`;
                    break;
                default: // name_asc
                    query += ` ORDER BY p.name ASC`;
            }
    
            const result = await pool.query(query, params);
            res.json(result.rows);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getProductById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const product = await ProductModel.findById(id);
            
            if (!product) {
                return res.status(404).json({ message: 'Ürün bulunamadı' });
            }
            
            res.status(200).json(product);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async updateProduct(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const productData: Partial<Product> = req.body;
            
            const updatedProduct = await ProductModel.update(id, productData);
            
            if (!updatedProduct) {
                return res.status(404).json({ message: 'Ürün bulunamadı' });
            }
            
            res.status(200).json({ message: 'Ürün başarıyla güncellendi', product: updatedProduct });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async searchProducts(req: Request, res: Response) {
        try {
            const filters = {
                name: req.query.name as string,
                category_id: req.query.category_id ? parseInt(req.query.category_id as string) : undefined,
                min_price: req.query.min_price ? parseFloat(req.query.min_price as string) : undefined,
                max_price: req.query.max_price ? parseFloat(req.query.max_price as string) : undefined,
                sort_by: req.query.sort_by as string,
                sort_direction: req.query.sort_direction as 'ASC' | 'DESC',
                page: req.query.page ? parseInt(req.query.page as string) : 1,
                limit: req.query.limit ? parseInt(req.query.limit as string) : 10
            };

            const result = await ProductModel.search(filters);
            res.status(200).json(result);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getPopularProducts(req: Request, res: Response) {
        try {
            const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
            const products = await ProductModel.getPopularProducts(limit);
            res.status(200).json(products);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
    static async getPriceRange(req: Request, res: Response) {
        try {
            const query = `
                SELECT 
                    MIN(price) as min,
                    MAX(price) as max
                FROM products
            `;
            
            const result = await pool.query(query);
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 