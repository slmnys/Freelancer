import { Request, Response } from 'express';
import { CategoryModel, Category } from '../models/category.model';

export class CategoryController {
    static async createCategory(req: Request, res: Response) {
        try {
            const categoryData: Category = req.body;
            const newCategory = await CategoryModel.create(categoryData);
            res.status(201).json({
                message: 'Kategori başarıyla oluşturuldu',
                category: newCategory
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getAllCategories(req: Request, res: Response) {
        try {
            const categories = await CategoryModel.findAll();
            res.status(200).json(categories);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async getCategoryById(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const category = await CategoryModel.findById(id);
            
            if (!category) {
                return res.status(404).json({ message: 'Kategori bulunamadı' });
            }
            
            res.status(200).json(category);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async updateCategory(req: Request, res: Response) {
        try {
            const id = parseInt(req.params.id);
            const categoryData: Partial<Category> = req.body;
            
            const updatedCategory = await CategoryModel.update(id, categoryData);
            
            if (!updatedCategory) {
                return res.status(404).json({ message: 'Kategori bulunamadı' });
            }
            
            res.status(200).json({
                message: 'Kategori başarıyla güncellendi',
                category: updatedCategory
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 