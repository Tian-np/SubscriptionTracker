# SubTracker

Angular PWA สำหรับติดตาม subscription — เชื่อม Supabase สำหรับเก็บข้อมูลและ sync ข้ามเครื่อง

## Stack

- Angular 21 + Signals
- Tailwind CSS 4 + PrimeNG
- Supabase (Auth + PostgreSQL)
- Deploy: Vercel

## Quick Start

```bash
npm install
cp .env.example .env.local   # ใส่ SUPABASE_ANON_KEY
# แก้ src/environments/environment.ts ใส่ supabaseAnonKey
npm start
```

## Supabase Setup

1. เปิด [Supabase Dashboard](https://supabase.com/dashboard/project/kwizcxeutuaawdfqlkah)
2. **SQL Editor** → รันไฟล์ `supabase/migrations/001_initial.sql`
3. **Authentication** → Providers → เปิด Email provider
4. **Project Settings → API** → คัดลอก:
   - Project URL: `https://kwizcxeutuaawdfqlkah.supabase.co`
   - `anon` public key

## Deploy (Vercel)

1. Push โค้ดไป GitHub
2. [vercel.com](https://vercel.com) → Import repo `Tian-np/SubscriptionTracker`
3. ตั้ง Environment Variables:
   - `SUPABASE_URL` = `https://kwizcxeutuaawdfqlkah.supabase.co`
   - `SUPABASE_ANON_KEY` = (anon key จาก Supabase)
4. Deploy

## iPhone PWA

1. เปิด URL ที่ deploy แล้วใน Safari
2. Share → Add to Home Screen
3. เปิดจากหน้าจอหลัก → อนุญาต Notifications

## Repo

https://github.com/Tian-np/SubscriptionTracker
