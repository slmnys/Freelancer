import React, { useEffect, useState } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Grid,
    Chip,
    Button,
    CircularProgress,
    IconButton,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField
} from '@mui/material';
import { Edit, Delete } from '@mui/icons-material';
import axios from 'axios';

interface Project {
    id: number;
    title: string;
    description: string;
    budget: number;
    status: 'open' | 'in_progress' | 'completed';
    skills_required: string[] | null;
    deadline: string;
    created_at: string;
    customer_id: number;
}

const UserProjects: React.FC = () => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [editProject, setEditProject] = useState<Project | null>(null);
    const [openDialog, setOpenDialog] = useState(false);

    useEffect(() => {
        fetchUserProjects();
    }, []);

    const fetchUserProjects = async () => {
        try {
            const token = localStorage.getItem('token');
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            
            console.log('Projeler isteniyor:', user.id);
            
            const response = await axios.get(`/api/projects/user/${user.id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            console.log('Gelen projeler:', response.data);

            if (response.data.success) {
                setProjects(response.data.projects);
            } else {
                throw new Error(response.data.message);
            }
        } catch (error: any) {
            console.error('Proje yükleme hatası:', error);
            setError(error.response?.data?.message || 'Projeler yüklenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (project: Project) => {
        setEditProject(project);
        setOpenDialog(true);
    };

    const handleDelete = async (projectId: number) => {
        if (window.confirm('Bu projeyi silmek istediğinizden emin misiniz?')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/projects/${projectId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setProjects(projects.filter(p => p.id !== projectId));
            } catch (error: any) {
                setError(error.response?.data?.message || 'Proje silinirken bir hata oluştu');
            }
        }
    };

    const handleUpdate = async () => {
        if (!editProject) return;

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `/api/projects/${editProject.id}`,
                editProject,
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );
            setProjects(projects.map(p => p.id === editProject.id ? response.data : p));
            setOpenDialog(false);
        } catch (error: any) {
            setError(error.response?.data?.message || 'Proje güncellenirken bir hata oluştu');
        }
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;
    if (projects.length === 0) {
        return (
            <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography variant="h6" color="textSecondary" gutterBottom>
                    Henüz hiç projeniz yok
                </Typography>
                <Button 
                    variant="contained" 
                    color="primary"
                    onClick={() => window.location.href = '/create-project'}
                    sx={{ mt: 2 }}
                >
                    Yeni Proje Oluştur
                </Button>
            </Box>
        );
    }

    return (
        <>
            <Grid container spacing={3}>
                {projects.map((project) => (
                    <Grid item xs={12} md={6} key={project.id}>
                        <Card>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                    <Typography variant="h6">
                                        {project.title}
                                    </Typography>
                                    <Box>
                                        <IconButton onClick={() => handleEdit(project)} size="small">
                                            <Edit />
                                        </IconButton>
                                        <IconButton onClick={() => handleDelete(project.id)} size="small" color="error">
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </Box>
                                <Typography variant="body2" color="textSecondary" paragraph>
                                    {project.description}
                                </Typography>
                                {Array.isArray(project.skills_required) && project.skills_required.length > 0 && (
                                    <Box sx={{ mb: 2 }}>
                                        {project.skills_required.map((skill) => (
                                            <Chip
                                                key={skill}
                                                label={skill}
                                                size="small"
                                                sx={{ mr: 1, mb: 1 }}
                                            />
                                        ))}
                                    </Box>
                                )}
                                <Typography variant="body2">
                                    Bütçe: {project.budget} TL
                                </Typography>
                                <Typography variant="body2">
                                    Teslim Tarihi: {new Date(project.deadline).toLocaleDateString()}
                                </Typography>
                                <Box sx={{ mt: 2 }}>
                                    <Chip
                                        label={project.status === 'open' ? 'Açık' : 
                                              project.status === 'in_progress' ? 'Devam Ediyor' : 'Tamamlandı'}
                                        color={project.status === 'open' ? 'success' : 
                                              project.status === 'in_progress' ? 'warning' : 'default'}
                                    />
                                </Box>
                            </CardContent>
                        </Card>
                    </Grid>
                ))}
            </Grid>

            <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
                <DialogTitle>Projeyi Düzenle</DialogTitle>
                <DialogContent>
                    <TextField
                        fullWidth
                        label="Başlık"
                        value={editProject?.title || ''}
                        onChange={(e) => setEditProject(prev => prev ? {...prev, title: e.target.value} : null)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Açıklama"
                        value={editProject?.description || ''}
                        onChange={(e) => setEditProject(prev => prev ? {...prev, description: e.target.value} : null)}
                        margin="normal"
                        multiline
                        rows={4}
                    />
                    <TextField
                        fullWidth
                        label="Bütçe"
                        type="number"
                        value={editProject?.budget || ''}
                        onChange={(e) => setEditProject(prev => prev ? {...prev, budget: Number(e.target.value)} : null)}
                        margin="normal"
                    />
                    <TextField
                        fullWidth
                        label="Teslim Tarihi"
                        type="date"
                        value={editProject?.deadline?.split('T')[0] || ''}
                        onChange={(e) => setEditProject(prev => prev ? {...prev, deadline: e.target.value} : null)}
                        margin="normal"
                        InputLabelProps={{ shrink: true }}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>İptal</Button>
                    <Button onClick={handleUpdate} variant="contained">Güncelle</Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default UserProjects; 