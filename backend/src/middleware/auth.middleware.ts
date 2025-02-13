import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/database';

interface JwtPayload {
    id: number;
    email: string;
    role: string;
}

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Token'ı al
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                message: 'Yetkilendirme token\'ı bulunamadı'
            });
        }

        const token = authHeader.split(' ')[1];
        
        // Token'ı doğrula
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as JwtPayload;
        
        // Kullanıcıyı veritabanından kontrol et
        const result = await pool.query(
            'SELECT id, email, role FROM users WHERE id = $1',
            [decoded.id]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz kullanıcı'
            });
        }

        // Kullanıcı bilgisini request nesnesine ekle
        (req as any).user = result.rows[0];
        
        console.log('Auth Middleware - Kullanıcı:', {
            id: result.rows[0].id,
            email: result.rows[0].email,
            role: result.rows[0].role
        });

        next();
    } catch (error: any) {
        console.error('Auth Middleware Hatası:', error);
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Geçersiz token'
            });
        }

        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token süresi dolmuş'
            });
        }

        res.status(500).json({
            success: false,
            message: 'Yetkilendirme hatası'
        });
    }
}; 