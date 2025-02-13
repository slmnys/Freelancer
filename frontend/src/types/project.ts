export interface Project {
    id: number;
    status: string;
    conversation_id: string;
    developer_id: number;
    price: number;
    requirements: string;
    custom_features?: string[];
    created_at: string;
} 