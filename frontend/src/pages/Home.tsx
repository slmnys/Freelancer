import React, { useState, useEffect } from 'react';
import { 
    Container, 
    Typography, 
    Box, 
    Grid, 
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    TextField
} from '@mui/material';
import ProjectList from '../components/ProjectList';

const Home: React.FC = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState('newest');
    const [statusFilter, setStatusFilter] = useState('all');
    const [category, setCategory] = useState('all');
    const [submittedQuery, setSubmittedQuery] = useState('');

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setSubmittedQuery(searchQuery);
        }, 300); // 300ms debounce süresi
        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <Container maxWidth="lg">
            <Box sx={{ mt: 4, mb: 4 }}>
                <Typography variant="h4" gutterBottom>
                    Mevcut Projeler
                </Typography>

                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {/* Arama Alanı */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth variant="outlined">
                            <TextField
                                id="search-input"
                                name="search"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                label="Proje Ara"
                                placeholder="Proje adı veya açıklama ile ara..."
                                aria-label="Proje arama"
                                variant="outlined"
                            />
                        </FormControl>
                    </Grid>

                    {/* Sıralama Seçimi */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="sort-label">Sırala</InputLabel>
                            <Select
                                labelId="sort-label"
                                id="sort-select"
                                name="sort"
                                value={sortBy}
                                label="Sırala"
                                onChange={(e) => setSortBy(e.target.value)}
                            >
                                <MenuItem value="newest">En Yeni</MenuItem>
                                <MenuItem value="oldest">En Eski</MenuItem>
                                <MenuItem value="budget_high">Bütçe (Yüksek-Düşük)</MenuItem>
                                <MenuItem value="budget_low">Bütçe (Düşük-Yüksek)</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Durum Filtresi */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="status-label">Durum</InputLabel>
                            <Select
                                labelId="status-label"
                                id="status-select"
                                name="status"
                                value={statusFilter}
                                label="Durum"
                                onChange={(e) => setStatusFilter(e.target.value)}
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                <MenuItem value="open">Açık</MenuItem>
                                <MenuItem value="in_progress">Devam Eden</MenuItem>
                                <MenuItem value="completed">Tamamlandı</MenuItem>
                            </Select>
                        </FormControl>
                    </Grid>

                    {/* Kategori Filtresi */}
                    <Grid item xs={12} md={3}>
                        <FormControl fullWidth>
                            <InputLabel id="category-label">Kategori</InputLabel>
                            <Select
                                labelId="category-label"
                                id="category-select"
                                name="category"
                                value={category}
                                label="Kategori"
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                <MenuItem value="all">Tümü</MenuItem>
                                <MenuItem value="web">Web Geliştirme</MenuItem>
                                <MenuItem value="mobile">Mobil Uygulama</MenuItem>
                                <MenuItem value="desktop">Masaüstü Uygulama</MenuItem>
                                <MenuItem value="ai">Yapay Zeka</MenuItem>
                                <MenuItem value="data_analysis">Veri Analizi</MenuItem>
                                <MenuItem value="ui_ux">UI/UX Tasarım</MenuItem>
                                <MenuItem value="marketing">Dijital Pazarlama</MenuItem>
                                <MenuItem value="seo">SEO</MenuItem>
                                <MenuItem value="other">Diğer</MenuItem>
                                
                            </Select>
                        </FormControl>
                    </Grid>
                </Grid>

                <ProjectList 
                    searchQuery={submittedQuery}
                    sortBy={sortBy}
                    statusFilter={statusFilter}
                    categoryFilter={category}
                />
            </Box>
        </Container>
    );
};

export default Home;
