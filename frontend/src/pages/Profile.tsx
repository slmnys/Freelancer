import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Paper, 
    Typography, 
    Box, 
    Avatar,
    Grid,
    Divider,
    Alert,
    TextField,
    Button,
    IconButton
} from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import axios from 'axios';

interface UserProfile {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    phone?: string;
    address?: string;
    city?: string;
    country?: string;
    occupation?: string;
    skills?: string[];
    bio?: string;
    role: string;
    profile_image?: string;
}

const Profile: React.FC = () => {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            setUser(JSON.parse(userStr));
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(
                `/api/users/${user?.id}`,
                {
                    first_name: user?.first_name,
                    last_name: user?.last_name,
                    phone: user?.phone,
                    address: user?.address,
                    city: user?.city,
                    country: user?.country,
                    occupation: user?.occupation,
                    skills: user?.skills,
                    bio: user?.bio
                },
                {
                    headers: { Authorization: `Bearer ${token}` }
                }
            );

            if (response.data.success) {
                // User state'ini güncelle
                setUser(response.data.user);
                // LocalStorage'ı güncelle
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setSuccess('Profil başarıyla güncellendi');
                setIsEditing(false);
            } else {
                throw new Error(response.data.message || 'Güncelleme başarısız');
            }
        } catch (error: any) {
            console.error('Güncelleme hatası:', error);
            setError(error.response?.data?.message || 'Güncelleme sırasında bir hata oluştu');
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            // Dosya tipini kontrol et
            if (!file.type.startsWith('image/')) {
                setError('Lütfen geçerli bir resim dosyası seçin');
                return;
            }

            // Dosya boyutunu kontrol et (5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Dosya boyutu 5MB\'dan küçük olmalıdır');
                return;
            }

            const formData = new FormData();
            formData.append('profile_image', file);

            console.log('Yükleme başlıyor:', {
                userId: user?.id,
                fileSize: file.size,
                fileType: file.type,
                fileName: file.name
            });

            const token = localStorage.getItem('token');
            try {
                const response = await axios.post(
                    `/api/users/${user?.id}/profile-image`,
                    formData,
                    {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    }
                );

                console.log('Sunucu yanıtı:', response.data);

                if (response.data.success && user) {
                    const updatedUser: UserProfile = {
                        ...user,
                        profile_image: response.data.profile_image
                    };
                    setUser(updatedUser);
                    localStorage.setItem('user', JSON.stringify(updatedUser));
                    setSuccess('Profil fotoğrafı güncellendi');
                } else {
                    throw new Error(response.data.message || 'Bilinmeyen bir hata oluştu');
                }
            } catch (axiosError: any) {
                console.error('Axios hatası:', {
                    response: axiosError.response?.data,
                    status: axiosError.response?.status,
                    headers: axiosError.response?.headers,
                    error: axiosError
                });
                throw axiosError;
            }
        } catch (error: any) {
            console.error('Yükleme hatası detayı:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            setError(
                error.response?.data?.message || 
                error.message || 
                'Profil fotoğrafı yüklenirken bir hata oluştu'
            );
        }
    };

    if (!user) return null;

    // Yetenekler alanı için güvenli kontrol ekleyelim
    const skillsString = Array.isArray(user?.skills) ? user.skills.join(', ') : '';

    return (
        <Container maxWidth="md">
            <Paper elevation={3} sx={{ p: 4, mt: 8 }}>
                {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

                <Grid container spacing={3}>
                    {/* Sol Taraf - Profil Fotoğrafı */}
                    <Grid item xs={12} md={4}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <Box sx={{ position: 'relative' }}>
                                <Avatar
                                    src={user?.profile_image ? `${user.profile_image}?t=${Date.now()}` : undefined}
                                    sx={{ 
                                        width: 150, 
                                        height: 150,
                                        fontSize: '3rem',
                                        mb: 2
                                    }}
                                >
                                    {user?.first_name?.[0]}
                                </Avatar>
                                <label htmlFor="profile-image">
                                    <input
                                        type="file"
                                        id="profile-image"
                                        accept="image/*"
                                        style={{ display: 'none' }}
                                        onChange={handleImageChange}
                                    />
                                    <IconButton
                                        color="primary"
                                        aria-label="upload picture"
                                        component="span"
                                        sx={{
                                            position: 'absolute',
                                            bottom: 20,
                                            right: -10,
                                            backgroundColor: 'background.paper',
                                            '&:hover': {
                                                backgroundColor: 'background.default'
                                            }
                                        }}
                                    >
                                        <PhotoCamera />
                                    </IconButton>
                                </label>
                            </Box>
                            <Typography variant="h6">
                                {user.first_name} {user.last_name}
                            </Typography>
                            <Typography color="textSecondary">
                                {user.role === 'freelancer' ? 'Freelancer' : 'Müşteri'}
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Sağ Taraf - Kullanıcı Bilgileri */}
                    <Grid item xs={12} md={8}>
                        <Box component="form" onSubmit={handleSubmit}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                                <Typography variant="h5">Profil Bilgileri</Typography>
                                <Button 
                                    variant={isEditing ? "outlined" : "contained"}
                                    onClick={() => setIsEditing(!isEditing)}
                                    disabled={loading}
                                >
                                    {isEditing ? 'İptal' : 'Düzenle'}
                                </Button>
                            </Box>
                            <Divider sx={{ mb: 3 }} />

                            {isEditing ? (
                                // Düzenleme Formu
                                <>
                                    <TextField
                                        fullWidth
                                        label="Ad"
                                        name="first_name"
                                        value={user?.first_name || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, first_name: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Soyad"
                                        name="last_name"
                                        value={user?.last_name || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, last_name: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Telefon"
                                        name="phone"
                                        value={user?.phone || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, phone: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Adres"
                                        name="address"
                                        value={user?.address || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, address: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                        multiline
                                        rows={2}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Şehir"
                                        name="city"
                                        value={user?.city || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, city: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Ülke"
                                        name="country"
                                        value={user?.country || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, country: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Meslek"
                                        name="occupation"
                                        value={user?.occupation || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, occupation: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Yetenekler (virgülle ayırın)"
                                        name="skills"
                                        value={skillsString}
                                        onChange={(e) => {
                                            const skillsArray = e.target.value ? e.target.value.split(',').map(s => s.trim()) : [];
                                            setUser(prev => prev ? {...prev, skills: skillsArray} : null);
                                        }}
                                        margin="normal"
                                        disabled={loading}
                                    />
                                    <TextField
                                        fullWidth
                                        label="Hakkımda"
                                        name="bio"
                                        value={user?.bio || ''}
                                        onChange={(e) => setUser(prev => prev ? {...prev, bio: e.target.value} : null)}
                                        margin="normal"
                                        disabled={loading}
                                        multiline
                                        rows={4}
                                    />
                                    <Button 
                                        type="submit"
                                        variant="contained"
                                        fullWidth
                                        sx={{ mt: 3 }}
                                        disabled={loading}
                                    >
                                        {loading ? 'Kaydediliyor...' : 'Kaydet'}
                                    </Button>
                                </>
                            ) : (
                                // Bilgi Görüntüleme
                                <>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography color="textSecondary" gutterBottom>Email</Typography>
                                        <Typography variant="body1">{user?.email}</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography color="textSecondary" gutterBottom>Ad</Typography>
                                        <Typography variant="body1">{user?.first_name}</Typography>
                                    </Box>
                                    <Box sx={{ mb: 2 }}>
                                        <Typography color="textSecondary" gutterBottom>Soyad</Typography>
                                        <Typography variant="body1">{user?.last_name}</Typography>
                                    </Box>
                                    {user?.phone && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography color="textSecondary" gutterBottom>Telefon</Typography>
                                            <Typography variant="body1">{user.phone}</Typography>
                                        </Box>
                                    )}
                                    {user?.address && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography color="textSecondary" gutterBottom>Adres</Typography>
                                            <Typography variant="body1">{user.address}</Typography>
                                        </Box>
                                    )}
                                    {user?.city && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography color="textSecondary" gutterBottom>Şehir</Typography>
                                            <Typography variant="body1">{user.city}</Typography>
                                        </Box>
                                    )}
                                    {user?.country && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography color="textSecondary" gutterBottom>Ülke</Typography>
                                            <Typography variant="body1">{user.country}</Typography>
                                        </Box>
                                    )}
                                    {user?.occupation && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography color="textSecondary" gutterBottom>Meslek</Typography>
                                            <Typography variant="body1">{user.occupation}</Typography>
                                        </Box>
                                    )}
                                    {Array.isArray(user?.skills) && user.skills.length > 0 && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography color="textSecondary" gutterBottom>Yetenekler</Typography>
                                            <Typography variant="body1">{user.skills.join(', ')}</Typography>
                                        </Box>
                                    )}
                                    {user?.bio && (
                                        <Box sx={{ mb: 2 }}>
                                            <Typography color="textSecondary" gutterBottom>Hakkımda</Typography>
                                            <Typography variant="body1">{user.bio}</Typography>
                                        </Box>
                                    )}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography color="textSecondary" gutterBottom>Hesap Türü</Typography>
                                        <Typography variant="body1">
                                            {user?.role === 'freelancer' ? 'Freelancer' : 'Müşteri'}
                                        </Typography>
                                    </Box>
                                </>
                            )}
                        </Box>
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default Profile; 