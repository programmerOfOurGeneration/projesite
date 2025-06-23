'use client';
import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import styles from './page.module.css';
import Image from 'next/image';

export default function EtkinliklerAdmin() {
  const { data: session, status } = useSession();  const router = useRouter();
    const [etkinlik, setEtkinlik] = useState({
    baslik: '',
    aciklama: '',
    icerik: '',
    tarih: '',
    konum: '',
    resimUrl: '',
  });
  const [resimler, setResimler] = useState([]);
  const [videolar, setVideolar] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [etkinlikler, setEtkinlikler] = useState([]);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
      return;
    }

    const fetchEtkinlikler = async () => {
      try {
        const response = await fetch('/api/etkinlikler');
        const data = await response.json();
        setEtkinlikler(data);
      } catch (error) {
        console.error('Etkinlikler yüklenemedi:', error);
        setError('Etkinlikler yüklenemedi');
      }
    };    fetchEtkinlikler();
  }, [status, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setFormSubmitting(true);

    try {// URL'leri temizle ve kontrol et
      const cleanedEtkinlik = {
        ...etkinlik,
        resimUrl: etkinlik.resimUrl ? etkinlik.resimUrl.trim() : ''
      };

      const cleanedResimler = resimler.map(resim => ({
        ...resim,
        url: resim.url ? resim.url.trim() : ''
      })).filter(resim => resim.url); // Boş URL'leri filtrele

      const cleanedVideolar = videolar.map(video => ({
        ...video,
        url: video.url ? video.url.trim() : ''
      })).filter(video => video.url); // Boş URL'leri filtrele

      const method = editMode ? 'PUT' : 'POST';
      const url = editMode ? `/api/etkinlikler/${editId}` : '/api/etkinlikler';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...cleanedEtkinlik,
          resimler: cleanedResimler,
          videolar: cleanedVideolar
        }),
      });

      if (response.ok) {
        setMessage(editMode ? 'Etkinlik güncellendi!' : 'Etkinlik oluşturuldu!');
        setEtkinlik({
          baslik: '',
          aciklama: '',
          icerik: '',
          tarih: '',
          konum: '',
          resimUrl: '',
        });
        setResimler([]);
        setVideolar([]);
        setEditMode(false);
        setEditId(null);
        
        // Etkinlikleri yenile
        const updatedResponse = await fetch('/api/etkinlikler');
        const updatedData = await updatedResponse.json();
        setEtkinlikler(updatedData);
      } else {
        const data = await response.json();
        setError(data.error || 'Bir hata oluştu');
      }    } catch (error) {
      console.error('İşlem hatası:', error);
      setError('İşlem sırasında bir hata oluştu');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleEdit = (etkinlik) => {
    setEtkinlik({
      baslik: etkinlik.baslik,
      aciklama: etkinlik.aciklama,
      icerik: etkinlik.icerik,
      tarih: new Date(etkinlik.tarih).toISOString().split('T')[0],
      konum: etkinlik.konum || '',
      resimUrl: etkinlik.resimUrl || '',
    });
    setResimler(etkinlik.resimler || []);
    setVideolar(etkinlik.videolar || []);
    setEditMode(true);
    setEditId(etkinlik.id);
    window.scrollTo(0, 0);
  };
  const handleDelete = async (id) => {
    if (!confirm('Bu etkinliği silmek istediğinizden emin misiniz?')) {
      return;
    }

    try {
      setMessage('');
      setError('');
      
      const response = await fetch(`/api/etkinlikler/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Etkinlik başarıyla silindi!');
        // Etkinlikleri yenile
        const updatedResponse = await fetch('/api/etkinlikler');
        const updatedData = await updatedResponse.json();
        setEtkinlikler(updatedData);
      } else {
        setError(data.error || 'Etkinlik silinirken bir hata oluştu');
      }
    } catch (error) {
      console.error('Silme hatası:', error);
      setError('Etkinlik silinirken bir hata oluştu');
    }
  };

  const addResim = () => {
    setResimler([...resimler, { url: '', aciklama: '' }]);
  };

  const addVideo = () => {
    setVideolar([...videolar, { url: '', aciklama: '' }]);
  };

  const removeResim = (index) => {
    setResimler(resimler.filter((_, i) => i !== index));
  };

  const removeVideo = (index) => {
    setVideolar(videolar.filter((_, i) => i !== index));
  };
  const handleFileUpload = async (file, type) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Dosya yükleme hatası');
      }      const data = await response.json();
      
      // URL'yi temizle ve kontrol et
      const cleanUrl = data.url ? data.url.trim() : '';
      if (!cleanUrl) {
        throw new Error('Geçersiz URL döndü');
      }
      
      if (type === 'image') {
        setResimler([...resimler, {
          url: cleanUrl,
          aciklama: file.name.split('.')[0] // Dosya adını varsayılan açıklama olarak kullan
        }]);
        setMessage(`${file.name} başarıyla yüklendi!`);
      } else if (type === 'video') {
        setVideolar([...videolar, {
          url: cleanUrl,
          aciklama: file.name.split('.')[0]
        }]);
        setMessage(`${file.name} başarıyla yüklendi!`);
      }

      return cleanUrl;
    } catch (error) {
      console.error('Dosya yükleme hatası:', error);
      setError(`${file.name} yüklenemedi: ${error.message}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      await handleFileUpload(file, 'image');
    }
  };

  const handleVideoUpload = async (e) => {
    const files = Array.from(e.target.files);
    for (const file of files) {
      await handleFileUpload(file, 'video');
    }
  };

  const removeMedia = (index, type) => {
    if (type === 'image') {
      setResimler(resimler.filter((_, i) => i !== index));
    } else if (type === 'video') {
      setVideolar(videolar.filter((_, i) => i !== index));
    }
  };

  const updateMediaDescription = (index, description, type) => {
    if (type === 'image') {
      const updatedResimler = [...resimler];
      updatedResimler[index].aciklama = description;
      setResimler(updatedResimler);
    } else if (type === 'video') {
      const updatedVideolar = [...videolar];
      updatedVideolar[index].aciklama = description;
      setVideolar(updatedVideolar);
    }
  };  const handleMainImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      setMessage('Ana resim yükleniyor...');
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error('Dosya yükleme hatası');
      }

      const data = await response.json();
      console.log('Upload response:', data); // DEBUG: API'den dönen yanıtı kontrol edin

      // URL'yi temizle ve kontrol et
      const cleanUrl = data.url ? data.url.trim() : '';
      if (cleanUrl) {
        setEtkinlik((prev) => ({ ...prev, resimUrl: cleanUrl }));
        setMessage('Ana resim başarıyla yüklendi!');
      } else {
        throw new Error('Geçersiz URL döndü');
      }

      // Input'u temizle
      if (e.target) {
        e.target.value = '';
      }

    } catch (error) {
      console.error('Ana resim yükleme hatası:', error);
      setError(`Ana resim yüklenirken bir hata oluştu: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };
  // Drag & Drop fonksiyonları
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target && e.target.classList) {
      e.target.classList.add(styles.dragOver);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target && e.target.classList) {
      e.target.classList.remove(styles.dragOver);
    }
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.target && e.target.classList) {
      e.target.classList.remove(styles.dragOver);
    }
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    for (const file of imageFiles) {
      await handleFileUpload(file, 'image');
    }
  };

  if (status === 'loading') {
    return <div className={styles.container}>Yükleniyor...</div>;
  }

  if (!session?.user?.isAdmin) {
    return <div className={styles.container}>Bu sayfaya erişim yetkiniz yok.</div>;
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>
        {editMode ? 'Etkinlik Düzenle' : 'Yeni Etkinlik Ekle'}
      </h1>
      
      {message && <div className={styles.success}>{message}</div>}
      {error && <div className={styles.error}>{error}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="baslik">Başlık</label>
          <input
            type="text"
            id="baslik"
            value={etkinlik.baslik}
            onChange={(e) => setEtkinlik({ ...etkinlik, baslik: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="aciklama">Kısa Açıklama</label>
          <textarea
            id="aciklama"
            value={etkinlik.aciklama}
            onChange={(e) => setEtkinlik({ ...etkinlik, aciklama: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="icerik">Detaylı İçerik</label>
          <textarea
            id="icerik"
            value={etkinlik.icerik}
            onChange={(e) => setEtkinlik({ ...etkinlik, icerik: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="tarih">Tarih</label>
          <input
            type="date"
            id="tarih"
            value={etkinlik.tarih}
            onChange={(e) => setEtkinlik({ ...etkinlik, tarih: e.target.value })}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="konum">Konum</label>
          <input
            type="text"
            id="konum"
            value={etkinlik.konum}
            onChange={(e) => setEtkinlik({ ...etkinlik, konum: e.target.value })}
          />
        </div>        <div className={styles.formGroup}>
          <label htmlFor="resimUrl">Ana Resim</label>
          <div className={styles.mainImageUpload}>
            {/* Sadece dosya yükleme, manuel URL girişi yok */}
            <div className={styles.imageUploadOptions}>
              <input
                type="file"
                accept="image/*"
                onChange={handleMainImageUpload}
                className={styles.fileInput}
                id="mainImageFile"
                disabled={uploading}
              />
              <label htmlFor="mainImageFile" className={styles.uploadButton}>
                {uploading ? '⏳ Yükleniyor...' : '📁 Dosya Seç'}
              </label>
            </div>
            {etkinlik.resimUrl && etkinlik.resimUrl.trim() && (
              <div className={styles.mainImagePreview}>
                <Image
                  src={etkinlik.resimUrl.startsWith('/') ? etkinlik.resimUrl : '/' + etkinlik.resimUrl}
                  alt="Ana resim önizleme"
                  width={200}
                  height={150}
                  unoptimized
                  style={{ objectFit: 'cover' }}
                  className={styles.previewImage}
                  onError={(e) => {
                    console.error('Main image load error:', e);
                    setError(`Ana resim yüklenemedi. URL: ${etkinlik.resimUrl}`);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setEtkinlik({ ...etkinlik, resimUrl: '' })}
                  className={styles.removeMainImage}
                >
                  ❌
                </button>
              </div>
            )}
            {/* Debug: URL durumunu göster */}
            {etkinlik.resimUrl && (
              <div style={{ fontSize: '12px', color: '#666', marginTop: '5px' }}>
                <strong>Mevcut URL:</strong> {etkinlik.resimUrl}
              </div>
            )}
          </div>
        </div>        <div className={styles.mediaSection}>
          <h3>Medya Yönetimi</h3>
          
          <div className={styles.mediaUpload}>
            <div className={styles.uploadArea}>
              <h4>📸 Galeri Resimleri</h4>
              <div 
                className={`${styles.dropZone} ${uploading ? styles.uploading : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
              >                <div className={styles.dropContent}>
                  {uploading ? (
                    <>
                      <div className={styles.loadingSpinner}></div>
                      <p>📤 Dosyalar yükleniyor...</p>
                    </>
                  ) : (
                    <>
                      <p>🎯 Resimleri buraya sürükleyip bırakın</p>
                      <span>veya</span>
                      <label className={styles.uploadButton}>
                        📁 Dosyaları Seçin
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageUpload}
                          className={styles.fileInput}
                          disabled={uploading}
                        />
                      </label>
                    </>
                  )}
                </div>
              </div>
            </div>
              <div className={styles.mediaPreview}>
              {resimler.map((resim, index) => (
                <div key={`image-${index}-${resim.url}`} className={styles.mediaItem}>
                  <div className={styles.imageContainer}>                    {resim.url && resim.url.trim() && (
                      <Image
                        src={resim.url.trim()}
                        alt={resim.aciklama || `Resim ${index + 1}`}
                        width={150}
                        height={120}
                        style={{ objectFit: 'cover' }}
                        className={styles.mediaImage}
                        onError={(e) => {
                          console.error('Image load error:', e);
                        }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index, 'image')}
                      className={styles.removeButton}
                    >
                      ❌
                    </button>
                  </div>
                  <input
                    type="text"
                    value={resim.aciklama || ''}
                    onChange={(e) => updateMediaDescription(index, e.target.value, 'image')}
                    placeholder="Resim açıklaması"
                    className={styles.mediaDescription}
                  />
                </div>
              ))}
            </div>
          </div>          <div className={styles.videoUpload}>
            <div className={styles.uploadArea}>
              <h4>🎬 Galeri Videoları</h4>              <label className={`${styles.uploadButton} ${uploading ? styles.uploading : ''}`}>
                {uploading ? '⏳ Yükleniyor...' : '📁 Video Dosyaları Seçin'}
                <input
                  type="file"
                  accept="video/*"
                  multiple
                  onChange={handleVideoUpload}
                  className={styles.fileInput}
                  disabled={uploading}
                />
              </label>
            </div>
              <div className={styles.mediaPreview}>
              {videolar.map((video, index) => (
                <div key={`video-${index}-${video.url}`} className={styles.mediaItem}>
                  <div className={styles.videoContainer}>                    {video.url && video.url.trim() && (
                      <video 
                        width="150" 
                        height="120" 
                        controls
                        className={styles.mediaVideo}
                        onError={(e) => {
                          console.error('Video load error:', e);
                        }}
                      >
                        <source src={video.url.trim()} type="video/mp4" />
                        Tarayıcınız video elementini desteklemiyor.
                      </video>
                    )}
                    <button
                      type="button"
                      onClick={() => removeMedia(index, 'video')}
                      className={styles.removeButton}
                    >
                      ❌
                    </button>
                  </div>
                  <input
                    type="text"
                    value={video.aciklama || ''}
                    onChange={(e) => updateMediaDescription(index, e.target.value, 'video')}
                    placeholder="Video açıklaması"
                    className={styles.mediaDescription}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
          <button type="submit" className={styles.submitButton} disabled={formSubmitting || uploading}>
          {formSubmitting ? '⏳ İşleniyor...' : (editMode ? 'Etkinliği Güncelle' : 'Etkinliği Oluştur')}
        </button>
      </form>      <div className={styles.eventList}>
        <h2>Mevcut Etkinlikler</h2>
        {etkinlikler.length === 0 ? (
          <p className={styles.noEvents}>Henüz etkinlik bulunmamaktadır.</p>
        ) : (
          <div className={styles.events}>
            {etkinlikler.map((item) => (
              <div key={item.id} className={styles.eventItem}>
                <div className={styles.eventImageContainer}>                  {item.resimUrl && item.resimUrl.trim() ? (
                    <Image
                      src={item.resimUrl.trim()}
                      alt={item.baslik}
                      width={200}
                      height={120}
                      style={{ objectFit: 'cover' }}
                      className={styles.eventImage}
                      onError={(e) => {
                        console.error('Event image load error:', e);
                      }}
                    />
                  ) : (
                    <div className={styles.noImage}>Resim Yok</div>
                  )}
                </div>
                <div className={styles.eventInfo}>
                  <h3>{item.baslik}</h3>
                  <p className={styles.description}>{item.aciklama}</p>
                  <p className={styles.date}>
                    <strong>Tarih:</strong>{' '}
                    {new Date(item.tarih).toLocaleDateString('tr-TR')}
                  </p>
                  {item.konum && (
                    <p className={styles.location}>
                      <strong>Konum:</strong> {item.konum}
                    </p>
                  )}
                </div>
                <div className={styles.eventActions}>
                  <button
                    onClick={() => handleEdit(item)}
                    className={styles.editButton}
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className={styles.deleteButton}
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
