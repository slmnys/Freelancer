// Rate limiting eklenecek
// Password complexity kontrolü eklenecek
// Session yönetimi eklenecek 

import rateLimit from 'express-rate-limit';
import { NextFunction, Request, Response } from 'express';

// Rate limiting
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 5 // IP başına maksimum istek
});

// Password complexity kontrolü
export const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    return password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
};

// XSS koruması
export const xssProtection = (req: Request, res: Response, next: NextFunction) => {
    // Request body'deki string değerleri temizle
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key].replace(/<[^>]*>/g, '');
            }
        });
    }
    next();
}; 