# Blog Backend (TypeScript)

پروژه پایه Node.js برای بک‌اند وبلاگ با استفاده از Express.js و TypeScript

## شروع سریع

1. نصب وابستگی‌ها:
   ```bash
   npm install
   ```
2. اجرای پروژه در حالت توسعه:
   ```bash
   npm run dev
   ```
3. بیلد و اجرای پروژه:
   ```bash
   npm run build
   npm start
   ```

## ساختار پروژه
- `src/app.ts`: نقطه شروع برنامه
- `src/routes/`: روت‌های برنامه
- `src/controllers/`: کنترلرها
- `src/models/`: مدل‌های دیتابیس (در آینده)

## تنظیمات محیطی
یک فایل `.env` بسازید و متغیرهای مورد نیاز را قرار دهید. به طور پیش‌فرض پورت 3000 است. 