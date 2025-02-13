import React from 'react';
import { 
    Paper, 
    Typography, 
    Slider, 
    Select, 
    MenuItem, 
    FormControl, 
    InputLabel 
} from '@mui/material';

interface Props {
    minPrice: number;
    maxPrice: number;
    priceRange: [number, number];
    sortBy: string;
    onPriceChange: (newRange: [number, number]) => void;
    onSortChange: (newSort: string) => void;
}

const FilterSort: React.FC<Props> = ({
    minPrice,
    maxPrice,
    priceRange,
    sortBy,
    onPriceChange,
    onSortChange
}) => {
    return (
        <Paper sx={{ p: 2, mt: 2 }}>
            <Typography gutterBottom>Fiyat Aralığı</Typography>
            <Slider
                value={priceRange}
                onChange={(_, newValue) => onPriceChange(newValue as [number, number])}
                valueLabelDisplay="auto"
                min={minPrice}
                max={maxPrice}
                sx={{ mt: 2, mb: 4 }}
            />
            
            <FormControl fullWidth>
                <InputLabel>Sıralama</InputLabel>
                <Select
                    value={sortBy}
                    label="Sıralama"
                    onChange={(e) => onSortChange(e.target.value)}
                >
                    <MenuItem value="name_asc">İsim (A-Z)</MenuItem>
                    <MenuItem value="name_desc">İsim (Z-A)</MenuItem>
                    <MenuItem value="price_asc">Fiyat (Düşükten Yükseğe)</MenuItem>
                    <MenuItem value="price_desc">Fiyat (Yüksekten Düşüğe)</MenuItem>
                    <MenuItem value="rating_desc">Puan (En Yüksek)</MenuItem>
                    <MenuItem value="rating_asc">Puan (En Düşük)</MenuItem>
                </Select>
            </FormControl>
        </Paper>
    );
};

export default FilterSort; 