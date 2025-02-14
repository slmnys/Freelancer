import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container } from '@mui/material';

const EmailVerification: React.FC = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');

    const verifyEmail = useCallback(async () => {
        try {
            await axios.get(`/api/auth/verify-email/${token}`);
            setStatus('success');
            setTimeout(() => navigate('/login'), 3000);
        } catch (error) {
            setStatus('error');
        }
    }, [token, navigate]);

    useEffect(() => {
        verifyEmail();
    }, [verifyEmail]);

    return (
        <Container>
            {status === 'loading' && <div>Doğrulanıyor...</div>}
            {status === 'success' && <div>Email başarıyla doğrulandı!</div>}
            {status === 'error' && <div>Doğrulama başarısız!</div>}
        </Container>
    );
};

export default EmailVerification; 