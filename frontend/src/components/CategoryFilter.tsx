import React from 'react';
import { Paper, FormControl, InputLabel, Select, MenuItem, Box } from '@mui/material';

interface CategoryFilterProps {
    onCategorySelect: (categoryId: number | null) => void;
    selectedCategory: number | null;
}

// Kategori listesi
const categories = [
    { id: 1, name: 'Web Geliştirme' },
    { id: 2, name: 'Mobil Uygulama' },
    { id: 3, name: 'Yapay Zeka' },
    { id: 4, name: 'Veri Analizi' },
    { id: 5, name: 'UI/UX Tasarım' },
    { id: 6, name: 'Dijital Pazarlama' },
    { id: 7, name: 'SEO' },
    { id: 8, name: 'İçerik Yazarlığı' },
    { id: 9, name: 'Grafik Tasarım' },
    { id: 10, name: 'Diğer' }
];

export const CategoryFilter: React.FC<CategoryFilterProps> = ({ onCategorySelect, selectedCategory }) => {
    return (
        <Paper elevation={2} sx={{ p: 2 }}>
            <Box sx={{ minWidth: 200 }}>
                <FormControl fullWidth size="small">
                    <InputLabel>Kategori</InputLabel>
                    <Select
                        value={selectedCategory || ''}
                        onChange={(e) => onCategorySelect(e.target.value === '' ? null : Number(e.target.value))}
                        label="Kategori"
                        MenuProps={{
                            PaperProps: {
                                style: {
                                    maxHeight: 300
                                }
                            }
                        }}
                    >
                        <MenuItem value="">Tümü</MenuItem>
                        {categories.map((category) => (
                            <MenuItem 
                                key={category.id} 
                                value={category.id}
                                sx={{ py: 1 }}
                            >
                                {category.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>
        </Paper>
    );
};

export default CategoryFilter; 