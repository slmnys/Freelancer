import { Request, Response, NextFunction } from 'express';

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
    // Şifre undefined veya null ise
    if (!password) {
        return { 
            isValid: false, 
            message: 'Şifre gereklidir' 
        };
    }

    const minLength = 6;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);
    
    if (password.length < minLength) {
        return { 
            isValid: false, 
            message: 'Şifre en az 6 karakter olmalıdır' 
        };
    }
    if (!hasUpperCase) {
        return { 
            isValid: false, 
            message: 'Şifre en az bir büyük harf içermelidir' 
        };
    }
    if (!hasLowerCase) {
        return { 
            isValid: false, 
            message: 'Şifre en az bir küçük harf içermelidir' 
        };
    }
    if (!hasNumbers) {
        return { 
            isValid: false, 
            message: 'Şifre en az bir rakam içermelidir' 
        };
    }
    if (!hasSpecialChar) {
        return { 
            isValid: false, 
            message: 'Şifre en az bir özel karakter içermelidir (!@#$%^&*)' 
        };
    }
    
    return { isValid: true, message: 'Geçerli şifre' };
};

export const passwordValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const { password, newPassword } = req.body;
    // Şifre veya yeni şifre kontrolü
    const passwordToValidate = newPassword || password;

    if (!passwordToValidate) {
        return res.status(400).json({
            success: false,
            message: 'Şifre gereklidir'
        });
    }

    const validation = validatePassword(passwordToValidate);
    
    if (!validation.isValid) {
        return res.status(400).json({
            success: false,
            message: validation.message
        });
    }
    
    next();
}; 