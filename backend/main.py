from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routers import resume, roadmap, chat

load_dotenv()

app = FastAPI(title="AI Career Compass")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(resume.router)
app.include_router(roadmap.router)
app.include_router(chat.router)

@app.get("/")
def root():
    return {"message": "AI Career Compass Backend Running"}

@app.get("/health")
def health():
    return {"status": "healthy"}
