# Backend - AI Career Compass

FastAPI backend with RAG engine for AI-powered career guidance.

## Quick Start

1. **Create virtual environment**:
   ```bash
   python -m venv venv
   venv\Scripts\activate
   ```

2. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

3. **Configure .env file**:
   - Add your `HUGGINGFACE_API_KEY`
   - Add your `SUPABASE_URL` and `SUPABASE_KEY`

4. **Run the server**:
   ```bash
   uvicorn main:app --reload
   ```

Server runs at: `http://localhost:8000`

## API Documentation

Once running, visit:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Environment Variables

Required in `.env`:
- `HUGGINGFACE_API_KEY`: Your HuggingFace API token
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_KEY`: Your Supabase anon/public key
- `BACKEND_PORT`: Port to run on (default: 8000)
- `FRONTEND_URL`: Frontend URL for CORS (default: http://localhost:5173)
