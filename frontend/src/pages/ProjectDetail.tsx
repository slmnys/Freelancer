import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress, Card, CardContent, Button, Avatar, Chip } from '@mui/material';
import api from '../utils/axios';
import { MessageOutlined as MessageIcon } from '@mui/icons-material';
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
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const fetchProjectDetail = async () => {
      if (!id) {
        setError("Geçersiz proje id.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await api.get(`/projects/${id}`);
        
        if (response.data && response.data.success) {
          if (response.data.project && response.data.project.budget && response.data.project.deadline && response.data.project.created_at) {
            setProject({
              ...response.data.project,
              budget: parseFloat(response.data.project.budget),
              deadline: new Date(response.data.project.deadline).toISOString(),
              created_at: new Date(response.data.project.created_at).toISOString(),
              customer_id: response.data.project.customer_id,
            });
          } else {
            setError("Veriler eksik veya hatalı.");
          }
        } else {
          setError("Proje bulunamadı.");
        }
      } catch (err: any) {
        console.error("Project detail fetch error:", err);
        setError(err.response?.data?.message || "Proje yüklenirken hata oluştu.");
      } finally {
        setLoading(false);
      }
    };

    fetchProjectDetail();
  }, [id]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (!project) return null;

  return (
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
            onClick={() => setIsChatOpen(true)}
            startIcon={<MessageIcon />}
            sx={{ mt: 2 }}
          >
            Mesaj Gönder
          </Button>

          <ChatDialog
            open={isChatOpen}
            onClose={() => setIsChatOpen(false)}
            projectId={id || ''}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProjectDetail;
