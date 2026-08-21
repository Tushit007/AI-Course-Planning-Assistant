# 🎓 Course Planning Studio

> **Turn an idea into a complete course — one conversation at a time.**

**Course Planning Studio** is an AI-powered course design assistant built for mentors, educators, and instructors. Instead of filling out long forms, educators have a natural conversation with the assistant, which collects the essential course information and transforms it into a structured, ready-to-use course plan.
**Live** 
<br>

<p align="center">
  <strong>💡 Idea</strong>
  &nbsp;→&nbsp;
  <strong>💬 Conversation</strong>
  &nbsp;→&nbsp;
  <strong>🧠 AI Planning</strong>
  &nbsp;→&nbsp;
  <strong>📚 Complete Course</strong>
</p>

---

## ✨ Why Course Planning Studio?

Creating a good course takes more than choosing a topic.

An educator needs to think about:

- 🎯 Learning objectives
- 👥 Target learners
- ⏱️ Course duration
- 📅 Session frequency
- 📖 Topics and modules
- 🧩 Lesson structure
- 📝 Assessments
- 🛠️ Learning resources

Course Planning Studio simplifies the initial planning process through a **guided AI conversation**.

Instead of asking educators to complete a complicated form, it asks **one focused question at a time**.

---

## 🚀 Features

### 💬 Conversational Course Intake

The assistant guides the mentor through a short conversation and collects:

| Field | Purpose |
|---|---|
| 📌 Subject | What the course is about |
| 👥 Target Audience | Who will learn it |
| ⏱️ Duration & Frequency | How long and how often |
| 🎯 Learning Goals | What learners should achieve |

The assistant prioritizes missing information and avoids overwhelming the user with multiple questions at once.

---

### 🧠 AI-Powered Course Planning

Once the required information is collected, the mentor can generate a structured course plan.

The AI is designed to transform a simple idea such as:

> **"Data Structures for MCA students"**

into a structured learning experience.

---

### 🔄 Iterative Refinement

Course planning doesn't always happen perfectly on the first attempt.

The assistant supports refinement so mentors can improve their plan through conversation.

For example:

```text
"Make the course more beginner-friendly."

"Add more practical exercises."

"Reduce the number of topics per week."

"Add an assessment after every module."
```

---

### 💾 Course Plan Management

Course plans can be saved and accessed from the application.

The current project uses browser-based storage for saved plans, making it lightweight and simple for demos and development.

---

### 🎨 Designed for Educators

The interface focuses on:

- Clean typography
- Minimal distractions
- Conversational interaction
- Structured course information
- Easy-to-understand progress
- Mentor-friendly workflow

---

# 🏗️ Architecture

```text
                       ┌──────────────────────┐
                       │        Mentor        │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Course Planning UI   │
                       │       Next.js        │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │   Next.js API Route  │
                       │     /api/gemini      │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │      Groq API        │
                       │   Llama 3.1 8B       │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │ Structured AI JSON   │
                       │      Response        │
                       └──────────┬───────────┘
                                  │
                                  ▼
                       ┌──────────────────────┐
                       │   Course Plan UI     │
                       └──────────────────────┘
```

---

# 🧩 Course Planning Workflow

```text
START
  │
  ▼
Enter Course Topic
  │
  ▼
Identify Target Audience
  │
  ▼
Define Duration & Frequency
  │
  ▼
Define Learning Goals
  │
  ▼
Review Collected Information
  │
  ▼
Generate Course Plan
  │
  ▼
Refine / Improve
  │
  ▼
Save Course
  │
  ▼
DONE 🎉
```

---

# 🛠️ Tech Stack

### Frontend

- ⚛️ React
- ▲ Next.js
- 🎨 CSS
- JavaScript

### AI

- 🤖 Groq API
- 🦙 Llama 3.1 8B Instant
- Structured JSON responses
- Conversational AI workflow

### Storage

- 💾 Browser Local Storage

### Deployment

- ▲ Vercel

---

# 📁 Project Structure

```text
course-planning-studio/
│
├── app/
│   ├── api/
│   │   └── claude/
│   │       └── route.js
│   │
│   ├── globals.css
│   ├── layout.js
│   └── page.jsx
│
├── lib/
│   └── storage.js
│
├── public/
│
├── .env.local.example
├── .gitignore
├── package.json
├── package-lock.json
└── README.md
```

---

# ⚙️ Getting Started

## 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/course-planning-studio.git
```

Move into the project:

```bash
cd course-planning-studio
```

---

## 2. Install dependencies

```bash
npm install
```

---

## 3. Configure environment variables

Create:

```text
.env.local
```

Add your Groq API key:

```env
GROQ_API_KEY=your_groq_api_key_here
```

> ⚠️ **Never commit `.env.local` to GitHub.**

The repository should only contain:

```text
.env.local.example
```

---

## 4. Start the development server

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

---

# 🧪 Example

### Mentor

```text
Data Structures
```

### AI

```text
Great choice! Who are the learners —
their age group, skill level, and prior knowledge?
```

### Mentor

```text
MCA students, beginner level, with basic programming knowledge.
```

### AI

```text
Great. How long will the course run,
and how often will you meet?
```

The assistant continues until the required course information is collected.

---

# 🌱 Example Course

A conversation can eventually produce a course concept such as:

```text
📚 DATA STRUCTURES

Target Audience:
MCA students with basic programming knowledge

Duration:
12 weeks

Frequency:
2 sessions per week

Learning Goals:
• Understand fundamental data structures
• Implement arrays and linked lists
• Work with stacks and queues
• Understand trees and graphs
• Analyze algorithm complexity
• Apply data structures to practical problems
```

---

# 🔐 Environment Variables

| Variable | Required | Description |
|---|---:|---|
| `GROQ_API_KEY` | ✅ | API key used for AI generation |

For local development:

```env
GROQ_API_KEY=your_key_here
```

For Vercel:

```text
Vercel Dashboard
      ↓
Project
      ↓
Settings
      ↓
Environment Variables
      ↓
GROQ_API_KEY
```

---

# 🚀 Deployment

Course Planning Studio can be deployed using **Vercel**.

### Build

```bash
npm run build
```

### Start

```bash
npm start
```

Or connect the GitHub repository directly to Vercel.

### Vercel Environment Variable

Add:

```text
GROQ_API_KEY
```

to your Vercel project's environment variables.

---

# 🛡️ Security

Never expose your AI API key in frontend code.

❌ Don't do this:

```javascript
const key = "gsk_xxxxxxxxx";
```

❌ Don't use:

```text
NEXT_PUBLIC_GROQ_API_KEY
```

✅ Use:

```text
GROQ_API_KEY
```

and access it only from the server-side API route.

---

# 🔮 Future Roadmap

The current application provides the foundation for a larger AI-powered education platform.

### Phase 1 — Foundation

- [x] Conversational course intake
- [x] AI-powered responses
- [x] Structured course information
- [x] Course plan storage
- [x] Vercel-ready architecture

### Phase 2 — Intelligent Course Builder

- [ ] Automatic module generation
- [ ] Lesson-plan generation
- [ ] Assignment generation
- [ ] Quiz generation
- [ ] Learning-resource recommendations
- [ ] Course difficulty adjustment

### Phase 3 — Mentor Workspace

- [ ] User authentication
- [ ] Cloud course storage
- [ ] Course dashboard
- [ ] Course duplication
- [ ] Course version history
- [ ] Export to PDF/DOCX

### Phase 4 — AI Education Platform

- [ ] Student-facing learning paths
- [ ] Personalized learning
- [ ] Progress tracking
- [ ] AI tutor
- [ ] Automated assessments
- [ ] Analytics dashboard

---

# 💡 Vision

> **Course planning should feel like a conversation, not paperwork.**

Course Planning Studio aims to make curriculum design faster, simpler, and more accessible by combining **educator expertise with AI-assisted planning**.

The long-term vision is to create an intelligent workspace where mentors can go from:

```text
"I want to teach something..."
```

to:

```text
"Here is my complete, structured course."
```

with minimal friction.

---

# 🤝 Contributing

Contributions, ideas, and improvements are welcome.

### Fork

```bash
git fork
```

### Create a branch

```bash
git checkout -b feature/your-feature
```

### Commit

```bash
git commit -m "Add your feature"
```

### Push

```bash
git push origin feature/your-feature
```

Then open a Pull Request.

---

# 📜 License

Add your preferred license here before making the repository public.

---

<div align="center">

### 🎓 Course Planning Studio

**Plan better. Teach smarter. Build meaningful learning experiences.**

Made with ❤️ + 🤖 AI

</div>