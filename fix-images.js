import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateImages() {
  try {
    console.log('Resim URL\'leri güncelleniyor...\n');
    
    // Etkinlik ana resimlerini güncelle
    await prisma.etkinlik.updateMany({
      where: {
        OR: [
          { resimUrl: '/stage-hero.jpg' },
          { resimUrl: { startsWith: '/uploads/' } }
        ]
      },
      data: {
        resimUrl: 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?w=1200&h=600&fit=crop'
      }
    });
    
    console.log('✅ Etkinlik ana resimleri güncellendi');
    
    // Envanter resimlerini güncelle
    await prisma.envanter.updateMany({
      where: {
        OR: [
          { image: '/light.svg' },
          { image: { startsWith: '/uploads/' } }
        ]
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
    
    console.log('✅ Envanter resimleri güncellendi');
    
    // Etkinlik ek resimlerini güncelle
    await prisma.etkinlikResim.updateMany({
      where: {
        url: { startsWith: '/uploads/' }
      },
      data: {
        url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=800&h=600&fit=crop'
      }
    });
    
    console.log('✅ Etkinlik ek resimleri güncellendi');
    
    console.log('\n🎉 Tüm resim URL\'leri başarıyla güncellendi!');
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateImages();
