# CLOVA RAG Roadmap Personalization

Hệ thống này triển khai một pipeline RAG + personalization để gợi ý **lộ trình học cá nhân hóa** cho sinh viên, sử dụng:

- Roadmap nghề (JSON) theo cấu trúc cố định
- Embedding + cosine similarity để retrieve các mục phù hợp
- CLOVA Studio:
  - Embedding API (`/v1/api-tools/embedding/v2`)
  - (Optional) Reranker API (`/v1/api-tools/reranker`)
  - HyperCLOVA X Chat Completions (HCX-007) để gắn `check` + `personalization` lên roadmap

Mục tiêu cuối cùng:

> Giữ nguyên **schema roadmap gốc**, chỉ thêm:
> - `check: boolean`
> - `personalization: { status, priority, personalized_description, reason }`
> cho từng `item` trong roadmap.

---

## 1. Cấu trúc thư mục

Ví dụ cấu trúc chính:

```text
clova-rag-roadmap/
│
├─ app/
│   ├─ search_api.py          # RAG retrieval API (embedding + cosine)
│   └─ personalize_api.py     # Gọi HCX-007 để cá nhân hóa roadmap
│
├─ data/
│   ├─ jobs/                  # Roadmap gốc (JSON)
│   │   └─ machine_learning.json
│   ├─ flatten_roadmaps/      # CSV phẳng sinh từ roadmap
│   ├─ roadmap_embeddings/    # CSV embedding sinh từ flatten_roadmaps
│   └─ users/
│       └─ users.json         # Profile sinh viên
│
├─ scripts/
│   ├─ flatten_roadmap.py     # Flatten JSON roadmap → CSV
│   └─ embed_roadmap.py       # Sinh embedding từ CSV
│
├─ .env.local                 # Chứa NCP_API_KEY
└─ README.md

## 2. Chuẩn bị môi trường

### 2.1. Tạo virtualenv và cài dependency

```bash
cd clova-rag-roadmap

# (tuỳ chọn) tạo virtualenv
python -m venv .venv
[activate](http://_vscodecontentref_/0)

# cài package
pip install -r requirements.txt

### 2.2. Cấu hình NCP_API_KEY
Tạo file .env.local trong thư mục clova-rag-roadmap/:

```bash
NCP_API_KEY=YOUR_CLOVA_STUDIO_API_KEY

## 3. Chuẩn bị dữ liệu
3.1. Roadmap nghề (data/jobs/*.json)
Mỗi file JSON mô tả một lộ trình nghề cụ thể, ví dụ:

big_data_engineer.json
machine_learning.json
full_stack_developer.json
...
3.2. Flatten roadmap → CSV
Nếu chỉnh sửa roadmap JSON, chạy lại script flatten:

cd clova-rag-roadmap
python scripts/flatten_roadmap.py

Script sẽ sinh lại các file trong data/flatten_roadmaps/.

3.3. Sinh embedding cho roadmap

cd clova-rag-roadmap
python scripts/embed_roadmap.py

Script gọi CLOVA Embedding API và lưu vào data/roadmap_embeddings/*_embeddings.csv.

4.2. Personalize API (gắn check + personalization)
Chạy FastAPI cho personalize_api.py:

cd clova-rag-roadmap
uvicorn app.personalize_api:app --reload --host 0.0.0.0 --port 8080

Mở docs:

http://127.0.0.1:8080/docs
Endpoint chính:

POST /roadmap/personalized
Body mẫu:

{
  "user_id": "user_001",
  "jobname": "big data engineer"
}

Luồng xử lý:

Load roadmap gốc từ data/jobs/big_data_engineer.json.
Build PROFILE từ data/users/users.json.
Gửi PROFILE + CANONICAL ROADMAP JSON vào HCX-007.
Model trả về bản roadmap đầy đủ, đã gắn:
check: true/false
personalization: { status, priority, personalized_description, reason }
API merge kết quả vào canonical, đảm bảo không mất stage/area/item nào.

5. Định dạng users.json
Ví dụ một user sau khi được normalize_user:

{
  "user_id": "user_001",
  "full_name": "Nguyen Van A",
  "current_semester": 4,
  "gpa": 3.2,
  "course_scores": [
    { "code": "CS101", "name": "Introduction to Programming", "grade": 8.5 },
    { "code": "CS203", "name": "Database Systems", "grade": 8.0 }
  ],
  "target_career_id": "big data engineer",
  "actual_career": null,
  "time_per_week_hours": 10,
  "it_skills": ["Python", "Linux basics"],
  "soft_skills": ["Teamwork"],
  "skills_technical": {
    "python": 7,
    "sql": 6
  },
  "skills_general": {
    "english": 6
  },
  "interests": ["data", "backend"],
  "projects": ["Small ETL pipeline for course project"],
  "meta": {}
}

search_api và personalize_api đều dựa vào schema đã chuẩn hoá này.

test.json là ví dụ roadmap machine learning cá nhân hóa