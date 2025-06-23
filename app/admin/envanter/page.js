'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from './page.module.css';

export default function AdminEnvanterPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [envanterItems, setEnvanterItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const categories = [
    { value: 'all', label: 'Tümü' },
    { value: 'sahne', label: 'Sahne Ekipmanları' },
    { value: 'isik', label: 'Işık Sistemleri' },
    { value: 'ses', label: 'Ses Sistemleri' },
    { value: 'kamera', label: 'Kamera & Video' },
    { value: 'aksesuar', label: 'Aksesuarlar' },
    { value: 'diger', label: 'Diğer' }
  ];

  const [formData, setFormData] = useState({
    name: '',
    category: 'sahne',
    quantity: 1,
    price: 0,
    description: '',
    location: '',
    condition: 'excellent',
    serialNumber: '',
    warranty: ''
  });

  // Admin kontrolü
  useEffect(() => {
    if (status === 'loading') return;
    if (!session?.user?.isAdmin) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  // Envanter verilerini yükle
  useEffect(() => {
    const fetchEnvanter = async () => {
      try {
        setIsLoading(true);
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (selectedCategory !== 'all') params.append('category', selectedCategory);
        
        const response = await fetch(`/api/envanter?${params}`);
        const result = await response.json();
        
        if (response.ok && result.success) {
          setEnvanterItems(result.data);
        }
      } catch (error) {
        console.error('Envanter yüklenemedi:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.isAdmin) {
      fetchEnvanter();
    }
  }, [searchTerm, selectedCategory, session]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/envanter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Başarı mesajı
        alert('Envanter item başarıyla eklendi!');
        
        // Formu sıfırla
        setFormData({
          name: '',
          category: 'sahne',
          quantity: 1,
          price: 0,
          description: '',
          location: '',
          condition: 'excellent',
          serialNumber: '',
          warranty: ''
        });
        
        setShowAddForm(false);
        
        // Listeyi yenile
        window.location.reload();
      } else {
        alert('Hata: ' + result.error);
      }
    } catch (error) {
      console.error('Form gönderim hatası:', error);
      alert('Bir hata oluştu!');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu item\'ı silmek istediğinizden emin misiniz?')) return;
    try {
      const response = await fetch(`/api/envanter?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();
      if (response.ok && result.success) {
        // Başarıyla silindi, UI'dan çıkar
        setEnvanterItems(prev => prev.filter(item => item.id !== id));
        alert('Ekipman başarıyla silindi!');
      } else {
        alert('Silme hatası: ' + (result.error || 'Bilinmeyen hata'));
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      alert('Silme işlemi sırasında bir hata oluştu!');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      description: item.description,
      location: item.location,
      condition: item.condition,
      serialNumber: item.serialNumber || '',
      warranty: item.warranty || ''
    });
    setShowAddForm(true);
  };

  if (status === 'loading') {
    return <div className={styles.loading}>Yükleniyor...</div>;
  }

  if (!session?.user?.isAdmin) {
    return <div className={styles.unauthorized}>Bu sayfaya erişim yetkiniz yok.</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Envanter Yönetimi - Admin Panel</h1>
          <p>Sahne ve etkinlik ekipmanları yönetimi</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/admin" className={styles.backButton}>
            ← Admin Panel
          </Link>
          <button 
            onClick={() => setShowAddForm(!showAddForm)}
            className={styles.addButton}
          >
            {showAddForm ? 'İptal' : '+ Yeni Ekipman'}
          </button>
        </div>
      </div>

      {/* Ekleme/Düzenleme Formu */}
      {showAddForm && (
        <div className={styles.formContainer}>
          <h2>{editingItem ? 'Ekipman Düzenle' : 'Yeni Ekipman Ekle'}</h2>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.formGroup}>
                <label>Ekipman Adı *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Kategori *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  {categories.slice(1).map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Miktar *</label>
                <input
                  type="number"
                  name="quantity"
                  value={formData.quantity}
                  onChange={handleInputChange}
                  min="1"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Fiyat (₺) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Konum *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Depo A - Raf 1"
                  required
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Durum</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                >
                  <option value="excellent">Mükemmel</option>
                  <option value="good">İyi</option>
                  <option value="fair">Orta</option>
                </select>
              </div>
              
              <div className={styles.formGroup}>
                <label>Seri Numarası</label>
                <input
                  type="text"
                  name="serialNumber"
                  value={formData.serialNumber}
                  onChange={handleInputChange}
                  placeholder="Otomatik oluşturulacak"
                />
              </div>
              
              <div className={styles.formGroup}>
                <label>Garanti Bitiş Tarihi</label>
                <input
                  type="date"
                  name="warranty"
                  value={formData.warranty}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            <div className={styles.formGroup}>
              <label>Açıklama *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                required
              />
            </div>
            
            <div className={styles.formActions}>
              <button type="submit" className={styles.submitButton}>
                {editingItem ? 'Güncelle' : 'Ekle'}
              </button>
              <button 
                type="button" 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingItem(null);
                }}
                className={styles.cancelButton}
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filtreler */}
      <div className={styles.filters}>
        <div className={styles.searchBox}>
          <input
            type="text"
            placeholder="Ekipman ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map(cat => (
            <option key={cat.value} value={cat.value}>{cat.label}</option>
          ))}
        </select>
      </div>

      {/* Envanter Tablosu */}
      <div className={styles.tableContainer}>
        {isLoading ? (
          <div className={styles.loadingTable}>Yükleniyor...</div>
        ) : (
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Resim</th>
                <th>Ekipman Adı</th>
                <th>Kategori</th>
                <th>Miktar</th>
                <th>Müsait</th>
                <th>Durum</th>
                <th>Fiyat</th>
                <th>Konum</th>
                <th>İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {envanterItems.map(item => (
                <tr key={item.id}>
                  <td>
                    <Image 
                      src={item.image} 
                      alt={item.name}
                      width={40}
                      height={40}
                      className={styles.itemImage}
                    />
                  </td>
                  <td>
                    <div className={styles.itemName}>
                      <strong>{item.name}</strong>
                      <small>{item.serialNumber}</small>
                    </div>
                  </td>
                  <td>
                    <span className={styles.category}>
                      {categories.find(c => c.value === item.category)?.label}
                    </span>
                  </td>
                  <td>{item.quantity}</td>
                  <td>{item.available}</td>
                  <td>
                    <span 
                      className={styles.condition}
                      data-condition={item.condition}
                    >
                      {item.condition === 'excellent' ? 'Mükemmel' : 
                       item.condition === 'good' ? 'İyi' : 'Orta'}
                    </span>
                  </td>
                  <td>{item.price.toLocaleString('tr-TR')} ₺</td>
                  <td>{item.location}</td>
                  <td>
                    <div className={styles.actions}>
                      <button 
                        onClick={() => handleEdit(item)}
                        className={styles.editBtn}
                      >
                        Düzenle
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className={styles.deleteBtn}
                      >
                        Sil
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
