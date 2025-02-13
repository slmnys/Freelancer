import React, { useState } from 'react';
import { 
    Container, 
    Paper, 
    TextField, 
    Button, 
    Typography, 
    Alert
} from '@mui/material';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const ResetPassword: React.FC = () => {
    const { token } = useParams<{ token?: string }>();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Token varsa şifre değiştirme, yoksa email isteme formu göster
    const isResetForm = Boolean(token);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            if (isResetForm) {
                // Şifre değiştirme
                if (newPassword !== confirmPassword) {
                    setError('Şifreler eşleşmiyor');
                    setLoading(false);
                    return;
                }

                if (newPassword.length < 6) {
                    setError('Şifre en az 6 karakter olmalıdır');
                    setLoading(false);
                    return;
                }

                console.log('Şifre güncelleme isteği gönderiliyor...');
                const response = await axios.post('/api/auth/reset-password', {
                    token, // URL'den gelen token
                    newPassword
                });

                console.log('Şifre güncelleme yanıtı:', response.data);

                if (response.data.success) {
                    setSuccess(true);
                    setTimeout(() => {
                        navigate('/login');
                    }, 3000);
                }
            } else {
                // Şifre sıfırlama bağlantısı isteme
                await axios.post('/api/auth/forgot-password', { email });
                setSuccess(true);
            }
        } catch (error: any) {
            console.error('Şifre güncelleme hatası:', error.response?.data);
            setError(error.response?.data?.message || 'Şifre güncellenirken bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container maxWidth="sm">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                <Typography variant="h5" component="h1" gutterBottom align="center">
                    {isResetForm ? 'Yeni Şifre Belirleme' : 'Şifre Sıfırlama'}
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {success && (
                    <Alert severity="success" sx={{ mb: 2 }}>
                        {isResetForm 
                            ? 'Şifreniz başarıyla güncellendi! Giriş sayfasına yönlendiriliyorsunuz...'
                            : 'Şifre sıfırlama bağlantısı email adresinize gönderildi!'
                        }
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    {isResetForm ? (
                        // Şifre değiştirme formu
                        <>
                            <TextField
                                fullWidth
                                label="Yeni Şifre"
                                type="password"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                margin="normal"
                                required
                                disabled={loading || success}
                            />
                            <TextField
                                fullWidth
                                label="Yeni Şifre (Tekrar)"
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                margin="normal"
                                required
                                disabled={loading || success}
                            />
                        </>
                    ) : (
                        // Email formu
                        <TextField
                            fullWidth
                            label="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            margin="normal"
                            required
                            disabled={loading || success}
                        />
                    )}

                    <Button
                        fullWidth
                        type="submit"
                        variant="contained"
                        sx={{ mt: 3 }}
                        disabled={loading || success}
                    >
                        {loading ? 'İşleniyor...' : (isResetForm ? 'Şifreyi Güncelle' : 'Şifre Sıfırlama Bağlantısı Gönder')}
                    </Button>
                </form>
            </Paper>
        </Container>
    );
};

export default ResetPassword; 