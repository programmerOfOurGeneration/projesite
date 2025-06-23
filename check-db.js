const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkDatabase() {
  try {
    console.log('=== VERİTABANI KONTROL ===\n');
    
    // Etkinlik sayısı
    const etkinlikCount = await prisma.etkinlik.count();
    console.log(`📅 Toplam Etkinlik: ${etkinlikCount}`);
    
    // Envanter sayısı
    const envanterCount = await prisma.envanter.count();
    console.log(`📦 Toplam Envanter: ${envanterCount}`);
    
    // Resim sayısı
    const resimCount = await prisma.etkinlikResim.count();
    console.log(`🖼️  Toplam Resim: ${resimCount}`);
    
    // Video sayısı
    const videoCount = await prisma.etkinlikVideo.count();
    console.log(`🎥 Toplam Video: ${videoCount}\n`);
    
    // Son 3 etkinlik detayları
    console.log('=== SON 3 ETKİNLİK ===');
    const etkinlikler = await prisma.etkinlik.findMany({
      take: 3,
      orderBy: { tarih: 'desc' },
      include: {
        resimler: true,
        videolar: true
      }
    });
    
    etkinlikler.forEach((etkinlik, index) => {
      console.log(`\n${index + 1}. ${etkinlik.baslik}`);
      console.log(`   Tarih: ${etkinlik.tarih}`);
      console.log(`   Ana Resim: ${etkinlik.resimUrl || 'YOK'}`);
      console.log(`   Ek Resim Sayısı: ${etkinlik.resimler.length}`);
      console.log(`   Video Sayısı: ${etkinlik.videolar.length}`);
      
      if (etkinlik.resimler.length > 0) {
        console.log('   Resim URLs:');
        etkinlik.resimler.forEach(resim => {
          console.log(`     - ${resim.url}`);
        });
      }
    });
    
    console.log('\n=== SON 3 ENVANTER ===');
    const envanterler = await prisma.envanter.findMany({
      take: 3,
      orderBy: { name: 'asc' }
    });
    
    envanterler.forEach((item, index) => {
      console.log(`\n${index + 1}. ${item.name}`);
      console.log(`   Kategori: ${item.category}`);
      console.log(`   Resim: ${item.image || 'YOK'}`);
      console.log(`   Adet: ${item.quantity}`);
    });
    
  } catch (error) {
    console.error('❌ Veritabanı kontrolünde hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
