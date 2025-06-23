const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function addTestImages() {
  try {
    console.log('Test resimleri ekleniyor...\n');
    
    // İlk etkinlik için resim ekle
    await prisma.etkinlikResim.create({
      data: {
        etkinlikId: 1,
        url: '/uploads/1750589880106.png',
        aciklama: 'Konser sahne görünümü'
      }
    });
    
    await prisma.etkinlikResim.create({
      data: {
        etkinlikId: 1,
        url: '/uploads/1750625512735.PNG',
        aciklama: 'Konser katılımcıları'
      }
    });
    
    // İkinci etkinlik için resim ekle
    await prisma.etkinlikResim.create({
      data: {
        etkinlikId: 2,
        url: '/uploads/1750625550400.png',
        aciklama: 'Tiyatro sahnesi'
      }
    });
    
    await prisma.etkinlikResim.create({
      data: {
        etkinlikId: 2,
        url: '/uploads/1750626557799.PNG',
        aciklama: 'Tiyatro oyuncuları'
      }
    });
    
    // Üçüncü etkinlik için resim ekle
    await prisma.etkinlikResim.create({
      data: {
        etkinlikId: 3,
        url: '/uploads/1750626575408.PNG',
        aciklama: 'Lansman etkinliği'
      }
    });
    
    console.log('✅ Test resimleri başarıyla eklendi!');
    
    // Kontrol et
    const etkinlikler = await prisma.etkinlik.findMany({
      include: {
        resimler: true
      },
      orderBy: { tarih: 'desc' }
    });
    
    console.log('\n=== GÜNCEL DURUM ===');
    etkinlikler.forEach((etkinlik, index) => {
      console.log(`${index + 1}. ${etkinlik.baslik} - ${etkinlik.resimler.length} resim`);
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addTestImages();
