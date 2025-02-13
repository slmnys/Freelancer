import React, { useEffect, useState } from 'react';
import { 
    Grid, Card, CardMedia, CardContent, 
    Typography, Button, Rating 
} from '@mui/material';
import axios from 'axios';

interface Product {
    id: number;
    name: string;
    description: string;
    price: string | number;
    image_url: string;
    category_name: string;
    average_rating: number;
}

interface Props {
    categoryId: number | null;
    searchQuery: string;
    priceRange: [number, number];
    sortBy: string;
}

const ProductList: React.FC<Props> = ({ categoryId, searchQuery, priceRange, sortBy }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                setError(null);
                
                let url = 'http://localhost:3000/api/products';
                const params = new URLSearchParams();
                
                if (categoryId) {
                    params.append('category_id', categoryId.toString());
                }
                
                if (searchQuery.trim()) {
                    params.append('search', searchQuery.trim());
                }
                params.append('min_price', priceRange[0].toString());
                params.append('max_price', priceRange[1].toString());
                params.append('sort', sortBy);

                if (params.toString()) {
                    url += `?${params.toString()}`;
                }
                

                console.log('Fetching URL:', url); // Debug için
                
                const response = await axios.get(url);
                console.log('API Response:', response.data); // Debug için
                
                setProducts(response.data);
            } catch (error) {
                console.error('Ürünler yüklenirken hata:', error);
                setError('Ürünler yüklenirken bir hata oluştu');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [categoryId, searchQuery, priceRange, sortBy]);
    if (loading) {
        return <Typography>Yükleniyor...</Typography>;
    }

    if (error) {
        return <Typography color="error">{error}</Typography>;
    }

    if (products.length === 0) {
        return (
            <Typography>
                {searchQuery 
                    ? `"${searchQuery}" için sonuç bulunamadı` 
                    : 'Ürün bulunamadı'}
            </Typography>
        );
    }

    const formatPrice = (price: string | number): string => {
        const numPrice = typeof price === 'string' ? parseFloat(price) : price;
        return numPrice.toFixed(2);
    };

    

    return (
        <Grid container spacing={3} sx={{ p: 3 }}>
            {products.map((product) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={product.id}>
                    <Card>
                        <CardMedia
                            component="img"
                            height="200"
                            image={product.image_url || 'https://via.placeholder.com/200'}
                            alt={product.name}
                        />
                        <CardContent>
                            <Typography gutterBottom variant="h6" component="div">
                                {product.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                                {product.description}
                            </Typography>
                            <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                                {formatPrice(product.price)}₺
                            </Typography>
                            <Rating 
                                value={product.average_rating || 0} 
                                readOnly 
                                precision={0.5}
                            />
                            <Button 
                                variant="contained" 
                                color="primary" 
                                fullWidth 
                                sx={{ mt: 2 }}
                            >
                                Sepete Ekle
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default ProductList;