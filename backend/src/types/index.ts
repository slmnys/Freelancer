export interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'developer';
    created_at: Date;
}

export interface Category {
    id: number;
    name: string;
    description?: string;
}

export interface Product {
    id: number;
    title: string;
    description: string;
    category_id: number;
    base_price: number;
    developer_id: number;
    features: string[];
    delivery_time: number;
    status: 'active' | 'inactive';
    created_at: Date;
}

export interface Project {
    id: number;
    product_id: number;
    customer_id: number;
    developer_id: number;
    status: 'pending' | 'negotiating' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
    requirements: string;
    custom_features: string[];
    price: number;
    start_date: Date | null;
    end_date: Date | null;
    created_at: Date;
}

export interface Conversation {
    id: number;
    project_id: number;
    customer_id: number;
    developer_id: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    customer_approved: boolean;
    developer_approved: boolean;
    final_price: number;
    created_at: Date;
}

export interface Message {
    id: number;
    conversation_id: number;
    sender_id: number;
    receiver_id: number;
    message: string;
    read: boolean;
    created_at: Date;
} 
import { Request } from 'express';

export interface CustomRequest extends Request {
    user?: {
        id: number;
        email: string;
        role: string;
    };
}