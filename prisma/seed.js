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
    });

    console.log('Test kullanıcısı oluşturuldu:', user);

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
