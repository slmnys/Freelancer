import { useState, useRef, useEffect } from 'react';
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
import { useMessages } from '../hooks/useMessages';

interface ChatDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  recipientId: string;
}

function ChatDialog({ open, onClose, projectId, recipientId }: ChatDialogProps) {
  const [newMessage, setNewMessage] = useState('');
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const nodeRef = useRef<HTMLDivElement>(null);
  const socket = useSocket(projectId);
  
  const parsedProjectId = parseInt(projectId, 10);
  const parsedRecipientId = parseInt(recipientId, 10);
  
  const { messages: fetchedMessages, isLoading, sendMessage } = useMessages(
    projectId,
    recipientId
  );
  
  useEffect(() => {
    scrollToBottom();
  }, [fetchedMessages]);

  useEffect(() => {
    const currentSocket = socket.current;
    
    const messageHandler = (message: any) => {
      if (message.project_id === parsedProjectId) {
        scrollToBottom();
      }
    };

    currentSocket?.on('newMessage', messageHandler);
    return () => {
      currentSocket?.off('newMessage', messageHandler);
    };
  }, [parsedProjectId, socket]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage);
      setNewMessage('');
      
      socket.current?.emit('newMessage', {
        content: newMessage,
        projectId: parsedProjectId,
        recipientId: parsedRecipientId,
        senderId: parseInt(localStorage.getItem('userId') || '0', 10)
      });

      scrollToBottom();
    } catch (error) {
      console.error('Mesaj gönderme hatası:', error);
      alert(`Mesaj gönderilemedi: ${(error as Error).message}`);
    }
  };

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
              {isLoading ? (
                <Typography variant="body2" align="center">
                  Mesajlar yükleniyor...
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {fetchedMessages?.map((message) => (
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
                          borderRadius: 2,
                        }}
                      >
                        <Typography variant="body2">
                          {!message.isSender && (
                            <Typography 
                              component="span" 
                              sx={{ 
                                fontSize: '0.8rem', 
                                color: 'text.secondary',
                                display: 'block',
                                mb: 0.5 
                              }}
                            >
                              {message.sender_name}
                            </Typography>
                          )}
                          {message.content || 'Boş mesaj'}
                        </Typography>
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
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
                  type="submit"
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
}

export default ChatDialog; 