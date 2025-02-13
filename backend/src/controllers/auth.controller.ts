import { Request, Response } from 'express';
import { pool } from '../config/database';
import { generateToken, verifyToken } from '../config/jwt.config';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { EmailService } from '../services/email.service';
import jwt from 'jsonwebtoken';

dotenv.config();

interface DatabaseError extends Error {
    code?: string;
    detail?: string;
}

export class AuthController {
    static async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body;

            // Kullanıcıyı bul
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({
                    success: false,
                    message: 'Email veya şifre hatalı'
                });
            }

            const user = result.rows[0];

            // Şifre kontrolü
            const isValidPassword = await bcrypt.compare(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({
                    success: false,
                    message: 'Email veya şifre hatalı'
                });
            }

            // JWT token oluştur
            const token = jwt.sign(
                { 
                    id: user.id,
                    email: user.email,
                    role: user.role 
                },
                process.env.JWT_SECRET || 'your-secret-key',
                { expiresIn: '24h' }
            );

            // Login başarılı ise last_login'i güncelle
            await pool.query(
                'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = $1',
                [user.id]
            );

            console.log('Login başarılı:', {
                userId: user.id,
                email: user.email,
                role: user.role
            });

            res.json({
                success: true,
                message: 'Giriş başarılı',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    role: user.role,
                    profile_image: user.profile_image
                }
            });

        } catch (error: any) {
            console.error('Login hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Giriş yapılırken bir hata oluştu'
            });
        }
    }

    static async register(req: Request, res: Response) {
        try {
            const { email, password, first_name, last_name, role } = req.body;
            console.log('Register isteği:', { email, first_name, last_name });

            // Role kontrolü
            const validRoles = ['customer', 'freelancer'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz rol'
                });
            }

            // Email kontrolü
            const existingUser = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            console.log('Mevcut kullanıcı kontrolü:', existingUser.rows);

            if (existingUser.rows.length > 0) {
                console.log('Email zaten kullanımda');
                return res.status(400).json({
                    success: false,
                    message: 'Bu email adresi zaten kullanımda'
                });
            }

            // SQL sorgusunu kontrol et
            const hashedPassword = await bcrypt.hash(password, 10);
            const insertQuery = `
                INSERT INTO users (email, password, first_name, last_name, role)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id, email, first_name, last_name, role`;

            console.log('SQL Query:', insertQuery);
            console.log('Parametreler:', [email.toLowerCase(), hashedPassword, first_name, last_name, role]);

            const result = await pool.query(
                insertQuery,
                [email.toLowerCase(), hashedPassword, first_name, last_name, role]
            );

            console.log('Kayıt sonucu:', result.rows[0]);

            const user = result.rows[0];
            const token = generateToken(user.id, user.role);

            // Doğrulama e-postası için token oluştur
            const verificationToken = jwt.sign(
                { email: user.email },
                process.env.JWT_SECRET || '736273',
                { expiresIn: '24h' }
            );

            console.log('Doğrulama e-postası gönderiliyor...');
            console.log('Email:', user.email);
            
            await EmailService.sendVerificationEmail(user.email, verificationToken);
            console.log('Doğrulama e-postası gönderildi');

            res.status(201).json({
                success: true,
                message: 'Kayıt başarılı. Lütfen email adresinizi doğrulayın. Giriş yapmadan önce email doğrulaması gereklidir.'
            });

        } catch (error) {
            const dbError = error as DatabaseError;
            console.error('Kayıt hatası detayı:', {
                message: dbError.message,
                code: dbError.code,
                detail: dbError.detail
            });
            res.status(500).json({
                success: false,
                message: 'Kayıt olurken bir hata oluştu',
                error: dbError.message,
                detail: dbError.detail
            });
        }
    }

    static async forgotPassword(req: Request, res: Response) {
        try {
            const { email } = req.body;
            console.log('Şifre sıfırlama isteği:', email);
            
            // Kullanıcıyı bul
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email.toLowerCase()]
            );

            if (result.rows.length === 0) {
                console.log('Kullanıcı bulunamadı:', email);
                return res.status(404).json({
                    success: false,
                    message: 'Bu email adresi ile kayıtlı kullanıcı bulunamadı'
                });
            }

            const user = result.rows[0];
            console.log('Kullanıcı bulundu:', { id: user.id, email: user.email });

            // Şifre sıfırlama token'ı oluştur
            const resetToken = jwt.sign(
                { email: user.email },
                process.env.JWT_SECRET || '736273',
                { expiresIn: '1h' }
            );

            // Token'ı veritabanına kaydet
            await pool.query(
                'UPDATE users SET reset_token = $1, reset_token_expires = NOW() + interval \'1 hour\' WHERE id = $2',
                [resetToken, user.id]
            );

            // Şifre sıfırlama emaili gönder
            try {
                await EmailService.sendPasswordResetEmail(user.email, resetToken);
                res.json({
                    success: true,
                    message: 'Şifre sıfırlama bağlantısı email adresinize gönderildi'
                });
            } catch (emailError) {
                console.error('Email gönderme hatası:', emailError);
                res.status(500).json({
                    success: false,
                    message: 'Email gönderilirken bir hata oluştu'
                });
            }
        } catch (error) {
            console.error('Şifre sıfırlama hatası:', error);
            res.status(500).json({
                success: false,
                message: 'Şifre sıfırlama işlemi sırasında bir hata oluştu'
            });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const { token, newPassword } = req.body;
            console.log('Şifre sıfırlama isteği alındı');

            if (!token || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Token ve yeni şifre gereklidir'
                });
            }

            // Token'ı doğrula
            const decoded = jwt.verify(token, process.env.JWT_SECRET || '736273') as { email: string };

            // Kullanıcıyı ve reset token'ı kontrol et
            const userResult = await pool.query(
                'SELECT * FROM users WHERE email = $1 AND reset_token = $2 AND reset_token_expires > NOW()',
                [decoded.email, token]
            );

            if (userResult.rows.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz veya süresi dolmuş şifre sıfırlama bağlantısı'
                });
            }

            // Yeni şifreyi hashle
            const hashedPassword = await bcrypt.hash(newPassword, 10);

            // Şifreyi güncelle ve reset token'ı temizle
            await pool.query(
                `UPDATE users 
                 SET password = $1,
                     reset_token = NULL,
                     reset_token_expires = NULL,
                     updated_at = NOW()
                 WHERE email = $2`,
                [hashedPassword, decoded.email]
            );

            console.log('Şifre başarıyla güncellendi:', { email: decoded.email });

            res.json({
                success: true,
                message: 'Şifreniz başarıyla güncellendi'
            });

        } catch (error) {
            console.error('Şifre güncelleme hatası:', error);

            // JWT doğrulama hatası
            if (error instanceof jwt.JsonWebTokenError) {
                return res.status(400).json({
                    success: false,
                    message: 'Geçersiz veya süresi dolmuş token'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Şifre güncellenirken bir hata oluştu'
            });
        }
    }

    static async verifyEmail(req: Request, res: Response) {
        try {
            const { token } = req.params;
            
            // Token'ı doğrudan jwt.verify ile çöz
            const decoded = jwt.verify(token, process.env.JWT_SECRET || '736273') as { email: string };
            
            // Email ile kullanıcıyı bul ve güncelle
            await pool.query(
                'UPDATE users SET email_verified = true WHERE email = $1 RETURNING *',
                [decoded.email]
            );

            res.json({
                success: true,
                message: 'Email başarıyla doğrulandı'
            });
        } catch (error) {
            console.error('Email doğrulama hatası:', error);
            res.status(400).json({
                success: false,
                message: 'Geçersiz veya süresi dolmuş token'
            });
        }
    }
} 