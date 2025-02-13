import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);

interface Conversation {
    id: number;
    project_id: number;
    customer_id: number;
    developer_id: number;
    status: 'pending' | 'active' | 'completed' | 'cancelled';
    created_at: Date;
    customer_approved: boolean;
    developer_approved: boolean;
    final_price: number;
} 