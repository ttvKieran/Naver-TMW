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
```

## 2. Chuẩn bị môi trường

### 2.1. Tạo virtualenv và cài dependency

```bash
cd clova-rag-roadmap

# (tuỳ chọn) tạo virtualenv
python -m venv .venv
[activate](http://_vscodecontentref_/0)

# cài package
pip install -r requirements.txt
```
### 2.2. Cấu hình NCP_API_KEY
Tạo file .env.local trong thư mục clova-rag-roadmap/:

```bash
NCP_API_KEY=YOUR_CLOVA_STUDIO_API_KEY
```
## 3. Chuẩn bị dữ liệu
### 3.1. Roadmap nghề (data/jobs/*.json)

Mỗi file JSON mô tả một lộ trình nghề cụ thể, ví dụ:

big_data_engineer.json
machine_learning.json
full_stack_developer.json
...
### 3.2. Flatten roadmap → CSV
Nếu chỉnh sửa roadmap JSON, chạy lại script flatten:
```bash
cd clova-rag-roadmap
python scripts/flatten_roadmap.py
```
Script sẽ sinh lại các file trong data/flatten_roadmaps/.

### 3.3. Sinh embedding cho roadmap
```bash
cd clova-rag-roadmap
python scripts/embed_roadmap.py
```
Script gọi CLOVA Embedding API và lưu vào data/roadmap_embeddings/*_embeddings.csv.

### 3.4. Personalize API (gắn check + personalization)

Chạy FastAPI cho personalize_api.py:
```bash
cd clova-rag-roadmap
uvicorn app.personalize_api:app --reload --host 0.0.0.0 --port 8080
```
Mở docs: http://127.0.0.1:8080/docs

Endpoint chính: `POST /roadmap/personalized`

Body mẫu:
```json
{
  "user_id": "user_001",
  "jobname": "big data engineer"
}
```
## 4. Luồng xử lý

### 4.1. Load dữ liệu
  - Đọc canonical roadmap từ `data/jobs/big_data_engineer.json`.
  - Đọc profile/PROFILE từ `data/users/users.json` (đã normalize).

### 4.2. Tạo payload cho HCX-007
  - Payload gồm: `{ "profile": PROFILE, "canonical_roadmap": ROADMAP, "instruction": "Gắn các trường check + personalization cho từng item; KHÔNG thay đổi cấu trúc roadmap; trả về roadmap đầy đủ." }`
  - Quy định output: mỗi `item` phải có thêm:
    - `check: boolean`
    - `personalization: { status, priority, personalized_description, reason }`

### 4.3. Gọi HCX-007
  - Gửi payload đến HCX-007 chat/completions.
  - Nhận response: roadmap đầy đủ với các trường bổ sung (model trả về whole roadmap JSON).

### 4.4. Merge kết quả vào canonical
  - Nguyên tắc:
    - Không xóa/di chuyển bất kỳ `stage/area/item` nào.
    - So khớp item dựa trên `id` (nếu có) hoặc đường dẫn vị trí (stage/area/title). Nếu không chính xác, dùng cosine-similarity giữa title/description để map.
    - Với mỗi item canonical: nếu model trả về personalization, gán các trường mới; nếu không, thêm mặc định:
    ```json
    {
      "check": false,
      "personalization": {
        "status": "not_personalized",
        "priority": null,
        "personalized_description": "",
        "reason": ""
      }
    }
    ```
    - Giữ nguyên thứ tự và các trường hiện có trong canonical.

### 4.5. Trả/luu kết quả
  - API trả về roadmap merged (JSON) hoặc lưu vào `data/...`.
  - Ghi log các item không khớp để review/tune prompt.

- Ví dụ payload (tóm tắt):
  ```json
  {
    "profile": { /* PROFILE */ },
    "canonical_roadmap": { /* ROADMAP */ },
    "instruction": "Gắn field check + personalization lên từng item; giữ nguyên schema; trả về toàn bộ roadmap JSON."
  }
  ```

Merging pseudocode (tóm tắt):
- iterate canonical.stages ->
  - iterate area.items ->
   - find corresponding item in model_response by id/path/title
   - if found: item.update(model_fields)
   - else: item.add_default_personalization()
- return canonical_merged

Ghi chú: đảm bảo prompt cho HCX-007 rõ ràng về schema và yêu cầu trả về JSON thuần để tránh mất cấu trúc.

## 5. Định dạng users.json

Ví dụ một user sau khi được normalize_user:
```json
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
```
search_api và personalize_api đều dựa vào schema đã chuẩn hoá này.
test.json là ví dụ roadmap machine learning cá nhân hóa.