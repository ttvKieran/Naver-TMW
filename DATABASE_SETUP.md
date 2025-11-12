# MongoDB Database Setup Guide

## Cài đặt MongoDB

### Option 1: Local MongoDB (Recommended for Development)

1. **Download MongoDB Community Server**
   - Truy cập: https://www.mongodb.com/try/download/community
   - Chọn phiên bản phù hợp với OS của bạn
   - Install và khởi động MongoDB service

2. **Verify Installation**
   ```bash
   mongosh
   # Hoặc
   mongo
   ```

### Option 2: MongoDB Atlas (Cloud - Free Tier)

1. Tạo tài khoản tại: https://www.mongodb.com/cloud/atlas/register
2. Tạo một Cluster miễn phí
3. Whitelist IP address của bạn
4. Tạo database user
5. Lấy connection string

---

## Configuration

1. **Copy file .env.example thành .env.local**
   ```bash
   cp .env.example .env.local
   ```

2. **Update MONGODB_URI trong .env.local**
   
   **Cho Local MongoDB:**
   ```
   MONGODB_URI=mongodb://localhost:27017/career-advisor
   ```
   
   **Cho MongoDB Atlas:**
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/career-advisor?retryWrites=true&w=majority
   ```

---

## Database Schema

Database bao gồm **8 collections** với thiết kế hierarchical và normalized:

1. **users** - User accounts and authentication
2. **students** - Student profiles referencing skills and courses
3. **skills** - Normalized skill definitions (technical, soft-skill, language, tool)
4. **courses** - Courses referencing skills they teach
5. **careers** - Career information referencing required skills
6. **roadmaps** - Hierarchical learning paths (levels → phases → skills/courses)
7. **chat_sessions** - AI conversation history
8. **recommendations** - Career recommendations with skill gaps and course suggestions

Chi tiết schema xem file: `lib/mongodb/schemas-new.md`

**Key Features:**
- Skills and Courses are separate normalized collections (reusable across careers/students)
- Roadmaps have hierarchical structure: Levels → Phases → Skills/Courses
- Students reference skills with proficiency levels and courses with completion status
- Recommendations reference skill gaps and recommended courses

---

## Seed Sample Data

Để populate database với dữ liệu mẫu:

```bash
# Make sure MONGODB_URI is set in .env.local
# Install tsx nếu chưa có
npm install -D tsx

# Run seed script
npx tsx lib/mongodb/scripts/seed.ts
```

Script sẽ tạo:
- 1 user account (Phan Lan)
- 4 skills (Python, Git, Data Structures, Communication)
- 3 courses (Python for Beginners, Git Essentials, DS Bootcamp)
- 1 career (Backend Developer) referencing skills
- 1 hierarchical roadmap with 2 levels and multiple phases
- 1 student profile referencing skills and courses
- 1 chat session
- 1 recommendation with skill gaps and course recommendations

---

## Usage Examples

### 1. Import models trong API routes

```typescript
import connectDB from '@/lib/mongodb/connection';
import { Student, Career, Recommendation } from '@/lib/mongodb/models';

export async function GET(request: Request) {
  await connectDB();
  
  const students = await Student.find({})
    .populate('userId')
    .limit(10);
  
  return Response.json(students);
}
```

### 2. Create new student

```typescript
import { Student } from '@/lib/mongodb/models';

const newStudent = await Student.create({
  userId: userId,
  studentCode: 'STU002',
  fullName: 'Nguyen Van A',
  gpa: 3.5,
  personality: {
    mbti: 'INTJ',
    traits: {
      analytical: 8,
      creative: 7,
      teamwork: 6,
      leadership: 7,
      technical: 9
    }
  },
  skills: {
    programming: 8,
    problemSolving: 9,
    communication: 6,
    systemDesign: 7,
    dataAnalysis: 8
  },
  interests: ['ai-ml', 'coding']
});
```

### 3. Find matching careers

```typescript
import { Career } from '@/lib/mongodb/models';

const matchingCareers = await Career.find({
  'idealProfile.minGPA': { $lte: student.gpa },
  'idealProfile.personalityTypes': { $in: [student.personality.mbti] },
  isActive: true
}).sort({ popularity: -1 });
```

### 4. Create recommendation

```typescript
import { Recommendation } from '@/lib/mongodb/models';

const recommendation = await Recommendation.create({
  studentId: student._id,
  sessionId: chatSession._id,
  recommendedCareers: [
    {
      careerId: career._id,
      careerTitle: career.title,
      matchScore: 92,
      confidence: 'high',
      strengths: ['Strong programming', 'Good GPA'],
      gaps: ['Need more soft skills'],
      rank: 1
    }
  ],
  studentSnapshot: {
    gpa: student.gpa,
    skills: student.skills,
    personality: student.personality,
    interests: student.interests
  }
});
```

---

## Useful MongoDB Commands

### Connect to database
```bash
mongosh "mongodb://localhost:27017/career-advisor"
```

### View collections
```javascript
show collections
```

### Query examples
```javascript
// Find all students
db.students.find()

// Find student by code
db.students.findOne({ studentCode: "STU001" })

// Count active careers
db.careers.countDocuments({ isActive: true })

// Get latest recommendations
db.recommendations.find().sort({ createdAt: -1 }).limit(5)

// Aggregate career popularity
db.recommendations.aggregate([
  { $unwind: "$recommendedCareers" },
  { $group: { 
      _id: "$recommendedCareers.careerTitle", 
      count: { $sum: 1 } 
    } 
  },
  { $sort: { count: -1 } }
])
```

### Drop database (CAUTION!)
```javascript
db.dropDatabase()
```

---

## Indexes

Các indexes quan trọng đã được định nghĩa trong models:

- `users.email` (unique)
- `students.studentCode` (unique)
- `students.userId` (unique)
- `careers.careerId` (unique)
- `careers.popularity` (descending)
- `chat_sessions.studentId`
- `recommendations.studentId`

Indexes sẽ tự động được tạo khi models được khởi tạo lần đầu.

---

## Troubleshooting

### Connection Failed
- Kiểm tra MongoDB service đang chạy: `mongosh`
- Verify MONGODB_URI trong .env.local
- Check firewall/network settings

### Authentication Failed (Atlas)
- Verify username/password trong connection string
- Check IP whitelist trong Atlas
- Ensure database user có đủ permissions

### Slow Queries
- Check indexes: `db.students.getIndexes()`
- Use `.explain()` để analyze queries
- Consider adding compound indexes

---

## Next Steps

1. ✅ Setup MongoDB connection
2. ✅ Run seed script
3. 📝 Create API routes để CRUD operations
4. 🔐 Implement authentication
5. 📊 Build dashboard với MongoDB data
6. 🚀 Deploy to production

