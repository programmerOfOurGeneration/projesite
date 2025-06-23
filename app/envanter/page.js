'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';
import styles from './page.module.css';

export default function EnvanterPage() {
  const { data: session } = useSession();
  const [envanterItems, setEnvanterItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('list'); // 'list' veya 'grid'
  const [showOnlyAvailable, setShowOnlyAvailable] = useState(false);

  const categories = [
    { value: 'all', label: 'Tümü' },
    { value: 'sahne', label: 'Sahne Ekipmanları' },    { value: 'isik', label: 'Işık Sistemleri' },
    { value: 'ses', label: 'Ses Sistemleri' },
    { value: 'kamera', label: 'Kamera & Video' },
    { value: 'aksesuar', label: 'Aksesuarlar' },
    { value: 'diger', label: 'Diğer' }
  ];

  useEffect(() => {
    const fetchEnvanter = async () => {
      try {
        setIsLoading(true);
        
        // API parametrelerini hazırla
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        if (sortBy) params.append('sortBy', sortBy);
        
        const response = await fetch(`/api/envanter?${params}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          setEnvanterItems(result.data);
        } else {
          console.error('API hatası:', result.error);
          // Hata durumunda mock data kullan ve filtrele
          let filteredItems = mockEnvanter;
          
          // Arama filtresi
          if (searchTerm) {
            filteredItems = filteredItems.filter(item =>
              item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              item.description.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }
          
          // Kategori filtresi
          if (selectedCategory !== 'all') {
            filteredItems = filteredItems.filter(item => item.category === selectedCategory);
          }
          
          // Sadece müsait olanlar filtresi
          if (showOnlyAvailable) {
            filteredItems = filteredItems.filter(item => item.available > 0);
          }
          
          // Sıralama
          filteredItems.sort((a, b) => {
            switch (sortBy) {
              case 'name':
                return a.name.localeCompare(b.name);
              case 'category':
                return a.category.localeCompare(b.category);
              case 'quantity':
                return b.quantity - a.quantity;
              case 'available':
                return b.available - a.available;
              case 'price':
                return b.price - a.price;
              case 'lastUsed':
                return new Date(b.lastUsed) - new Date(a.lastUsed);
              default:
                return 0;
            }
          });
          
          setEnvanterItems(filteredItems);
        }
      } catch (error) {
        console.error('Envanter yüklenemedi:', error);
        // Hata durumunda mock data kullan
        setEnvanterItems(mockEnvanter);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchEnvanter();
  }, [searchTerm, selectedCategory, sortBy, showOnlyAvailable]);

  const getConditionColor = (condition) => {
    switch (condition) {
      case 'excellent': return '#10B981';
      case 'good': return '#F59E0B';
      case 'fair': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getConditionText = (condition) => {
    switch (condition) {
      case 'excellent': return 'Mükemmel';
      case 'good': return 'İyi';
      case 'fair': return 'Orta';
      default: return 'Bilinmiyor';
    }
  };  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Envanter</h1>
      </div>{/* Gelişmiş Filtreler */}
      <div className={styles.searchSection}>
        <div className={styles.searchRow}>
          <input
            type="text"
            placeholder="Ekipman ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={styles.searchInput}
          />
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className={styles.categorySelect}
          >
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.filterRow}>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="name">Ada Göre</option>
            <option value="category">Kategoriye Göre</option>
            <option value="quantity">Miktara Göre</option>
            <option value="available">Müsait Olana Göre</option>
            <option value="price">Fiyata Göre</option>
            <option value="lastUsed">Son Kullanıma Göre</option>
          </select>
          
          <label className={styles.checkboxLabel}>
            <input
              type="checkbox"
              checked={showOnlyAvailable}
              onChange={(e) => setShowOnlyAvailable(e.target.checked)}
              className={styles.checkbox}
            />
            Sadece Müsait Olanlar
          </label>
          
          <div className={styles.viewToggle}>
            <button
              className={`${styles.viewBtn} ${viewMode === 'list' ? styles.active : ''}`}
              onClick={() => setViewMode('list')}
              title="Liste Görünümü"
            >
              ☰
            </button>
            <button
              className={`${styles.viewBtn} ${viewMode === 'grid' ? styles.active : ''}`}
              onClick={() => setViewMode('grid')}
              title="Kart Görünümü"
            >
              ⊞
            </button>
          </div>
        </div>
        
        {/* İstatistikler */}
        <div className={styles.stats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>{envanterItems.length}</span>
            <span className={styles.statLabel}>Ekipman</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {envanterItems.reduce((sum, item) => sum + item.available, 0)}
            </span>
            <span className={styles.statLabel}>Müsait</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>
              {envanterItems.reduce((sum, item) => sum + item.quantity, 0)}
            </span>
            <span className={styles.statLabel}>Toplam</span>
          </div>
        </div>
      </div>      {/* Envanter Listesi */}
      <div className={viewMode === 'grid' ? styles.itemsGrid : styles.itemsList}>
        {isLoading ? (
          <div className={styles.loading}>Yükleniyor...</div>
        ) : envanterItems.length === 0 ? (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>📦</div>
            <h3>Ekipman bulunamadı</h3>
            <p>Arama kriterlerinizi değiştirmeyi deneyin</p>
          </div>
        ) : (
          envanterItems.map(item => (
            <div key={item.id} className={viewMode === 'grid' ? styles.itemCard : styles.item}>
              <div className={styles.itemImage}>
                <Image
                  src={item.image || '/stage.svg'}
                  alt={item.name}
                  width={viewMode === 'grid' ? 120 : 100}
                  height={viewMode === 'grid' ? 120 : 100}
                  className={styles.image}
                />
                {viewMode === 'grid' && (
                  <span 
                    className={styles.conditionBadge}
                    style={{ backgroundColor: getConditionColor(item.condition) }}
                  >
                    {getConditionText(item.condition)}
                  </span>
                )}
              </div>
              
              <div className={styles.itemInfo}>
                <h3>{item.name}</h3>
                <p className={styles.category}>
                  {categories.find(c => c.value === item.category)?.label}
                </p>
                <p className={styles.description}>{item.description}</p>
                
                {viewMode === 'grid' ? (
                  <div className={styles.itemMeta}>
                    <div className={styles.quantityInfo}>
                      <span className={styles.available}>{item.available}</span>
                      <span className={styles.separator}>/</span>
                      <span className={styles.total}>{item.quantity}</span>
                      <span className={styles.label}>adet</span>
                    </div>
                    <div className={styles.price}>₺{item.price.toLocaleString()}</div>
                  </div>
                ) : (
                  <div className={styles.itemDetails}>
                    <span className={styles.quantity}>
                      Toplam: {item.quantity} | Müsait: {item.available}
                    </span>
                    {viewMode === 'list' && (
                      <span 
                        className={styles.condition}
                        style={{ backgroundColor: getConditionColor(item.condition) }}
                      >
                        {getConditionText(item.condition)}
                      </span>
                    )}
                  </div>
                )}
                  {viewMode === 'grid' && (                  <div className={styles.itemFooter}>
                    <p className={styles.lastUsed}>🕒 {new Date(item.lastUsed).toLocaleDateString('tr-TR')}</p>
                  </div>)}
              </div>
            </div>
          ))
        )}
      </div>
    </div>  );
}
