import { Pool } from 'pg';

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ecommerce_db',
    password: '736273',
    port: 5432,
});

// Bağlantıyı test edelim
pool.connect()
    .then(() => console.log('Veritabanına başarıyla bağlandı'))
    .catch(err => console.error('Veritabanı bağlantı hatası:', err));

export default pool; 