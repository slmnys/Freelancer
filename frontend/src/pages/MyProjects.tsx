import React, { useState } from 'react';
import { Container, Typography, Box, Paper } from '@mui/material';
import ProjectList from '../components/ProjectList';
import SearchBar from '../components/SearchBar';

const MyProjects: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    

    const handleSearch = (query: string) => {
        setSearchQuery(query);
    };

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
                <SearchBar onSearch={handleSearch} />
                <ProjectList 
                    searchQuery={searchQuery}
                    
                    myProjects={true}
                />
            </Paper>
        </Container>
    );
};

export default MyProjects; 