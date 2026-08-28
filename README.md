<p align="center">
  <h1 align="center">🚀 AI Interview Prep Platform</h1>
  <p align="center">
    <strong>Land your dream job with AI-powered resume analysis, mock interviews, and cover letter generation.</strong>
  </p>
  <p align="center">
    <a href="#features">Features</a> •
    <a href="#architecture">Architecture</a> •
    <a href="#tech-stack">Tech Stack</a> •
    <a href="#deployment">Deployment</a>
  </p>
</p>

---

## ✨ Features

### 📄 ATS Resume Analyzer

Upload your resume (PDF or DOCX) and receive an instant **ATS compatibility score** out of 100. The AI breaks down your resume's **strengths**, **weaknesses**, **skill gaps**, and provides **actionable rewrite suggestions** — transforming weak bullet points into high-impact, metric-driven statements.

### 🤖 Dynamic Mock Interviews

Simulate real interviews with an AI interviewer that adapts in real-time. Configure the **company**, **role**, **difficulty level**, and **interview type** (behavioral, technical, or system design). At the end, receive a detailed **scorecard** with ratings for communication, technical ability, and structured feedback.

### ✍️ Cover Letter Generator

Select any uploaded resume, paste a job description, and the AI generates a **tailored, professional cover letter** that maps your real experiences to the job requirements — no hallucinated skills, no generic templates.

### 📊 Progress History

Track all past resume analyses, completed mock interviews with scores, and saved cover letters in one centralized dashboard. Delete old entries you no longer need.

---

## 🏗️ Architecture

The platform follows a **containerized microservice architecture** with three isolated services orchestrated via Docker Compose:

```
┌─────────────────────────────────────────────────────────────────┐
│                        AWS EC2 Instance                         │
│                                                                 │
│  ┌──────────────┐    ┌──────────────────┐    ┌───────────────┐  │
│  │   Frontend   │    │     Backend      │    │  PostgreSQL   │  │
│  │              │    │                  │    │               │  │
│  │  React/Vite  │───▶│  Express/Node.js │───▶│  pgvector    │  │
│  │  Nginx       │    │  Prisma ORM      │    │  (pg16)       │  │
│  │              │    │  Gemini AI       │    │               │  │
│  │  Port: 80    │    │  Port: 5000      │    │  Port: 5432   │  │
│  └──────────────┘    └──────────────────┘    └───────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
         ▲                      ▲
         │                      │
    Docker Image           Docker Image
    (GHCR)                 (GHCR)
         ▲                      ▲
         │                      │
┌─────────────────────────────────────────────────────────────────┐
│               GitHub Actions CI/CD Pipeline                     │
│                                                                 │
│   Push to main ──▶ Build Images ──▶ Push to GHCR ──▶ Deploy    │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

1. **Resume Upload** → The frontend sends the file to the backend API via `multipart/form-data`.
2. **Text Extraction** → The backend parses PDFs with `pdf-parse` and DOCX files with `mammoth`, extracting raw text.
3. **Text Chunking** → The extracted text is split into overlapping chunks at natural paragraph boundaries for efficient processing and storage.
4. **AI Analysis (RAG)** → Resume chunks are stored in PostgreSQL with **pgvector** for vector similarity search. The chunks are sent to the **Google Gemini API** for contextual ATS analysis, interview preparation, and cover letter generation.
5. **Structured Response** → The AI returns structured JSON that is parsed, validated, and persisted to the database.

---

## 🛠️ Tech Stack

### Frontend

| Technology                 | Purpose                                        |
| -------------------------- | ---------------------------------------------- |
| **React 19**               | UI component library                           |
| **TypeScript**             | Type-safe development                          |
| **Vite 8**                 | Lightning-fast build tool & dev server         |
| **Tailwind CSS 4**         | Utility-first responsive styling               |
| **React Router 7**         | Client-side routing & navigation               |
| **React Query (TanStack)** | Server state management & caching              |
| **Zod**                    | Runtime schema validation                      |
| **Nginx**                  | Production static file serving & reverse proxy |

### Backend

| Technology                              | Purpose                                                    |
| --------------------------------------- | ---------------------------------------------------------- |
| **Node.js 22**                          | JavaScript runtime                                         |
| **Express 5**                           | HTTP server framework                                      |
| **TypeScript**                          | Type-safe development                                      |
| **Prisma ORM 7**                        | Database schema management, migrations & type-safe queries |
| **Google Gemini AI** (gemini-3.6-flash) | LLM for resume analysis, interviews & cover letters        |
| **Multer**                              | Multipart file upload handling                             |
| **pdf-parse**                           | PDF text extraction                                        |
| **Mammoth**                             | DOCX text extraction                                       |
| **JWT (jsonwebtoken)**                  | Stateless authentication tokens                            |
| **Argon2**                              | Secure password hashing                                    |
| **Helmet**                              | HTTP security headers                                      |
| **Morgan**                              | HTTP request logging                                       |

### Database

| Technology        | Purpose                                    |
| ----------------- | ------------------------------------------ |
| **PostgreSQL 16** | Primary relational database                |
| **pgvector**      | Vector similarity search extension for RAG |

### DevOps & Infrastructure

| Technology                           | Purpose                              |
| ------------------------------------ | ------------------------------------ |
| **Docker**                           | Application containerization         |
| **Docker Compose**                   | Multi-container orchestration        |
| **GitHub Actions**                   | CI/CD pipeline (build, push, deploy) |
| **GitHub Container Registry (GHCR)** | Docker image hosting                 |
| **AWS EC2**                          | Cloud compute instance (Ubuntu)      |

---

## 📁 Project Structure

```
AI-Interview_Prep/
├── .github/
│   └── workflows/
│       └── deploy.yml              # CI/CD pipeline definition
├── backend/
│   ├── prisma/
│   │   ├── migrations/             # Database migration history
│   │   └── schema.prisma           # Database schema (source of truth)
│   ├── src/
│   │   ├── lib/
│   │   │   ├── chunking.ts         # Text chunking with overlap for RAG
│   │   │   ├── llm.ts              # Google Gemini AI integration
│   │   │   ├── parsing.ts          # PDF & DOCX text extraction
│   │   │   └── prisma.ts           # Prisma client singleton
│   │   ├── middleware/
│   │   │   └── auth.ts             # JWT authentication middleware
│   │   ├── routes/
│   │   │   ├── auth.ts             # Login, register, token refresh
│   │   │   ├── coverLetter.ts      # Cover letter generation endpoint
│   │   │   ├── interview.ts        # Mock interview session management
│   │   │   ├── resume.ts           # Resume upload & ATS analysis
│   │   │   └── user.ts             # User history & profile
│   │   └── server.ts               # Express app entry point
│   ├── Dockerfile                   # Multi-stage production build
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Auth.tsx             # Login & Registration
│   │   │   ├── Dashboard.tsx        # Resume upload & navigation hub
│   │   │   ├── Analysis.tsx         # ATS score & detailed feedback
│   │   │   ├── InterviewSetup.tsx   # Interview configuration
│   │   │   ├── InterviewRoom.tsx    # Real-time AI interview chat
│   │   │   ├── InterviewScorecard.tsx # Post-interview evaluation
│   │   │   ├── CoverLetterGenerator.tsx # AI cover letter builder
│   │   │   └── History.tsx          # Past analyses & interviews
│   │   └── lib/
│   │       └── api.ts               # Centralized API client
│   ├── nginx.conf                   # Production Nginx configuration
│   ├── Dockerfile                   # Multi-stage production build
│   └── package.json
├── docker-compose.yaml              # Service orchestration
└── init.sql                         # Database initialization (pgvector)
```

---

## ☁️ Deployment

### CI/CD Pipeline

The project uses **GitHub Actions** for fully automated deployment. Every push to the `main` branch triggers the following pipeline:

```
Push to main
    │
    ▼
┌─────────────────────┐
│  Checkout code      │
│  Set up Docker      │
│  Buildx             │
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐     ┌─────────────────────┐
│  Build Backend      │     │  Build Frontend     │
│  Docker Image       │     │  Docker Image       │
│  (Multi-stage)      │     │  (Multi-stage)      │
└────────┬────────────┘     └────────┬────────────┘
         │                           │
         ▼                           ▼
┌─────────────────────────────────────────────┐
│     Push images to GitHub Container         │
│     Registry (GHCR)                         │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  SSH into EC2 ──▶ docker compose pull       │
│               ──▶ docker compose up -d      │
└─────────────────────────────────────────────┘
```

### Required GitHub Secrets

| Secret        | Description                           |
| ------------- | ------------------------------------- |
| `EC2_HOST`    | Public IP address of the EC2 instance |
| `EC2_USER`    | SSH username (e.g., `ubuntu`)         |
| `EC2_SSH_KEY` | Private SSH key for EC2 access        |

### Running Database Migrations in Production

After deploying a schema change, run the following on the EC2 instance:

```bash
docker compose exec backend npx prisma migrate deploy
```

---

## 📊 Database Schema

The application uses **10 tables** managed by Prisma ORM:

| Model                | Description                                                |
| -------------------- | ---------------------------------------------------------- |
| `User`               | Registered users with email/password or OAuth              |
| `RefreshToken`       | Secure JWT refresh token rotation                          |
| `Resume`             | Uploaded resume files with extracted raw text              |
| `ResumeChunk`        | Chunked resume text segments for RAG processing            |
| `ResumeAnalysis`     | ATS scores, strengths, weaknesses & suggestions            |
| `InterviewSession`   | Mock interview metadata (company, role, difficulty)        |
| `InterviewMessage`   | Individual chat messages in an interview                   |
| `InterviewScorecard` | Post-interview evaluation scores & feedback                |
| `CoverLetter`        | Generated cover letters tied to a resume & job description |

---

## 🔒 Security

- **Password Hashing** — User passwords are hashed with **Argon2**, the winner of the Password Hashing Competition.
- **JWT Authentication** — Stateless access tokens with secure refresh token rotation.
- **Helmet** — Sets secure HTTP headers to protect against common web vulnerabilities.
- **Rate Limiting** — API rate limiting via `express-rate-limit` to prevent abuse.
- **Input Validation** — All user inputs are validated on both client (Zod) and server side.
- **CORS** — Configured to only accept requests from trusted origins.

---

## 📝 API Endpoints

| Method   | Endpoint                     | Description                          |
| -------- | ---------------------------- | ------------------------------------ |
| `POST`   | `/api/auth/register`         | Register a new user                  |
| `POST`   | `/api/auth/login`            | Login and receive JWT tokens         |
| `POST`   | `/api/auth/refresh`          | Refresh access token                 |
| `POST`   | `/api/resume/upload`         | Upload and analyze a resume          |
| `GET`    | `/api/resume/:id`            | Get resume analysis results          |
| `DELETE` | `/api/resume/:id`            | Delete a resume and its analysis     |
| `POST`   | `/api/interview/setup`       | Start a new mock interview session   |
| `GET`    | `/api/interview/:id`         | Get interview session with messages  |
| `POST`   | `/api/interview/:id/message` | Send a message during interview      |
| `POST`   | `/api/interview/:id/end`     | End interview and generate scorecard |
| `DELETE` | `/api/interview/:id`         | Delete an interview session          |
| `POST`   | `/api/cover-letter/generate` | Generate a cover letter              |
| `DELETE` | `/api/cover-letter/:id`      | Delete a cover letter                |
| `GET`    | `/api/user/history`          | Get all user history data            |

---

<p align="center">
  Built with ❤️ using React, Node.js, and Google Gemini AI
</p>
