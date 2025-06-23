const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateImageUrls() {
  try {
    console.log('Resim URL\'lerini güncelleniyor...\n');
    
    // Etkinlik ana resimlerini güncelle
    await prisma.etkinlik.updateMany({
      where: {
        resimUrl: '/stage-hero.jpg'
      },
      data: {
        resimUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=600&fit=crop'
      }
    });
    
    console.log('Ana resimler güncellendi');
    
    // Etkinlik ek resimlerini güncelle
    const etkinlikResimler = await prisma.etkinlikResim.findMany();
    
    const newImageUrls = [
      'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop'
    ];
    
    for (let i = 0; i < etkinlikResimler.length; i++) {
      const resim = etkinlikResimler[i];
      const newUrl = newImageUrls[i % newImageUrls.length];
      
      await prisma.etkinlikResim.update({
        where: { id: resim.id },
        data: { url: newUrl }
      });
    }
    
    console.log('Ek resimler güncellendi');
    
    // Envanter resimlerini güncelle
    await prisma.envanter.updateMany({
      where: {
        image: '/light.svg'
      },
      data: {
        image: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=300&fit=crop'
      }
    });
    
    await prisma.envanter.updateMany({
      where: {
        image: '/sound.svg'
      },
      data: {
        image: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=300&fit=crop'
      }
    });
    
    await prisma.envanter.updateMany({
      where: {
        image: '/stage.svg'
      },
      data: {
        image: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=400&h=300&fit=crop'
      }
    });
    
    console.log('Envanter resimleri güncellendi');
    
    // Sonuçları kontrol et
    const updatedEtkinlikler = await prisma.etkinlik.findMany({
      include: {
        resimler: true
      }
    });
    
    console.log('\n=== GÜNCELLENMIŞ DURUM ===');
    updatedEtkinlikler.forEach((etkinlik, index) => {
      console.log(`${index + 1}. ${etkinlik.baslik}`);
      console.log(`   Ana resim: ${etkinlik.resimUrl}`);
      console.log(`   Ek resim sayısı: ${etkinlik.resimler.length}`);
    });
    
    console.log('\n✅ Tüm resim URL\'leri başarıyla güncellendi!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImageUrls();
