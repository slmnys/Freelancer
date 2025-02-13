import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';

import userRoutes from './routes/user.routes';
import productRoutes from './routes/product.routes';
import orderRoutes from './routes/order.routes';
import authRoutes from './routes/auth.routes';
import passwordResetRoutes from './routes/password-reset.routes';
import profileRoutes from './routes/profile.routes';
import categoryRoutes from './routes/category.routes';
import reviewRoutes from './routes/review.routes';
import { ratingRoutes } from './routes/rating.routes';
import notificationRoutes from './routes/notification.routes';
import projectRoutes from './routes/project.routes';
import messageRoutes from './routes/message.routes';
import { pool } from './config/database';

const app = express();

// Middleware

// Request logging middleware
app.use((req, res, next) => {
    console.log('\n--- Yeni İstek ---');
    console.log('URL:', req.url);
    console.log('Method:', req.method);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Files:', req.files);
    console.log('----------------\n');
    next();
});

// Statik dosya servisini en başa al
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// CORS ayarları
app.use(cors({
    origin: 'http://localhost:3001', // Frontend'in çalıştığı port
    credentials: true // Frontend ile güvenli veri alışverişi
}));

// CORS hata ayıklama
app.use((req, res, next) => {
    console.log('İstek detayları:', {
        method: req.method,
        url: req.url,
        headers: req.headers
    });
    next();
});

app.use(helmet());

app.use(express.json());

// Uploads klasörünü oluştur
const profileImagesDir = path.join(path.join(__dirname, '../uploads'), 'profile-images');
if (!fs.existsSync(profileImagesDir)) {
    fs.mkdirSync(profileImagesDir, { recursive: true });
    console.log('Profile images klasörü oluşturuldu:', profileImagesDir);
}

// Routes
app.get('/api/test', (req, res) => {
    res.json({ message: 'API çalışıyor' });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/ratings', ratingRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/messages', messageRoutes);

// Test endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok',
        timestamp: new Date(),
        database: pool.totalCount > 0 ? 'connected' : 'disconnected'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export default app;
