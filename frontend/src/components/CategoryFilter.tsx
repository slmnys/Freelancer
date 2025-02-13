import React from 'react';
import { Paper, FormControl, InputLabel, Select, MenuItem } from '@mui/material';

interface CategoryFilterProps {
    onCategorySelect: (categoryId: number | null) => void;
    selectedCategory: number | null;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ onCategorySelect, selectedCategory }) => {
    return (
        <Paper elevation={2}>
            <FormControl fullWidth>
                <InputLabel>Kategori</InputLabel>
                <Select
                    value={selectedCategory || ''}
                    onChange={(e) => onCategorySelect(e.target.value as number)}
                    label="Kategori"
                >
                    <MenuItem value="">Tümü</MenuItem>
                    {/* ... diğer MenuItem'lar ... */}
                </Select>
            </FormControl>
        </Paper>
    );
};

export default CategoryFilter; 