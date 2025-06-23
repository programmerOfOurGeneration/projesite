'use client';
import { useState, useEffect } from 'react';
import { signIn, useSession } from 'next-auth/react';
import styles from './page.module.css';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();
  // Oturum durumunu kontrol et
  useEffect(() => {
    if (session) {
      if (session.user.isAdmin) {
        router.replace('/admin');
      } else {
        router.replace('/');
      }
    }
  }, [session, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!email || !password) {
      setError('Lütfen e-posta ve şifrenizi girin');
      setIsLoading(false);
      return;
    }

    try {
      const result = await signIn('credentials', {
        email: email.toLowerCase().trim(),
        password,
        redirect: false
      });

      console.log('SignIn result:', result);

      if (result?.error) {
        if (result.error === 'Email ve şifre gerekli') {
          setError('Lütfen tüm alanları doldurun');
        } else if (result.error === 'Kullanıcı bulunamadı') {
          setError('Bu e-posta ile kayıtlı kullanıcı bulunamadı');
        } else if (result.error === 'Geçersiz şifre') {
          setError('Şifre hatalı');
        } else {
          setError('Giriş yapılamadı. Lütfen bilgilerinizi kontrol edin.');
        }
      } else if (result?.ok) {
        console.log('Giriş başarılı, yönlendiriliyor...');
      }
    } catch (error) {
      console.error('Giriş hatası:', error);
      setError('Bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsLoading(false);
    }
  };

  // Yükleme durumunda veya oturum açıkken loading göster
  if (status === 'loading') {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.loginBox}>
        <div className={styles.leftSide}>
          <Image 
            src="/stage.svg" 
            alt="StageDesign Logo" 
            width={100} 
            height={100} 
            className={styles.logo}
          />
          <h2>Onpases</h2>
          <p>Kullanıcı Girişi</p>
        </div>
        
        <div className={styles.rightSide}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <h1>Giriş Yap</h1>
            {error && <div className={styles.error}>{error}</div>}
            
            <div className={styles.formGroup}>
              <label htmlFor="email">E-posta</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="E-posta adresiniz"
                disabled={isLoading}
              />
            </div>
            
            <div className={styles.formGroup}>
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Şifreniz"
                disabled={isLoading}
                minLength={6}
              />
            </div>

            <button type="submit" className={styles.loginButton} disabled={isLoading}>
              {isLoading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
