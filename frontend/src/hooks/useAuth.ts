import api from '../utils/axios';

export function useAuth() {
    const login = async (email: string, password: string) => {
        try {
            const response = await api.post('/auth/login', { email, password });
            
            if (response.data.success) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('userId', response.data.user.id.toString());

                
                console.log('Login bilgileri:', {
                    token: response.data.token,
                    userId: response.data.user.id
                });
                
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login hatası:', error);
            return false;
        }
    };

    return { login };
} 