import nodemailer from 'nodemailer';

export class EmailService {
    private static transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        tls: {
            rejectUnauthorized: false
        }
    });

    static async sendVerificationEmail(email: string, token: string) {
        const verifyUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
        
        await this.transporter.sendMail({
            to: email,
            subject: 'Freelancer Platform - E-posta Doğrulama',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #1976d2;">Freelancer Platform'a Hoş Geldiniz!</h2>
                    <p>Merhaba,</p>
                    <p>Freelancer Platform'a kayıt olduğunuz için teşekkür ederiz. Hesabınızı aktifleştirmek için lütfen aşağıdaki butona tıklayın:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verifyUrl}" 
                           style="background-color: #1976d2; 
                                  color: white; 
                                  padding: 12px 24px; 
                                  text-decoration: none; 
                                  border-radius: 4px;
                                  display: inline-block;">
                            Hesabımı Doğrula
                        </a>
                    </div>
                    
                    <p>Bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Bu e-posta Freelancer Platform tarafından otomatik olarak gönderilmiştir.
                    </p>
                </div>
            `
        });
    }

    static async sendPasswordResetEmail(email: string, token: string) {
        const verifyUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
        
        try {
            // Doğrulama emaili ile aynı yapıyı kullanalım
            const info = await this.transporter.sendMail({
                from: `"Freelancer Platform" <${process.env.SMTP_USER}>`,
                to: email,
                subject: 'Freelancer Platform - Şifre Sıfırlama',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                        <h2 style="color: #1976d2;">Şifre Sıfırlama</h2>
                        <p>Merhaba,</p>
                        <p>Şifrenizi sıfırlamak için aşağıdaki butona tıklayın:</p>
                        
                        <div style="text-align: center; margin: 30px 0;">
                            <a href="${verifyUrl}" 
                               style="background-color: #1976d2; 
                                      color: white; 
                                      padding: 12px 24px; 
                                      text-decoration: none; 
                                      border-radius: 4px;
                                      display: inline-block;">
                                Şifremi Sıfırla
                            </a>
                        </div>
                        
                        <p>Bu işlemi siz yapmadıysanız, lütfen bu e-postayı dikkate almayın.</p>
                        <hr style="border: 1px solid #eee; margin: 20px 0;">
                        <p style="color: #666; font-size: 12px;">
                            Bu e-posta Freelancer Platform tarafından otomatik olarak gönderilmiştir.
                        </p>
                    </div>
                `
            });

            console.log('Şifre sıfırlama emaili gönderildi:', {
                messageId: info.messageId,
                to: email,
                resetUrl: verifyUrl
            });

            return true;
        } catch (error) {
            console.error('Email gönderme hatası:', {
                error,
                smtp: {
                    host: process.env.SMTP_HOST,
                    port: process.env.SMTP_PORT,
                    user: process.env.SMTP_USER
                }
            });
            throw error;
        }
    }

    static async testConnection() {
        try {
            // SMTP bağlantısını test et
            await this.transporter.verify();
            console.log('SMTP Bağlantısı başarılı');
            
            // Test e-postası gönder
            await this.transporter.sendMail({
                to: process.env.SMTP_USER,
                subject: 'SMTP Test',
                text: 'Bu bir test e-postasıdır.'
            });
            console.log('Test e-postası gönderildi');
            
            return true;
        } catch (error) {
            console.error('SMTP Bağlantı hatası:', error);
            return false;
        }
    }
} 