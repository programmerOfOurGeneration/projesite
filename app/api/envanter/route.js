import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';
import { prisma } from '../../../lib/prisma';

// Envanter Listeleme
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    const isAdmin = session?.user?.isAdmin || false;
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search')?.toLowerCase() || '';
    const category = searchParams.get('category') || 'all';
    const sortBy = searchParams.get('sortBy') || 'name';

    // Prisma filtreleri
    let where = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { serialNumber: { contains: search, mode: 'insensitive' } }
      ];
    }
    if (category !== 'all') {
      where.category = category;
    }

    // Sıralama
    let orderBy = {};
    switch (sortBy) {
      case 'name': orderBy = { name: 'asc' }; break;
      case 'quantity': orderBy = { quantity: 'desc' }; break;
      case 'available': orderBy = { available: 'desc' }; break;
      case 'price': orderBy = { price: 'desc' }; break;
      case 'lastUsed': orderBy = { lastUsed: 'desc' }; break;
      default: orderBy = { name: 'asc' };
    }

    const items = await prisma.envanter.findMany({ where, orderBy });

    // Admin değilse bazı alanları gizle
    const filteredItems = isAdmin
      ? items
      : items.map(({ location, serialNumber, purchaseDate, warranty, ...publicItem }) => publicItem);

    // İstatistikler
    const allItems = await prisma.envanter.findMany();
    const stats = {
      totalItems: allItems.reduce((sum, item) => sum + item.quantity, 0),
      availableItems: allItems.reduce((sum, item) => sum + item.available, 0),
      inUseItems: allItems.reduce((sum, item) => sum + (item.quantity - item.available), 0),
      totalValue: allItems.reduce((sum, item) => sum + (item.price * item.quantity), 0),
      categories: {
        isik: allItems.filter(item => item.category === 'isik').length,
        ses: allItems.filter(item => item.category === 'ses').length,
        kamera: allItems.filter(item => item.category === 'kamera').length,
        sahne: allItems.filter(item => item.category === 'sahne').length,
        aksesuar: allItems.filter(item => item.category === 'aksesuar').length,
        diger: allItems.filter(item => item.category === 'diger').length
      }
    };

    return NextResponse.json({
      success: true,
      data: filteredItems,
      stats,
      total: filteredItems.length
    });
  } catch (error) {
    console.error('Envanter API hatası:', error);
    return NextResponse.json({ error: 'Envanter verileri alınamadı' }, { status: 500 });
  }
}

// Yeni envanter item ekleme (Admin only)
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir' }, { status: 403 });
    }
    const data = await request.json();
    const requiredFields = ['name', 'category', 'quantity', 'price', 'description', 'location'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} alanı zorunludur` }, { status: 400 });
      }
    }    const newItem = await prisma.envanter.create({
      data: {
        name: data.name,
        category: data.category,
        quantity: parseInt(data.quantity),
        available: parseInt(data.available || data.quantity),
        condition: data.condition || 'excellent',
        price: parseFloat(data.price),
        description: data.description,
        image: data.image || '/stage.svg',
        lastUsed: data.lastUsed ? new Date(data.lastUsed) : null,
        location: data.location,
        serialNumber: data.serialNumber || `AUTO-${Date.now()}`,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : null,
        warranty: data.warranty ? new Date(data.warranty) : null
      }
    });
    return NextResponse.json({ success: true, data: newItem, message: 'Envanter item başarıyla eklendi' });
  } catch (error) {
    console.error('Envanter ekleme hatası:', error);
    return NextResponse.json({ error: 'Envanter item eklenemedi' }, { status: 500 });
  }
}

// Envanter item güncelleme (Admin only)
export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ error: 'Geçersiz veya eksik ID' }, { status: 400 });
    }

    const data = await request.json();
    const requiredFields = ['name', 'category', 'quantity', 'price', 'description', 'location'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ error: `${field} alanı zorunludur` }, { status: 400 });
      }
    }

    const updatedItem = await prisma.envanter.update({
      where: { id },
      data: {
        name: data.name,
        category: data.category,
        quantity: parseInt(data.quantity),
        available: parseInt(data.available || data.quantity),
        condition: data.condition || 'excellent',
        price: parseFloat(data.price),
        description: data.description,
        location: data.location,
        serialNumber: data.serialNumber,
        warranty: data.warranty ? new Date(data.warranty) : null
      }
    });

    return NextResponse.json({ success: true, data: updatedItem, message: 'Envanter item başarıyla güncellendi' });
  } catch (error) {
    console.error('Envanter güncelleme hatası:', error);
    return NextResponse.json({ error: 'Envanter item güncellenemedi' }, { status: 500 });
  }
}

// Envanter item silme (Admin only)
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ error: 'Bu işlem için admin yetkisi gereklidir' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const id = parseInt(searchParams.get('id'));
    if (!id) {
      return NextResponse.json({ error: 'Geçersiz veya eksik ID' }, { status: 400 });
    }
    const deletedItem = await prisma.envanter.delete({ where: { id } });
    return NextResponse.json({ success: true, data: deletedItem, message: 'Envanter item başarıyla silindi' });
  } catch (error) {
    console.error('Envanter silme hatası:', error);
    return NextResponse.json({ error: 'Envanter item silinemedi' }, { status: 500 });
  }
}
