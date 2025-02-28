import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Paper,
  TextField,
  IconButton,
  Box,
  Typography,
  Stack,
  Alert
} from '@mui/material';
import { Send as SendIcon, Close as CloseIcon, Remove as MinimizeIcon } from '@mui/icons-material';
import Draggable from 'react-draggable';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/axios';

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  recipientId: string;
  projectId: string;
}

interface Message {
  id: number;
  content: string;
  sender_name: string;
  created_at: string;
  isSender: boolean;
}

const ChatDialog: React.FC<ChatDialogProps> = ({ open, onClose, recipientId, projectId }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const socket = useSocket();
  
  const parsedProjectId = parseInt(projectId, 10);
  const parsedRecipientId = parseInt(recipientId, 10);
  
  const loadMessages = useCallback(async () => {
    try {
        setLoading(true);
        console.log('Mesaj yükleme isteği:', {
            recipientId,
            projectId,
            url: `/messages/chat/${projectId}/${recipientId}`
        });

        const response = await api.get(`/messages/chat/${projectId}/${recipientId}`);
        console.log('Mesaj yükleme cevabı:', response.data);

        if (response.data.success) {
            setMessages(response.data.data.map((msg: any) => ({
                ...msg,
                isSender: msg.sender_id === parseInt(localStorage.getItem('userId') || '0')
            })));
        }
    } catch (error) {
        console.error('Mesaj yükleme detaylı hata:', error);
    } finally {
        setLoading(false);
    }
}, [recipientId, projectId]);

  useEffect(() => {
    if (open && recipientId) {
      loadMessages();
    }
  }, [open, recipientId, loadMessages]);

  useEffect(() => {
    const currentSocket = socket.current;
    
    const messageHandler = (message: any) => {
        console.log('Yeni mesaj alındı:', message);
        
        if (message.projectId === parseInt(projectId) && 
            (message.senderId === parseInt(recipientId) || message.recipientId === parseInt(recipientId))) {
            loadMessages();
            scrollToBottom();
        }
    };

    currentSocket?.on('newMessage', messageHandler);
    return () => {
        currentSocket?.off('newMessage', messageHandler);
    };
}, [projectId, recipientId, loadMessages, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !recipientId) return;

    try {
        console.log('Mesaj gönderme isteği:', {
            recipientId,
            projectId,
            content: newMessage
        });

        const response = await api.post('/messages', {
            recipientId: parseInt(recipientId),
            projectId: parseInt(projectId),
            content: newMessage.trim()
        });

        console.log('Mesaj gönderme cevabı:', response.data);

        if (response.data.success) {
            setNewMessage('');
            await loadMessages();
            scrollToBottom();

            socket.current?.emit('newMessage', {
                content: newMessage,
                projectId: parseInt(projectId),
                recipientId: parseInt(recipientId),
                senderId: parseInt(localStorage.getItem('userId') || '0')
            });
        }
    } catch (error) {
        console.error('Mesaj gönderme detaylı hata:', error);
    }
  };

  if (!projectId || !recipientId) {
    return <Alert severity="error">Geçersiz iletişim kanalı</Alert>;
  }
  
  if (isNaN(parsedProjectId) || parsedProjectId <= 0) {
    return <Alert severity="error">Geçersiz proje</Alert>;
  }
  
  if (isNaN(parsedRecipientId) || parsedRecipientId <= 0) {
    return <Alert severity="error">Geçersiz alıcı</Alert>;
  }

  if (!open) return null;

  return (
    <Draggable 
      handle=".chat-header" 
      nodeRef={nodeRef}
      bounds="parent"
      defaultPosition={{ x: 0, y: 0 }}
    >
      <Paper
        ref={nodeRef}
        elevation={3}
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
          backgroundColor: 'background.paper'
        }}
      >
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
            <IconButton 
              size="small" 
              onClick={() => setIsMinimized(!isMinimized)} 
              sx={{ color: 'white' }}
            >
              <MinimizeIcon />
            </IconButton>
            <IconButton size="small" onClick={onClose} sx={{ color: 'white' }}>
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {!isMinimized && (
          <>
            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
              {loading ? (
                <Typography variant="body2" align="center">
                  Mesajlar yükleniyor...
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {messages?.map((message) => (
                    <Box
                      key={message.id}
                      sx={{
                        display: 'flex',
                        justifyContent: message.isSender ? 'flex-end' : 'flex-start',
                      }}
                    >
                      <Paper
                        sx={{
                          p: 1.5,
                          maxWidth: '80%',
                          bgcolor: message.isSender ? 'primary.main' : 'grey.100',
                          color: message.isSender ? 'white' : 'text.primary',
                          borderRadius: message.isSender 
                            ? '20px 20px 0 20px'
                            : '20px 20px 20px 0',
                        }}
                      >
                        {!message.isSender && (
                          <Typography 
                            component="span" 
                            sx={{ 
                              fontSize: '0.8rem', 
                              color: message.isSender ? 'white' : 'text.secondary',
                              display: 'block',
                              mb: 0.5 
                            }}
                          >
                            {message.sender_name}
                          </Typography>
                        )}
                        <Typography variant="body2">
                          {message.content || 'Boş mesaj'}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            opacity: 0.7,
                            display: 'block',
                            textAlign: message.isSender ? 'right' : 'left'
                          }}
                        >
                          {new Date(message.created_at).toLocaleTimeString('tr-TR')}
                        </Typography>
                      </Paper>
                    </Box>
                  ))}
                  <div ref={messagesEndRef} />
                </Stack>
              )}
            </Box>

            <Box
              component="form"
              onSubmit={handleSend}
              sx={{
                p: 2,
                borderTop: 1,
                borderColor: 'divider',
                backgroundColor: 'background.paper',
              }}
            >
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Mesajınızı yazın..."
                  variant="outlined"
                  inputProps={{ maxLength: 500 }}
                />
                <IconButton
                  color="primary"
                  onClick={handleSend}
                  disabled={!newMessage.trim()}
                >
                  <SendIcon />
                </IconButton>
              </Stack>
            </Box>
          </>
        )}
      </Paper>
    </Draggable>
  );
};

export default ChatDialog; 