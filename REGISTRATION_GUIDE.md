# Hướng dẫn chạy hệ thống đăng ký và tạo lộ trình học tập

## Tổng quan luồng đăng ký

Khi người dùng đăng ký tài khoản, hệ thống sẽ thực hiện các bước sau:

1. **Generation Task AI**: Dựa vào IT skills và Soft skills để dự đoán ngành nghề phù hợp
2. **HCX-007 AI**: Tạo đề xuất chi tiết về ngành nghề và lộ trình phát triển
3. **Chọn thông tin học tập**: Người dùng chọn trường, ngành, kỳ học hiện tại
4. **CLOVA RAG Roadmap**: Tạo lộ trình học tập cá nhân hóa
5. **Lưu vào Database**: Lưu thông tin User, Student, và PersonalizedRoadmap
6. **Chuyển đến Dashboard**: Hiển thị lộ trình học tập cho người dùng

## Cài đặt và chạy

### 1. Cài đặt dependencies cho Next.js

\`\`\`powershell
cd D:\Workspace\Naver-Learn\final\Naver-TMW
npm install
\`\`\`

### 2. Cài đặt dependencies cho Python (CLOVA RAG Roadmap)

\`\`\`powershell
cd clova-rag-roadmap
pip install -r requirements.txt
\`\`\`

### 3. Khởi động CLOVA RAG Roadmap Server

**Cách 1: Sử dụng script Python**
\`\`\`powershell
cd D:\Workspace\Naver-Learn\final\Naver-TMW\clova-rag-roadmap
python run_servers.py
\`\`\`

**Cách 2: Chạy trực tiếp với uvicorn**

Terminal 1 - Search API (port 8000):
\`\`\`powershell
cd D:\Workspace\Naver-Learn\final\Naver-TMW\clova-rag-roadmap
uvicorn app.search_api:app --host 0.0.0.0 --port 8000 --reload
\`\`\`

Terminal 2 - Personalize API (port 8001):
\`\`\`powershell
cd D:\Workspace\Naver-Learn\final\Naver-TMW\clova-rag-roadmap
uvicorn app.personalize_api:app --host 0.0.0.0 --port 8001 --reload
\`\`\`

### 4. Khởi động Next.js Server

Terminal mới:
\`\`\`powershell
cd D:\Workspace\Naver-Learn\final\Naver-TMW
npm run dev
\`\`\`

### 5. Truy cập ứng dụng

- **Trang đăng ký**: http://localhost:3000/register
- **Dashboard**: http://localhost:3000/dashboard
- **CLOVA Search API**: http://localhost:8000/docs
- **CLOVA Personalize API**: http://localhost:8001/docs

## Cấu trúc API

### Next.js APIs

1. **POST /api/generation-task**
   - Input: `{ itSkills: string[], softSkills: string[] }`
   - Output: `{ predictedCareer: string, fullResponse: string }`
   - Mô tả: Gọi CLOVA Generation Task để dự đoán ngành nghề

2. **POST /api/career-recommendation**
   - Input: `{ studentInfo, predictedCareer }`
   - Output: `{ recommendation: string }`
   - Mô tả: Gọi HCX-007 để tạo đề xuất chi tiết về ngành nghề

3. **POST /api/register**
   - Input: Thông tin đăng ký đầy đủ (xem RegisterPage)
   - Output: `{ success: boolean, data: {...}, redirectTo: string }`
   - Mô tả: API đăng ký chính, tích hợp tất cả các bước

### Python APIs (CLOVA RAG Roadmap)

1. **POST http://localhost:8000/search/**
   - Input: `{ user_id, jobname, query?, top_k }`
   - Output: `{ results: [...] }`
   - Mô tả: Tìm kiếm các mục trong roadmap phù hợp

2. **POST http://localhost:8001/roadmap/personalized**
   - Input: `{ user_id, jobname }`
   - Output: Roadmap JSON đầy đủ với personalization
   - Mô tả: Tạo lộ trình học tập cá nhân hóa

## Database Models

### User
- email, password, name, role
- Liên kết với Student qua studentId

### Student
- userId, studentCode, fullName
- Academic: university, major, currentYear, cpa
- Skills: studentSkills[], interests[]
- Personality traits

### PersonalizedRoadmap
- studentId, roadmapId, careerId
- stages[] với areas[] và items[]
- Mỗi item có:
  - check: boolean (đã hoàn thành?)
  - personalization: status, priority, description, reason
  - progress: startedAt, completedAt, progressPercentage

### Career
- careerId, title, category, level
- requiredSkills[], salaryRange
- Linked to roadmaps

## Components

### SearchableSkillInput
- Props: skillType ('it' | 'soft'), selectedSkills, onSkillsChange
- Features:
  - Autocomplete từ CSV files
  - Thêm/xóa skills
  - Cho phép thêm custom skills
  - Responsive UI

### RegisterPage
- Multi-step form (4 bước)
- Validation cho mỗi bước
- Loading states khi gọi APIs
- Error handling

## Dữ liệu

### IT Skills & Soft Skills
- Files: `data/skills/it_skills.csv`, `data/skills/soft_skills.csv`
- Được load và parse trong SearchableSkillInput
- Hỗ trợ autocomplete

### PTIT Courses
- File: `data/universities/ptit-courses.ts`
- 9 kỳ học với tất cả các môn
- Định dạng TypeScript để seed vào database

## Environment Variables

File `.env.local`:
\`\`\`
NCP_API_KEY=your_naver_cloud_api_key
NCP_CLOVASTUDIO_ENDPOINT=https://clovastudio.stream.ntruss.com/v3/chat-completions/HCX-005
MONGODB_URI=your_mongodb_connection_string
\`\`\`

## Troubleshooting

### Lỗi: "ImportError: attempted relative import with no known parent package"
- **Giải pháp**: Đã fix bằng cách thêm `__init__.py` và chạy như module
- Sử dụng: `uvicorn app.personalize_api:app` thay vì `python personalize_api.py`

### Lỗi: CLOVA RAG Roadmap không kết nối được
- **Kiểm tra**: Server Python có đang chạy trên port 8001 không?
- **Kiểm tra**: API URL trong `/api/register/route.ts` có đúng không?

### Lỗi: Skills không load được
- **Kiểm tra**: Files CSV có tồn tại trong `public/data/skills/` không?
- **Note**: Next.js public folder phải có đường dẫn `/data/skills/`

### Lỗi: MongoDB connection
- **Kiểm tra**: MONGODB_URI trong `.env.local` có đúng không?
- **Kiểm tra**: MongoDB cluster có cho phép kết nối từ IP của bạn không?

## Testing

### Test Registration Flow

1. Truy cập http://localhost:3000/register
2. Điền thông tin:
   - Email: test@example.com
   - Password: test123
   - Skills: Python, JavaScript, teamwork
   - Chọn kỳ học: Kỳ 3
3. Submit và chờ xử lý
4. Kiểm tra console logs để xem các bước
5. Sau khi thành công, chuyển đến dashboard

### Test APIs riêng lẻ

\`\`\`powershell
# Test Generation Task
curl -X POST http://localhost:3000/api/generation-task ^
  -H "Content-Type: application/json" ^
  -d "{\"itSkills\": [\"Python\", \"Machine Learning\"], \"softSkills\": [\"problem-solving\"]}"

# Test Career Recommendation  
curl -X POST http://localhost:3000/api/career-recommendation ^
  -H "Content-Type: application/json" ^
  -d "{\"studentInfo\": {...}, \"predictedCareer\": \"Data Scientist\"}"
\`\`\`

## Các tính năng đã triển khai

✅ Đăng ký tài khoản với multi-step form
✅ Searchable skill input với autocomplete
✅ Integration với CLOVA Generation Task
✅ Integration với HCX-007 cho career advice
✅ Integration với CLOVA RAG Roadmap
✅ PersonalizedRoadmap model
✅ Dữ liệu môn học PTIT đầy đủ 9 kỳ
✅ API endpoint /api/register tích hợp toàn bộ luồng
✅ Error handling và loading states
✅ Fix lỗi relative import trong Python

## Các bước tiếp theo (nếu cần)

- [ ] Implement login page
- [ ] Dashboard để hiển thị personalized roadmap
- [ ] Progress tracking cho từng item trong roadmap
- [ ] Seed PTIT courses vào database
- [ ] Hash password trước khi lưu
- [ ] Email verification
- [ ] Sync user data giữa MongoDB và clova-rag-roadmap users.json

## Liên hệ

Nếu có vấn đề, check logs ở:
- Next.js: Terminal chạy `npm run dev`
- Python APIs: Terminal chạy uvicorn servers
- MongoDB: MongoDB Atlas dashboard
