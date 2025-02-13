import React, { useState } from 'react';
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box,
    Alert,
    
} from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTheme } from '@mui/material/styles';

// Axios varsayılan ayarları
axios.defaults.timeout = 10000; // 10 saniye
axios.defaults.headers.common['Content-Type'] = 'application/json';

const Login: React.FC = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const theme = useTheme();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post('/api/auth/login', {
                email,
                password
            });

            console.log('Login response:', response.data);

            if (response.data.success) {
                // Token'ı localStorage'a kaydet
                localStorage.setItem('token', response.data.token);
                
                // Kullanıcı bilgisini localStorage'a kaydet
                localStorage.setItem('user', JSON.stringify(response.data.user));
                
                // Global kullanıcı durumunu güncelle
                window.dispatchEvent(new Event('userStateChanged'));

                console.log('Token ve kullanıcı bilgileri kaydedildi');
                
                // Anasayfaya yönlendir
                navigate('/', { replace: true });
            } else {
                setError(response.data.message || 'Giriş yapılamadı');
            }
        } catch (error: any) {
            console.error('Login hatası:', error);
            setError(error.response?.data?.message || 'Giriş yapılırken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    Giriş Yap
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <TextField
                        fullWidth
                        label="Email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        margin="normal"
                        required
                    />
                    <TextField
                        fullWidth
                        label="Şifre"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        margin="normal"
                        required
                    />

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3 }}
                        disabled={loading}
                    >
                        {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                    </Button>
                </form>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Link 
                        to="/reset-password"
                        style={{ 
                            textDecoration: 'none', 
                            color: theme.palette.primary.main 
                        }}
                    >
                        Şifremi Unuttum
                    </Link>
                </Box>

                <Box sx={{ mt: 2, textAlign: 'center' }}>
                    <Typography variant="body2">
                        Hesabınız yok mu?{' '}
                        <Link 
                            to="/register" 
                            style={{ 
                                textDecoration: 'none',
                                color: theme.palette.primary.main 
                            }}
                        >
                            Kayıt Ol
                        </Link>
                    </Typography>
                </Box>
            </Paper>
        </Container>
    );
};

export default Login; 