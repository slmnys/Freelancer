import React, { useState, useEffect } from 'react';
import { 
    AppBar, 
    Toolbar, 
    Typography, 
    
    Button,
    Box,
    Avatar,
    Menu,
    MenuItem
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';

interface HeaderProps {
    isAuthenticated: boolean;
}

export const Header: React.FC<HeaderProps> = ({ isAuthenticated }) => {
    const navigate = useNavigate();
    const [user, setUser] = useState<any>(null);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

    useEffect(() => {
        const checkUser = () => {
            const userStr = localStorage.getItem('user');
            const token = localStorage.getItem('token');
            
            if (userStr && token) {
                try {
                    const userData = JSON.parse(userStr);
                    setUser(userData);
                } catch (error) {
                    // JSON parse hatası durumunda user'ı null yap
                    setUser(null);
                    // Hatalı veriyi temizle
                    localStorage.removeItem('user');
                    localStorage.removeItem('token');
                }
            } else {
                setUser(null);
            }
        };

        checkUser();
        window.addEventListener('storage', checkUser);
        window.addEventListener('userStateChanged', checkUser);

        return () => {
            window.removeEventListener('storage', checkUser);
            window.removeEventListener('userStateChanged', checkUser);
        };
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
        handleClose();
        window.dispatchEvent(new Event('userStateChanged'));
        navigate('/login');
    };

    const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <AppBar position="static">
            <Toolbar>
                {/* Logo ve Site Adı */}
                <Typography 
                    variant="h6" 
                    component={Link} 
                    to="/" 
                    sx={{ flexGrow: 1, textDecoration: 'none', color: 'white' }}
                >
                    Freelancer Platform
                </Typography>

                {/* Sağ Menü */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {isAuthenticated ? (
                        <>
                            <Button 
                                component={Link}
                                to="/create-project"
                                startIcon={<AddIcon />}
                                color="inherit"
                            >
                                Proje Oluştur
                            </Button>

                            {/* Profil Menüsü */}
                            <Box>
                                <Avatar
                                    onClick={handleMenu}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    {user?.first_name?.[0]}
                                </Avatar>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={Boolean(anchorEl)}
                                    onClose={handleClose}
                                >
                                    <MenuItem component={Link} to="/profile" onClick={handleClose}>
                                        Profil
                                    </MenuItem>
                                    <MenuItem component={Link} to="/my-projects" onClick={handleClose}>
                                        Projelerim
                                    </MenuItem>
                                    <MenuItem onClick={handleLogout}>
                                        Çıkış Yap
                                    </MenuItem>
                                </Menu>
                            </Box>
                        </>
                    ) : (
                        <>
                            <Button color="inherit" component={Link} to="/login">
                                Giriş Yap
                            </Button>
                            <Button color="inherit" component={Link} to="/register">
                                Kayıt Ol
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
}; 