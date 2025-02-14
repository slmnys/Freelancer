import { pool } from '../config/database';

export interface IMessage {
    id?: number;
    project_id: number;
    sender_id: number;
    recipient_id: number;
    content: string;
    read?: boolean;
    created_at?: Date;
    sender_name?: string;
}

export class MessageModel {
    /**
     * Yeni mesaj oluşturma
     */
    static async create(message: IMessage): Promise<IMessage> {
        const result = await pool.query<IMessage>(
            `INSERT INTO messages 
             (project_id, sender_id, recipient_id, content, read, created_at)
             VALUES ($1, $2, $3, $4, $5, NOW())
             RETURNING *`,
            [
                message.project_id,
                message.sender_id,
                message.recipient_id,
                message.content,
                message.read ?? false
            ]
        );
        return result.rows[0];
    }

    /**
     * Bir projeye ait mesajları getirir
     */
    static async findByProject(projectId: number): Promise<IMessage[]> {
        const result = await pool.query<IMessage>(
            `SELECT * FROM messages
             WHERE project_id = $1
             ORDER BY created_at ASC`,
            [projectId]
        );
        return result.rows;
    }

    /**
     * Tek bir mesajı ID'ye göre getirir
     */
    static async findById(id: number): Promise<IMessage | null> {
        const result = await pool.query<IMessage>(
            `SELECT * FROM messages
             WHERE id = $1`,
            [id]
        );
        return result.rows[0] || null;
    }
}

export default MessageModel; 