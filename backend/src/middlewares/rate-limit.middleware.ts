import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 25 * 60 * 1000, // 15 dakika
    max: 15, // IP başına maksimum istek
    message: {
        success: false,
        message: 'Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin.'
    }
});

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 dakika
    max: 60, // IP başına dakikada 60 istek
    message: {
        success: false,
        message: 'Çok fazla istek gönderdiniz. Lütfen biraz bekleyin.'
    }
}); 