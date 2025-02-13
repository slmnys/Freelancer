import React from 'react';
import { Box, Typography, Chip } from '@mui/material';
import { Project } from '../types/project';

interface Props {
    project: Project | null;
}

const ProjectStatus: React.FC<Props> = ({ project }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'warning';
            case 'approved': return 'success';
            case 'completed': return 'info';
            case 'cancelled': return 'error';
            default: return 'default';
        }
    };

    if (!project) return null;

    return (
        <Box>
            <Typography variant="body1" gutterBottom>
                Durum: <Chip 
                    label={project.status.toUpperCase()} 
                    color={getStatusColor(project.status)}
                    size="small"
                />
            </Typography>
            <Typography variant="body1" gutterBottom>
                Fiyat: {project.price}₺
            </Typography>
            <Typography variant="body1" gutterBottom>
                Gereksinimler: {project.requirements}
            </Typography>
            {project.custom_features && (
                <Typography variant="body1" gutterBottom>
                    Özel İstekler: {project.custom_features.join(', ')}
                </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
                Oluşturulma: {new Date(project.created_at).toLocaleDateString()}
            </Typography>
        </Box>
    );
};

export default ProjectStatus; 