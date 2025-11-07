# WhatsApp Web.js Server

Server สำหรับเชื่อมต่อ WhatsApp กับระบบ Lovable โดยใช้ WhatsApp Web.js

## 🚀 Quick Start

### วิธีที่ 1: Deploy บน Render.com (แนะนำ - ง่ายที่สุด)
อ่านคู่มือที่ [RENDER_DEPLOYMENT.md](./RENDER_DEPLOYMENT.md)

### วิธีที่ 2: รันบน Local หรือ VPS
```bash
# 1. Clone repository
git clone <your-repo-url>
cd whatsapp-server

# 2. Install dependencies
npm install

# 3. สร้างไฟล์ .env
cp .env.example .env
# แก้ไข .env ใส่ข้อมูลจริง

# 4. รัน server
npm start
```

## 📋 Environment Variables

```env
SUPABASE_URL=https://kgiyrkvjviwnosfuovyp.supabase.co
SUPABASE_ANON_KEY=your_anon_key
SESSION_ID=your_session_id
WEBHOOK_URL=your_webhook_url
```

## 🎯 Features

- ✅ QR Code generation
- ✅ Auto-reconnect
- ✅ Message handling
- ✅ Supabase integration
- ✅ Webhook notifications
- ✅ Session management

## 📚 Documentation

- [Render.com Deployment Guide](./RENDER_DEPLOYMENT.md) - คู่มือ Deploy แบบละเอียด
- [WhatsApp Web.js Setup](../WHATSAPP_WEBJS_SETUP.md) - คู่มือแบบเดิม (EC2)

## ⚠️ คำเตือน

การใช้ WhatsApp Web.js เป็นวิธีที่ไม่เป็นทางการและมีความเสี่ยงที่บัญชีจะถูกแบน  
สำหรับธุรกิจจริงแนะนำให้ใช้ WhatsApp Cloud API

## 📞 Support

ถ้ามีปัญหาหรือคำถาม:
1. ดู [Troubleshooting](./RENDER_DEPLOYMENT.md#-troubleshooting)
2. ตรวจสอบ Logs ใน Render Dashboard
3. ติดต่อทีมสนับสนุน
