import React, { useState, useEffect } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Grid,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Alert,
    SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

interface FormData {
    title: string;
    description: string;
    requirements: string;
    budget: string;
    deadline: string;
    category: string;
}

const CreateProject: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        requirements: '',
        budget: '',
        deadline: '',
        category: ''
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
        }
    }, [navigate]);

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        setFormData(prev => ({
            ...prev,
            category: e.target.value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('Oturum bulunamadı');
            }

            const projectData = {
                ...formData,
                budget: parseFloat(formData.budget),
                requirements: formData.requirements.split(',').map(r => r.trim()),
                deadline: new Date(formData.deadline).toISOString().split('T')[0]
            };

            console.log('Gönderilen veriler:', projectData);

            const response = await axios.post('http://localhost:3000/api/projects', projectData, {
                headers: { 
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            console.log('API Yanıtı:', response.data);

            if (response.data.success) {
                // Başarılı olduğunda önce bekle, sonra yönlendir
                await new Promise(resolve => setTimeout(resolve, 1000));
                navigate('/my-projects');
            } else {
                setError('Proje oluşturulamadı: ' + (response.data.message || 'Bilinmeyen hata'));
            }
        } catch (error: any) {
            console.error('Proje oluşturma hatası:', error);
            console.error('Hata detayı:', error.response?.data);
            setError(
                error.response?.data?.message || 
                error.message || 
                'Proje oluşturulurken bir hata oluştu'
            );
            // Hata durumunda yönlendirme yapma
            return;
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="md" sx={{ mt: 4 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Yeni Proje Oluştur
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <FormControl fullWidth>
                                <InputLabel>Kategori</InputLabel>
                                <Select
                                    name="category"
                                    value={formData.category}
                                    label="Kategori"
                                    onChange={handleSelectChange}
                                    required
                                >
                                    <MenuItem value="web">Web Geliştirme</MenuItem>
                                    <MenuItem value="mobile">Mobil Uygulama</MenuItem>
                                    <MenuItem value="desktop">Masaüstü Uygulama</MenuItem>
                                    <MenuItem value="ai">Yapay Zeka</MenuItem>
                                    <MenuItem value="other">Diğer</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                label="Proje Başlığı"
                                name="title"
                                value={formData.title}
                                onChange={handleTextChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={4}
                                label="Proje Açıklaması"
                                name="description"
                                value={formData.description}
                                onChange={handleTextChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                multiline
                                rows={3}
                                label="Teknik Gereksinimler"
                                name="requirements"
                                value={formData.requirements}
                                onChange={handleTextChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Bütçe (₺)"
                                name="budget"
                                type="number"
                                value={formData.budget}
                                onChange={handleTextChange}
                                required
                            />
                        </Grid>

                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                label="Teslim Tarihi"
                                name="deadline"
                                type="date"
                                value={formData.deadline}
                                onChange={handleTextChange}
                                required
                                InputLabelProps={{
                                    shrink: true,
                                }}
                            />
                        </Grid>

                        <Grid item xs={12}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
                                <Button
                                    variant="outlined"
                                    onClick={() => navigate('/')}
                                >
                                    İptal
                                </Button>
                                <Button
                                    type="submit"
                                    variant="contained"
                                    disabled={loading}
                                >
                                    {loading ? 'Oluşturuluyor...' : 'Proje Oluştur'}
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </form>
            </Paper>
        </Container>
    );
};

export default CreateProject;
