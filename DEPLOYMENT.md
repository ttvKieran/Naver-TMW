# HƯỚNG DẪN DEPLOY LÊN VERCEL VÀ RENDER

## 📦 PHẦN 1: DEPLOY NEXT.JS LÊN VERCEL

### Bước 1: Chuẩn bị MongoDB Atlas (Database)
1. Truy cập https://www.mongodb.com/cloud/atlas
2. Đăng ký/Đăng nhập tài khoản
3. Tạo cluster miễn phí (M0 Sandbox)
4. Trong "Database Access", tạo user với password
5. Trong "Network Access", thêm IP: `0.0.0.0/0` (cho phép mọi IP)
6. Click "Connect" → "Connect your application"
7. Copy connection string: `mongodb+srv://username:password@cluster.mongodb.net/naver-tmw?retryWrites=true&w=majority`

### Bước 2: Chuẩn bị Git Repository
```bash
cd d:\Workspace\Naver-Learn\final\Naver-TMW
git add .
git commit -m "Prepare for deployment"
git push origin phong
```

### Bước 3: Deploy lên Vercel
1. Truy cập https://vercel.com
2. Đăng nhập bằng GitHub
3. Click "Add New" → "Project"
4. Import repository: `ttvKieran/Naver-TMW`
5. Chọn branch: `phong`
6. Framework Preset: **Next.js** (auto-detect)
7. Root Directory: `./` (để trống)

### Bước 4: Cấu hình Environment Variables
Trong phần "Environment Variables", thêm các biến sau:

**Required (Bắt buộc):**
```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/naver-tmw?retryWrites=true&w=majority
NEXTAUTH_SECRET=your-random-secret-key-min-32-chars
NEXTAUTH_URL=https://your-app-name.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-app-name.vercel.app
```

**NCP Clova Studio API Keys:**
```
NCP_CLOVASTUDIO_API_KEY=your-clovastudio-api-key
NCP_APIGW_API_KEY=your-apigw-api-key
NCP_REQUEST_ID=your-request-id
```

**Python API (sẽ thêm sau khi deploy Render):**
```
PYTHON_API_URL=https://your-render-app.onrender.com
```

### Bước 5: Generate NEXTAUTH_SECRET
Chạy lệnh sau trong terminal để tạo secret key:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Bước 6: Deploy
1. Click "Deploy"
2. Đợi 3-5 phút để build
3. Sau khi deploy xong, copy URL: `https://your-app-name.vercel.app`

---

## 🐍 PHẦN 2: DEPLOY PYTHON API LÊN RENDER

### Bước 1: Chuẩn bị Repository
Đảm bảo folder `clova-rag-roadmap` có các file:
- ✅ `requirements.txt` (đã update)
- ✅ `Procfile` (đã tạo)
- ✅ `runtime.txt` (đã tạo)
- ✅ Folder `app/` với `personalize_api.py`, `search_api.py`
- ✅ Folder `data/` với CSV files

### Bước 2: Push code lên GitHub
```bash
git add clova-rag-roadmap/
git commit -m "Add Render deployment files"
git push origin phong
```

### Bước 3: Deploy lên Render
1. Truy cập https://render.com
2. Đăng nhập bằng GitHub
3. Click "New" → "Web Service"
4. Connect repository: `ttvKieran/Naver-TMW`
5. Cấu hình:
   - **Name**: `naver-tmw-api` (hoặc tên bạn muốn)
   - **Region**: Singapore (gần Việt Nam nhất)
   - **Branch**: `phong`
   - **Root Directory**: `clova-rag-roadmap`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.personalize_api:app --host 0.0.0.0 --port $PORT`

### Bước 4: Chọn Plan
- **Free Plan**: 750 giờ/tháng, ngủ sau 15 phút không hoạt động
- **Paid Plan** ($7/month): Không ngủ, nhanh hơn

### Bước 5: Deploy
1. Click "Create Web Service"
2. Đợi 5-10 phút để build (lần đầu lâu vì cài dependencies)
3. Sau khi deploy xong, copy URL: `https://naver-tmw-api.onrender.com`

### Bước 6: Test API
Mở browser test endpoint:
```
https://naver-tmw-api.onrender.com/docs
```
Bạn sẽ thấy Swagger UI của FastAPI.

---

## 🔗 PHẦN 3: KẾT NỐI 2 SERVICES

### Bước 1: Update Environment Variables trên Vercel
1. Vào Vercel Dashboard → Project → Settings → Environment Variables
2. Thêm/Update:
   ```
   PYTHON_API_URL=https://naver-tmw-api.onrender.com
   ```
3. Click "Save"

### Bước 2: Redeploy Next.js
1. Vào Vercel Dashboard → Deployments
2. Click "..." trên deployment mới nhất → "Redeploy"
3. Hoặc push commit mới lên GitHub

---

## ✅ KIỂM TRA SAU KHI DEPLOY

### Test Next.js App:
1. Mở `https://your-app-name.vercel.app`
2. Nên redirect đến `/login`
3. Đăng ký tài khoản mới
4. Kiểm tra Dashboard, My Roadmap, Profile, Courses

### Test Python API:
1. Mở `https://naver-tmw-api.onrender.com/docs`
2. Test endpoint `/roadmap/personalized` với POST request

### Test Integration:
1. Trong Next.js app, đăng ký user mới
2. Kiểm tra xem roadmap có được generate không
3. Check Network tab (F12) xem có lỗi API call không

---

## 🐛 TROUBLESHOOTING

### Lỗi: "Cannot connect to MongoDB"
- Kiểm tra MONGODB_URI đúng format
- Kiểm tra MongoDB Atlas Network Access có `0.0.0.0/0`
- Kiểm tra user/password database đúng

### Lỗi: "Python API timeout"
- Render Free Plan ngủ sau 15 phút → request đầu tiên sẽ chậm (30s)
- Giải pháp: Upgrade paid plan hoặc dùng cron job ping API 5 phút/lần

### Lỗi: "NEXTAUTH_SECRET not found"
- Generate lại secret key
- Paste vào Vercel Environment Variables
- Redeploy

### Lỗi: Python build failed
- Check `requirements.txt` có đúng format không
- Check Python version trong `runtime.txt`
- Xem build log trong Render để debug

---

## 📊 MONITORING

### Vercel:
- Dashboard → Analytics: Xem traffic, performance
- Dashboard → Logs: Xem server logs
- Function Logs: Xem API route errors

### Render:
- Dashboard → Logs: Xem Python logs realtime
- Dashboard → Metrics: CPU, Memory usage
- Dashboard → Events: Deploy history

---

## 💰 CHI PHÍ

### Vercel:
- **Hobby (Free)**: 
  - 100GB bandwidth/month
  - Serverless Functions: 100 giờ/month
  - Đủ cho development và demo

### Render:
- **Free**: 
  - 750 giờ/month
  - App ngủ sau 15 phút
  - Bandwidth: Unlimited
  - Tốt cho testing

- **Starter ($7/month)**:
  - Không ngủ
  - Faster response
  - Khuyến nghị cho production

### MongoDB Atlas:
- **M0 (Free)**:
  - 512MB storage
  - Shared CPU
  - Đủ cho hàng nghìn users

---

## 🚀 NÂNG CẤP PRODUCTION

Khi cần scale lên production:

1. **Vercel**: Upgrade Pro ($20/month)
   - Unlimited bandwidth
   - Advanced analytics
   - Team collaboration

2. **Render**: Upgrade Starter ($7/month)
   - Always online
   - Faster cold starts

3. **MongoDB**: Upgrade M10 ($57/month)
   - Dedicated CPU
   - 10GB storage
   - Auto-scaling

---

## 📝 CHECKLIST TRƯỚC KHI DEPLOY

- [ ] MongoDB Atlas cluster đã tạo và config Network Access
- [ ] Git repository đã push code mới nhất
- [ ] Environment variables đã chuẩn bị đầy đủ
- [ ] NEXTAUTH_SECRET đã generate
- [ ] Python dependencies trong requirements.txt đã kiểm tra
- [ ] Đã test local trước khi deploy
- [ ] Đã backup database (nếu có data quan trọng)
