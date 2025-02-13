interface Project {
    id: number;
    product_id: number;      // Seçilen hizmet
    customer_id: number;     // Müşteri
    developer_id: number;    // Yazılımcı
    status: 'pending' | 'negotiating' | 'approved' | 'in_progress' | 'completed' | 'cancelled';
    requirements: string;    // Müşteri gereksinimleri
    custom_features: string[]; // Özel istekler
    price: number;          // Anlaşılan fiyat
    start_date: Date | null;
    end_date: Date | null;
    created_at: Date;
} 