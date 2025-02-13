import React, { useState, useEffect, useCallback } from 'react';
import { 
    Paper, 
    InputBase, 
    IconButton, 
    Divider,
    CircularProgress
} from '@mui/material';
import { Search as SearchIcon, Clear as ClearIcon } from '@mui/icons-material';
import { debounce } from 'lodash';

interface Props {
    onSearch: (query: string) => void;
}

const SearchBar: React.FC<Props> = ({ onSearch }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearching, setIsSearching] = useState(false);

    // Debounce fonksiyonu oluştur
    const debouncedSearch = useCallback(
        debounce((query: string) => {
            onSearch(query);
            setIsSearching(false);
        }, 500),
        [onSearch]
    );

    // Arama değiştiğinde
    useEffect(() => {
        if (searchQuery !== '') {
            setIsSearching(true);
            debouncedSearch(searchQuery);
        } else {
            onSearch('');
            setIsSearching(false);
        }

        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, debouncedSearch]);

    const handleClear = () => {
        setSearchQuery('');
        onSearch('');
    };

    return (
        <Paper
            component="form"
            onSubmit={(e) => e.preventDefault()}
            elevation={2}
            sx={{
                p: '2px 4px',
                display: 'flex',
                alignItems: 'center',
                width: '100%',
                mb: 3
            }}
        >
            <IconButton sx={{ p: '10px' }} aria-label="search">
                {isSearching ? (
                    <CircularProgress size={24} />
                ) : (
                    <SearchIcon />
                )}
            </IconButton>
            
            <InputBase
                sx={{ ml: 1, flex: 1 }}
                placeholder="Ürün ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />

            {searchQuery && (
                <>
                    <Divider sx={{ height: 28, m: 0.5 }} orientation="vertical" />
                    <IconButton 
                        sx={{ p: '10px' }} 
                        aria-label="clear" 
                        onClick={handleClear}
                    >
                        <ClearIcon />
                    </IconButton>
                </>
            )}
        </Paper>
    );
};

export default SearchBar;