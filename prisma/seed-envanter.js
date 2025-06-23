const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const mockEnvanter = [
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

async function seedEnvanter() {
  try {
    console.log('Envanter verileri ekleniyor...');
    
    for (const item of mockEnvanter) {
      await prisma.envanter.create({
        data: item
      });
    }
    
    console.log('✅ Envanter verileri başarıyla eklendi!');
  } catch (error) {
    console.error('❌ Envanter verileri eklenirken hata:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedEnvanter();
