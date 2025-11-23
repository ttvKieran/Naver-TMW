# 🚀 QUICK START DEPLOYMENT GUIDE

## TL;DR - Các Bước Deploy Nhanh

### 1️⃣ Setup MongoDB (5 phút)
```
1. Vào mongodb.com/cloud/atlas
2. Tạo cluster miễn phí
3. Tạo user + password
4. Network Access: thêm 0.0.0.0/0
5. Copy connection string
```

### 2️⃣ Deploy Python API lên Render (10 phút)
```
1. Vào render.com
2. New → Web Service
3. Connect GitHub repo
4. Root: clova-rag-roadmap
5. Start: uvicorn app.personalize_api:app --host 0.0.0.0 --port $PORT
6. Deploy → đợi build
7. Copy URL: https://your-app.onrender.com
```

### 3️⃣ Deploy Next.js lên Vercel (5 phút)
```
1. Vào vercel.com
2. Import repo từ GitHub
3. Add Environment Variables:
   - MONGODB_URI=your-connection-string
   - NEXTAUTH_SECRET=random-32-char-string
   - NEXTAUTH_URL=https://your-app.vercel.app
   - NEXT_PUBLIC_BASE_URL=https://your-app.vercel.app
   - PYTHON_API_URL=https://your-app.onrender.com
   - NCP_CLOVASTUDIO_API_KEY=your-key
   - NCP_APIGW_API_KEY=your-key
   - NCP_REQUEST_ID=your-id
4. Deploy → đợi build
```

### 4️⃣ Test
```
1. Mở https://your-app.vercel.app
2. Đăng ký tài khoản mới
3. Kiểm tra Dashboard
4. Kiểm tra My Roadmap
```

## 📝 Chi Tiết

Xem file `DEPLOYMENT.md` để có hướng dẫn chi tiết và troubleshooting.

## 🔧 Local Development

```bash
# Terminal 1: Next.js
npm run dev

# Terminal 2: Python API
cd clova-rag-roadmap
uvicorn app.personalize_api:app --reload --port 8001
```

## ✅ Checklist

- [ ] MongoDB Atlas cluster created
- [ ] MongoDB connection string copied
- [ ] NEXTAUTH_SECRET generated (32+ chars)
- [ ] NCP API keys ready
- [ ] Code pushed to GitHub
- [ ] Python API deployed to Render
- [ ] Next.js deployed to Vercel
- [ ] Environment variables configured
- [ ] Test registration works
- [ ] Test roadmap generation works

## 🆘 Need Help?

- Vercel docs: https://vercel.com/docs
- Render docs: https://render.com/docs
- MongoDB Atlas: https://www.mongodb.com/docs/atlas/

## 💰 Cost (All Free Tier)

- MongoDB Atlas M0: FREE (512MB)
- Render Free: FREE (750hrs/month)
- Vercel Hobby: FREE (100GB bandwidth)

**Total: $0/month** 🎉
