import { NextResponse } from 'next/server';

// Mock envanter verisi - Gerçek uygulamada veritabanından gelecek
const mockEnvanter = [
  {
    id: 1,
    name: 'Professional LED Panel 1000W',
    category: 'isik',
    quantity: 12,
    available: 8,
    condition: 'excellent',
    price: 15000,
    description: 'Yüksek kaliteli LED panel ışık sistemi. 1000W güç kapasitesi ile geniş alan aydınlatması sağlar.',
    image: '/light.svg',
    lastUsed: '2024-06-15',
    location: 'Depo A - Raf 3',
    serialNumber: 'LED-001-012',
    purchaseDate: '2023-01-15',
    warranty: '2025-01-15'
  },
  {
    id: 2,
    name: 'Wireless Mikrofon Seti',
    category: 'ses',
    quantity: 20,
    available: 15,
    condition: 'good',
    price: 8000,
    description: 'Profesyonel kablosuz mikrofon sistemi. UHF frekans bandında çalışır.',
    image: '/sound.svg',
    lastUsed: '2024-06-10',
    location: 'Depo B - Dolap 1',
    serialNumber: 'MIC-002-020',
    purchaseDate: '2023-03-10',
    warranty: '2025-03-10'
  },
  {
    id: 3,
    name: 'Sahne Reflektörü 500W',
    category: 'isik',
    quantity: 25,
    available: 20,
    condition: 'excellent',
    price: 5500,
    description: 'Ayarlanabilir sahne reflektörü. Spot ve flood ayarları mevcut.',
    image: '/light.svg',
    lastUsed: '2024-06-12',
    location: 'Depo A - Raf 1',
    serialNumber: 'REF-003-025',
    purchaseDate: '2023-02-20',
    warranty: '2025-02-20'
  },
  {
    id: 4,
    name: 'PA Sistem 2000W',
    category: 'ses',
    quantity: 8,
    available: 6,
    condition: 'good',
    price: 25000,
    description: 'Güçlü PA ses sistemi. Geniş etkinlikler için ideal.',
    image: '/sound.svg',
    lastUsed: '2024-06-08',
    location: 'Depo C - Alan 1',
    serialNumber: 'PA-004-008',
    purchaseDate: '2022-11-05',
    warranty: '2024-11-05'
  },
  {
    id: 5,
    name: 'Profesyonel Video Kamera',
    category: 'kamera',
    quantity: 6,
    available: 4,
    condition: 'excellent',
    price: 45000,
    description: '4K video kayıt kamerası. Profesyonel etkinlik çekimleri için.',
    image: '/stage.svg',
    lastUsed: '2024-06-14',
    location: 'Güvenlik Dolabı',
    serialNumber: 'CAM-005-006',
    purchaseDate: '2023-05-12',
    warranty: '2025-05-12'
  },
  {
    id: 6,
    name: 'Sahne Dekoru Paneli',
    category: 'sahne',
    quantity: 50,
    available: 35,
    condition: 'good',
    price: 1200,
    description: 'Modüler sahne dekor paneli. Farklı renk ve desen seçenekleri.',
    image: '/stage.svg',
    lastUsed: '2024-06-09',
    location: 'Depo D - Yığın 1',
    serialNumber: 'DEC-006-050',
    purchaseDate: '2023-04-18',
    warranty: '2025-04-18'
  },
  {
    id: 7,
    name: 'DMX Controller',
    category: 'isik',
    quantity: 4,
    available: 3,
    condition: 'excellent',
    price: 12000,
    description: 'DMX 512 ışık kontrol sistemi. 24 kanal kontrolü.',
    image: '/light.svg',
    lastUsed: '2024-06-11',
    location: 'Teknik Odası',
    serialNumber: 'DMX-007-004',
    purchaseDate: '2023-06-20',
    warranty: '2025-06-20'
  },
  {
    id: 8,
    name: 'Sahne Duman Makinesi',
    category: 'sahne',
    quantity: 8,
    available: 6,
    condition: 'good',
    price: 3500,
    description: 'Profesyonel sahne duman efekt makinesi.',
    image: '/stage.svg',
    lastUsed: '2024-06-13',
    location: 'Depo A - Raf 2',
    serialNumber: 'SMK-008-008',
    purchaseDate: '2023-07-08',
    warranty: '2025-07-08'
  },
  {
    id: 9,
    name: 'Kablosuz In-Ear Monitor',
    category: 'ses',
    quantity: 16,
    available: 12,
    condition: 'excellent',
    price: 6500,
    description: 'Profesyonel in-ear monitör sistemi. Kristal ses kalitesi.',
    image: '/sound.svg',
    lastUsed: '2024-06-07',
    location: 'Depo B - Dolap 2',
    serialNumber: 'IEM-009-016',
    purchaseDate: '2023-08-15',
    warranty: '2025-08-15'
  },
  {
    id: 10,
    name: 'Tripod Set',
    category: 'kamera',
    quantity: 12,
    available: 10,
    condition: 'good',
    price: 2800,
    description: 'Profesyonel kamera tripodu. Ayarlanabilir yükseklik.',
    image: '/stage.svg',
    lastUsed: '2024-06-06',
    location: 'Depo C - Raf 1',
    serialNumber: 'TRI-010-012',
    purchaseDate: '2023-09-22',
    warranty: '2025-09-22'
  }
];

export async function GET(request) {
  try {
    // Session kontrolü kaldırıldı - frontend'da kontrol edilecek

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'name';

    // Filtreleme
    let filteredItems = mockEnvanter;

    if (search) {
      filteredItems = filteredItems.filter(item => 
        item.name.toLowerCase().includes(search) ||
        item.description.toLowerCase().includes(search) ||
        item.serialNumber.toLowerCase().includes(search)
      );
    }

    if (category !== 'all') {
      filteredItems = filteredItems.filter(item => item.category === category);
    }

    // Sıralama
    filteredItems.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'quantity':
          return b.quantity - a.quantity;
        case 'available':
          return b.available - a.available;
        case 'price':
          return b.price - a.price;
        case 'lastUsed':
          return new Date(b.lastUsed) - new Date(a.lastUsed);
        default:
          return 0;
      }
    });

    // İstatistikler
    const stats = {
      totalItems: mockEnvanter.reduce((sum, item) => sum + item.quantity, 0),
      availableItems: mockEnvanter.reduce((sum, item) => sum + item.available, 0),
      inUseItems: mockEnvanter.reduce((sum, item) => sum + (item.quantity - item.available), 0),
      totalValue: mockEnvanter.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      categories: {
        isik: mockEnvanter.filter(item => item.category === 'isik').length,
        ses: mockEnvanter.filter(item => item.category === 'ses').length,
        kamera: mockEnvanter.filter(item => item.category === 'kamera').length,
        sahne: mockEnvanter.filter(item => item.category === 'sahne').length,
        aksesuar: mockEnvanter.filter(item => item.category === 'aksesuar').length,
        diger: mockEnvanter.filter(item => item.category === 'diger').length
      }
    };

    return NextResponse.json({
      success: true,
      data: filteredItems,
      stats: stats,
      total: filteredItems.length
    });

  } catch (error) {
    console.error('Envanter API hatası:', error);
    return NextResponse.json({ 
      error: 'Envanter verileri alınamadı' 
    }, { status: 500 });
  }
}

// Yeni envanter item ekleme (Admin only)
export async function POST(request) {
  try {
    // Session kontrolü kaldırıldı - frontend'da kontrol edilecek
    
    const data = await request.json();
    
    // Validation
    const requiredFields = ['name', 'category', 'quantity', 'price', 'description', 'location'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ 
          error: `${field} alanı zorunludur` 
        }, { status: 400 });
      }
    }

    // Yeni item oluştur
    const newItem = {
      id: mockEnvanter.length + 1,
      name: data.name,
      category: data.category,
      quantity: parseInt(data.quantity),
      available: parseInt(data.quantity), // Başlangıçta tümü müsait
      condition: data.condition || 'excellent',
      price: parseFloat(data.price),
      description: data.description,
      image: data.image || '/stage.svg',
      lastUsed: null,
      location: data.location,
      serialNumber: data.serialNumber || `AUTO-${Date.now()}`,
      purchaseDate: data.purchaseDate || new Date().toISOString().split('T')[0],
      warranty: data.warranty
    };

    // Mock data'ya ekle (gerçek uygulamada veritabanına kaydet)
    mockEnvanter.push(newItem);

    return NextResponse.json({
      success: true,
      data: newItem,
      message: 'Envanter item başarıyla eklendi'
    });

  } catch (error) {
    console.error('Envanter ekleme hatası:', error);
    return NextResponse.json({ 
      error: 'Envanter item eklenemedi' 
    }, { status: 500 });
  }
}
