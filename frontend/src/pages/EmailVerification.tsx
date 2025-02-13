import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container } from '@mui/material';

const EmailVerification: React.FC = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    useEffect(() => {
        verifyEmail();
    }, []);

    const verifyEmail = async () => {
        try {
            await axios.get(`/api/auth/verify-email/${token}`);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setStatus('error');
        }
    };

    return (
        <Container>
            {status === 'loading' && <div>Doğrulanıyor...</div>}
            {status === 'success' && <div>Email başarıyla doğrulandı!</div>}
            {status === 'error' && <div>Doğrulama başarısız!</div>}
        </Container>
    );
};

export default EmailVerification; 