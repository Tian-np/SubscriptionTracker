# Backend API Contract

Frontend เรียก API ผ่าน `ApiService` ที่ base URL จาก `environment.apiUrl`

ตั้ง `useMockApi: false` ใน `environment.prod.ts` เมื่อเชื่อมต่อ backend จริง

## Endpoints

### Subscriptions

| Method | Path | Description |
|--------|------|-------------|
| GET | `/subscriptions` | รายการทั้งหมด → `{ data: Subscription[], total: number }` |
| GET | `/subscriptions/:id` | รายการเดียว → `{ data: Subscription }` |
| POST | `/subscriptions` | สร้างใหม่ → `{ data: Subscription }` |
| PATCH | `/subscriptions/:id` | อัปเดต → `{ data: Subscription }` |
| DELETE | `/subscriptions/:id` | ลบ |
| GET | `/subscriptions/summary/monthly?baseCurrency=THB` | สรุปรายเดือน → `{ data: MonthlySummary }` |

### Categories

| Method | Path | Description |
|--------|------|-------------|
| GET | `/categories` | หมวดทั้งหมด → `{ data: Category[], total: number }` |

### Currency

| Method | Path | Description |
|--------|------|-------------|
| GET | `/currency/rates` | อัตราแลกเปลี่ยน → `{ data: ExchangeRates }` |

### Push Notifications (สำหรับ iPhone)

| Method | Path | Description |
|--------|------|-------------|
| POST | `/push/subscribe` | ลงทะเบียน Web Push subscription |
| POST | `/push/unsubscribe` | ยกเลิก subscription |

Backend ควรมี **cron job รายวัน** ตรวจ subscription ที่ใกล้ตัดบัตร แล้วส่ง Web Push ผ่าน `web-push` library:

```bash
npx web-push generate-vapid-keys
```

```typescript
import webpush from 'web-push';

webpush.setVapidDetails('mailto:you@example.com', PUBLIC_KEY, PRIVATE_KEY);
webpush.sendNotification(subscription, JSON.stringify({
  title: 'แจ้งเตือน: Netflix',
  body: 'ตัดบัตรอีก 3 วัน — ฿419.00',
  tag: 'billing-1-2026-06-12',
}));
```

## iPhone Requirements

1. iOS **16.4+**
2. เปิดผ่าน **Safari** → Share → **Add to Home Screen**
3. เปิดแอปจากหน้าจอหลัก → อนุญาต Notifications
4. Deploy บน **HTTPS** (Web Push ไม่ทำงานบน HTTP)

## Models

ดู type definitions ใน `src/app/core/models/`
