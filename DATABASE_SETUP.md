# MongoDB Database MongoDB Atlas 


## Configuration

1. **Copy file .env.example thành .env.local**

2. **Update MONGODB_URI trong .env.local**

   **Cho MongoDB Atlas:**
   ```
   MONGODB_URI=...
   ```

---

## Database Schema

Chi tiết schema trong issue github

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



