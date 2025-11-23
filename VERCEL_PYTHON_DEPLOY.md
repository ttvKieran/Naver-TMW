# 🚀 DEPLOY PYTHON API LÊN VERCEL (MIỄN PHÍ)

## Tại sao Vercel thay vì Render?

- ✅ **Hoàn toàn miễn phí** (không giới hạn như Render)
- ✅ **Không ngủ** như Render free tier
- ✅ **Deploy nhanh** hơn (1-2 phút)
- ✅ **Same domain** với Next.js app (dễ quản lý)
- ✅ **Serverless** - tự động scale

## Cấu Trúc Project

```
Naver-TMW/
├── clova-rag-roadmap/
│   ├── api/
│   │   └── index.py          ← Entry point cho Vercel
│   ├── app/
│   │   ├── personalize_api.py ← FastAPI app chính
│   │   └── search_api.py      ← Search utilities
│   ├── data/
│   │   ├── jobs/              ← JSON roadmap files
│   │   ├── users/             ← User data
│   │   └── ...                ← CSV embedding files
│   ├── requirements.txt       ← Python dependencies
│   └── vercel.json           ← Vercel configuration
```

## Bước 1: Chuẩn Bị Files

✅ Đã tạo sẵn các files:
- `clova-rag-roadmap/api/index.py` - Entry point
- `clova-rag-roadmap/vercel.json` - Vercel config
- `clova-rag-roadmap/requirements.txt` - Dependencies

## Bước 2: Push Code Lên GitHub

```bash
git add clova-rag-roadmap/
git commit -m "Add Vercel deployment for Python API"
git push origin phong
```

## Bước 3: Deploy Lên Vercel

### Option A: Deploy từ Dashboard (Khuyến nghị)

1. Vào https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Chọn repository: `ttvKieran/Naver-TMW`
4. **QUAN TRỌNG**: Configure deployment:
   - **Root Directory**: `clova-rag-roadmap`
   - **Framework Preset**: Other
   - **Build Command**: (để trống)
   - **Output Directory**: (để trống)
   - **Install Command**: `pip install -r requirements.txt`

5. Click "Deploy"
6. Đợi 2-3 phút
7. Copy URL: `https://your-project-name.vercel.app`

### Option B: Deploy bằng Vercel CLI

```bash
# Cài Vercel CLI (nếu chưa có)
npm i -g vercel

# Login
vercel login

# Deploy từ thư mục clova-rag-roadmap
cd clova-rag-roadmap
vercel

# Deploy production
vercel --prod
```

## Bước 4: Test API

Sau khi deploy xong, test các endpoints:

### 1. Health Check
```bash
curl https://your-project-name.vercel.app/health
```

### 2. API Documentation
Mở browser: `https://your-project-name.vercel.app/docs`

### 3. Personalized Roadmap
```bash
curl -X POST https://your-project-name.vercel.app/roadmap/personalized \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "test-user",
    "jobname": "machine learning"
  }'
```

## Bước 5: Update Next.js App

### Trong Vercel Dashboard của Next.js project:

1. Settings → Environment Variables
2. Tìm `PYTHON_API_URL`
3. Update value:
   ```
   https://your-python-api.vercel.app
   ```
4. Save
5. Redeploy Next.js app (Deployments → Redeploy)

## Cấu Trúc URL

Sau khi deploy:

- **Next.js App**: `https://naver-tmw.vercel.app`
- **Python API**: `https://naver-tmw-api.vercel.app`
- **API Docs**: `https://naver-tmw-api.vercel.app/docs`
- **Roadmap Endpoint**: `https://naver-tmw-api.vercel.app/roadmap/personalized`

## Troubleshooting

### Lỗi: "Module not found"

**Nguyên nhân**: Python dependencies không được cài đặt.

**Giải pháp**:
1. Kiểm tra `requirements.txt` có đúng format
2. Xóa `.vercel` folder và deploy lại
3. Check build logs trong Vercel dashboard

### Lỗi: "Cannot find data files"

**Nguyên nhân**: Folder `data/` không được include.

**Giải pháp**:
1. Commit data files vào Git:
   ```bash
   git add clova-rag-roadmap/data/
   git commit -m "Add data files"
   git push
   ```
2. Redeploy trên Vercel

### Lỗi: "Function size limit exceeded"

**Nguyên nhân**: Vercel Serverless Functions giới hạn 50MB.

**Giải pháp**:
1. Xóa file CSV embeddings lớn (nếu có)
2. Chỉ giữ file JSON cần thiết
3. Hoặc upgrade Vercel Pro (250MB limit)

### Lỗi: "Timeout error"

**Nguyên nhân**: Function timeout sau 10s (free tier).

**Giải pháp**:
1. Optimize code để chạy nhanh hơn
2. Cache dữ liệu
3. Hoặc upgrade Pro (60s timeout)

## So Sánh Vercel vs Render

| Feature | Vercel Free | Render Free |
|---------|-------------|-------------|
| **Giá** | $0 | $0 |
| **Sleep** | Không | Sau 15 phút |
| **Cold Start** | < 1s | 30-60s |
| **Timeout** | 10s | Không giới hạn |
| **Deploy Time** | 1-2 phút | 5-10 phút |
| **Bandwidth** | 100GB/tháng | Unlimited |
| **Functions** | 100 giờ/tháng | 750 giờ/tháng |

**Khuyến nghị**: 
- ✅ Dùng **Vercel** cho API đơn giản, nhanh
- ⚠️ Dùng **Render** nếu cần long-running tasks > 10s

## Monitoring

### Vercel Dashboard:
- **Logs**: Xem request logs realtime
- **Analytics**: Traffic, response time
- **Deployments**: History và rollback

### View Logs:
```bash
vercel logs your-project-name --follow
```

## Auto Deploy

Vercel tự động deploy khi push lên GitHub:
1. Push code → GitHub
2. Vercel detect changes
3. Auto build và deploy
4. Notification qua email/Slack

Disable auto-deploy:
- Settings → Git → Production Branch → Disable

## Environment Variables (Nếu Cần)

Nếu Python API cần environment variables:

1. Vercel Dashboard → Project → Settings → Environment Variables
2. Add variables:
   ```
   NCP_API_KEY=your-key
   DATABASE_URL=your-db-url
   ```
3. Redeploy

## Chi Phí

**Vercel Free Tier**:
- ✅ Serverless Functions: 100 giờ execution/tháng
- ✅ Bandwidth: 100GB/tháng
- ✅ Invocations: 100K requests/tháng
- ✅ Build time: 100 giờ/tháng

**Đủ cho**:
- Small/Medium projects
- Personal portfolio
- Demo apps
- Side projects

**Cần upgrade khi**:
- > 100GB bandwidth/tháng
- Function execution > 10s
- Team collaboration
- Custom domain SSL

## Next Steps

1. ✅ Deploy Python API lên Vercel
2. ✅ Test các endpoints
3. ✅ Update PYTHON_API_URL trong Next.js
4. ✅ Test full integration (registration + roadmap)
5. ✅ Monitor logs và performance

## Useful Links

- Vercel Dashboard: https://vercel.com/dashboard
- Vercel Docs: https://vercel.com/docs
- Vercel Python Runtime: https://vercel.com/docs/functions/runtimes/python
- Status Page: https://vercel-status.com

---

**Lưu ý**: Vercel Serverless Functions có giới hạn 50MB và 10s timeout. Nếu API cần process lâu hơn, cân nhắc:
1. Optimize code
2. Use edge functions
3. Upgrade Vercel Pro
4. Hoặc dùng Render/Railway cho backend
