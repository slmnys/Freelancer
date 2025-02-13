import { Message } from '../models/Message';

export const sendMessage = async (req, res) => {
    try {
        const { content, projectId, recipientId } = req.body;
        const senderId = req.user._id; // JWT'den gelen kullanıcı ID'si

        const message = await Message.create({
            sender: senderId,
            receiver: recipientId,
            project: projectId,
            content
        });

        await message.populate('sender', 'name email');

        res.status(201).json({
            success: true,
            data: message
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getProjectMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const userId = req.user._id; // JWT'den gelen kullanıcı ID'si

        const messages = await Message.find({
            project: projectId,
            $or: [
                { sender: userId },
                { receiver: userId }
            ]
        })
        .populate('sender', 'name email')
        .sort({ createdAt: 1 });

        res.json({
            success: true,
            data: messages
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
}; 