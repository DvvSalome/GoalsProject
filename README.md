# Reality Check AI — Self-Sabotage Predictor

A behavioral prediction AI that tells you when you're about to fail, why, and what you're really doing wrong. Brutally honest. Psychologically precise.

## Tech Stack

- **Frontend**: React + Vite + TailwindCSS + Recharts + Lucide Icons
- **Backend**: Node.js + Express
- **AI**: OpenAI API (GPT-4o-mini) — works without API key in demo mode

## Quick Start

### 1. Backend

```bash
cd backend
npm install
```

Copy `.env.example` to `.env` and add your OpenAI API key (optional — works without it in demo mode):

```bash
cp .env.example .env
# Edit .env and add your OPENAI_API_KEY
```

Start the backend:

```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

## Features

- **Behavioral Prediction Engine** — Analyzes your goal, energy, mood, distractions, and past consistency
- **Brutal Honesty Mode** — No sugarcoating. Psychologically precise feedback.
- **Impostor Syndrome Detection** — Detects self-doubt language and calls it out
- **Demo Mode** — Works without an API key using a built-in prediction algorithm
- **"Try Failing Scenario"** — One-click demo with a realistic failure case
- **Failure History Tracker** — Shows your pattern of overestimation (mock + real)
- **Discipline vs Time Chart** — Visualizes predicted discipline decay over your session

## Demo Mode

If no OpenAI API key is set, the app automatically falls back to a built-in prediction engine that uses the same behavioral psychology heuristics. Click **"Try realistic failing scenario"** for an instant demo.

## Project Structure

```
├── backend/
│   ├── server.js          # Express server + OpenAI integration + fallback engine
│   ├── package.json
│   ├── .env.example
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── App.jsx                    # Main app logic
│   │   ├── main.jsx                   # Entry point
│   │   ├── index.css                  # TailwindCSS styles
│   │   └── components/
│   │       ├── Header.jsx             # App header
│   │       ├── InputForm.jsx          # Behavioral input form
│   │       ├── ResultCard.jsx         # Prediction results display
│   │       ├── LoadingAnimation.jsx   # Analysis loading animation
│   │       ├── HistoryTracker.jsx     # Failure history (mock + real)
│   │       └── DisciplineChart.jsx    # Discipline vs Time chart
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
└── README.md
```
