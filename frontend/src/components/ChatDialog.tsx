import { useState, useRef, useEffect } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
  Stack
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon, Remove as MinimizeIcon } from '@mui/icons-material';
import { useMessages } from '../hooks/useMessages';
import Draggable from 'react-draggable';
import { ChatMessage } from '../types/chat';
import api from '../utils/axios';

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  recipientId?: string;
}

function ChatDialog({ open, onClose, projectId }: ChatDialogProps) {
  const [recipientId, setRecipientId] = useState<string>('');
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef(null);
  
  // useMessages hook'unu recipientId varsa kullan
  const { messages, isLoading, sendMessage } = useMessages(projectId, recipientId);

  // Otomatik scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchProjectDetails = async () => {
        try {
            const token = localStorage.getItem('token');
            const userId = localStorage.getItem('userId');

            // Debug için userId'nin değerini kontrol edelim
            console.log('Mevcut userId:', {
                rawUserId: userId,
                fromStorage: localStorage.getItem('userId'),
                allStorage: { ...localStorage }
            });

            if (!token || !userId) {
                console.error('Kullanıcı bilgileri eksik:', { token: !!token, userId: !!userId });
                return;
            }

            const projectResponse = await api.get(`/projects/${projectId}`);
            
            if (projectResponse.data?.project) {
                const project = projectResponse.data.project;
                const parsedUserId = parseInt(userId);

                // Debug için proje ve ID karşılaştırması
                console.log('ID Karşılaştırması:', {
                    parsedUserId,
                    creatorId: project.creator_id,
                    customerId: project.customer_id,
                    rawUserId: userId
                });

                const newRecipientId = parsedUserId === project.creator_id ? 
                    project.customer_id : project.creator_id;

                setRecipientId(newRecipientId.toString());
            }
        } catch (error) {
            console.error('Proje detayları alınamadı:', error);
        }
    };

    if (open && projectId) {
        fetchProjectDetails();
    }
  }, [open, projectId]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form gönderildi:', { newMessage, projectId, recipientId });
    
    if (newMessage.trim()) {
        sendMessage(newMessage, {
            onSuccess: () => {
                console.log('Mesaj gönderme başarılı');
                setNewMessage('');
                scrollToBottom();
            },
            onError: (error) => {
                console.error('Mesaj gönderme hatası:', error);
            }
        });
    }
  };

  if (!open) return null;

  return (
    <Draggable 
      handle=".chat-header" 
      nodeRef={nodeRef}
    >
      <Paper
        ref={nodeRef}
        sx={{
          position: 'fixed',
          bottom: 0,
          right: 30,
          width: 300,
          height: isMinimized ? '40px' : '400px',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 3,
          zIndex: 1000,
        }}
      >
        {/* Sohbet Başlığı */}
        <Box
          className="chat-header"
          sx={{
            p: 1,
            bgcolor: 'primary.main',
            color: 'white',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            cursor: 'move',
          }}
        >
          <Typography variant="subtitle2">Mesajlar</Typography>
          <Box>
            <IconButton size="small" onClick={() => setIsMinimized(!isMinimized)} sx={{ color: 'white' }}>
              <MinimizeIcon />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            {/* Mesaj Listesi */}
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 1 }}>
              <Stack spacing={1}>
                {isLoading ? (
                  <Typography variant="body2" align="center">Mesajlar yükleniyor...</Typography>
                ) : (
                  messages?.map((message: ChatMessage) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.isSender ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1,
                          maxWidth: '70%',
                          bgcolor: message.isSender ? 'primary.main' : 'grey.100',
                          color: message.isSender ? 'white' : 'text.primary',
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">{message.content}</Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
                <div ref={messagesEndRef} />
              </Stack>
            </Box>

            {/* Mesaj Gönderme Formu */}
            <Box 
              component="form" 
              onSubmit={handleSend} 
              sx={{ 
                p: 1, 
                display: 'flex', 
                gap: 1, 
                borderTop: 1, 
                borderColor: 'divider' 
              }}
            >
              <TextField
                fullWidth
                size="small"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Mesajınızı yazın..."
                variant="outlined"
              />
              <IconButton 
                color="primary" 
                type="submit" 
                disabled={!newMessage.trim()}
              >
                <SendIcon />
              </IconButton>
            </Box>
          </>
        )}
      </Paper>
    </Draggable>
  );
}

export default ChatDialog; 