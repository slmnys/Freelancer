import { Request, Response } from 'express';
import { UserModel, UserProfile } from '../models/user.model';
import { AuthRequest } from '../middlewares/auth.middleware';

export class ProfileController {
    static async getProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            const profile = await UserModel.findById(userId);
            if (!profile) {
                return res.status(404).json({ message: 'Profil bulunamadı' });
            }

            res.status(200).json(profile);
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }

    static async updateProfile(req: AuthRequest, res: Response) {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return res.status(401).json({ message: 'Yetkilendirme gerekli' });
            }

            const profileData: UserProfile = req.body;
            
            // Email değişikliği varsa, email'in benzersiz olduğunu kontrol et
            if (profileData.email) {
                const existingUser = await UserModel.findByEmail(profileData.email);
                if (existingUser && existingUser.id !== userId) {
                    return res.status(400).json({ message: 'Bu email adresi zaten kullanımda' });
                }
            }

            const updatedProfile = await UserModel.update(userId, profileData);
            
            res.status(200).json({
                message: 'Profil başarıyla güncellendi',
                profile: updatedProfile
            });
        } catch (error) {
            res.status(500).json({ message: 'Sunucu hatası', error });
        }
    }
} 