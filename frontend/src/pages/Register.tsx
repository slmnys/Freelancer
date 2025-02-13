import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    Link,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Axios base URL ayarı
axios.defaults.baseURL = 'http://localhost:3000';

const Register: React.FC = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        first_name: '',
        last_name: '',
        role: 'customer' // Varsayılan rol
    });
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSelectChange = (e: SelectChangeEvent) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            console.log('Gönderilen veri:', formData);

            // Debug için tam URL'i görelim
            const url = `${axios.defaults.baseURL}/api/auth/register`;
            console.log('İstek URL:', url);

            const response = await axios.post('/api/auth/register', formData, {
                headers: {
                    'Content-Type': 'application/json'
                },
                // Timeout ekleyelim
                timeout: 5000
            });

            console.log('Sunucu yanıtı:', response.data);
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                navigate('/');
            }
        } catch (error: any) {
            console.error('Kayıt hatası:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            
            if (error.code === 'ECONNABORTED') {
                setError('Sunucu yanıt vermiyor. Lütfen daha sonra tekrar deneyin.');
            } else {
                setError(error.response?.data?.message || 'Bağlantı hatası oluştu.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm" sx={{ mt: 8 }}>
            <Paper sx={{ p: 4 }}>
                <Typography variant="h4" align="center" gutterBottom>
                    Kayıt Ol
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Ad"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Soyad"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="E-posta"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 2 }}
                    />

                    <TextField
                        fullWidth
                        label="Şifre"
                        name="password"
                        type="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required
                        sx={{ mb: 3 }}
                    />

                    <FormControl fullWidth sx={{ mb: 2 }}>
                        <InputLabel>Rol</InputLabel>
                        <Select
                            name="role"
                            value={formData.role}
                            label="Rol"
                            onChange={handleSelectChange}
                            required
                        >
                            <MenuItem value="customer">Müşteri</MenuItem>
                            <MenuItem value="freelancer">Freelancer</MenuItem>
                        </Select>
                    </FormControl>

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        sx={{ mb: 2 }}
                    >
                        {loading ? 'Kayıt Yapılıyor...' : 'Kayıt Ol'}
                    </Button>

                    <Box sx={{ textAlign: 'center' }}>
                        <Link href="/login" variant="body2">
                            Zaten hesabınız var mı? Giriş yapın
                        </Link>
                    </Box>
                </form>
            </Paper>
        </Container>
    );
};

export default Register; 