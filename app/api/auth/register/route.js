import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}

export async function POST(request) {
  try {
    const { email, password, name } = await request.json()    // Email kontrolü
    const existingUser = await prisma.kullanici.findUnique({
      where: { email },
      select: { id: true, email: true }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Bu e-posta adresi zaten kullanılıyor' },
        { status: 400 }
      )
    }

    // Şifreyi hashle
    const hashedPassword = await bcrypt.hash(password, 10)

    // Yeni kullanıcı oluştur
    const user = await prisma.kullanici.create({
      data: {
        email,
        password: hashedPassword,
        isim: name,
        isAdmin: false // Normal kullanıcı olarak işaretle
      }
    })

    // Hassas bilgileri çıkar
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(userWithoutPassword)
  } catch (error) {
    console.error('Kayıt hatası:', error)
    return NextResponse.json(
      { error: 'Kayıt işlemi başarısız oldu' },
      { status: 500 }
    )
  }
}
