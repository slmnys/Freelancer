import { Router, Request, Response } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authLimiter } from '../middlewares/rate-limit.middleware';
import { passwordValidationMiddleware } from '../middlewares/validation.middleware';
import { authMiddleware } from '../middleware/auth.middleware';
import { pool } from '../config/database';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}

const router = Router();

router.post('/register', authLimiter, passwordValidationMiddleware, AuthController.register);
router.post('/login', authLimiter, async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );

        if (result.rows.length > 0) {
            const user = result.rows[0];
            const validPassword = await bcrypt.compare(password, user.password);

            if (validPassword) {
                const token = jwt.sign(
                    { id: user.id, email: user.email, role: user.role },
                    process.env.JWT_SECRET || 'your-secret-key'
                );

                res.json({
                    success: true,
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        role: user.role,
                        first_name: user.first_name
                    }
                });
            } else {
                res.status(401).json({ success: false, message: 'Geçersiz şifre' });
            }
        } else {
            res.status(404).json({ success: false, message: 'Kullanıcı bulunamadı' });
        }
    } catch (error) {
        console.error('Login hatası:', error);
        res.status(500).json({ success: false, message: 'Giriş yapılırken bir hata oluştu' });
    }
});
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', passwordValidationMiddleware, AuthController.resetPassword);
router.get('/verify-email/:token', AuthController.verifyEmail);
router.get('/me', authMiddleware, async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        
        const result = await pool.query(
            'SELECT id, email, first_name, role FROM users WHERE id = $1',
            [userId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                success: false,
                message: 'Kullanıcı bulunamadı'
            });
        }

        res.json({
            success: true,
            user: result.rows[0]
        });
    } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        res.status(500).json({
            success: false,
            message: 'Kullanıcı bilgileri alınamadı'
        });
    }
});

export default router; 