# 📄 Resume Scorer & Enhancer — Frontend

This is the **React + TypeScript frontend** for the **Resume Scorer & Enhancer** UI.  
It allows users to upload a PDF resume, provide a job listing URL (Naukri.com), get an AI-generated score & analysis, then request an enhanced resume PDF which can be previewed, annotated, and downloaded.

---

## ✨ Features
- 📤 Upload resume (PDF) via file input or drag-and-drop  
- 🔗 Enter job listing URL (with Naukri.com validation)  
- 📊 Score display with:
  - Animated circular progress  
  - Eligibility badge  
  - Analysis summary  
- 📝 "Enhance" flow:
  - Requests enhanced PDF from backend  
  - Preview + simple annotation tools (text, rectangle, circle, line)  
  - Undo/redo, zoom, rotate, save/download  
- 🖥️ Demo fallback mode when backend is not reachable  

---

## 🛠️ Tech Stack
- **React + TypeScript** (Vite)
- **Tailwind CSS** (styling)
- **react-pdf + pdfjs-dist** (PDF rendering)
- **lucide-react** (icons)
- **pdf-lib** (optional PDF modifications)

---

## 📦 Prerequisites
- Node.js **v18+**
- npm or yarn
- A running backend API (see [Backend](#-backend))

---

## 🚀 Installation & Run (Frontend)

1. Clone the repository:
   ```bash
   git clone https://github.com/Prathat2006/Resume-analyser-enhancer-front-end.git
   cd resume-analyser-enhancer-front-end
````

2. Install dependencies:

   ```bash
   npm install
   # or
   yarn
   ```

3. Start dev server:

   ```bash
   npm run dev
   ```

   Open the URL printed in the terminal (usually `http://localhost:5173`).


---

## ⚙️ Configuration — Connecting to Backend

By default, the frontend expects the backend at:
`http://127.0.0.1:8000`

Endpoints:

* **POST** `/evaluate` → accepts `resume` (PDF file) & `job_url` (string).
  Responds with:

  ```json
  {
    "score": { "final_score": 85, "eligible": true, "reason": "..." },
    "session_id": "..."
  }
  ```
* **POST** `/enhance` → accepts `session_id`.
  Returns **PDF binary** with optional `X-score` response header containing JSON score update.

### 🔧 Using `.env`

For flexibility, create a `.env` file in the root:

```env
VITE_API_BASE_URL=http://127.0.0.1:8000
```

Then in `src/App.tsx`, use:

```ts
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';
```

---

## 🖥️ Backend (Recommended)

Clone and run backend separately:

```bash
git clone https://github.com/Prathat2006/Resume-analyser-enhancer.git
cd resume-analyser-enhancer/back-end

# Setup virtual environment
python -m venv .venv
# Windows
.venv\Scripts\activate
# macOS/Linux
source .venv/bin/activate

pip install -r requirements.txt
uvicorn server:app --host 127.0.0.1 --port 8000 --reload
```

✅ Ensure **CORS is enabled** for frontend origin.

---

## 🧪 Demo Fallback

* If backend is unreachable, UI loads demo data:

  * Sample score JSON
  * Demo PDF preview

---

## 🛠️ Troubleshooting

* **PDF worker error**: ensure `pdfjs.GlobalWorkerOptions.workerSrc` points to a valid worker (default uses CDN).
* **CORS errors**: enable CORS in backend (`fastapi.middleware.cors`).
* **File upload errors**: backend must accept **multipart form-data** with correct field names.

---

## 🤝 Contributing

* PRs are welcome!
* Improvements:

  * Move all backend URLs to `.env`
  * Improve annotation tools
  * Enhance demo mode

---

## 📬 Contact

After starting backend (`:8000`) and frontend (`:5173`):

* Upload a PDF + valid Naukri job URL
* Test full scoring & enhancing flow

---

🔗 **Related Repositories**

* [Backend Repo](https://github.com/Prathat2006/Resume-analyser-enhancer)

---


