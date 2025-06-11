import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const etkinlikler = await prisma.etkinlik.findMany({
      include: {
        resimler: true,
        videolar: true,
      },
      orderBy: {
        tarih: 'desc',
      },
    });
    
    return NextResponse.json(etkinlikler);
  } catch (error) {
    console.error('Etkinlikler alınamadı:', error);
    return NextResponse.json({ error: 'Etkinlikler alınamadı' }, { status: 500 });
  }
}

export async function POST(request) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  }

  const user = await prisma.kullanici.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
  }

  try {
    const data = await request.json();
    
    const etkinlik = await prisma.etkinlik.create({
      data: {
        baslik: data.baslik,
        aciklama: data.aciklama,
        icerik: data.icerik,
        tarih: new Date(data.tarih),
        konum: data.konum,
        resimUrl: data.resimUrl,
        resimler: {
          create: data.resimler,
        },
        videolar: {
          create: data.videolar,
        },
      },
      include: {
        resimler: true,
        videolar: true,
      },
    });
    
    return NextResponse.json(etkinlik);
  } catch (error) {
    console.error('Etkinlik oluşturulamadı:', error);
    return NextResponse.json({ error: 'Etkinlik oluşturulamadı' }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json({ error: 'Yetkilendirme gerekli' }, { status: 401 });
  }

  const user = await prisma.kullanici.findUnique({
    where: {
      email: session.user.email,
    },
  });

  if (!user?.isAdmin) {
    return NextResponse.json({ error: 'Admin yetkisi gerekli' }, { status: 403 });
  }

  try {
    const data = await request.json();
    const id = Number(params.id);

    // Önce mevcut resimleri ve videoları sil
    await prisma.etkinlikResim.deleteMany({
      where: { etkinlikId: id },
    });
    
    await prisma.etkinlikVideo.deleteMany({
      where: { etkinlikId: id },
    });

    // Etkinliği güncelle
    const etkinlik = await prisma.etkinlik.update({
      where: { id },
      data: {
        baslik: data.baslik,
        aciklama: data.aciklama,
        icerik: data.icerik,
        tarih: new Date(data.tarih),
        konum: data.konum,
        resimUrl: data.resimUrl,
        resimler: {
          create: data.resimler,
        },
        videolar: {
          create: data.videolar,
        },
      },
      include: {
        resimler: true,
        videolar: true,
      },
    });
    
    return NextResponse.json(etkinlik);
  } catch (error) {
    console.error('Etkinlik güncellenemedi:', error);
    return NextResponse.json({ error: 'Etkinlik güncellenemedi' }, { status: 500 });
  }
}

// DELETE işlemi [id] klasöründeki route.js dosyasına taşındı
