# CampusQuery – College Knowledge Base Platform

> **CampusQuery** is a community-driven academic doubt resolution and technical knowledge base platform designed specifically for college students and faculty. It ensures that technical doubts, syllabus questions, and lab problem solutions across subjects like **Computer Networks (CN), DBMS, Web Programming, Graph Theory, and Operating Systems** remain preserved and searchable for batchmates and future juniors.

---

## 🌟 Key Features

### 1. Student & Faculty Authentication (JWT + Bcrypt)
- **Role-Based Access Control**: `Student`, `Faculty`, and `Admin`.
- **College Profile Fields**: Name, College Email, Roll No / ID, Branch/Department (CSE, IT, ECE, AI/DS), and Semester.
- **1-Click Quick Demo Switcher**: Instant sign-in as Student, Faculty, or Admin from the login portal.

### 2. Subject Taxonomy & Rich Doubt Asking
- **Academic Subjects**:
  - Computer Networks (CN)
  - DBMS (Database Management Systems)
  - Web Programming & Full Stack
  - Graph Theory & Discrete Mathematics
  - Operating Systems (OS)
  - Algorithms & DSA
  - Artificial Intelligence
- **Markdown Editor & Live Preview**: Real-time editor with toolbar for code blocks (`cpp`, `python`, `sql`, `javascript`), mathematical expressions (`$O(V \cdot E)$`), quotes, and bullet lists.
- **Dynamic Tags**: Subject tags (e.g., `#dijkstra`, `#tcp-ip`, `#b-plus-tree`, `#react`) with tag exploration and auto-counting.

### 3. Community Answer System
- **Peer & Faculty Solutions**: Write and format academic answers in Markdown.
- **Accepted Answer System**: The question author (or faculty) can mark the verified solution, highlighting it with an emerald glowing badge at the top of the discussion.
- **Faculty Endorsement Badge**: Faculty members can endorse verified answers to guide students with authority.

### 4. Exam Revision Bookmarks ("Save Doubt")
- Students can bookmark key theoretical proofs, network diagrams, and algorithm implementations with a single click.
- Dedicated **Saved Revision List** tab in student profiles for quick review right before midterms and semester vivas.

### 5. Voting & Reputation System
- **Upvote / Downvote**: Real-time voting on both doubts and solutions with duplicate vote prevention.
- **Reputation Points Economy**:
  - `+15 Points`: When your answer is marked as the **Accepted Solution**.
  - `+10 Points`: When your answer is **Upvoted**.
  - `+5 Points`: When your question is **Upvoted**.
  - `-2 Points`: On Downvotes.
- **Campus Hall of Fame Leaderboard**: Top 3 podium display (Gold, Silver, Bronze) and complete student/faculty reputation rankings.

### 6. Instant Search & Multi-Criteria Filtering
- Search across titles, doubt descriptions, and code blocks.
- Filter by Subject and Tag.
- Sort by `Newest`, `Highest Votes`, `Most Views`, or `Most Answers`.
- Filter by `Unanswered` or `Solved / Accepted`.

### 6. Admin & Faculty Moderation Panel
- **Analytics Dashboard**: Total doubts, answers count, resolution rate %, and top syllabus topics.
- **User Management**: View accounts, elevate roles (Student -> Faculty/Admin), or suspend abusive accounts.
- **Syllabus Pinning**: Faculty can pin critical exam solutions and departmental notices to the top of the feed.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Tailwind CSS v3, React Router v7, Lucide Icons, Axios, Vite.
- **Backend**: Node.js, Express.js, JSON Web Tokens (JWT), Bcrypt.js, Sequelize ORM.
- **Database**: Relational SQL Database (Sequelize ORM):
  - Out-of-the-box **SQLite** database (`backend/data/campusquery.sqlite`) with zero external daemon requirements.
  - Full support for **MySQL** / **PostgreSQL** via simple configuration in `backend/.env` (`DB_DIALECT=mysql`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm (v9+)

### 1. Start the Backend Server
```bash
cd backend
npm install
npm run dev
# Server will run on http://localhost:5000
```

### 2. Start the Frontend Application
```bash
cd frontend
npm install
npm run dev
# Frontend will be live on http://localhost:5173
```

### Root Shortcut Commands (from project root):
```bash
# Start backend
npm run dev:backend

# Start frontend
npm run dev:frontend
```

---

## 🔑 Default Demo Accounts

| Role | Email | Password | Name |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@campus.edu` | `password123` | Dr. Rajesh Sharma (HOD CSE) |
| **Faculty** | `faculty@campus.edu` | `password123` | Prof. Ananya Gupta (Dept of IT) |
| **Student** | `student@campus.edu` | `password123` | Arjun Verma (6th Sem CSE) |
| **Student** | `priya@campus.edu` | `password123` | Priya Nair (4th Sem IT) |

*(You can also click the 1-Click Demo buttons on the `/login` page to sign in immediately without typing).*
