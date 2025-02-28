import { Request, Response, NextFunction } from 'express';
import { pool } from '../config/database';

// Auth middleware tarafından eklenen kullanıcı bilgileri için genişletilmiş Request tipi
interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

/**
 * Proje sahibine mesaj gönderme
 */
export const sendMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, projectId, recipientId } = req.body;
    const senderId = req.user?.id;

    // Debug log
    console.log('Mesaj Gönderme Detayları:', {
      senderId,
      recipientId,
      projectId,
      content
    });

    // Mesajı kaydet
    const result = await pool.query(
      `INSERT INTO messages 
       (message_content, sender_id, recipient_id, project_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING 
         id, 
         message_content, 
         sender_id, 
         recipient_id, 
         project_id, 
         created_at`,
      [content, senderId, recipientId, projectId]
    );

    // Gönderici bilgilerini al
    const senderInfo = await pool.query(
      `SELECT first_name, last_name FROM users WHERE id = $1`,
      [senderId]
    );

    const messageData = {
      ...result.rows[0],
      sender_name: `${senderInfo.rows[0].first_name} ${senderInfo.rows[0].last_name}`
    };

    console.log('Kaydedilen Mesaj:', messageData);

    return res.status(201).json({
      success: true,
      data: messageData
    });
  } catch (error) {
    console.error('Mesaj Gönderme Hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Mesaj gönderilemedi'
    });
  }
};

/**
 * Bu projeye ait mesajları getir.
 * Gönderici veya alıcı olarak giriş yapmış kullanıcının olduğu mesajları döndürür.
 */
export const getProjectMessages = async (req: AuthRequest, res: Response) => {
  try {
    const { projectId } = req.params;
    const userId = req.user?.id;

    // Debug log
    console.log('Proje Mesajları İsteği:', { projectId, userId });

    const result = await pool.query(
      `SELECT 
          m.id,
          m.message_content as content,
          m.created_at,
          m.sender_id,
          m.recipient_id,
          m.project_id,
          CONCAT(u.first_name, ' ', u.last_name) as sender_name
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      WHERE m.project_id = $1
      AND (
          m.sender_id = $2 
          OR m.recipient_id = $2
      )
      ORDER BY m.created_at ASC`,
      [projectId, userId]
    );

    console.log('Bulunan Mesaj Sayısı:', result.rows.length);

    return res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        id: row.id.toString(),
        sender_name: row.sender_name,
        isSender: row.sender_id === userId
      }))
    });
  } catch (error) {
    console.error('Mesaj getirme hatası:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Mesajlar getirilemedi' 
    });
  }
};

export const getUnreadMessages = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    const result = await pool.query(
      `SELECT 
        m.id,
        m.message_content as content,
        m.created_at,
        m.project_id,
        m.read,
        m.sender_id,
        m.recipient_id,
        u.first_name,
        u.last_name,
        CONCAT(u.first_name, ' ', u.last_name) as sender_name,
        p.title as project_title
      FROM messages m
      INNER JOIN users u ON m.sender_id = u.id
      INNER JOIN projects p ON m.project_id = p.id
      WHERE m.recipient_id = $1 
      AND (m.read = false OR m.read IS NULL)
      ORDER BY m.created_at DESC`,
      [userId]
    );

    return res.json({
      success: true,
      data: result.rows.map(row => ({
        ...row,
        id: row.id.toString(),
        sender_name: row.first_name && row.last_name 
          ? `${row.first_name} ${row.last_name}`
          : `Kullanıcı #${row.sender_id}`,
        content: row.message_content || 'Mesaj içeriği yok',
        project_title: row.title || 'Proje başlığı yok'
      }))
    });
  } catch (error) {
    console.error('Hata:', error);
    return res.status(500).json({
      success: false,
      message: 'Mesajlar alınamadı'
    });
  }
};

export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const result = await pool.query(
      `UPDATE messages 
       SET read = true 
       WHERE id = $1 AND recipient_id = $2
       RETURNING *`,
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Mesaj bulunamadı'
      });
    }

    return res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Mesaj işaretlenemedi:', error);
    return res.status(500).json({
      success: false,
      message: 'Mesaj işaretlenemedi'
    });
  }
};

export const getChatHistory = async (req: AuthRequest, res: Response) => {
    try {
        const { projectId, recipientId } = req.params;
        const userId = req.user?.id;

        console.log('Chat geçmişi isteği:', {
            userId,
            recipientId,
            projectId
        });

        // İki yönlü mesajlaşmayı getir
        const result = await pool.query(
            `SELECT 
                m.*,
                CONCAT(u.first_name, ' ', u.last_name) as sender_name,
                CASE WHEN m.sender_id = $1 THEN true ELSE false END as is_sender
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE m.project_id = $1
            AND (
                (m.sender_id = $2 AND m.recipient_id = $3)
                OR 
                (m.sender_id = $3 AND m.recipient_id = $2)
            )
            ORDER BY m.created_at ASC`,
            [projectId, userId, recipientId]
        );

        console.log('Bulunan mesaj sayısı:', result.rows.length);

        const messages = result.rows.map(msg => ({
            id: msg.id,
            content: msg.message_content,
            sender_name: msg.sender_name,
            created_at: msg.created_at,
            isSender: msg.is_sender,
            sender_id: msg.sender_id,
            recipient_id: msg.recipient_id
        }));

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        console.error('Chat geçmişi hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar getirilemedi'
        });
    }
};

const createMessage = async (req: AuthRequest, res: Response) => {
  try {
    const { content, projectId, recipientId } = req.body;
    
    // Tüm alanların varlığını kontrol et
    if (!content || !projectId || !recipientId) {
      return res.status(400).json({
        success: false,
        message: 'Eksik alan: content, projectId veya recipientId'
      });
    }
    
    // Sayısal ID kontrolü
    const numericProjectId = parseInt(projectId, 10);
    const numericRecipientId = parseInt(recipientId, 10);
    if (isNaN(numericProjectId) || isNaN(numericRecipientId)) {
      return res.status(400).json({
        success: false,
        message: 'Geçersiz ID formatı'
      });
    }
    
    // Proje ve alıcı varlık kontrolü
    const projectExists = await pool.query('SELECT id FROM projects WHERE id = $1', [numericProjectId]);
    const recipientExists = await pool.query('SELECT id FROM users WHERE id = $1', [numericRecipientId]);
    
    if (projectExists.rowCount === 0 || recipientExists.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Proje veya alıcı bulunamadı'
      });
    }

    const result = await pool.query(
      `INSERT INTO messages 
       (message_content, sender_id, recipient_id, project_id, created_at)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [content, req.user?.id, recipientId, projectId]
    );

    return res.status(201).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Mesaj oluşturma hatası:', error);
    return res.status(500).json({
      success: false,
      message: 'Mesaj oluşturulamadı'
    });
  }
};

// Mesaj validasyon middleware'i
const validateMessage = (req: Request, res: Response, next: NextFunction) => {
  const { content, projectId, recipientId } = req.body;
  const errors = [];
  
  if (!content || content.trim().length < 1) errors.push('Mesaj içeriği gereklidir');
  if (!Number.isInteger(Number(projectId))) errors.push('Geçersiz proje ID');
  if (!Number.isInteger(Number(recipientId))) errors.push('Geçersiz alıcı ID');
  
  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }
  next();
};

export const getMessages = async (req: Request, res: Response) => {
    try {
        const { recipientId, projectId } = req.params; // URL'den parametreleri al
        const userId = (req as any).user?.id;

        console.log('Mesaj getirme parametreleri:', {
            userId,
            recipientId,
            projectId
        });

        const result = await pool.query(
            `SELECT 
                m.*,
                u.first_name || ' ' || u.last_name as sender_name,
                CASE WHEN m.sender_id = $1 THEN true ELSE false END as is_sender
            FROM messages m
            JOIN users u ON m.sender_id = u.id
            WHERE (m.sender_id = $1 AND m.recipient_id = $2)
               OR (m.sender_id = $2 AND m.recipient_id = $1)
            AND m.project_id = $3
            ORDER BY m.created_at ASC`,
            [userId, recipientId, projectId]
        );

        console.log('Bulunan mesajlar:', result.rows);

        res.json({
            success: true,
            messages: result.rows
        });
    } catch (error) {
        console.error('Mesaj getirme hatası:', error);
        res.status(500).json({
            success: false,
            message: 'Mesajlar alınırken bir hata oluştu'
        });
    }
}
