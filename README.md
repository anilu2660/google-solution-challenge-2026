# EquiLens — AI-Powered HR Bias Auditor

<div align="center">

![EquiLens Banner](https://img.shields.io/badge/EquiLens-AI%20Bias%20Auditor-4285F4?style=for-the-badge&logo=google&logoColor=white)
![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite)
![LangChain](https://img.shields.io/badge/LangChain-Orchestrated-1C3C3C?style=flat-square)
![OpenAI](https://img.shields.io/badge/Gemini--3.1Pro-Powered-412991?style=flat-square&logo=openai)
![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)

**Google Solution Challenge Submission**

*Detect, understand, and remediate algorithmic bias in HR datasets — powered by LangChain & Gemini3.1 Pro.*

[Live Demo](#running-locally) · [Features](#features) · [Setup](#setup) · [Architecture](#architecture)

</div>

---

## Overview

**EquiLens** is a full-stack, browser-based AI bias auditing platform built for the **Google Solution Challenge**. It empowers HR teams and compliance officers to upload any HR CSV dataset and instantly receive a deep, LLM-enriched fairness audit — including approval rate disparities, proxy variable detection, a Bias Fingerprint Radar, and a fully-printable **EU AI Act compliance report**.

EquiLens follows a two-stage analysis pipeline:
1. **Client-side statistical engine** (`csvAnalysis.js`) computes real, verifiable bias metrics — no AI hallucination.
2. **LangChain + Gemini 3.1 Pro layer** (`apiService.js`) enriches those pre-computed statistics with expert narrative, root-cause analysis, legal impact predictions, and actionable remediation steps.

---

## Features

### 🔒 Secure Access Portal
- Advanced glassmorphism login interface acting as the initial gateway.
- Form validation and simulated authentication delays for a realistic demo experience.
- Uses dummy credentials for easy testing (e.g., Email: `admin@equilens.ai`, Password: `admin`).

### 🔍 Real-Time Bias Detection
- Upload any HR CSV (hiring, promotion, selection data)
- Automatic column classification: **demographic**, **outcome**, and **proxy** variables
- Computes the **EEOC 4/5ths rule** Demographic Parity Score
- Identifies and measures **proxy variables** (zip code, school, neighborhood) via Cramér's V correlation

### 📊 Interactive Dashboard
- **Demographic Parity Score** card with highest/lowest group breakdown
- **Fairness Doughnut Chart** with an overall 0–10 score
- **Recruitment Disparity Matrix** — horizontal bar chart comparing approval rates by demographic group
- **Proxy Correlation Heatmap** — color-coded grid showing which columns may encode protected attributes
- **Bias Fingerprint Radar** — 6-dimensional spider chart (Parity, Proxy-Free, Integrity, Consistency, Coverage, Transparency) benchmarked against industry standard
- **CSV Data Preview** — GitHub-style head + tail table view of the uploaded dataset
- **PDF Export** — one-click dashboard export to PDF

### 🤖 AI Ethics Co-Pilot (Gemini 3.1 pro)
- Persistent chat interface powered by **LangChain** + Google Gemini 3.1 Pro`
- **Context-aware**: the AI always knows your dataset metrics, approval rates, and detected correlations
- **"Explain for HR"** button generates a plain-English, non-technical explanation of the audit findings
- **Response quality evaluation**: every AI reply is graded for bias sensitivity, accuracy, and actionability
- Streaming support for real-time token-by-token audit generation

### ⚖️ "What-If" Scenario Simulator
- Interactive slider to simulate **mitigation intensity** (0%–100%)
- Real-time trade-off charts: **Demographic Disparity** vs. **Model Accuracy**
- Live metric cards: Bias Score, Model Accuracy, Bias Reduction %, and EEOC compliance status
- Highlights the **optimal zone** (55–70% intensity) where EEOC compliance is met with minimal accuracy loss

### 📄 EU AI Act Compliance Report
- One-click generation of a structured **PDF report** (jsPDF)
- References **Regulation (EU) 2024/1689** Articles 9, 10, 13, 14, 15 and Annex III
- Includes PASS / REVIEW / FAIL status per article based on real audit data
- Covers executive summary, mitigation snapshot, findings, scenario analysis, and next steps

### 🎨 Premium UI / UX
- Beautiful dark/light theme with animated **Three.js particle background**
- Google-brand color palette (#4285F4, #EA4335, #FBBC05, #34A853)
- Smooth **Framer Motion** animations on all dashboard cards
- Live **streaming text cursor** while Gemini3.1 flash generates the audit
- Fully responsive layout with glassmorphism header

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend Framework** | React 19 + Vite 8 |
| **Styling** | Tailwind CSS v4 + Vanilla CSS |
| **Charts** | Chart.js / react-chartjs-2 (Bar, Doughnut, Radar) + Recharts (AreaChart) |
| **Animations** | Framer Motion + Three.js (particle background) |
| **AI Orchestration** | LangChain (`@langchain/core`, `@langchain/gemini`) |
| **LLM** | Google Gemini (Gemini 3.1pro) |
| **PDF Generation** | jsPDF + html2canvas |
| **Icons** | Lucide React |
| **Markdown Rendering** | react-markdown |

---

## Project Structure

```
google-solution-challenge/
├── public/                     # Static assets
├── src/
│   ├── components/
│   │   ├── AICopilot.jsx       # Gemini chat panel (right sidebar)
│   │   ├── Dashboard.jsx       # Main audit dashboard with all charts
│   │   ├── ErrorBoundary.jsx   # React error boundary wrapper
│   │   ├── ParticleBackground.jsx  # Three.js animated particle field
│   │   ├── SettingsModal.jsx   # API key configuration modal
│   │   ├── UploadZone.jsx      # CSV drag-and-drop upload + processing UI
│   │   └── WhatIfSimulator.jsx # Interactive mitigation slider + EU AI Act PDF
│   ├── context/
│   │   └── AppContext.jsx      # Global React context (data, insights, messages)
│   ├── services/
│   │   ├── apiService.js       # LangChain + GPT-4o AI service layer
│   │   ├── csvAnalysis.js      # Client-side statistical bias engine
│   │   ├── evaluationService.js # AI response quality grader
│   │   └── pdfExportService.js # Dashboard → PDF export logic
│   ├── App.jsx                 # Root component, layout, theme toggle
│   ├── main.jsx                # React entry point
│   ├── index.css               # Global design tokens + utility classes
│   └── App.css                 # App-level styles
├── mock_hr_data.csv            # Sample HR dataset for testing
├── .env.example                # Environment variable template
├── vite.config.js              # Vite + polyfill configuration
├── tailwind.config.js          # Tailwind CSS v4 config
└── package.json
```

---

## Setup

### Prerequisites
- **Node.js** ≥ 18.x
- **npm** ≥ 9.x
- An **Gemini API Key** with access to `gemini3.1Pro`

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/google-solution-challenge.git
cd google-solution-challenge
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file and add your API key:

```bash
cp .env.example .env
```

Edit `.env`:

```env
VITE_GEMINI_API_KEY="sk-proj-your-gemini-key-here"
```

> **⚠️ Never commit your `.env` file to Git.** It is already included in `.gitignore`.
>
> Alternatively, you can leave `.env` empty and enter your API key at runtime via the **Settings** button (⚙️) in the app header — it will be stored in `localStorage`.

### 4. Run the Development Server

```bash
npm run dev
```

The app will be available at **https://google-solution-challenge-2026.vercel.app/**

### 5. Build for Production

```bash
npm run build
```

Output will be in the `dist/` directory.

---

## Usage Guide

### Step 1 — Authenticate
- The application begins with a secure login screen.
- For the demo, you can use the following dummy credentials (or any valid email format and password):
  - **Email:** `admin@equilens.ai`
  - **Password:** `admin`
- After a successful login, you will be directed to the dataset upload area.

### Step 2 — Upload Your HR Dataset
- Drag and drop a **CSV file** onto the upload zone, or click to browse
- EquiLens reads the full file client-side (no server upload needed)
- A sample dataset is provided: [`mock_hr_data.csv`](./mock_hr_data.csv)

**Expected CSV format (columns are auto-detected):**

| Column Type | Examples |
|---|---|
| Demographic (protected) | `Gender`, `Ethnicity`, `Age`, `Race`, `Nationality` |
| Outcome (decision) | `Approved`, `Hired`, `Status`, `Decision`, `Promoted` |
| Proxy variables | `ZipCode`, `School`, `Neighborhood`, `Income` |
| Numeric features | `InterviewScore`, `SkillTestScore`, `YearsAtCompany` |

### Step 3 — View the Audit Dashboard
After upload, the statistical engine runs instantly and Gemini begins an asynchronous full audit (streaming). You'll see:
- **Risk level badge** (CRITICAL / HIGH / MEDIUM / LOW)
- **Metric cards** with animated counters
- **AI Summary banner** with the Gemini executive summary
- All charts and findings update once the AI response completes

### Step 4 — Chat with the AI Co-Pilot
- Use the right-panel chat to ask any question about your dataset
- Examples: *"Why is the disparity for Black applicants so high?"*, *"What's the legal risk here?"*, *"Suggest Python code to fix this bias"*
- Click **"Explain for HR"** for a non-technical, HR-manager-friendly summary

### Step 5 — Run What-If Scenarios
- Scroll to the bottom of the dashboard
- Drag the **Mitigation Intensity** slider to simulate bias reduction
- Watch the trade-off charts update in real time
- At 55–70% intensity, the EEOC 4/5ths threshold is typically satisfied

### Step 6 — Export Reports
- **Dashboard PDF**: Click **"Export Report"** at the top of the dashboard
- **EU AI Act PDF**: Click **"Generate EU AI Act Compliance Report"** at the bottom of the What-If Simulator

---

## Bias Metrics Explained

| Metric | Description | Threshold |
|---|---|---|
| **Demographic Parity Score** | Ratio of lowest to highest group approval rate × 100. Based on the EEOC 4/5ths rule. | ≥ 80 = Compliant |
| **Fairness Score** | Composite 0–10 score = Parity (50%) + Proxy-Free (30%) + Coverage (20%) | ≥ 7 = Acceptable |
| **Cramér's V** | Normalized chi-square measure of association between two categorical columns. Used for the proxy heatmap. | > 0.6 = High Risk |
| **Bias Fingerprint** | Six-axis profile: Parity, Proxy-Free, Integrity, Consistency, Coverage, Transparency | Benchmark = 80 per axis |

---

## Architecture

```
User uploads CSV
        │
        ▼
┌─────────────────────────────────┐
│   csvAnalysis.js (client-side)  │
│   - Column classification       │
│   - Cramér's V heatmap          │
│   - Approval rates by group     │
│   - Fairness score & fingerprint│
└────────────┬────────────────────┘
             │ Pre-computed stats
             ▼
┌─────────────────────────────────┐
│   apiService.js (LangChain)     │
│   - Gemini3.1 pro streaming invoke     │
│   - System + Human message      │
│   - JSON output parse           │
│   → summary, riskLevel,         │
│     keyFindings, predictions,   │
│     suggestions, transparencyScore│
└────────────┬────────────────────┘
             │ Enriched insights
             ▼
┌─────────────────────────────────┐
│   AppContext.jsx                │
│   - data, insights, messages    │
│   - auditError, streamingText   │
└────────────┬────────────────────┘
             │
    ┌────────┴────────┐
    ▼                 ▼
Dashboard.jsx     AICopilot.jsx
(Charts & Cards)  (Chat interface)
    │
    ▼
WhatIfSimulator.jsx
(Slider + EU AI Act PDF)
```

---

## Sample Data

A test dataset is included at [`mock_hr_data.csv`](./mock_hr_data.csv). It contains 10 HR records with columns:

`EmployeeID`, `Gender`, `Ethnicity`, `Age`, `Department`, `YearsAtCompany`, `EducationLevel`, `ZipCode`, `InterviewScore`, `SkillTestScore`, `Status`, `Approved`

This dataset is designed to trigger bias detection across gender, ethnicity, and ZipCode dimensions.

---

## EU AI Act Compliance

EquiLens natively generates reports referencing **Regulation (EU) 2024/1689** (EU Artificial Intelligence Act), specifically for HR AI systems classified as **High-Risk** under Annex III:

| Article | Description | Auto-Evaluated |
|---|---|---|
| Article 9 | Risk Management System | ✅ |
| Article 10 | Data and Data Governance | ✅ |
| Article 13 | Transparency | ✅ |
| Article 14 | Human Oversight | ✅ |
| Article 15 | Accuracy, Robustness & Cybersecurity | ✅ (based on bias score) |
| Annex III | High-Risk Category — Employment | ✅ (noted) |

---

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## Privacy & Security

- **All CSV processing is 100% client-side** — your data never leaves the browser for analysis
- Only a statistical summary (no raw rows) is sent to the OpenAI API for AI enrichment
- API keys are stored only in your local `.env` file or `localStorage` — never transmitted to any third party
- The app uses `vite-plugin-node-polyfills` to safely run LangChain in the browser environment

---

## Deployment:
Vercel: https://google-solution-challenge-2026.vercel.app/

## License

This project is licensed under the **MIT License**.

---

## Acknowledgements

- Built with ❤️ for the **Google Solution Challenge**
- Powered by [LangChain](https://langchain.com/), [Gemini](https://gemini.com/), [React](https://react.dev/), [Vite](https://vite.dev/), [Chart.js](https://www.chartjs.org/), [Recharts](https://recharts.org/), [Framer Motion](https://www.framer.com/motion/), [Three.js](https://threejs.org/), and [jsPDF](https://github.com/parallax/jsPDF)
- EEOC 4/5ths rule reference: [U.S. Equal Employment Opportunity Commission](https://www.eeoc.gov/)
- EU AI Act reference: [EUR-Lex Regulation (EU) 2024/1689](https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689)

---

<div align="center">
  <sub>Made for Google Solution Challenge · EquiLens AI Bias Auditor</sub>
</div>
