const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkEtkinlikResimler() {
  try {
    console.log('=== ETKİNLİK RESİMLERİ KONTROLÜ ===\n');
    
    const etkinlikler = await prisma.etkinlik.findMany({
      include: {
        resimler: true,
        videolar: true
      },
      orderBy: { tarih: 'desc' }
    });
    
    console.log(`Toplam ${etkinlikler.length} etkinlik bulundu.\n`);
    
    etkinlikler.forEach((etkinlik, index) => {
      console.log(`${index + 1}. ${etkinlik.baslik}`);
      console.log(`   ID: ${etkinlik.id}`);
      console.log(`   Tarih: ${etkinlik.tarih.toLocaleDateString('tr-TR')}`);
      console.log(`   Ana Resim URL: ${etkinlik.resimUrl || 'BOŞ'}`);
      console.log(`   Ek Resim Sayısı: ${etkinlik.resimler.length}`);
      console.log(`   Video Sayısı: ${etkinlik.videolar.length}`);
      
      if (etkinlik.resimler.length > 0) {
        console.log('   Ek Resimler:');
        etkinlik.resimler.forEach((resim, i) => {
          console.log(`     ${i + 1}. ${resim.url} - ${resim.aciklama || 'Açıklama yok'}`);
        });
      }
      
      if (etkinlik.videolar.length > 0) {
        console.log('   Videolar:');
        etkinlik.videolar.forEach((video, i) => {
          console.log(`     ${i + 1}. ${video.url} - ${video.aciklama || 'Açıklama yok'}`);
        });
      }
      
      console.log('');
    });
    
  } catch (error) {
    console.error('❌ Hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkEtkinlikResimler();
