# 🎓 AI Course Planning Assistant

<p align="center">

  <img src="https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/Google-Gemini-4285F4?style=for-the-badge&logo=google" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?style=for-the-badge&logo=supabase" />
  <img src="https://img.shields.io/badge/Vercel-Deployment-000000?style=for-the-badge&logo=vercel" />

</p>

<p align="center">
  <strong>Turn an idea into a complete course — through conversation.</strong>
</p>

<p align="center">
  An AI-powered course planning assistant designed for mentors, educators, trainers, and curriculum designers.
</p>

---

## ✨ What is Course Planning Assistant?

Planning a course shouldn't feel like filling out a complicated form.

**AI Course Planning Assistant** turns course creation into a simple conversation.

Just tell the assistant what you want to teach.

It intelligently collects the essential information, understands your requirements, and transforms them into a structured, practical course plan.

```text
💬 Conversation
      ↓
🧠 AI Understanding
      ↓
📋 Course Requirements
      ↓
✨ Course Generation
      ↓
💾 Supabase
      ↓
📚 Course Dashboard

🚀 Why this project?

Traditional course planning often means:

Forms → Templates → Spreadsheets → Documents → Revisions

This project takes a different approach:

Talk → Plan → Generate → Refine

The goal is to make curriculum design faster, simpler, and more interactive.

🧠 AI-Powered Course Intake
The assistant doesn't throw a huge form at the mentor.

Instead, it asks one meaningful question at a time.

Example
AI:
Let's sketch out your course.
What subject or topic are you planning to teach?

You:
Java

AI:
Who is the target audience for this course?

You:
College Students

AI:
How long will the course run and how frequently
will the sessions happen?

You:
2 days for 1 week

AI:
What should students be able to achieve by the
end of the course?

You:
Learn OOP, collections and exception handling.
The assistant keeps track of the conversation and builds the course requirements progressively.

🎯 Intelligent Requirement Collection
The assistant collects four core requirements:

Requirement	Example
📚 Subject	Java
👥 Target Audience	College Students
⏱️ Duration & Frequency	2 days for 1 week
🎯 Learning Goals	Learn OOP and build a Java project
Smart validation
The assistant doesn't blindly accept every response.

For example:

Learning Goal:

❌ Expert
❌ Developer
❌ Yes
❌ Okay

✅ Learn Java OOP and exception handling
✅ Build a small Java application
✅ Understand collections and file handling
This prevents incomplete course plans from being generated.

⚡ From Conversation to Course
Once all required information is available:

              USER
                │
                ▼
        ┌───────────────┐
        │ AI CONVERSATION│
        └───────┬───────┘
                │
                ▼
       ┌──────────────────┐
       │ Requirement       │
       │ Collection        │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │ Gemini AI         │
       │ Course Generation │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │ Structured Course │
       │ Plan              │
       └────────┬─────────┘
                │
                ▼
       ┌──────────────────┐
       │ Supabase          │
       │ PostgreSQL        │
       └────────┬─────────┘
                │
                ▼
           DASHBOARD
📚 What gets generated?
The AI transforms the requirements into a structured learning experience.

Course Overview
Course title

Subject

Target audience

Duration

Learning goals

Course Structure
Modules

Topics

Learning outcomes

Activities

Assessments

Practical work

Projects

The result isn't just a response from a chatbot.

It's a structured course plan that can be saved, opened, refined, and managed.

💾 Persistent Course Storage
Generated courses are automatically saved to Supabase PostgreSQL.

             Course Plan
                  │
                  ▼
          POST /api/courses
                  │
                  ▼
        ┌─────────────────┐
        │ Next.js API      │
        └────────┬────────┘
                 │
                 ▼
        ┌─────────────────┐
        │    Supabase      │
        │   PostgreSQL     │
        └────────┬────────┘
                 │
                 ▼
             courses
So refreshing the browser doesn't erase your courses.

📊 Course Dashboard
The dashboard acts as the central workspace for managing generated courses.

You can:
➕ Create a new course

📖 Open an existing course

✏️ Refine a course

💾 Save course updates

🗑️ Delete courses

🔄 Refresh course data

✏️ AI Course Refinement
Course planning doesn't stop after the first generation.

You can continue improving the course with natural language.

For example:

"Make this course more practical."

"Add a final project."

"Reduce the theoretical content."

"Add more activities."

"Make Module 2 suitable for beginners."
The AI can use the existing course context to refine the plan.

Existing Course
       │
       ▼
Refinement Request
       │
       ▼
     Gemini
       │
       ▼
Updated Course
       │
       ▼
   Supabase
🏗️ Architecture
┌───────────────────────────────────────────────┐
│                  USER / MENTOR                │
└──────────────────────┬────────────────────────┘
                       │
                       ▼
┌───────────────────────────────────────────────┐
│                 NEXT.JS FRONTEND              │
│                                               │
│  Conversational Intake                       │
│  Course Dashboard                             │
│  Course Viewer                                │
│  Course Refinement                            │
└───────────────┬───────────────────┬───────────┘
                │                   │
                ▼                   ▼
       ┌────────────────┐   ┌─────────────────┐
       │  Gemini API    │   │ Courses API     │
       │                │   │                 │
       │ AI reasoning   │   │ CRUD operations │
       └───────┬────────┘   └────────┬────────┘
               │                     │
               │                     ▼
               │            ┌─────────────────┐
               │            │    SUPABASE     │
               │            │   PostgreSQL    │
               │            └─────────────────┘
               │
               ▼
       ┌────────────────┐
       │ Generated Plan │
       └────────────────┘
🛠️ Tech Stack
Frontend
Next.js 14

React

JavaScript

Responsive UI

AI
Google Gemini API

Conversational AI

Structured course generation

Course refinement

Backend
Next.js API Routes

REST-style API endpoints

Database
Supabase

PostgreSQL

Deployment
Vercel

Version Control
Git

GitHub

📁 Project Structure
AI-Course-Planning-Assistant/
│
├── app/
│   │
│   ├── api/
│   │   │
│   │   ├── courses/
│   │   │   ├── [id]/
│   │   │   │   └── route.js
│   │   │   │
│   │   │   ├── route.js
│   │   │   └── supabase.js
│   │   │
│   │   └── gemini/
│   │       └── route.js
│   │
│   ├── page.jsx
│   ├── layout.js
│   └── globals.css
│
├── lib/
│   └── storage.js
│
├── public/
│
├── .env.local
├── package.json
├── package-lock.json
└── README.md
🔌 API Architecture
🤖 Gemini
POST /api/gemini
Used for:

Conversational intake

Requirement extraction

Course generation

Course refinement

📚 Courses
Get all courses
GET /api/courses
Create course
POST /api/courses
Get course
GET /api/courses/:id
Update course
PUT /api/courses/:id
Delete course
DELETE /api/courses/:id
🗄️ Database Model
The primary database table is:

courses
with fields such as:

┌─────────────────────────────┐
│           courses           │
├─────────────────────────────┤
│ id                          │
│ title                       │
│ subject                     │
│ course_metadata             │
│ target_audience             │
│ duration_and_frequency      │
│ learning_goals              │
│ modules                     │
│ refine_log                  │
│ status                      │
│ created_at                  │
│ updated_at                  │
└─────────────────────────────┘
🔐 Environment Configuration
Create a .env.local file:

GEMINI_API_KEY=your_gemini_api_key

NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url

NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
⚠️ Never commit your .env.local file.

Add this to .gitignore:

.env*
!.env.example
🚀 Getting Started
1️⃣ Clone the repository
git clone https://github.com/Tushit007/AI-Course-Planning-Assistant.git
cd AI-Course-Planning-Assistant
2️⃣ Install dependencies
npm install
3️⃣ Configure environment variables
Create:

.env.local
and add:

GEMINI_API_KEY=your_key
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key
4️⃣ Start the development server
npm run dev
Open:

http://localhost:3000
🌐 Deployment
The project is designed to be deployed on Vercel.

Deployment flow
GitHub
   │
   ▼
Vercel
   │
   ▼
Next.js Application
   │
   ├──────────► Gemini API
   │
   └──────────► Supabase
Add the required environment variables in:

Vercel
 → Project
 → Settings
 → Environment Variables
Then redeploy the application.

🧪 Project Testing Checklist
AI Intake
 Subject collection

 Audience collection

 Duration collection

 Learning-goal collection

 Missing-field detection

 Learning-goal validation

 One-question-at-a-time conversation

Course Generation
 Gemini integration

 Structured course generation

 Module generation

 Learning outcomes

 Course refinement

Database
 Course creation

 Course retrieval

 Course update

 Course deletion

 Persistent storage

 Automatic save after generation

Deployment
 GitHub repository

 Vercel deployment

 Environment configuration

 Supabase integration

🎯 Use Cases
👨‍🏫 Educators
Create structured lesson plans quickly.

🎓 Mentors
Turn a simple teaching idea into a complete curriculum.

🏫 Educational Institutions
Create standardized course structures.

💼 Corporate Trainers
Design skill-based training programs.

🧑‍💻 Curriculum Designers
Use AI to accelerate the planning and refinement process.

🔮 Future Roadmap
The project can evolve into a complete AI-powered curriculum platform.

Phase 1 — Core
 Conversational intake

 AI course generation

 Supabase persistence

 Course dashboard

Phase 2 — Intelligence
 Personalized learning paths

 AI-generated assessments

 AI-generated quizzes

 Learning resource recommendations

 Advanced course refinement

Phase 3 — Collaboration
 User authentication

 Mentor profiles

 Team collaboration

 Course sharing

 Role-based access

Phase 4 — Platform
 Student progress tracking

 Analytics dashboard

 Calendar integration

 PDF export

 LMS integration

 Multi-language support

💡 Product Vision
Make course creation as simple as having a conversation.

The long-term vision is to evolve from an AI course generator into an intelligent curriculum design platform that helps educators move from:

IDEA
  ↓
PLANNING
  ↓
CURRICULUM
  ↓
CONTENT
  ↓
ASSESSMENT
  ↓
LEARNING
with AI supporting every stage.

🌟 Highlights
Capability	Status
🤖 Conversational AI	✅
🧠 Gemini Integration	✅
📚 Course Generation	✅
🎯 Learning Goal Validation	✅
💾 Supabase Persistence	✅
📊 Course Dashboard	✅
✏️ AI Refinement	✅
🔌 REST API	✅
☁️ Vercel Deployment	✅
🔐 Environment Configuration	✅
👨‍💻 Built With
<p align="center">
Next.js · React · Gemini · Supabase · PostgreSQL · Vercel · GitHub

</p>
📌 Project Status
🟢 Active Development

The core course planning workflow is functional, with AI-powered intake, course generation, persistence, dashboard management, and refinement.

⭐ Support
If you find this project interesting, consider giving the repository a ⭐.

It helps support the project and future development.

<p align="center">
🎓 AI Course Planning Assistant
From an idea → to a conversation → to a complete course.

</p> ```
This version is much more product/startup-style: it leads with the problem and experience, then shows the architecture, tech stack, APIs, setup, roadmap, and product vision rather than reading like a plain technical manual.