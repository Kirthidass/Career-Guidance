# 🎯 AI Career Compass

<div align="center">

![AI Career Compass](https://img.shields.io/badge/AI-Career%20Guidance-blue?style=for-the-badge&logo=robot)
![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?style=for-the-badge&logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=for-the-badge&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-Database-3ECF8E?style=for-the-badge&logo=supabase)

**An intelligent career guidance platform powered by AI that analyzes resumes, generates personalized learning roadmaps, and provides context-aware career counseling through an interactive chat interface.**

[Features](#-features) • [Tech Stack](#-tech-stack) • [Architecture](#-architecture) • [Installation](#-installation) • [Usage](#-usage) • [API Documentation](#-api-documentation)

</div>

---

## ✨ Features

### 🔍 Resume Analysis Engine
- **ATS Score Calculation**: Analyzes resumes against industry standards and target role requirements
- **Multi-Sector Support**: Healthcare (Doctors, Nurses, Physiotherapists), Technology, Business, Education
- **Skill Extraction**: Automatically identifies skills you have and skills you need
- **Resume History**: Tracks all uploaded resumes with analysis history

### 🗺️ AI-Powered Roadmap Generation
- **Personalized Learning Paths**: Auto-generates 4-week structured learning roadmaps based on skill gaps
- **Progress Tracking**: Mark weeks as complete and track overall progress
- **Chat-Based Modifications**: Modify roadmaps through natural language commands
- **Resource Recommendations**: Curated learning resources for each skill

### 💬 Context-Aware AI Chat
- **Resume-Aware Responses**: AI reads and understands your uploaded resume
- **Conversation Memory**: Maintains chat history for contextual conversations
- **Career Counseling**: Interview prep, salary negotiation, job search strategies
- **Roadmap Control**: Create, modify, and extend roadmaps through chat commands

### 🔐 Authentication & Security
- **Supabase Authentication**: Secure email/password authentication
- **Row Level Security**: Users can only access their own data
- **Session Management**: Persistent login sessions

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI Framework with Hooks |
| **TypeScript** | Type-safe development |
| **Vite** | Build tool & dev server |
| **Tailwind CSS** | Utility-first styling |
| **shadcn/ui** | Accessible component library |
| **React Router** | Client-side routing |
| **Axios** | HTTP client |

### Backend
| Technology | Purpose |
|------------|---------|
| **FastAPI** | Async Python web framework |
| **Python 3.11+** | Backend runtime |
| **PyPDF2** | PDF parsing for resumes |
| **Supabase Python** | Database client |
| **Pydantic** | Data validation |
| **Uvicorn** | ASGI server |

### Database & Auth
| Technology | Purpose |
|------------|---------|
| **Supabase** | PostgreSQL database & Auth |
| **Row Level Security** | Data protection policies |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Frontend (React)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Dashboard │  │ Resume   │  │ Roadmap  │  │   Chat   │        │
│  │          │  │ Analysis │  │          │  │          │        │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘        │
│       │             │             │             │               │
│       └─────────────┴─────────────┴─────────────┘               │
│                           │                                      │
│                    ┌──────┴──────┐                              │
│                    │   Axios     │                              │
│                    │   HTTP      │                              │
│                    └──────┬──────┘                              │
└──────────────────────────│──────────────────────────────────────┘
                           │ REST API
┌──────────────────────────┴──────────────────────────────────────┐
│                      Backend (FastAPI)                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌────────────────────────────────────────────────────────┐     │
│  │                    API Routers                          │     │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐             │     │
│  │  │ /resume  │  │ /roadmap │  │  /chat   │             │     │
│  │  └────┬─────┘  └────┬─────┘  └────┬─────┘             │     │
│  └───────┴──────────────┴───────────────┴────────────────┘     │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │              Shared AI Engine (CareerAI)                 │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │ PDF Parser   │  │ Skill        │  │ Roadmap      │  │    │
│  │  │              │  │ Extraction   │  │ Generator    │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │    │
│  │  │ ATS Scorer   │  │ Chat Context │  │ User Memory  │  │    │
│  │  │              │  │ Manager      │  │              │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  │    │
│  └─────────────────────────────────────────────────────────┘    │
│                           │                                      │
│  ┌────────────────────────┴────────────────────────────────┐    │
│  │                   Database Layer                         │    │
│  └────────────────────────┬────────────────────────────────┘    │
└───────────────────────────│─────────────────────────────────────┘
                            │
┌───────────────────────────┴─────────────────────────────────────┐
│                        Supabase                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │   resumes    │  │   roadmaps   │  │chat_messages │          │
│  │              │  │              │  │              │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│                                                                  │
│  ┌──────────────────────────────────────────────────────┐       │
│  │              Row Level Security (RLS)                 │       │
│  └──────────────────────────────────────────────────────┘       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- Supabase account (free tier works)

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/ai-career-compass.git
cd ai-career-compass
```

### 2. Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate (Windows)
.\venv\Scripts\activate

# Activate (macOS/Linux)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your Supabase credentials
```

### 3. Frontend Setup
```bash
cd frontend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your API URL and Supabase credentials
```

### 4. Database Setup
1. Go to your Supabase project
2. Open SQL Editor
3. Run the contents of `backend/supabase_setup.sql`

### 5. Environment Variables

**Backend `.env`:**
```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
HUGGINGFACE_API_KEY=optional-for-advanced-ai
```

**Frontend `.env`:**
```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

---

## 🚀 Usage

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd backend
python -m uvicorn main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Access the application at `http://localhost:5173`

### Key User Flows

#### 1. Resume Analysis
1. Navigate to **Resume Analysis**
2. Upload PDF resume
3. Enter target role (e.g., "Software Engineer")
4. View ATS score and skill analysis
5. Roadmap is auto-generated

#### 2. AI Chat Commands
| Command | Action |
|---------|--------|
| "What is my name?" | Shows name from resume |
| "Show my roadmap" | Displays current learning plan |
| "Add Python to my roadmap" | Adds new week for Python |
| "Focus my roadmap on React" | Restructures roadmap |
| "Create a roadmap for Data Scientist" | Generates new roadmap |

#### 3. Roadmap Progress
1. Navigate to **Roadmap**
2. View weekly learning plan
3. Click "Mark Complete" for finished weeks
4. Track overall progress percentage

---

## 📚 API Documentation

### Resume Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/resume/analyze` | Upload and analyze resume |
| GET | `/resume/history/{user_id}` | Get analysis history |
| GET | `/resume/detail/{resume_id}` | Get specific analysis |

### Roadmap Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/roadmap/generate` | Generate new roadmap |
| GET | `/roadmap/latest/{user_id}` | Get latest roadmap |
| PUT | `/roadmap/progress` | Update completion progress |

### Chat Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/message` | Send message to AI |
| GET | `/chat/history/{user_id}` | Get chat history |
| GET | `/chat/roadmap/{user_id}` | Get roadmap from session |
| POST | `/chat/load-context/{user_id}` | Load user context |

---

## 🎨 Screenshots

<details>
<summary>Click to view application screenshots</summary>

### Dashboard
The main dashboard showing navigation and overview.

### Resume Analysis
Upload resume and view ATS score with skill breakdown.

### Learning Roadmap
Week-by-week learning plan with progress tracking.

### AI Chat
Context-aware career counseling chat interface.

</details>

---

## 🔮 Future Enhancements

- [ ] Integration with job boards (LinkedIn, Indeed)
- [ ] Video interview practice with AI feedback
- [ ] Resume builder with ATS optimization
- [ ] Networking recommendations
- [ ] Salary comparison tools
- [ ] Mobile application (React Native)

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)

---

<div align="center">

**Built with ❤️ for career advancement**

⭐ Star this repo if you found it helpful!

</div>
