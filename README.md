# HackerRank Intelligence Dashboard & Admin System 🚀

A modern, responsive dashboard and admin management platform built with React, Vite, Tailwind CSS, and Express. Designed with authentic **HackerRank dark theme aesthetics**, green accent tokens (`#2EC866`, `#00EA64`), radiant badge stars, and live REST API integration for public HackerRank profiles (e.g., [`https://www.hackerrank.com/profile/atkamat1204`](https://www.hackerrank.com/profile/atkamat1204)).

---

## 🌟 Key Features

### 1. 🎯 Authentic HackerRank Candidate Dashboard
- **Profile Hero Header**: Avatar, Full Name, `@username`, direct HackerRank profile link, country flag/location, school/university, job title, level, verified status, and GitHub/LinkedIn links.
- **Key Metrics Overview**: Total solved challenges (with Easy / Medium / Hard estimation), Total Stars, Track Points, and Global Rank percentile.
- **HackerRank Skill Badges**:
  - Star rendering (1 to 6 stars) with golden/emerald glow
  - Domain progression (Python, C++, Java, Problem Solving, SQL, Algorithms, etc.)
  - Progress towards next star and track points
  - Interactive badge inspector modal with direct practice links
- **365-Day Submission Contribution Heatmap**:
  - GitHub & HackerRank-style interactive yearly activity grid
  - Hover tooltips showing date & submission counts
  - Current streak & Longest streak counters
- **Domain & Skills Mastery**:
  - Breakdown of Python, C++, Java, Algorithms, Data Structures, Mathematics, SQL, AI, Linux Shell, etc.
  - Practice points, track rank, and domain categories
  - Quick domain filters (*All Domains*, *Languages*, *Core CS*)
- **Recently Solved Challenges**:
  - Challenge name with direct problem link
  - Language tag (Python, C++, etc.)
  - Difficulty pill (*Easy*, *Medium*, *Hard*)
  - Acceptance status & timestamp
- **Verified Certifications & Certificate Viewer**:
  - HackerRank Verified Certificates (*Python Basic*, *Problem Solving*, *C++ Specialist*, *SQL Intermediate*)
  - Interactive Certificate Modal with verification ID and printable format

---

### 2. 🛡️ Comprehensive Admin Panel
- **Add Profile by Username or Full URL**:
  - Supports both username (`atkamat1204`) and full URL (`https://www.hackerrank.com/profile/atkamat1204`)
  - Live REST API fetch proxy with automatic enrichment and caching
- **Batch Import**:
  - Multi-line or comma-separated batch import for entire student cohorts or hiring candidate batches
- **Cohort Leaderboard & Analytics**:
  - 1st 🥇, 2nd 🥈, 3rd 🥉 podium cards
  - Multi-criteria sorting (*Stars*, *Solved Problems*, *Track Points*)
  - Cohort statistics (Total problems solved by team, average stars, interview-ready candidate ratio)
- **Candidate Management Table**:
  - Batch / Section tagging (e.g. `Batch 2025`)
  - Candidate status (*Active*, *Interview Ready*, *Review*, *Placed*)
  - Internal admin notes & review remarks
  - 1-click live sync & refresh button
  - Export cohort data to **CSV** or **JSON**

---

### 3. ⚔️ Side-by-Side Candidate Comparison
- Compare two candidates head-to-head with diff bars and domain matchup tables.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**: React 19, Vite, Tailwind CSS, Lucide React, Canvas Confetti
- **Backend API Proxy**: Express.js, Axios, CORS (serves live data from HackerRank REST endpoints, heatmap generation, and cached cohort storage)
- **Data Persistence**: Local JSON store in `data/profiles.json` + browser localStorage fallback for reliability in all environments.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Development Server
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Backend API proxy runs at: `http://localhost:3001`

### 3. Build & Run Production Server
```bash
npm run build
npm run server
```

---

## 🌐 Sample Profiles Included
- `atkamat1204` ([https://www.hackerrank.com/profile/atkamat1204](https://www.hackerrank.com/profile/atkamat1204))
- `saurabh_singh` ([https://www.hackerrank.com/profile/saurabh_singh](https://www.hackerrank.com/profile/saurabh_singh))
- Custom profiles can be added at any time via the Admin Panel.
