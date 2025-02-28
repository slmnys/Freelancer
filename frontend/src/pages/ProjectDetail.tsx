import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Box, Typography, Card, CardContent, Button, Avatar, Chip, CircularProgress, Alert, Container } from '@mui/material';
import api from '../utils/axios';
import ChatDialog from '../components/ChatDialog';

interface Project {
  id: number;
  title: string;
  description: string;
  budget: number;
  deadline: string;
  category: string;
  customer_name: string;
  customer_image?: string;
  status: string;
  created_at: string;
  userId: string;
  customer_id: string;
  creator_id: string;
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [recipientId, setRecipientId] = useState('');
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [projectId, setProjectId] = useState('');

  useEffect(() => {
    const fetchProject = async () => {
      if (!id) return;
      try {
        setLoading(true);
        const response = await api.get(`/projects/${id}`);
        
        if (!response.data?.project) {
          throw new Error('Proje bulunamadı');
        }

        setProject(response.data.project);
      } catch (err) {
        console.error('Proje yükleme hatası:', err);
        setError('Proje yüklenemedi');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id]);

  useEffect(() => {
    if (project?.customer_id) {
      const validRecipientId = project.customer_id.toString();
      if (validRecipientId && validRecipientId !== recipientId) {
        console.log('RecipientID Güncellendi:', validRecipientId);
        setRecipientId(validRecipientId);
      }
    }
  }, [project, recipientId]);

  useEffect(() => {
    if (location.state?.openChat) {
      setDialogOpen(true);
      setRecipientId(project?.creator_id || '');
      setProjectId(project?.id.toString() || '');
    }
  }, [location.state?.openChat, project]);

  console.log('Proje Verisi:', {
    id: project?.id,
    customerId: project?.customer_id,
    rawData: project
  });

  const handleMessageClick = () => {
    if (project) {
      setDialogOpen(true);
      setRecipientId(project.creator_id);
      setProjectId(project.id.toString());
    }
  };

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  if (!project) return null;

  return (
    <Container maxWidth="lg">
      <Card sx={{ maxWidth: 800, margin: 'auto', mt: 4 }}>
        <CardContent>
          {/* Kategori */}
          <Chip 
            label={project.category}
            size="small"
            color="primary"
            sx={{ mb: 2 }}
          />
          {/* Başlık */}
          <Typography variant="h4" gutterBottom>
            {project.title}
          </Typography>
          {/* Açıklama */}
          <Typography variant="body1" gutterBottom>
            {project.description}
          </Typography>
          {/* Bütçe */}
          <Typography variant="body2" gutterBottom>
            <strong>Bütçe:</strong> {project.budget.toLocaleString('tr-TR')} ₺
          </Typography>
          {/* Teslim Tarihi */}
          <Typography variant="body2" gutterBottom>
            <strong>Teslim Tarihi:</strong> {new Date(project.deadline).toLocaleDateString('tr-TR')}
          </Typography>
          {/* Durum */}
          <Typography variant="body2" gutterBottom>
            <strong>Durum:</strong> {project.status === 'open' ? 'Açık' :
             project.status === 'in_progress' ? 'Devam Ediyor' :
             project.status === 'completed' ? 'Tamamlandı' : project.status}
          </Typography>
          {/* Oluşturulma Tarihi */}
          <Typography variant="body2" gutterBottom>
            <strong>Oluşturulma Tarihi:</strong> {new Date(project.created_at).toLocaleDateString('tr-TR')}
          </Typography>
          {/* Müşteri Bilgileri */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
            <Avatar 
              src={project.customer_image}
              sx={{ width: 40, height: 40, mr: 2 }}
            >
              {project.customer_name?.[0]}
            </Avatar>
            <Typography variant="body2">
              {project.customer_name}
            </Typography>
          </Box>
          {/* Geri Dön Butonu */}
          <Box sx={{ mt: 3 }}>
            <Button variant="contained" onClick={() => navigate(-1)}>
              Geri Dön
            </Button>
          </Box>
          <div className="project-actions">
            <Button 
              variant="contained" 
              color="primary"
              onClick={handleMessageClick}
              disabled={!project.creator_id}
              sx={{ mt: 2 }}
            >
              Mesaj Gönder
            </Button>
          </div>

          <ChatDialog
            open={dialogOpen}
            onClose={() => setDialogOpen(false)}
            recipientId={recipientId}
            projectId={projectId}
          />
        </CardContent>
      </Card>
    </Container>
  );
};

export default ProjectDetail;
