'use client'
import Image from "next/image";
import styles from "./page.module.css";
import Link from "next/link";
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';

export default function Home() {
  const { data: session, status } = useSession();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [projeler, setProjeler] = useState([]);
  const [tumProjeler, setTumProjeler] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [icerik, setIcerik] = useState({
    heroBaslik: "Hayallerinizi Sahneliyoruz",
    heroAltBaslik: "Profesyonel sahne tasarımı ve teknik prodüksiyon hizmetleri",
    servisler: [
      {
        baslik: "Sahne Tasarımı",
        aciklama: "Konser, tiyatro ve özel etkinlikler için yaratıcı sahne tasarımları",
        ikonUrl: "/stage.svg"
      },
      {
        baslik: "Işık Sistemleri",
        aciklama: "Modern ışık teknolojileri ile profesyonel aydınlatma çözümleri",
        ikonUrl: "/light.svg"
      },
      {
        baslik: "Ses Sistemleri",
        aciklama: "Yüksek kaliteli ses sistemleri ve akustik tasarım",
        ikonUrl: "/sound.svg"
      }
    ],
    istatistikler: [
      {
        rakam: "500+",
        aciklama: "Tamamlanan Proje"
      },
      {
        rakam: "50+",
        aciklama: "Uzman Ekip"
      },
      {
        rakam: "15+",
        aciklama: "Yıllık Deneyim"
      }
    ]
  });  // Projeler verilerini çek
  useEffect(() => {
    const fetchProjeler = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/etkinlikler');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data && Array.isArray(data) && data.length > 0) {
          // Veri doğrulaması
          const validProjeler = data.filter(proje => proje && proje.id);
          setProjeler(validProjeler.slice(0, 5)); // İlk 5 projeyi slider için
          setTumProjeler(validProjeler.slice(0, 8)); // İlk 8 projeyi liste için
        } else {
          setProjeler([]);
          setTumProjeler([]);
        }
      } catch (error) {
        console.error('Projeler yüklenemedi:', error);
        setProjeler([]);
        setTumProjeler([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProjeler();
  }, []);

  // İçerik verilerini çek
  useEffect(() => {
    const getIcerik = async () => {
      try {
        const response = await fetch('/api/admin/icerik');
        const data = await response.json();
        if (data && !data.error) {
          setIcerik(data);
        }
      } catch (error) {
        console.error('İçerik yüklenemedi:', error);
      }
    };
    getIcerik();
  }, []);
  // CurrentSlide değerini sıfırla eğer projeler değişirse
  useEffect(() => {
    if (projeler && projeler.length > 0 && currentSlide >= projeler.length) {
      setCurrentSlide(0);
    }
  }, [projeler, currentSlide]);

  // Slider otomatik geçiş - projeler yüklendikten sonra
  useEffect(() => {
    if (projeler && projeler.length > 0 && !isLoading) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => {
          if (projeler && projeler.length > 0) {
            return (prev + 1) % projeler.length;
          }
          return prev;
        });
      }, 4000);
      return () => clearInterval(interval);
    }
  }, [projeler, isLoading]);
  const handleSignOut = async () => {
    await signOut({ redirect: true, callbackUrl: '/' });
  };  const nextSlide = () => {
    if (projeler && projeler.length > 0) {
      setCurrentSlide((prev) => (prev + 1) % projeler.length);
    }
  };

  const prevSlide = () => {
    if (projeler && projeler.length > 0) {
      setCurrentSlide((prev) => (prev - 1 + projeler.length) % projeler.length);
    }
  };

  const goToSlide = (index) => {
    if (projeler && projeler.length > 0 && index >= 0 && index < projeler.length) {
      setCurrentSlide(index);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <nav className={styles.nav}>
          <Link href="/" className={styles.logo}>
            Onpases
          </Link>          <div className={styles.navLinks}>
            <Link href="/">Ana Sayfa</Link>
            <Link href="/etkinlikler">Projelerimiz</Link>
            <Link href="/envanter">Envanter</Link>
            <Link href="/iletisim">İletişim</Link>            {status === 'loading' ? (
              <div className={styles.loadingDot}></div>
            ) : session?.user ? (
              <>
                {session.user.isAdmin && (
                  <Link href="/admin" className={styles.adminLink}>
                    Admin Panel
                  </Link>
                )}
                <button onClick={handleSignOut} className={styles.signOutButton}>
                  Çıkış Yap
                </button>
              </>
            ) : (
              <Link href="/admin/login" className={styles.adminLoginLink}>
                Admin Giriş
              </Link>
            )}
          </div>
        </nav>        <section className={styles.hero}>
          <div className={styles.sliderContainer}>
            {isLoading ? (
              // Loading state
              <div className={`${styles.slide} ${styles.active}`} style={{ backgroundImage: `url(/stage-hero.jpg)` }}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                  <h1>Projeler Yükleniyor...</h1>
                  <p>Lütfen bekleyin</p>
                </div>
              </div>            ) : projeler && projeler.length > 0 ? (
              projeler.map((proje, index) => (
                proje && proje.id ? (
                  <div
                    key={`slide-${proje.id}-${index}`}
                    className={`${styles.slide} ${index === currentSlide ? styles.active : ''}`}
                    style={{ 
                      backgroundImage: proje.resimUrl 
                        ? `url(${proje.resimUrl})` 
                        : `url(/stage-hero.jpg)`
                    }}
                  >
                    <div className={styles.heroOverlay}></div>
                    <div className={styles.heroContent}>
                      <h1>{proje.baslik || 'Proje Başlığı'}</h1>
                      <p>{proje.aciklama || 'Proje açıklaması'}</p>
                      <div className={styles.projectDetails}>
                        <span className={styles.projectDate}>
                          📅 {proje.tarih ? new Date(proje.tarih).toLocaleDateString('tr-TR') : 'Tarih yok'}
                        </span>
                        {proje.konum && (
                          <span className={styles.projectLocation}>
                            📍 {proje.konum}
                          </span>
                        )}
                      </div>
                      <div className={styles.heroActions}>
                        <Link href={`/blog/${proje.id}`} className={styles.cta}>
                          Projeyi İncele
                        </Link>
                        <Link href="/etkinlikler" className={styles.ctaSecondary}>
                          Tüm Projeler
                        </Link>
                      </div>
                    </div>
                  </div>
                ) : null
              ))
            ) : (
              // Varsayılan slide - projeler yoksa
              <div className={`${styles.slide} ${styles.active}`} style={{ backgroundImage: `url(/stage-hero.jpg)` }}>
                <div className={styles.heroOverlay}></div>
                <div className={styles.heroContent}>
                  <h1>Hayallerinizi Sahneliyoruz</h1>
                  <p>Profesyonel sahne tasarımı ve teknik prodüksiyon hizmetleri</p>
                  <Link href="/etkinlikler" className={styles.cta}>
                    Projelerimizi İnceleyin
                  </Link>
                </div>
              </div>
            )}
          </div>
            {projeler && projeler.length > 0 && !isLoading && (
            <>
              <div className={styles.sliderControls}>
                <button onClick={prevSlide} className={styles.sliderBtn} type="button">
                  &#8249;
                </button>
                <button onClick={nextSlide} className={styles.sliderBtn} type="button">
                  &#8250;
                </button>
              </div>
              
              <div className={styles.sliderDots}>
                {projeler.map((proje, index) => (
                  <button
                    key={`dot-${proje?.id || index}-${index}`}
                    onClick={() => goToSlide(index)}
                    className={`${styles.dot} ${index === currentSlide ? styles.activeDot : ''}`}
                    type="button"
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </section>        <section className={styles.projects}>
          <div className={styles.container}>
            <h2>Son Projelerimiz</h2>
            <p className={styles.sectionSubtitle}>
              Gerçekleştirdiğimiz öne çıkan etkinlikler ve projeler
            </p>
              {isLoading ? (
              <div className={styles.loadingGrid}>
                {Array.from({ length: 6 }, (_, index) => (
                  <div key={`loading-${index}`} className={styles.loadingCard}>
                    <div className={styles.loadingSkeleton}></div>
                    <div className={styles.loadingContent}>
                      <div className={styles.loadingTitle}></div>
                      <div className={styles.loadingText}></div>
                      <div className={styles.loadingText}></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : tumProjeler && tumProjeler.length > 0 ? (
              <div className={styles.projectGrid}>
                {tumProjeler.map((proje, index) => (
                  proje && proje.id ? (
                    <Link href={`/blog/${proje.id}`} key={`project-${proje.id}-${index}`} className={styles.projectCard}>
                      <div className={styles.projectImage}>
                        {proje.resimUrl ? (
                          <Image
                            src={proje.resimUrl}
                            alt={proje.baslik || 'Proje'}
                            width={300}
                            height={200}
                            className={styles.projectImg}
                          />
                        ) : (
                          <div className={styles.noImage}>
                            <Image
                              src="/stage.svg"
                              alt="Proje"
                              width={64}
                              height={64}
                            />
                          </div>
                        )}
                      </div>
                      <div className={styles.projectInfo}>
                        <h3>{proje.baslik || 'Başlık yok'}</h3>
                        <p>{proje.aciklama ? proje.aciklama.substring(0, 120) + '...' : 'Açıklama yok'}</p>
                        <div className={styles.projectMeta}>
                          <span className={styles.projectDate}>
                            {proje.tarih ? new Date(proje.tarih).toLocaleDateString('tr-TR') : 'Tarih yok'}
                          </span>
                          {proje.konum && (
                            <span className={styles.projectLocation}>
                              📍 {proje.konum}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ) : null
                ))}
              </div>
            ) : (
              <div className={styles.noProjects}>
                <Image
                  src="/stage.svg"
                  alt="Proje"
                  width={80}
                  height={80}
                />
                <h3>Henüz proje eklenmemiş</h3>
                <p>Yakında projelerimizi burada görebileceksiniz.</p>
              </div>
            )}
            
            <div className={styles.projectsFooter}>
              <Link href="/etkinlikler" className={styles.viewAllProjects}>
                Tüm Projelerimizi Görün
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.services}>
          <h2>Hizmetlerimiz</h2>
          <div className={styles.serviceGrid}>
            {icerik.servisler.map((servis, index) => (
              <div key={index} className={styles.serviceCard}>
                <Image
                  src={servis.ikonUrl}
                  alt={servis.baslik}
                  width={64}
                  height={64}
                />
                <h3>{servis.baslik}</h3>
                <p>{servis.aciklama}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.stats}>
          {icerik.istatistikler.map((istatistik, index) => (
            <div key={index} className={styles.statCard}>
              <h3>{istatistik.rakam}</h3>
              <p>{istatistik.aciklama}</p>
            </div>
          ))}
        </section>        <section className={styles.contact}>
          <h2>Vizyonunuzu Gerçeğe Dönüştürelim</h2>
          <p>Projeniz için profesyonel çözümler sunalım</p>
          <Link href="/iletisim" className={styles.ctaSecondary}>
            Bizimle İletişime Geçin
          </Link>
        </section>
      </main>
    </div>
  );
}
