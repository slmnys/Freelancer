import express from 'express';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';

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
const httpServer = createServer(app);

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

// CORS ayarlarını güncelle
app.use(cors({
    origin: 'http://localhost:3001',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization']
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
app.use(express.urlencoded({ extended: true }));

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

// Socket.IO kurulumu
const io = new Server(httpServer, {
    cors: {
        origin: 'http://localhost:3001',
        methods: ['GET', 'POST'],
        credentials: true,
        allowedHeaders: ['Authorization']
    }
});

// Socket yetkilendirme middleware
io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
        return next(new Error('Yetkilendirme gerekli'));
    }
    
    try {
        // Token doğrulama
        const decoded = jwt.verify(token, process.env.JWT_SECRET || '736273');
        socket.data.user = decoded;
        next();
    } catch (err) {
        next(new Error('Geçersiz token'));
    }
});

// Socket.IO bağlantıları
io.on('connection', (socket) => {
    console.log('Yeni socket bağlantısı:', socket.id);
    
    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        console.log(`Socket ${socket.id} joined room ${roomId}`);
    });
    
    socket.on('chatMessage', async (data) => {
        console.log('Socket üzerinden gelen mesaj:', data);
        
        try {
            // Mesajı veritabanına kaydet
            const result = await pool.query(
                `INSERT INTO messages 
                 (message_content, content, sender_id, recipient_id, project_id, created_at)
                 VALUES ($1, $1, $2, $3, $4, CURRENT_TIMESTAMP)
                 RETURNING id, message_content, content, sender_id, recipient_id, project_id, created_at`,
                [data.content, data.senderId, data.receiverId, data.projectId]
            );
            
            console.log('Veritabanına kaydedilen mesaj:', result.rows[0]);
            
            // Mesajı socket üzerinden yayınla
            const savedMessage = {
                ...result.rows[0],
                id: result.rows[0].id.toString(),
                content: result.rows[0].message_content || result.rows[0].content
            };
            
            io.to(data.projectId.toString()).emit('newMessage', savedMessage);
        } catch (error) {
            console.error('Mesaj kaydetme hatası:', error);
            console.error('Hata detayları:', {
                error_message: (error as Error).message,
                error_detail: (error as any).detail,
                error_code: (error as any).code
            });
        }
    });
});

// Sunucuyu başlat
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

export { app, io };
