# SkillPath AI - Personalized Learning Path Generator

SkillPath AI is an AI-powered learning platform that creates personalized learning paths based on users' existing skills, interests, education level, and career goals.

## Tech Stack
- **Frontend**: React, Vite, Tailwind CSS, Redux Toolkit, Framer Motion, Chart.js.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), Socket.io, Cloudinary, OpenAI.

## Installation

### Prerequisites
- Node.js (v18+)
- MongoDB Atlas account or local installation

### Setup Backend
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your keys:
   ```bash
   cp .env.example .env
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### Setup Frontend
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start development server:
   ```bash
   npm run dev
   ```

## Changelog

### AI Career Assessment
Adds the "I don't know what I should learn" discovery flow:

- **Entry point** (`/career-discovery`) — the two-option fork: take the assessment, or go straight to the existing "I already know my career" roadmap form
- **Assessment** (`/assessment`) — 35 adaptive-style multiple-choice questions covering interests, aptitude, personality, logical reasoning, problem-solving, programming interest, mathematics, communication, creativity, analytical thinking, working style, favorite subjects, and career preferences. One question per screen with a progress bar; `backend/src/data/assessmentQuestions.js` holds the bank plus a trait-weight table for 10 careers (AI Engineer, Full Stack Developer, Data Scientist, Cloud Engineer, DevOps Engineer, Cybersecurity Engineer, UI/UX Designer, Mobile Developer, Backend Developer, Frontend Developer)
- **Report** (`/assessment/:id/report`) — personality summary, strengths/weaknesses, learning style, skill/interest profile, and top 4 career matches with confidence percentages. Each match has a "Build My Roadmap" button that hands off to the existing `/paths` generator, prefilled with the recommended title and skills
- **AI analysis**: `openaiService.analyzeCareerAssessment()` sends the full Q&A transcript to the LLM for a JSON report (same pattern as `analyzeResume`/`generateQuiz`). When no OpenAI key is configured, `localAnalyzeAssessment()` computes a deterministic trait-based match instead — confidence scores are relative to the spread across all 10 careers, not an absolute measure, so they'll vary meaningfully between attempts even offline
- Completing an assessment awards 15 points, fires a real-time notification, and runs the same badge-check used elsewhere

New backend: `models/CareerAssessment.js`, `data/assessmentQuestions.js`, `controllers/assessmentController.js`, `routes/assessmentRoutes.js` (mounted at `/api/assessment`). New frontend: `pages/CareerDiscovery.jsx`, `pages/Assessment.jsx`, `pages/AssessmentReport.jsx`. `PathsList.jsx` now reads `location.state` to prefill the roadmap form when arriving from a report recommendation.

**Not built yet** (from the same follow-up spec): the multi-source resource recommendation engine (YouTube/docs/courses/practice-platforms/GitHub per topic), AI project recommendations after milestones, adaptive roadmap adjustment based on quiz performance, and the multi-provider AI abstraction (OpenAI/Gemini/Claude via env var) — `openaiService` is still OpenAI-only.

### Auth Fix: Concurrent Refresh Token Race Condition
`api.js`'s 401 handler called `/api/auth/refresh` independently for every failed request. Since the backend **rotates** the refresh token on every use (issues a new one, invalidates the old), this caused a real bug: when several requests expire at once (e.g. a page mounting and firing `/paths`, `/paths/goals`, `/auth/profile` together), each one raced to refresh with the same stale token — only the first succeeded, and every other one got rejected with "session out of sync," wiped `localStorage`, and force-logged-out the user. Fixed by sharing a single in-flight refresh promise (`performTokenRefresh()`) across all concurrent 401s, so only one actual refresh call happens and every pending request reuses its result. Also removed a dead, unused `generateApiKeyOrMock` function that sat above the file's imports.

### Path Generation: Silent Error Messages + Unsanitized AI Output
- **Global error handler used the wrong JSON key.** `middleware/error.js` returned `{ success, error: "..." }` for thrown exceptions, but every controller's own responses (and every frontend slice's `.catch`) read `{ success, message: "..." }`. Any real server-side exception during path generation silently degraded to a generic fallback string like "Failed to generate path" instead of showing the actual reason. Renamed the key to `message` for consistency across the whole app.
- **AI-generated roadmaps weren't sanitized before saving.** `LearningPath`'s node schema restricts `type` to `['course','quiz','project','article','video']`, `status` to `['locked','unlocked','completed']`, and `difficulty` to `['Beginner','Intermediate','Advanced']`. The AI prompt only *shows* example values rather than strictly enforcing them, so a response with e.g. `"type": "tutorial"` would throw a Mongoose `ValidationError` — invisible before the fix above. `pathController.js` now normalizes every node's `type`/`status` and the path's `difficulty` to a valid enum value before calling `.create()` (unrecognized type → `article`, first node → `unlocked` else `locked`, unrecognized difficulty → `Beginner`), adds fallbacks for missing node `id`/`title`, and returns a clear 502 if the AI response has no usable `nodes` array at all.
- **Actual root cause of the `/api/paths/generate` 400, once the error message above was visible: `` `quiz` is not a valid enum value for path `type` ``.** `PathNode.type` allows `['course','quiz','project','article','video']`, but `Resource.type` is a *different* enum: `['video','book','article','documentation','github_project','practice_problem','coding_challenge']`. `getOrCreateResource()` was passing the node's type straight through as the Resource's type, only special-casing `'course'` → `'video'`. `'article'`/`'video'` happened to exist in both enums, so those node types worked by coincidence — but any `'quiz'` or `'project'` node threw a Mongoose validation error the moment one was generated, which is nearly always, since every roadmap includes quizzes. Added a proper mapping table (`quiz` → `practice_problem`, `project` → `github_project`, `course` → `video`, `article`/`video` unchanged) instead of a single special case.


- **`chatSlice.js` was calling the wrong URLs.** Backend chat routes are mounted at `/api/chat` with sub-paths `/chats`, `/chats/:id/messages` (so the real path is `/api/chat/chats`), but the frontend was calling `/api/chats` (missing the `/chat` segment) — a 404 on every chat load/send. Fixed all four thunks (`loadChats`, `loadMessages`, `postMessage`, `initiateChat`) to hit `/chat/chats...`.
- **`LiveSupportChat.jsx` was fetching `/api/admin/users` to list mentors to chat with**, wrapped in a `.catch()` that silently substituted two hardcoded fake users ("Dr. Sarah Connor", "John Doe") whenever that call failed — which it always will now that `/api/admin/*` is locked to `authorize('admin')`. Added a real `GET /api/chat/contacts` endpoint (`protect` only, no admin restriction): students get the list of mentors/admins, mentors/admins get everyone else. `LiveSupportChat.jsx` now calls that instead, so support chat shows real accounts.


- `store/index.js` imported from the nonexistent package `@reduxjs/store` (should be `@reduxjs/toolkit`) — crashed Vite on startup
- `notificationSlice.js` had a dead duplicate API call left over from an earlier draft
- `Dashboard.jsx` used `<Layout>` without importing it — crashed on load
- `LearningPathDetail.jsx` used the `RotateCcw` icon without importing it from `lucide-react`


Split the single admin dashboard into a full multi-screen panel:

- **Overview** (`/admin`) — unchanged stats/feedback dashboard
- **Manage Students** (`/admin/students`) and **Manage Mentors** (`/admin/mentors`) — searchable, paginated user tables (10/page) with inline role change, delete, and a detail drawer showing paths started/completed, streak, and points (backed by `GET /api/admin/users/:id`)
- **Manage Courses** (`/admin/courses`) — full CRUD over the `Course` collection (title, instructor, platform, level, category, rating, thumbnail, etc.), searchable and paginated
- **Manage Resources** (`/admin/resources`) — full CRUD over the `Resource` collection (type, difficulty, tags, approval status), searchable, filterable by type, paginated

All admin routes are gated with both `protect` and `authorize('admin')`. `GET /api/admin/users` gained `role`, `search`, `page`, `limit` query params (backward compatible — omitting them returns the same behavior as before). Every create/update/delete action now writes an `AdminLog` entry.

New frontend: `AdminLayout.jsx` (shared tab navigation) and `AdminUserManager.jsx` (shared table component reused by both Students and Mentors screens) in `components/`, plus `AdminStudents.jsx`, `AdminMentors.jsx`, `AdminCourses.jsx`, `AdminResources.jsx` in `pages/`.

### AI Provider: Switched from OpenAI to Google Gemini
Per request, `openaiService.js` now calls Google's Gemini `generateContent` API (`https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent`) instead of OpenAI's chat completions endpoint. The core `callOpenAI()` function name was kept as-is (documented inline) so every caller in the file — `generateLearningPath`, `generateQuiz`, `analyzeResume`, `chatMentor`, `analyzeCareerAssessment`, `getMockInterviewQuestions` — needed zero changes; only the internals of that one function changed.

- **Message format translation**: OpenAI's `messages: [{role: 'system'|'user'|'assistant', content}]` is converted to Gemini's shape — a top-level `systemInstruction` plus a `contents` array using Gemini's `'user'`/`'model'` roles.
- **JSON mode**: OpenAI's `response_format: {type: 'json_object'}` maps to Gemini's `generationConfig.responseMimeType: 'application/json'`.
- **Auth**: uses the `x-goog-api-key` header (Google's current recommended method) rather than a `?key=` query param.
- **Env var**: canonical name is now `GEMINI_API_KEY` (`GEMINI_MODEL` optional, defaults to `gemini-2.5-flash`), but `OPENAI_API_KEY` is still checked as a fallback — so if you already had a Gemini key stored under the old `OPENAI_API_KEY` name, it keeps working with zero `.env` changes.
- All mock-fallback behavior (used when no key is configured, or a real call fails) is unchanged — the app still runs fully offline without any key.

### Student Features Update
Added gamification and productivity tools on top of the original scaffold:

- **Badges & Achievements** (`/badges`) — a seeded catalog of badges auto-awarded based on streaks, quiz completions, study minutes, and finished learning paths. Backed by new `Badge`-condition checks in `gamificationService.js`, run after quiz submission and path-node completion.
- **Leaderboard** (`/leaderboard`) — ranks students by points earned from study sessions, quizzes, and badges. `Progress.points` is a new field.
- **Study Timer / Pomodoro** (`/study-timer`) — a persisted 25/5-minute focus timer. Completed sessions are logged via `POST /api/student/timer/session`, updating streak, total minutes, and points, and triggering badge checks.
- **Notes** (`/notes`) — full CRUD notes with search, tags, and pinning.
- **Wishlist** (`/wishlist`) — save resources from any learning path node (see the "Save" button in Learning Path Detail) and manage them from a dedicated page.

New backend surface: `backend/src/models/{StudySession,UserBadge,Note,Wishlist}.js`, `backend/src/controllers/{badgeController,leaderboardController,timerController,noteController,wishlistController}.js`, mounted at `/api/student/*` via `backend/src/routes/studentRoutes.js`. Default badges are seeded automatically on first server start.

Also fixed a pre-existing bug: `pathController.js` used `crypto.randomBytes()` for certificate IDs without importing the `crypto` module — this would have thrown a runtime error the first time any user completed a learning path.

### Still not built
Per the original spec's full scope: Google login, Cloudinary uploads, broader test coverage (only auth is tested), a frontend Dockerfile, "Manage Categories"/"Manage Learning Paths"/"Manage Notifications"/"Manage Chat" admin screens, a revenue dashboard, and deployment guides beyond the existing README section.

