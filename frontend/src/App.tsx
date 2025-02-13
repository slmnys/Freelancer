import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { Header } from './components/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmailVerification from './pages/EmailVerification';
import ResetPassword from './pages/ResetPassword';
import Profile from './pages/Profile';
import CreateProject from './pages/CreateProject';
import ProjectDetail from './pages/ProjectDetail';
import MyProjects from './pages/MyProjects';
import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const theme = createTheme({
    palette: {
        primary: {
            main: '#1976d2',
        },
        secondary: {
            main: '#dc004e',
        },
    },
    typography: {
        fontFamily: [
            '-apple-system',
            'BlinkMacSystemFont',
            '"Segoe UI"',
            'Roboto',
            '"Helvetica Neue"',
            'Arial',
            'sans-serif',
        ].join(','),
    },
});

const queryClient = new QueryClient();

// Protected Route bileşeni: Sadece giriş yapmış kullanıcıların erişebileceği sayfalar için kullanılır.
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const user = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (!user || !token) {
        return <Navigate to="/login" />;
    }
    
    return <>{children}</>;
};

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        // Sayfa yüklendiğinde ve kullanıcı durumu değiştiğinde kontrol et
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            const user = localStorage.getItem('user');
            setIsAuthenticated(!!token && !!user);
        };

        checkAuth();

        // Kullanıcı durumu değiştiğinde dinle (örneğin, login/logout işlemlerinde)
        window.addEventListener('userStateChanged', checkAuth);
        return () => window.removeEventListener('userStateChanged', checkAuth);
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <ThemeProvider theme={theme}>
                <CssBaseline />
                <BrowserRouter>
                    <Header isAuthenticated={isAuthenticated} />
                    <Routes>
                        {/* Public routes */}
                        <Route path="/" element={<Home />} />
                        {/* Proje detay sayfası: Kullanıcı "Detaylar" butonuna bastığında buraya yönlendirilecektir */}
                        <Route path="/projects/:id" element={<ProjectDetail />} />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        <Route path="/reset-password/:token" element={<ResetPassword />} />
                        <Route path="/verify-email/:token" element={<EmailVerification />} />

                        {/* Protected routes */}
                        <Route
                            path="/profile"
                            element={
                                <ProtectedRoute>
                                    <Profile />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/create-project"
                            element={
                                <ProtectedRoute>
                                    <CreateProject />
                                </ProtectedRoute>
                            }
                        />
                        <Route
                            path="/my-projects"
                            element={
                                <ProtectedRoute>
                                    <MyProjects />
                                </ProtectedRoute>
                            }
                        />

                        {/* 404: Tanımlanmayan route'larda ana sayfaya yönlendir */}
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
            </ThemeProvider>
        </QueryClientProvider>
    );
}

export default App;
