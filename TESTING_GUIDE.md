# Test Registration Flow

## Các bước test:

1. **Start servers:**
   ```bash
   # Terminal 1: Next.js
   npm run dev
   
   # Terminal 2: CLOVA RAG Roadmap
   cd clova-rag-roadmap
   uvicorn app.personalize_api:app --reload --host 0.0.0.0 --port 8001
   ```

2. **Đăng ký user mới:**
   - Truy cập: http://localhost:3000/register
   - Điền thông tin đầy đủ
   - Xem AI prediction ở Step 5
   - Hoàn thành đăng ký

3. **Check logs:**
   - Server logs để xem:
     - Step 1: Generation Task AI
     - Step 2: HCX-007 recommendation
     - Step 6: User sync
     - Step 7: CLOVA RAG API call
     - Step 8: PersonalizedRoadmap save

4. **Kiểm tra Dashboard:**
   - Truy cập: http://localhost:3000/dashboard?id=STU...
   - Check console logs:
     - `Dashboard - Student loaded: { hasAiRecommendation: true/false }`
     - `Fetching personalized roadmap for student DB ID: ...`
     - `Personalized roadmap response status: 200/404`
   
5. **Debug nếu không có data:**
   
   **Nếu không có aiCareerRecommendation:**
   - Check server logs xem HCX-007 có được gọi không
   - Check response có lỗi không
   - Đăng ký user mới để test
   
   **Nếu không có PersonalizedRoadmap:**
   - Check uvicorn server đang chạy: `netstat -ano | findstr ":8001"`
   - Check users.json có user mới không: `clova-rag-roadmap/data/users/users.json`
   - Check server logs xem CLOVA RAG API có error không
   - Test trực tiếp API:
     ```bash
     curl -X POST http://localhost:8001/roadmap/personalized \
       -H "Content-Type: application/json" \
       -d '{"user_id": "YOUR_STUDENT_ID", "jobname": "machine learning"}'
     ```

6. **Check MongoDB:**
   ```javascript
   // Use MongoDB Compass or mongo shell
   db.students.findOne({ studentCode: "STU..." })
   // Check: aiCareerRecommendation field
   
   db.personalizedroadmaps.findOne({ studentId: ObjectId("...") })
   // Check: stages array, careerID, careerName
   ```

## Expected Results:

### Student document should have:
- `aiCareerRecommendation`: string (HCX-007 output)
- `itSkill`: array of IT skills
- `softSkill`: array of soft skills
- `career.targetCareerID`: predicted career
- `academic.gpa`, `academic.currentSemester`

### PersonalizedRoadmap document should have:
- `studentId`: ObjectId reference
- `careerID`: string (e.g., "machine_learning")
- `careerName`: string (e.g., "Machine Learning Engineer")
- `stages`: array with AI personalization
  - Each item has `check` and `personalization` fields
  - `personalization.status`: already_mastered | high_priority | medium_priority | etc.
  - `personalization.personalizedDescription`: AI explanation
  - `personalization.reason`: AI reasoning

### Dashboard should display:
- AI Career Recommendation section (purple box)
- Personalized Roadmap with AI status icons:
  - 🔥 High Priority items
  - ⭐ Medium Priority items
  - ✓ Already Mastered items
- IT Skills and Soft Skills badges

## Troubleshooting:

### 404 on personalized-roadmap API:
- Student ID mismatch (check console logs)
- No roadmap created (check Step 8 in registration)
- Query issue (studentId as string vs ObjectId)

### Empty aiCareerRecommendation:
- HCX-007 API error (check NCP_API_KEY)
- Response parsing issue
- User registered before field was added (need to re-register)

### CLOVA RAG API fails:
- Server not running on port 8001
- User not synced to users.json
- Job name mismatch (check available jobs in data/jobs/)
- API timeout or error
