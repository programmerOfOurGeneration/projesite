import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  try {
    // Admin şifresi: Admin123!
    const adminPassword = await bcrypt.hash('Admin123!', 10);

    // Admin kullanıcısı oluştur veya güncelle
    const admin = await prisma.kullanici.upsert({
      where: { email: 'admin@onpases.com' },
      update: {},
      create: {
        email: 'admin@onpases.com',
        password: adminPassword,
        isim: 'Admin Kullanıcı',
        isAdmin: true
      },
    });

    console.log('Admin kullanıcısı oluşturuldu:', admin);

    // Normal test kullanıcısı oluştur
    const userPassword = await bcrypt.hash('User123!', 10);
    
    const user = await prisma.kullanici.upsert({
      where: { email: 'user@onpases.com' },
      update: {},
      create: {
        email: 'user@onpases.com',
        password: userPassword,
        isim: 'Test Kullanıcı',
        isAdmin: false
      },
    });    console.log('Test kullanıcısı oluşturuldu:', user);

    // Örnek etkinlikler oluştur
    const etkinlikler = [
      {
        baslik: 'Yıldızlar Altında Konser',
        aciklama: 'Açık hava konser alanında gerçekleştirilen büyülü bir müzik gecesi',
        icerik: 'Bu özel konser etkinliğinde, en sevilen sanatçılar sahne aldı. Modern sahne tasarımı ve profesyonel ses sistemi ile unutulmaz bir gece yaşandı.',
        tarih: new Date('2024-07-15'),
        konum: 'İstanbul Açık Hava Tiyatrosu',
        resimUrl: '/stage-hero.jpg'
      },
      {
        baslik: 'Tiyatro Festivali 2024',
        aciklama: 'Ülkemizin en prestijli tiyatro festivali',
        icerik: 'Üç gün süren festival boyunca, yerli ve yabancı tiyatro toplulukları sahne aldı. Özel sahne tasarımları ve ışık oyunları ile büyüleyici performanslar sergilendi.',
        tarih: new Date('2024-06-20'),
        konum: 'Ankara Devlet Tiyatrosu',
        resimUrl: '/stage-hero.jpg'
      },
      {
        baslik: 'Kurumsal Lansman Etkinliği',
        aciklama: 'Teknoloji şirketi için özel ürün lansmanı',
        icerik: 'Interaktif sahne tasarımı ve LED ekranlar kullanılarak gerçekleştirilen modern lansman etkinliği. Hologram teknolojisi ile etkileyici sunum yapıldı.',
        tarih: new Date('2024-05-10'),
        konum: 'İstanbul Kongre Merkezi',
        resimUrl: '/stage-hero.jpg'
      },
      {
        baslik: 'Müze Gecesi Özel Etkinliği',
        aciklama: 'Tarihi müzede gerçekleştirilen kültür-sanat gecesi',
        icerik: 'Tarihi atmosfere uygun özel ışık tasarımı ve ses sistemi ile müze koleksiyonları eşliğinde sanatsal performanslar sergilendi.',
        tarih: new Date('2024-04-25'),
        konum: 'İstanbul Arkeoloji Müzesi',
        resimUrl: '/stage-hero.jpg'
      },
      {
        baslik: 'Fashion Week Defile',
        aciklama: 'Moda haftası ana defile etkinliği',
        icerik: 'Podium tasarımı, özel ışık efektleri ve ses sistemi ile moda dünyasının en önemli etkinliklerinden biri gerçekleştirildi.',
        tarih: new Date('2024-03-18'),
        konum: 'İstanbul Fuar Merkezi',
        resimUrl: '/stage-hero.jpg'
      }
    ];

    for (const etkinlik of etkinlikler) {
      await prisma.etkinlik.create({
        data: etkinlik
      });
    }

    console.log('Örnek etkinlikler oluşturuldu');

    // Envanter verileri oluştur
    const envanterItems = [
      {
        name: 'Professional LED Panel 1000W',
        category: 'isik',
        quantity: 12,
        available: 8,
        condition: 'excellent',
        price: 15000,
        description: 'Yüksek kaliteli LED panel ışık sistemi. 1000W güç kapasitesi ile geniş alan aydınlatması sağlar.',
        image: '/light.svg',
        lastUsed: new Date('2024-06-15'),
        location: 'Depo A - Raf 3',
        serialNumber: 'LED-001-012',
        purchaseDate: new Date('2023-01-15'),
        warranty: new Date('2025-01-15')
      },
      {
        name: 'Wireless Mikrofon Seti',
        category: 'ses',
        quantity: 20,
        available: 15,
        condition: 'good',
        price: 8000,
        description: 'Profesyonel kablosuz mikrofon sistemi. UHF frekans bandında çalışır.',
        image: '/sound.svg',
        lastUsed: new Date('2024-06-10'),
        location: 'Depo B - Dolap 1',
        serialNumber: 'MIC-002-020',
        purchaseDate: new Date('2023-03-10'),
        warranty: new Date('2025-03-10')
      },
      {
        name: 'Sahne Reflektörü 500W',
        category: 'isik',
        quantity: 25,
        available: 20,
        condition: 'excellent',
        price: 5500,
        description: 'Ayarlanabilir sahne reflektörü. Spot ve flood ayarları mevcut.',
        image: '/light.svg',
        lastUsed: new Date('2024-06-12'),
        location: 'Depo A - Raf 1',
        serialNumber: 'REF-003-025',
        purchaseDate: new Date('2023-02-20'),
        warranty: new Date('2025-02-20')
      },
      {
        name: 'PA Sistem 2000W',
        category: 'ses',
        quantity: 8,
        available: 6,
        condition: 'good',
        price: 25000,
        description: 'Güçlü PA ses sistemi. Geniş etkinlikler için ideal.',
        image: '/sound.svg',
        lastUsed: new Date('2024-06-08'),
        location: 'Depo C - Alan 1',
        serialNumber: 'PA-004-008',
        purchaseDate: new Date('2022-11-05'),
        warranty: new Date('2024-11-05')
      },
      {
        name: 'Profesyonel Video Kamera',
        category: 'kamera',
        quantity: 6,
        available: 4,
        condition: 'excellent',
        price: 45000,
        description: '4K video kayıt kamerası. Profesyonel etkinlik çekimleri için.',
        image: '/stage.svg',
        lastUsed: new Date('2024-06-14'),
        location: 'Güvenlik Dolabı',
        serialNumber: 'CAM-005-006',
        purchaseDate: new Date('2023-05-12'),
        warranty: new Date('2025-05-12')
      }
    ];

    for (const item of envanterItems) {
      await prisma.envanter.create({
        data: item
      });
    }

    console.log('Envanter verileri oluşturuldu');

    // Ana sayfa içeriği oluştur
    const anaSayfaIcerik = await prisma.anaSayfaIcerik.create({
      data: {
        heroBaslik: 'Hayallerinizi Sahneliyoruz',
        heroAltBaslik: 'Profesyonel sahne tasarımı ve teknik prodüksiyon hizmetleri',
        servisler: {
          create: [
            {
              baslik: 'Sahne Tasarımı',
              aciklama: 'Konser, tiyatro ve özel etkinlikler için yaratıcı sahne tasarımları',
              ikonUrl: '/stage.svg'
            },
            {
              baslik: 'Işık Sistemleri',
              aciklama: 'Modern ışık teknolojileri ile profesyonel aydınlatma çözümleri',
              ikonUrl: '/light.svg'
            },
            {
              baslik: 'Ses Sistemleri',
              aciklama: 'Yüksek kaliteli ses sistemleri ve akustik tasarım',
              ikonUrl: '/sound.svg'
            }
          ]
        },
        istatistikler: {
          create: [
            {
              rakam: '500+',
              aciklama: 'Tamamlanan Proje'
            },
            {
              rakam: '50+',
              aciklama: 'Uzman Ekip'
            },
            {
              rakam: '15+',
              aciklama: 'Yıllık Deneyim'
            }
          ]
        }
      }
    });

    console.log('Ana sayfa içeriği oluşturuldu');

    // İletişim bilgileri oluştur
    const iletisimBilgileri = await prisma.iletisimBilgileri.create({
      data: {
        firmaAdi: 'Onpases Sahne Tasarım',
        hakkimizda: 'Profesyonel sahne tasarımı ve teknik prodüksiyon alanında 15 yılı aşkın deneyime sahip ekibimizle, hayallerinizi gerçeğe dönüştürüyoruz.',
        adres: 'İstanbul, Türkiye',
        telefon: '+90 (212) 123 45 67',
        email: 'info@onpases.com',
        calismaSaatleri: 'Pazartesi - Cuma: 09:00 - 18:00',
        sosyalMedya: {
          instagram: 'https://instagram.com/onpases',
          facebook: 'https://facebook.com/onpases',
          twitter: 'https://twitter.com/onpases'
        }
      }
    });

    console.log('İletişim bilgileri oluşturuldu');

  } catch (error) {
    console.error('Seed hatası:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
