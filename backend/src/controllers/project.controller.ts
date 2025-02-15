import { Request, Response } from 'express';
import { pool } from '../config/database';
import { CustomRequest } from '../types';

interface DatabaseError extends Error {
    code?: string;
    detail?: string;
}

export class ProjectController {
    // Yeni proje oluştur
    static async createProject(req: Request, res: Response) {
        try {
            const {
                title,
                description,
                requirements,
                budget,
                deadline,
                category
            } = req.body;

            const user = (req as any).user;

            // İstek verilerini logla
            console.log('=== Proje Oluşturma Detayları ===');
            console.log('Kullanıcı bilgisi:', {
                userId: user?.id,
                userRole: user?.role
            });
            console.log('Proje verileri:', {
                title,
                description,
                requirements: Array.isArray(requirements) ? requirements : requirements.split(','),
                budget: parseFloat(budget),
                deadline,
                category
            });

            // SQL sorgusunu logla
            const query = `INSERT INTO projects 
                (title, description, requirements, budget, deadline, category, customer_id, creator_id, status, is_public)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $7, 'open', true)
                RETURNING *`;
            
            console.log('SQL Sorgusu:', query);
            console.log('Parametre değerleri:', [
                title,
                description,
                Array.isArray(requirements) ? requirements : requirements.split(',').map((r: string) => r.trim()),
                parseFloat(budget),
                deadline,
                category,
                user.id
            ]);

            const result = await pool.query(query, [
                title,
                description,
                Array.isArray(requirements) ? requirements : requirements.split(',').map((r: string) => r.trim()),
                parseFloat(budget),
                deadline,
                category,
                user.id
            ]);

            console.log('Veritabanı yanıtı:', result.rows[0]);
            
            res.status(201).json({
                success: true,
                project: result.rows[0]
            });
        } catch (error: any) {
            console.error('=== Proje Oluşturma Hatası ===');
            console.error('Hata mesajı:', error.message);
            console.error('Hata detayı:', error);
            console.error('SQL Hatası:', error.code);
            console.error('SQL Detay:', error.detail);
            
            res.status(500).json({
                success: false,
                message: 'Proje oluşturulurken bir hata oluştu',
                error: error.message
            });
        }
    }

    // Projeleri listele
    static async getProjects(req: Request, res: Response) {
        try {
            const { sort = 'newest', status = 'all' } = req.query;

            let query = `
                SELECT 
                    p.id,
                    p.title,
                    p.description,
                    p.budget,
                    p.deadline,
                    p.status,
                    p.category,
                    p.requirements,
                    p.created_at,
                    u.first_name as customer_name,
                    u.profile_image as customer_image
                FROM projects p
                LEFT JOIN users u ON p.customer_id = u.id
                WHERE p.is_public = true
            `;

            const params: any[] = [];

            if (status !== 'all') {
                query += ` AND p.status = $${params.length + 1}`;
                params.push(status);
            }

            query += ` ORDER BY `;
            switch (sort) {
                case 'oldest':
                    query += 'p.created_at ASC';
                    break;
                case 'budget_high':
                    query += 'p.budget DESC';
                    break;
                case 'budget_low':
                    query += 'p.budget ASC';
                    break;
                default:
                    query += 'p.created_at DESC';
            }

            const result = await pool.query(query, params);

            res.json({
                success: true,
                projects: result.rows.map(project => ({
                    ...project,
                    requirements: Array.isArray(project.requirements) ? 
                        project.requirements : 
                        project.requirements ? [project.requirements] : []
                }))
            });

        } catch (error) {
            console.error('Projeler listelenirken hata:', error);
            res.status(500).json({
                success: false,
                message: 'Projeler listelenirken bir hata oluştu'
            });
        }
    }

    // Kullanıcının projelerini getir
    static async getMyProjects(req: CustomRequest, res: Response) {
        try {
            const user_id = req.user?.id;
            const user_role = req.user?.role;

            const query = `
                SELECT 
                    p.*,
                    u1.first_name as customer_name,
                    u2.first_name as developer_name,
                    pr.name as product_name
                FROM projects p
                LEFT JOIN users u1 ON p.customer_id = u1.id
                LEFT JOIN users u2 ON p.developer_id = u2.id
                LEFT JOIN products pr ON p.product_id = pr.id
                WHERE ${user_role === 'customer' ? 'p.customer_id' : 'p.developer_id'} = $1
                ORDER BY p.created_at DESC
            `;

            const result = await pool.query(query, [user_id]);
            res.json(result.rows);
        } catch (error) {
            console.error('Projeler listelenirken hata:', error);
            res.status(500).json({ message: 'Sunucu hatası' });
        }
    }

    // Proje detayını getir
    static async getProjectById(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await pool.query(
                `SELECT 
                    p.*,
                    u.id as customer_id,
                    u.first_name || ' ' || u.last_name as customer_name,
                    u.email as customer_email
                FROM projects p
                INNER JOIN users u ON p.customer_id = u.id
                WHERE p.id = $1`,
                [id]
            );
            
            if (result.rows.length === 0) {
                return res.status(404).json({ 
                    success: false, 
                    message: 'Proje bulunamadı' 
                });
            }
            
            const project = result.rows[0];
            res.json({
                success: true,
                project: {
                    ...project,
                    customer_id: project.customer_id.toString(), // ID'yi string'e çevir
                    budget: parseFloat(project.budget),
                    deadline: new Date(project.deadline).toISOString()
                }
            });
        } catch (error) {
            console.error('Proje detay hatası:', error);
            res.status(500).json({ 
                success: false, 
                message: 'Sunucu hatası' 
            });
        }
    }

    // Proje onayla
    static async approveProject(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const result = await pool.query(
                'UPDATE projects SET status = $1 WHERE id = $2 RETURNING *',
                ['approved', id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    // Proje durumunu güncelle
    static async updateProjectStatus(req: Request, res: Response) {
        try {
            const { id } = req.params;
            const { status } = req.body;
            const result = await pool.query(
                'UPDATE projects SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );
            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    // Kullanıcının projelerini listele
    static async getUserProjects(req: Request, res: Response) {
        try {
            const userId = req.params.userId;

            const result = await pool.query(
                `SELECT 
                    p.id,
                    p.title,
                    p.description,
                    p.budget,
                    p.deadline,
                    p.status,
                    p.created_at,
                    p.customer_id,
                    p.requirements as skills_required,
                    u.first_name as customer_name,
                    u.profile_image as customer_image
                FROM projects p
                LEFT JOIN users u ON p.customer_id = u.id
                WHERE p.customer_id = $1
                ORDER BY p.created_at DESC`,
                [userId]
            );

            res.json({
                success: true,
                projects: result.rows
            });
        } catch (error) {
            console.error('Kullanıcı projeleri listelenirken hata:', error);
            res.status(500).json({
                success: false,
                message: 'Projeler listelenirken bir hata oluştu: ' + (error as Error).message
            });
        }
    }

    // Proje güncelle
    static async updateProject(req: Request, res: Response) {
        try {
            const projectId = req.params.id;
            const updates = req.body;

            const result = await pool.query(
                `UPDATE projects 
                SET title = $1, description = $2, budget = $3, deadline = $4, updated_at = CURRENT_TIMESTAMP
                WHERE id = $5 AND customer_id = $6
                RETURNING *`,
                [updates.title, updates.description, updates.budget, updates.deadline, projectId, req.user?.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proje bulunamadı veya düzenleme yetkiniz yok'
                });
            }

            res.json(result.rows[0]);
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Proje güncellenirken bir hata oluştu'
            });
        }
    }

    // Proje sil
    static async deleteProject(req: Request, res: Response) {
        try {
            const projectId = req.params.id;

            const result = await pool.query(
                'DELETE FROM projects WHERE id = $1 AND customer_id = $2 RETURNING id',
                [projectId, req.user?.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Proje bulunamadı veya silme yetkiniz yok'
                });
            }

            res.json({ success: true, message: 'Proje başarıyla silindi' });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Proje silinirken bir hata oluştu'
            });
        }
    }
}
