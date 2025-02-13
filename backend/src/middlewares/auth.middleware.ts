import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || '736273';

export interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

export const authMiddleware = (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token bulunamadı'
            });
        }

        const decoded = jwt.verify(token, JWT_SECRET) as AuthRequest['user'];
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Geçersiz token'
        });
    }
};

// Rol bazlı yetkilendirme middleware'leri
export const isCustomer = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'customer') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için müşteri yetkisi gerekiyor'
        });
    }
    next();
};

export const isFreelancer = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'freelancer') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için freelancer yetkisi gerekiyor'
        });
    }
    next();
};

export const isAdmin = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için admin yetkisi gerekiyor'
        });
    }
    next();
};

export const isDeveloper = (req: AuthRequest, res: Response, next: NextFunction) => {
    if (req.user?.role !== 'developer' && req.user?.role !== 'admin') {
        return res.status(403).json({
            success: false,
            message: 'Bu işlem için geliştirici yetkisi gerekiyor'
        });
    }
    next();
}; 