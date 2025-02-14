import React, { useState, useEffect } from 'react';
import {
  Badge,
  IconButton,
  Menu,
  MenuItem,
  Typography,
  Box,
  Divider,
  Avatar
} from '@mui/material';
import { Mail as MailIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSocket } from '../hooks/useSocket';
import api from '../utils/axios';

interface Message {
  id: string;
  content: string;
  sender_name: string;
  sender_id: string;
  project_id: number;
  project_title: string;
  created_at: string;
  read: boolean;
}

export function NotificationBadge() {
  const [unreadCount, setUnreadCount] = useState(0);
  const [messages, setMessages] = useState<Message[]>([]);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const navigate = useNavigate();
  const socket = useSocket();

  useEffect(() => {
    fetchUnreadMessages();
    
    const currentSocket = socket.current;
    
    if (currentSocket) {
      currentSocket.on('connect', () => {
        console.log('Socket bağlandı');
        fetchUnreadMessages();
      });
      
      currentSocket.on('newMessage', (message) => {
        console.log('Yeni mesaj alındı:', message);
        if (message.recipient_id === localStorage.getItem('userId')) {
          fetchUnreadMessages();
        }
      });
    }

    const interval = setInterval(fetchUnreadMessages, 10000); // Her 10 saniyede bir kontrol

    return () => {
      currentSocket?.off('newMessage');
      currentSocket?.off('connect');
      clearInterval(interval);
    };
  }, [socket]);

  const fetchUnreadMessages = async () => {
    try {
      const response = await api.get('/messages/unread');
      console.log('Okunmamış Mesajlar Yanıtı:', response.data);
      
      if (response.data.success && Array.isArray(response.data.data)) {
        const formattedMessages = response.data.data.map((msg: any) => ({
          id: msg.id,
          content: msg.content || msg.message_content || 'Mesaj içeriği yok',
          sender_name: msg.sender_name,
          sender_id: msg.sender_id,
          project_id: msg.project_id,
          project_title: msg.project_title,
          created_at: msg.created_at,
          read: false
        }));

        setMessages(formattedMessages);
        setUnreadCount(formattedMessages.length);
        console.log('İşlenmiş Mesajlar:', formattedMessages);
      }
    } catch (error: any) {
      console.error('Mesaj getirme hatası:', error);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMessageClick = async (message: Message) => {
    try {
      await api.put(`/messages/${message.id}/read`);
      
      // Mesajı okundu olarak işaretle ve listeden kaldır
      setMessages(prev => prev.filter(m => m.id !== message.id));
      setUnreadCount(prev => prev - 1);
      
      // Proje detay sayfasına yönlendir ve sohbeti aç
      navigate(`/projects/${message.project_id}`, {
        state: {
          openChat: true,
          recipientId: message.sender_id.toString()
        }
      });
      
      handleClose();
    } catch (error) {
      console.error('Mesaj işlenemedi:', error);
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={unreadCount} color="error">
          <MailIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { width: 320, maxHeight: 400 }
        }}
      >
        <Box sx={{ p: 2 }}>
          <Typography variant="h6">Mesajlar</Typography>
        </Box>
        <Divider />
        
        {messages.length === 0 ? (
          <MenuItem disabled>
            <Typography variant="body2">Yeni mesaj yok</Typography>
          </MenuItem>
        ) : (
          messages.map((message) => (
            <MenuItem 
              key={message.id} 
              onClick={() => handleMessageClick(message)}
              sx={{ 
                py: 1.5,
                px: 2,
                borderBottom: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1 }}>
                <Avatar sx={{ width: 32, height: 32 }}>
                  {message.sender_name?.charAt(0) || '?'}
                </Avatar>
                <Box>
                  <Typography variant="subtitle2">
                    {message.sender_name || 'Bilinmeyen Kullanıcı'}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" noWrap>
                    {message.content || 'Mesaj içeriği yok'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {message.created_at ? new Date(message.created_at).toLocaleString('tr-TR') : ''}
                  </Typography>
                </Box>
              </Box>
            </MenuItem>
          ))
        )}
      </Menu>
    </>
  );
} 