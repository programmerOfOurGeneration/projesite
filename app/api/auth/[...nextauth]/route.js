import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import { PrismaClient } from "@prisma/client"
import bcrypt from 'bcryptjs'

const globalForPrisma = globalThis
const prisma = globalForPrisma.prisma || new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
})
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export const authOptions = {
  secret: process.env.NEXTAUTH_SECRET,  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Email ve şifre gerekli')
          }          const user = await prisma.kullanici.findUnique({
            where: {
              email: credentials.email
            },
            select: {
              id: true,
              email: true,
              isim: true,
              password: true,
              isAdmin: true
            }
          })

          if (!user || !user.password) {
            throw new Error('Kullanıcı bulunamadı')
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            throw new Error('Geçersiz şifre')
          }

          return {
            id: user.id.toString(),
            email: user.email,
            name: user.isim,
            isAdmin: user.isAdmin
          }
        } catch (error) {
          console.error('Auth error:', error)
          throw error
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60 // 30 gün
  },  pages: {
    signIn: '/login',
    error: '/login'
  },
  callbacks: {
    // async signIn({ user, account, profile }) {
    //   if (account.provider === "google") {
    //     try {
    //       // Google ile giriş yapan kullanıcıyı veritabanında kontrol et
    //       const existingUser = await prisma.kullanici.findUnique({
    //         where: { email: user.email }
    //       });

    //       if (!existingUser) {
    //         // Yeni kullanıcı oluştur
    //         const newUser = await prisma.kullanici.create({
    //           data: {
    //             email: user.email,
    //             isim: user.name,
    //             resim: user.image,
    //             googleId: profile.sub, // Google'dan gelen unique ID
    //             isAdmin: false
    //           }
    //         });
    //         user.id = newUser.id.toString();
    //         user.isAdmin = false;
    //       } else {
    //         // Mevcut kullanıcıya Google ID ekle (eğer yoksa)
    //         if (!existingUser.googleId) {
    //           await prisma.kullanici.update({
    //             where: { email: user.email },
    //             data: { 
    //               googleId: profile.sub,
    //               resim: user.image 
    //             }
    //           });
    //         }
    //         user.id = existingUser.id.toString();
    //         user.isAdmin = existingUser.isAdmin;
    //       }
    //       return true;
    //     } catch (error) {
    //       console.error("Google sign in error:", error);
    //       return false;    //     }
    //   }
    //   return true;
    // },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  debug: process.env.NODE_ENV === 'development'
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
