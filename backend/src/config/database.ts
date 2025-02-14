import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Çevre değişkenlerini kontrol et
console.log('Çevre değişkenleri:', {
    DB_HOST: process.env.DB_HOST,
    DB_PORT: process.env.DB_PORT,
    DB_NAME: process.env.DB_NAME,
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'undefined'
});

const dbConfig = {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD
};

console.log('Bağlantı ayarları:', {
    ...dbConfig,
    password: '***'
});

export const pool = new Pool(dbConfig);

// Bağlantıyı test et
pool.connect()
    .then(client => {
        console.log('Veritabanına bağlandı');
        // Veritabanı bilgilerini kontrol et
        return client.query('SELECT current_database(), current_user')
            .then(result => {
                console.log('Bağlı veritabanı:', result.rows[0]);
                client.release();
            })
            .catch(err => {
                console.error('Sorgu hatası:', err.message);
                client.release();
            });
    })
    .catch(err => {
        console.error('Bağlantı hatası detayı:', {
            message: err.message,
            code: err.code,
            detail: err.detail
        });
    });

// Pool ayarlarını kontrol edin (tekrar tanımlama yapılmamalı)
