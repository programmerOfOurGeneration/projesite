'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import styles from './page.module.css';
import Link from 'next/link';

export default function BlogPost() {
  const params = useParams();
  const [etkinlik, setEtkinlik] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [imageErrors, setImageErrors] = useState({});

  const handleImageError = (imageUrl) => {
    setImageErrors(prev => ({ ...prev, [imageUrl]: true }))
  }

  // Scroll progress hesaplama
  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(Math.min(progress, 100));
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Okuma süresi hesaplama
  const calculateReadingTime = (text) => {
    const wordsPerMinute = 200;
    const words = text.split(' ').length;
    return Math.ceil(words / wordsPerMinute);
  };

  useEffect(() => {
    const fetchEtkinlik = async () => {
      try {
        const response = await fetch(`/api/etkinlikler/${params.id}`);
        if (!response.ok) {
          throw new Error('Etkinlik bulunamadı');        }
        const data = await response.json();
        setEtkinlik(data);
        
        // Okuma süresini hesapla
        const fullText = data.aciklama + ' ' + (data.icerik || '');
        setReadingTime(calculateReadingTime(fullText));
      } catch (error) {
        console.error('Etkinlik yüklenemedi:', error);
      }
    };

    if (params.id) {
      fetchEtkinlik();
    }
  }, [params.id]);

  if (!etkinlik) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loader}>Yükleniyor...</div>
      </div>
    );
  }
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };
  return (
    <div className={styles.container}>
      {/* Progress Bar */}
      <div className={styles.progressBar}>
        <div 
          className={styles.progressFill}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className={styles.breadcrumb}>
        <Link href="/etkinlikler">← Etkinliklere Dön</Link>
      </div>

      <article className={styles.blogPost}>
        <header className={styles.header}>
          <div className={styles.meta}>
            <time dateTime={etkinlik.tarih}>{formatDate(etkinlik.tarih)}</time>
            {readingTime > 0 && (
              <span className={styles.readingTime}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12,6 12,12 16,14"></polyline>
                </svg>
                {readingTime} dk okuma
              </span>
            )}
            {etkinlik.konum && (
              <span className={styles.location}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={styles.icon}>
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                {etkinlik.konum}
              </span>
            )}
          </div>
          <h1 className={styles.title}>{etkinlik.baslik}</h1>
        </header>        {etkinlik.resimUrl && !imageErrors[etkinlik.resimUrl] && (
          <div className={styles.featuredImage}>
            <Image
              src={etkinlik.resimUrl}
              alt={etkinlik.baslik}
              width={1200}
              height={600}
              className={styles.mainImage}
              priority
              onError={() => handleImageError(etkinlik.resimUrl)}
            />
          </div>
        )}

        {(!etkinlik.resimUrl || imageErrors[etkinlik.resimUrl]) && (
          <div className={styles.featuredImage}>
            <div className={styles.defaultImageContainer}>
              <Image
                src="/stage-hero.jpg"
                alt={etkinlik.baslik}
                width={1200}
                height={600}
                className={styles.mainImage}
                priority
              />
            </div>
          </div>
        )}<div className={styles.content}>
          <div className={styles.summary}>
            {etkinlik.aciklama}
          </div>

          {/* Sosyal Paylaşım Butonları */}
          <div className={styles.socialShare}>
            <h3>Bu Projeyi Paylaş</h3>
            <div className={styles.shareButtons}>
              <button 
                onClick={() => {
                  const text = `${etkinlik.baslik} - ${window.location.href}`;
                  navigator.share ? navigator.share({title: etkinlik.baslik, url: window.location.href}) : window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`);
                }}
                className={styles.shareBtn}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
                Twitter
              </button>
              <button 
                onClick={() => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`)}
                className={styles.shareBtn}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
                Facebook
              </button>
              <button 
                onClick={() => {
                  const text = `${etkinlik.baslik} - ${window.location.href}`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`);
                }}
                className={styles.shareBtn}
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
                </svg>
                WhatsApp
              </button>
            </div>
          </div>

          <div 
            className={styles.description} 
            dangerouslySetInnerHTML={{ __html: etkinlik.icerik }}
          />
        </div>

        {etkinlik.resimler && etkinlik.resimler.length > 0 && (
          <section className={styles.gallery}>
            <h2>Etkinlik Fotoğrafları</h2>
            <div className={styles.imageGrid}>
              {etkinlik.resimler.map((resim, index) => (
                <div
                  key={index}
                  className={styles.imageItem}
                  onClick={() => setSelectedImage(resim)}
                >
                  <Image
                    src={resim.url}
                    alt={resim.aciklama || `${etkinlik.baslik} - Fotoğraf ${index + 1}`}
                    width={400}
                    height={300}
                    className={styles.galleryImage}
                  />
                  {resim.aciklama && (
                    <div className={styles.imageCaption}>{resim.aciklama}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {etkinlik.videolar && etkinlik.videolar.length > 0 && (
          <section className={styles.videoSection}>
            <h2>Etkinlik Videoları</h2>
            <div className={styles.videoGrid}>
              {etkinlik.videolar.map((video, index) => (
                <div key={index} className={styles.videoItem}>
                  <video controls className={styles.video}>
                    <source src={video.url} type="video/mp4" />
                    Tarayıcınız video oynatmayı desteklemiyor.
                  </video>
                  {video.aciklama && (
                    <div className={styles.videoCaption}>{video.aciklama}</div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </article>

      {selectedImage && (
        <div className={styles.lightbox} onClick={() => setSelectedImage(null)}>
          <button className={styles.closeButton} onClick={() => setSelectedImage(null)}>
            ✕
          </button>
          <Image
            src={selectedImage.url}
            alt={selectedImage.aciklama || 'Etkinlik fotoğrafı'}
            width={1200}
            height={800}
            className={styles.lightboxImage}
          />
          {selectedImage.aciklama && (
            <div className={styles.lightboxCaption}>
              {selectedImage.aciklama}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
