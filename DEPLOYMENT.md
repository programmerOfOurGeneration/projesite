# Production ortamına geçiş için yapılacaklar

1. Railway CLI'yi yükleyin:
```bash
npm i -g @railway/cli
```

2. Railway'e giriş yapın:
```bash
railway login
```

3. Yeni bir Railway projesi oluşturun:
```bash
railway init
```

4. PostgreSQL veritabanı oluşturun:
```bash
railway add
```
- PostgreSQL seçin

5. Environment değişkenlerini ayarlayın:
Railway Dashboard > Settings > Environment Variables
```
NEXTAUTH_SECRET=7a344217d1f371665b2390c798c8fe455f0cc6ab461432465af28507abb23497
NEXTAUTH_URL=https://your-production-url.vercel.app
DATABASE_URL=<Railway PostgreSQL URL>
```

6. Production şemasını uygulayın:
```bash
copy prisma\schema.production.prisma prisma\schema.prisma /Y
railway run npx prisma db push
copy prisma\schema.prisma prisma\schema.production.prisma /Y
```

7. Vercel'de deploy edin:
- GitHub reponuzu Vercel'e bağlayın
- Environment değişkenlerini Vercel'de ayarlayın
- Deploy butonuna tıklayın

Not: Production'da dosya yüklemeleri için bir CDN (örn: Cloudinary) kullanmanız önerilir.
