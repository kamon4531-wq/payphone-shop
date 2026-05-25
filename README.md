# PAY BY PA.PHONE — เว็บขายสินค้าโทรศัพท์ (ภาษาไทย)

Next.js 14 (App Router) + Supabase + Google Drive + Vercel — **ฟรีทั้งหมด**

## โครงสร้าง

```
payphone-shop/
├── app/
│   ├── page.tsx              # หน้าลูกค้า (banner, filter, products, order)
│   ├── admin/page.tsx        # หน้า admin (login + dashboard)
│   ├── api/
│   │   ├── products/route.ts # CRUD สินค้า
│   │   ├── orders/route.ts   # รับออเดอร์
│   │   ├── orders/list/...   # ดูออเดอร์ (admin)
│   │   ├── upload/route.ts   # อัพรูปไป Google Drive
│   │   └── admin/...         # login/logout/me
│   └── globals.css
├── components/               # Banner, ProductCard, CategoryFilter, OrderModal
├── lib/                      # supabase, googleDrive, auth, types
├── supabase-schema.sql       # SQL schema
├── .env.example              # ตัวแปร env
└── package.json
```

## วิธีติดตั้ง (ฟรี 100%)

### 1) Supabase (ฐานข้อมูล)

1. ไปที่ https://supabase.com → สมัคร → **New Project** (ฟรี)
2. รอ project setup เสร็จ → ไป **SQL Editor** → คัดลอกเนื้อหา `supabase-schema.sql` แล้ว Run
3. ไป **Settings → API** จด 3 ค่า:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` → `SUPABASE_SERVICE_ROLE_KEY` (เก็บลับ!)

### 2) Google Drive API (เก็บรูป)

1. ไป https://console.cloud.google.com → New Project (ฟรี)
2. **APIs & Services → Library** → เปิดใช้ **Google Drive API**
3. **Credentials → Create Credentials → Service Account**
   - ตั้งชื่อ เช่น `payphone-uploader`
   - กด Done
4. กดที่ Service Account → **Keys → Add Key → Create new key → JSON** → ดาวน์โหลดไฟล์
5. เปิดไฟล์ JSON จะเห็น `client_email` และ `private_key` → เอามาใส่ `.env`
6. ไป Google Drive ของคุณ สร้างโฟลเดอร์ใหม่ (เช่น `payphone-images`)
   - คลิกขวา → **Share** → ใส่ `client_email` ของ service account → ให้สิทธิ์ **Editor**
   - คัดลอก folder ID จาก URL (`drive.google.com/drive/folders/<FOLDER_ID>`) → `GOOGLE_DRIVE_FOLDER_ID`

### 3) ตั้งค่า env

คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจริง:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GOOGLE_CLIENT_EMAIL=...
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
GOOGLE_DRIVE_FOLDER_ID=...
ADMIN_USERNAME=admin
ADMIN_PASSWORD=รหัสที่ตั้งเอง
JWT_SECRET=สุ่มยาวๆ
```

### 4) รันบนเครื่อง

```bash
npm install
npm run dev
```

เปิด http://localhost:3000 (ลูกค้า) และ http://localhost:3000/admin (เจ้าของ)

### 5) Deploy ไป Vercel (ฟรี)

1. ดัน code นี้ขึ้น GitHub
2. ไป https://vercel.com → **Import Project** → เลือก repo
3. ใส่ **Environment Variables** ทั้งหมดจาก `.env.local`
   - **สำคัญ**: `GOOGLE_PRIVATE_KEY` ให้วางทั้ง string (มี `\n` ก็ใส่ตรงๆ)
4. กด **Deploy** → ได้ URL `.vercel.app`

## การใช้งาน

- **หน้าลูกค้า** `/` — ดูสินค้า, กรองหมวด, สั่งซื้อ (กรอกชื่อ+เบอร์)
- **หน้าแอดมิน** `/admin` — login ด้วย `ADMIN_USERNAME`/`ADMIN_PASSWORD`
  - แท็บ "สินค้า" — เพิ่ม/แก้/ลบ (รูปจะอัพไป Google Drive อัตโนมัติ)
  - แท็บ "ออเดอร์" — ดูรายการสั่งซื้อทั้งหมด

## ค่าใช้จ่าย

| บริการ | Free tier |
|---|---|
| Vercel | Hobby plan (ไม่จำกัด deploy, 100GB bandwidth/เดือน) |
| Supabase | 500MB DB, 1GB storage, 50k MAU |
| Google Drive API | 15GB ฟรี (จากบัญชี Google ปกติ) |

เพียงพอสำหรับร้านเล็ก-กลางทั่วไป
