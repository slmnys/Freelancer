import React from 'react';
import { 
    Menu, 
    MenuItem, 
    ListItemIcon, 
    ListItemText
} from '@mui/material';
import { 
    Person as PersonIcon, 
    ExitToApp as LogoutIcon,
    Assignment as ProjectIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

interface ProfileMenuProps {
    anchorEl: null | HTMLElement;
    handleClose: () => void;
    handleLogout: () => void;
}

const ProfileMenu: React.FC<ProfileMenuProps> = ({ anchorEl, handleClose, handleLogout }) => {
    const navigate = useNavigate();

    const handleProfileClick = () => {
        navigate('/profile');
        handleClose();
    };

    const handleProjectsClick = () => {
        navigate('/my-projects');
        handleClose();
    };

    return (
        <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleClose}
            onClick={handleClose}
        >
            <MenuItem onClick={handleProfileClick}>
                <ListItemIcon>
                    <PersonIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Profil" />
            </MenuItem>
            
            <MenuItem onClick={handleProjectsClick}>
                <ListItemIcon>
                    <ProjectIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Projelerim" />
            </MenuItem>

            <MenuItem onClick={handleLogout}>
                <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Çıkış Yap" />
            </MenuItem>
        </Menu>
    );
};

export default ProfileMenu; 