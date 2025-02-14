import { Request, Response } from 'express';
import { UserModel, User } from '../models/user.model';
import bcrypt from 'bcrypt';
import { pool } from '../config/database';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Multer ayarlarını sınıf dışına al
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '../../uploads/profile-images');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'profile-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const uploadMiddleware = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        console.log('Gelen dosya:', file); // Dosya bilgilerini logla
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            console.log('Geçersiz dosya tipi:', file.mimetype); // Hata durumunu logla
            cb(new Error('Sadece resim dosyaları yüklenebilir'));
        }
    }
}).single('profile_image');

export class UserController {
    static async register(req: Request, res: Response) {
        try {
            const { email, password, first_name, last_name } = req.body;
            
            // Email kontrolü
            const existingUser = await UserModel.findByEmail(email);
            if (existingUser) {
                return res.status(400).json({ message: 'Bu email zaten kullanımda' });
            }

            // Şifre hashleme
            const hashedPassword = await bcrypt.hash(password, 10);
            
            const newUser: User = {
                id: 0,
                email,
                password: hashedPassword,
                first_name,
                last_name,
                role: 'customer'
            };

            const user = await UserModel.create(newUser);
            res.status(201).json({ message: 'Kullanıcı başarıyla oluşturuldu', user });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async updateProfile(req: Request, res: Response) {
        try {
            const userId = req.params.id;
            const updates = req.body;
            
            console.log('1. Profil güncelleme isteği:', {
                userId,
                updates
            });

            // Boş alanları null olarak ayarla
            const sanitizedUpdates = {
                first_name: updates.first_name || null,
                last_name: updates.last_name || null,
                phone: updates.phone || null,
                address: updates.address || null,
                city: updates.city || null,
                country: updates.country || null,
                occupation: updates.occupation || null,
                skills: Array.isArray(updates.skills) ? updates.skills : null,
                bio: updates.bio || null
            };

            console.log('2. Temizlenmiş güncellemeler:', sanitizedUpdates);

            try {
                const result = await pool.query(
                    `UPDATE users 
                    SET 
                        first_name = COALESCE($1, first_name),
                        last_name = COALESCE($2, last_name),
                        phone = COALESCE($3, phone),
                        address = COALESCE($4, address),
                        city = COALESCE($5, city),
                        country = COALESCE($6, country),
                        occupation = COALESCE($7, occupation),
                        skills = $8,
                        bio = COALESCE($9, bio),
                        updated_at = CURRENT_TIMESTAMP
                    WHERE id = $10
                    RETURNING *`,
                    [
                        sanitizedUpdates.first_name,
                        sanitizedUpdates.last_name,
                        sanitizedUpdates.phone,
                        sanitizedUpdates.address,
                        sanitizedUpdates.city,
                        sanitizedUpdates.country,
                        sanitizedUpdates.occupation,
                        sanitizedUpdates.skills,
                        sanitizedUpdates.bio,
                        userId
                    ]
                );

                console.log('3. Veritabanı sorgu sonucu:', result.rows[0]);

                if (result.rows.length === 0) {
                    console.error('4a. Kullanıcı bulunamadı:', userId);
                    return res.status(404).json({
                        success: false,
                        message: 'Kullanıcı bulunamadı'
                    });
                }

                const updatedUser = result.rows[0];
                delete updatedUser.password; // Şifreyi yanıttan çıkar

                console.log('4b. Güncellenmiş kullanıcı:', updatedUser);

                return res.json({
                    success: true,
                    user: updatedUser
                });

            } catch (dbError: any) {
                console.error('5. Veritabanı hatası:', {
                    message: dbError.message,
                    code: dbError.code,
                    detail: dbError.detail,
                    hint: dbError.hint
                });
                throw dbError;
            }
        } catch (error: any) {
            console.error('6. Genel hata:', error);
            return res.status(500).json({
                success: false,
                message: 'Profil güncellenirken bir hata oluştu: ' + error.message,
                detail: process.env.NODE_ENV === 'development' ? error.detail : undefined
            });
        }
    }

    static async uploadProfileImage(req: Request, res: Response) {
        console.log('\n=== Profil Fotoğrafı Yükleme Başladı ===');
        try {
            // Klasör kontrolü
            const uploadDir = path.join(__dirname, '../../uploads/profile-images');
            if (!fs.existsSync(uploadDir)) {
                fs.mkdirSync(uploadDir, { recursive: true });
            }

            await new Promise((resolve, reject) => {
                uploadMiddleware(req, res, function(err) {
                    if (err) {
                        console.error('Upload hatası:', err);
                        reject(err);
                    } else {
                        resolve(true);
                    }
                });
            });

            if (!req.file) {
                return res.status(400).json({
                    success: false,
                    message: 'Dosya seçilmedi'
                });
            }

            // Dosya yolunu düzelt - tam URL oluştur
            const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
            const imagePath = `/uploads/profile-images/${req.file.filename}`;
            const fullImageUrl = `${baseUrl}${imagePath}`;

            console.log('Yüklenen dosya:', {
                originalPath: imagePath,
                fullUrl: fullImageUrl,
                filename: req.file.filename,
                mimetype: req.file.mimetype,
                size: req.file.size
            });

            const result = await pool.query(
                'UPDATE users SET profile_image = $1 WHERE id = $2 RETURNING id, profile_image',
                [fullImageUrl, req.params.id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Kullanıcı bulunamadı'
                });
            }

            return res.json({
                success: true,
                profile_image: fullImageUrl
            });

        } catch (error: any) {
            console.error('Upload hatası:', error);
            return res.status(500).json({
                success: false,
                message: 'Profil fotoğrafı yüklenirken bir hata oluştu: ' + error.message
            });
        }
    }
} 