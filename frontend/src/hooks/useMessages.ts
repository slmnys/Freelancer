import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
// ChatMessage import'unu kaldır
// import { ChatMessage } from '../types/chat';

interface ChatMessage {
  id: string;
  content: string;
  created_at: string;
  sender_id: number;
  recipient_id: number;
  project_id: number;
  isSender: boolean;
  sender_name: string;
}

export function useMessages(projectId: string, recipientId: string) {
    const queryClient = useQueryClient();

    const { data: messages, isLoading, error } = useQuery<ChatMessage[]>({
        queryKey: ['messages', projectId],
        queryFn: async () => {
            try {
                const response = await api.get(`/messages/project/${projectId}`);
                console.log('API Response:', response.data);

                if (!response.data.success) {
                    throw new Error(response.data.message);
                }

                const messages = response.data.data || [];
                const user = localStorage.getItem('user');
                const userId = user ? JSON.parse(user).id : null;
                console.log('Current User ID:', userId); // Debug log

                return messages.map((msg: any) => {
                    const messageDate = msg.created_at 
                        ? new Date(msg.created_at).toLocaleString('tr-TR')
                        : new Date().toLocaleString('tr-TR');

                    return {
                        id: msg.id || Date.now() + Math.random(),
                        content: msg.message_content || msg.content || '',
                        created_at: messageDate,
                        sender_id: msg.sender_id || 0,
                        recipient_id: msg.recipient_id || 0,
                        project_id: Number(msg.project_id) || 0,
                        isSender: userId ? msg.sender_id === Number(userId) : false,
                        sender_name: msg.sender_name || ''
                    };
                });
            } catch (error) {
                console.error('Mesaj getirme hatası:', error);
                throw error;
            }
        },
        enabled: Boolean(projectId && localStorage.getItem('token'))
    });

    const getUser = () => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch (error) {
            console.error('Kullanıcı verisi okunamadı:', error);
            return {};
        }
    };

    const user = getUser();
    if (!user?.id) {
        throw new Error('Oturum açmalısınız!');
    }
    const senderId = parseInt(user.id, 10);

    const sendMessage = useMutation({
        mutationFn: async (content: string) => {
            if (!recipientId || recipientId === '0') {
                throw new Error('Geçerli bir alıcı seçmelisiniz');
            }
            const response = await api.post('/messages', {
                content,
                projectId: parseInt(projectId),
                recipientId: parseInt(recipientId),
                senderId: senderId
            });
            
            if (!response.data.success) {
                throw new Error(response.data.message);
            }
            
            return response.data.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['messages', projectId]);
        }
    });

    const fetchUnreadMessages = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                console.error('Token bulunamadı');
                return;
            }

            const response = await api.get('/messages/unread', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('API yanıtı:', response.data);
            
            if (response.data.success && Array.isArray(response.data.data)) {
                // setMessages(response.data.data);
                // setUnreadCount(response.data.data.length);
            } else {
                console.error('Geçersiz API yanıtı:', response.data);
            }
        } catch (error) {
            console.error('Okunmamış mesajlar alınamadı:', error);
        }
    };

    return {
        messages: messages || [],
        isLoading,
        error,
        sendMessage: (content: string) => sendMessage.mutate(content),
        fetchUnreadMessages
    };
} 