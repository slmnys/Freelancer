import React from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import UserProjects from '../components/UserProjects';

const MyProjects: React.FC = () => {
    return (
        <Container maxWidth="lg">
            <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" gutterBottom>
                        Projelerim
                    </Typography>
                    <Typography color="textSecondary">
                        Oluşturduğunuz ve yönettiğiniz projeler
                    </Typography>
                </Box>
                <UserProjects />
            </Paper>
        </Container>
    );
};

export default MyProjects; 