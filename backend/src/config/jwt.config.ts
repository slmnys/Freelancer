import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || '736273';

interface JwtPayload {
    userId: number;
    role: string;
}

export const generateToken = (userId: number, role: string): string => {
    return jwt.sign(
        { userId, role },
        JWT_SECRET,
        { expiresIn: '24h' }
    );
};

export const verifyToken = (token: string): JwtPayload => {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
}; 