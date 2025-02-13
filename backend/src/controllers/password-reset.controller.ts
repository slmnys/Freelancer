import { Request, Response } from 'express';
import { UserModel } from '../models/user.model';
import { PasswordResetModel } from '../models/password-reset.model';
import bcrypt from 'bcrypt';

export class PasswordResetController {
    static async requestReset(req: Request, res: Response) {
        try {
            const { email } = req.body;
            
            const user = await UserModel.findByEmail(email);
            if (!user) {
                return res.status(200).json({ message: 'Şifre sıfırlama talimatları email adresinize gönderildi' });
            }

            // Varolan reset tokenlarını temizle
            await PasswordResetModel.deleteByUserId(user.id);
            
            // Yeni reset token oluştur
            const resetData = await PasswordResetModel.create(user.id);

            // Token'ı response ile birlikte gönder (sadece geliştirme aşamasında)
            res.status(200).json({ 
                message: 'Şifre sıfırlama talimatları email adresinize gönderildi',
                // Bu satırı sadece geliştirme aşamasında kullanın
                resetToken: resetData.token
            });

            // Console'a da yazdır
            console.log('Reset Token:', resetData.token);
            
        } catch (error) {
            console.error('Hata:', error);
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async resetPassword(req: Request, res: Response) {
        try {
            const { token, new_password } = req.body;

            const resetData = await PasswordResetModel.findByToken(token);
            if (!resetData) {
                return res.status(400).json({ 
                    message: 'Geçersiz veya süresi dolmuş token' 
                });
            }

            // Yeni şifreyi hashle
            const hashedPassword = await bcrypt.hash(new_password, 10);
            
            // Şifreyi güncelle
            await UserModel.updatePassword(resetData.user_id, hashedPassword);
            
            // Kullanılan token'ı sil
            await PasswordResetModel.deleteByUserId(resetData.user_id);

            res.status(200).json({ 
                message: 'Şifreniz başarıyla güncellendi' 
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 