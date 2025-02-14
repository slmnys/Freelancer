import React from 'react';
import { Box, Typography, Paper } from '@mui/material';

export interface MessageProps {
    id: number;
    sender_id: number;
    message: string;
    created_at: string;
    sender_name: string;
}

interface Props {
    message: MessageProps;
}

export const Message: React.FC<Props> = ({ message }) => {
    return (
        <Box sx={{ mb: 2 }}>
            <Paper sx={{ p: 2 }}>
                <Typography variant="subtitle2" color="primary">
                    {message.sender_name}
                </Typography>
                <Typography variant="body1">
                    {message.message}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                    {new Date(message.created_at).toLocaleString()}
                </Typography>
            </Paper>
        </Box>
    );
};

export default Message; 