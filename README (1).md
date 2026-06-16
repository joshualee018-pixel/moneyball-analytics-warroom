# Moneyball Analytics & Sabermetric Sandbox

[![Live Demo](https://img.shields.io/badge/Demo-Live%20Preview-emerald?style=for-the-badge&logo=google-cloud&logoColor=white)](https://ais-pre-kp7nlfh3gqbyqdxh6vn4yb-795368804061.us-east1.run.app)

A full-stack, immersive sabermetric sandbox and baseball roster simulator inspired by the legendary 2002 Oakland Athletics front office. This platform allows you to construct and optimize rosters under strict resource constraints, evaluate aggregate on-base talent, and simulate matchups against high-payroll rivals.

---

## 💡 Origin & Inspiration

I built this platform after completing **Inspirit AI**, an educational program where I learned how to write software, leverage artificial intelligence, and apply machine learning concepts. Being inspired by their introductory "Moneyball" project, I set out to construct this significantly upgraded, interactive, full-stack sandbox experience!

---

## 🚀 Key Features

* **Roster Builder & Sabermetric Catalog**: Search, filter, and balance baseball talent utilizing key metrics like On-Base Percentage (OBP), Slugging (SLG), On-Base Plus Slugging (OPS), and cost-per-win efficiency.
* **Classic & Modern Baseball Database**: Seamlessly load the classic 2002 Oakland Roster post-departure of Jason Giambi, or draft modern active superstars like Shohei Ohtani, Paul Skenes, Steven Kwan, and Aaron Judge.
* **Front Office AI Critique Panel**: Summon character-accurate AI agents into the Oakland War Room. Get reactive dialog critiques from Billy Beane, Grady Fuson, and Peter Brand evaluating your specific trade and draft strategies via Google Gemini (`gemini-3.5-flash`).
* **Bronx Matchup Simulator**: Go head-to-head against the $125M New York Yankees in an interactive 3-game series simulation, testing your sabermetric strategy against brute-force payrolls.

---

## 🛠️ Technology Stack

* **Frontend**: React (v18), Vite, Tailwind CSS, Motion (Animations)
* **Backend**: Express (Custom Full-stack NodeJS server)
* **AI Integration**: Google GenAI SDK (`@google/genai` with `gemini-3.5-flash`)
* **Icons**: Lucide React
* **Build System**: TypeScript compilation and bundle-split optimization via `esbuild`

---

## 💻 Local Sandbox Setup Instructions

To run the application locally on your computer:

### 1. Prerequisite Installation
Ensure you have [Node.js](https://nodejs.org/) (v18+) installed.

### 2. Clone and Install Dependencies
Unzip the exported project repository, open your terminal in the directory, and run:
```bash
npm install
```

### 3. Configure API Credentials
Create a `.env` file in the root of your directory (use `.env.example` as a template) and supply your Google Gemini API Key:
```env
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 4. Direct Development Server Launch
Start both the React development assets and the Express API server concurrently:
```bash
npm run dev
```
Open your browser to `http://localhost:3000` to interact with the sandbox.

### 5. Production Compilation
To build and execute production artifacts:
```bash
npm run build
npm start
```

---

## 📜 License
This repository is configured open-source under the guidelines of the MIT License. Feel free to copy, modify, and build upon.
