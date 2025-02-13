import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  CircularProgress,
  Avatar,
  Chip
} from '@mui/material';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';

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
}

interface ProjectListProps {
  searchQuery: string;
  sortBy: string;
  statusFilter: string;
  categoryFilter: string;
}

const ProjectList: React.FC<ProjectListProps> = ({
  searchQuery,
  sortBy,
  statusFilter,
  categoryFilter
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // API'den projeleri çekiyoruz. API parametreleri; sıralama, durum ve kategori için gönderiliyor.
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get('/projects', {
          params: {
            sort: sortBy,
            status: statusFilter !== 'all' ? statusFilter : undefined,
            category: categoryFilter !== 'all' ? categoryFilter : undefined
          }
        });

        // API yanıtını kontrol et
        if (response.data && response.data.success) {
          // Doğrudan projects array'ini al
          setProjects(response.data.projects);
        } else {
          setError('Projeler alınamadı');
          setProjects([]);
        }
      } catch (error) {
        console.error('Projeler yüklenirken hata:', error);
        setError('Projeler yüklenirken bir hata oluştu');
        setProjects([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [sortBy, statusFilter, categoryFilter]);

  // Filtreleme işlemlerini yap
  useEffect(() => {
    let filtered = [...projects];

    // Arama filtresi
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(project =>
        project.title.toLowerCase().includes(searchTerm) ||
        project.description.toLowerCase().includes(searchTerm)
      );
    }

    setFilteredProjects(filtered);
  }, [searchQuery, projects]);

  if (loading) return <CircularProgress />;
  if (error) return <Typography color="error">{error}</Typography>;
  if (filteredProjects.length === 0) {
    return (
      <Typography variant="h6" align="center" color="textSecondary">
        Henüz proje bulunmuyor
      </Typography>
    );
  }

  return (
    <Grid container spacing={3}>
      {filteredProjects.map((project) => (
        <Grid item xs={12} sm={6} md={4} key={project.id}>
          <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flexGrow: 1 }}>
              {/* Kategori */}
              <Chip 
                label={project.category}
                size="small"
                color="primary"
                sx={{ mb: 2 }}
              />

              {/* Başlık */}
              <Typography variant="h6" gutterBottom>
                {project.title}
              </Typography>

              {/* Açıklama */}
              <Typography 
                variant="body2" 
                color="text.secondary"
                sx={{ 
                  mb: 2,
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}
              >
                {project.description}
              </Typography>

              {/* Bütçe */}
              <Typography variant="body2" sx={{ mb: 1 }}>
                <strong>Bütçe:</strong> {project.budget} ₺
              </Typography>

              {/* Teslim Tarihi */}
              <Typography variant="body2" sx={{ mb: 2 }}>
                <strong>Teslim Tarihi:</strong> {new Date(project.deadline).toLocaleDateString('tr-TR')}
              </Typography>

              {/* Durum */}
              <Typography variant="body2" sx={{ mb: 2, fontWeight: 'bold' }}>
                <strong>Durum:</strong> {project.status}
              </Typography>

              {/* Yayınlayan */}
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Avatar 
                  src={project.customer_image}
                  sx={{ width: 32, height: 32, mr: 1 }}
                >
                  {project.customer_name?.[0]}
                </Avatar>
                <Typography variant="body2">
                  {project.customer_name}
                </Typography>
              </Box>

              {/* Detay Butonu */}
              <Button 
            variant="contained" 
            fullWidth
            onClick={() => navigate(`/projects/${project.id}`)}
            >
            Detaylar
            </Button>

            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};

export default ProjectList;
