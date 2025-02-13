import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../utils/axios';
import { ChatMessage } from '../types/chat';

interface Message {
    _id: string;
    conversation_id: number;
    sender: {
        _id: string;
        name: string;
        email: string;
    };
    receiver_id: number;
    content: string;
    project_id: number;
    status: 'sent' | 'delivered' | 'read';
    read: boolean;
    createdAt: string;
}

interface SendMessageOptions {
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function useMessages(projectId: string, recipientId: string) {
    const queryClient = useQueryClient();

    const { data: messages, isLoading } = useQuery<ChatMessage[]>({
        queryKey: ['messages', projectId],
        queryFn: async () => {
            try {
                const response = await api.get(`/messages/project/${projectId}`);
                console.log('Mesaj yanıtı:', response.data);
                return response.data.data.map((msg: any) => ({
                    id: msg.id,
                    content: msg.content || msg.message_content,
                    createdAt: msg.created_at,
                    isSender: msg.sender_id === parseInt(localStorage.getItem('userId') || '0')
                }));
            } catch (error) {
                console.error('Mesaj getirme hatası:', error);
                throw error;
            }
        },
        enabled: !!projectId && !!localStorage.getItem('userId')
    });

    const sendMessage = useMutation<Message, Error, string, unknown>({
        mutationFn: async (content: string) => {
            try {
                console.log('Mesaj gönderiliyor:', { content, projectId, recipientId });
                
                const response = await api.post('/messages', {
                    content,
                    projectId,
                    recipientId
                });
                
                console.log('API Yanıtı:', response.data);
                
                if (!response.data.success) {
                    throw new Error(response.data.message || 'Mesaj gönderilemedi');
                }
                
                return response.data.data;
            } catch (error) {
                console.error('Mesaj gönderme hatası:', error);
                throw error;
            }
        },
        onSuccess: () => {
            console.log('Mesaj başarıyla gönderildi');
            queryClient.invalidateQueries({ queryKey: ['messages', projectId] });
        },
        onError: (error) => {
            console.error('Mutation hatası:', error);
        }
    });

    const handleSendMessage = (content: string, options?: SendMessageOptions) => {
        sendMessage.mutate(content, {
            onSuccess: () => {
                options?.onSuccess?.();
            },
            onError: (error) => {
                options?.onError?.(error);
            }
        });
    };

    return {
        messages,
        isLoading,
        sendMessage: handleSendMessage
    };
} 