<div align="center">

<img src="https://img.shields.io/badge/Google_Solution_Challenge-2026-4285F4?style=for-the-badge&logo=google&logoColor=white" alt="Google Solution Challenge 2026" />
<img src="https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black" alt="React 19" />
<img src="https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite 8" />
<img src="https://img.shields.io/badge/Gemini_AI-Powered-8E75B2?style=for-the-badge&logo=googlegemini&logoColor=white" alt="Gemini AI" />
<img src="https://img.shields.io/badge/LangChain-Agentic-1C3C3C?style=for-the-badge&logo=chainlink&logoColor=white" alt="LangChain" />

<br/><br/>

# ⚖️ EquiLens AI

### Next-Generation HR Bias Auditing & Algorithmic Fairness Platform

*Detect bias. Understand root causes. Build fairer organizations.*

<br/>

> **EquiLens AI** is a comprehensive, production-grade platform that empowers HR teams, compliance officers, and data scientists to detect, analyze, and mitigate demographic bias in employment datasets — powered by **Gemini AI**, **LangChain**, and real-time statistical analysis.

<br/>

[![License](https://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen?style=flat-square)](https://nodejs.org)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](CONTRIBUTING.md)

</div>

---

## 📋 Table of Contents

1. [Overview](#-overview)
2. [Key Features](#-key-features)
3. [System Architecture](#-system-architecture)
4. [Project Structure](#-project-structure)
5. [Data Processing Pipeline](#-data-processing-pipeline)
6. [AI & LLM Design](#-ai--llm-design)
7. [Component Reference](#-component-reference)
8. [Services Reference](#-services-reference)
9. [State Management](#-state-management)
10. [Design System](#-design-system)
11. [Setup & Installation](#-setup--installation)
12. [Usage Guide](#-usage-guide)
13. [Technology Stack](#-technology-stack)
14. [Compliance & Fairness Standards](#-compliance--fairness-standards)

---

## 🌍 Overview

Modern HR processes increasingly rely on algorithmic decision-making for hiring, promotions, and workforce planning. Without proper auditing, these systems can silently encode and amplify demographic bias — violating EEOC regulations, the EU AI Act, and fundamental ethical principles.

**EquiLens AI** solves this by providing:

- **Automated statistical bias detection** — no manual data science required
- **Gemini AI-generated narrative analysis** — turning raw numbers into actionable legal insight
- **End-to-end compliance workflows** — from CSV upload to PDF audit report in minutes
- **Agentic AI co-pilot** — a conversational tool with real-time dataset access

---

## ✨ Key Features

### 🔬 Core Auditing Engine
| Feature | Description |
|---|---|
| **Multi-File Batch Upload** | Upload up to **3 CSV/JSON files simultaneously**; the engine concatenates and deduplicates columns for a unified audit |
| **Statistical Bias Analysis** | Computes Demographic Parity, Cramér's V Proxy Correlations, Approval Rates, and Bias Fingerprint scores — entirely client-side |
| **Gemini AI Narrative Audit** | Sends pre-computed statistics to **Gemini** via LangChain for deep narrative root-cause analysis, risk classification, and actionable recommendations |
| **Live Streaming Output** | AI responses stream token-by-token in real-time with a smooth progressive UI |

### 🧠 Advanced Analytics Panels
| Feature | Description |
|---|---|
| **Root-Cause "Why" Explainer** | Gemini AI identifies the top proxy variables driving bias with per-feature importance scores (0.0–1.0) and plain-language explanations |
| **Historical Trend Tracker** | AI simulates realistic quarter-over-quarter parity and fairness score progressions based on dataset severity |
| **Interactive Cohort Drill-Down** | Click any demographic group in the bar chart to expand a raw data table filtered to that specific cohort |
| **Proxy Correlation Heatmap** | Cramér's V correlation matrix highlights illegally predictive proxy columns (e.g., zip code, income) |
| **Bias Fingerprint Radar** | A 6-axis radar chart across Parity, Proxy-Free, Integrity, Consistency, Coverage, and Transparency dimensions |

### 🤖 Agentic Co-Pilot
| Feature | Description |
|---|---|
| **Natural Language Dataset Querying** | Ask questions in plain English; the Co-Pilot runs structured tool calls against the live dataset |
| **Multimodal Vision** | Upload chart screenshots or images; Gemini analyzes visuals contextually alongside CSV data |
| **On-Demand PDF Reports** | Instruct the Co-Pilot to export a structured EU AI Act compliance report as a downloadable PDF |
| **Markdown Reporting** | Generate formatted Markdown audit reports for GitHub or Confluence |

### 📋 Audit Management
| Feature | Description |
|---|---|
| **Audit History Log** | Persists up to 50 audit records in localStorage with timestamps, risk levels, and summaries |
| **View Report (PDF)** | Re-download any historical audit as a full PDF at any time |
| **Clear History** | Wipe the full audit log with a single click |
| **What-If Simulator** | Adjust fairness thresholds and recompute metrics interactively |

### 🎨 UI/UX Excellence
| Feature | Description |
|---|---|
| **Light & Dark Modes** | Full theme system with smooth transitions and adaptive glassmorphism |
| **Vivid Authority Design** | Premium design language with curated HSL palettes, Space Grotesk typography |
| **Framer Motion Animations** | Smooth page transitions, staggered list reveals, and micro-animations throughout |
| **Responsive Layout** | Adapts gracefully from laptop to widescreen monitors |

---

## 🏛️ System Architecture

```
┌───────────────────────────────────────────────────────────────────────┐
│                          EquiLens AI — Browser Client                 │
│                                                                       │
│   ┌─────────────┐     ┌──────────────────┐     ┌──────────────────┐  │
│   │  React 19   │────▶│   AppContext.jsx  │────▶│  Component Tree  │  │
│   │  + Vite 8   │     │  (Global State)   │     │  (Dashboard, AI  │  │
│   └─────────────┘     └──────────────────┘     │   Copilot, etc.) │  │
│                                                 └──────────────────┘  │
│                                                                       │
│   ┌──────────────────────────────────────────────────────────────┐   │
│   │                    DATA PIPELINE                              │   │
│   │                                                               │   │
│   │  [1] File Upload (≤3 CSVs)                                   │   │
│   │       │                                                       │   │
│   │       ▼                                                       │   │
│   │  [2] FileReader API → Parse + Concatenate Rows               │   │
│   │       │                                                       │   │
│   │       ▼                                                       │   │
│   │  [3] csvAnalysis.js → Statistical Engine                     │   │
│   │       │   • Column classification (demographic/outcome/proxy) │   │
│   │       │   • Approval rates per demographic group              │   │
│   │       │   • Cramér's V proxy correlation matrix               │   │
│   │       │   • Parity score, Fairness score, Fingerprint         │   │
│   │       │                                                       │   │
│   │       ▼                                                       │   │
│   │  [4] apiService.js → LangChain + Gemini                      │   │
│   │       │   • System prompt (enforced no dummy data)            │   │
│   │       │   • Human message (injected real statistics)          │   │
│   │       │   • Streaming response → token-by-token UI update     │   │
│   │       │   • JSON parse → rootCause, historicalTrend, metrics  │   │
│   │       │                                                       │   │
│   │       ▼                                                       │   │
│   │  [5] Dashboard.jsx → Visualize + Interact                    │   │
│   │       • Bar charts, Radar, Line, Heatmap                     │   │
│   │       • Cohort drill-down, Findings, Suggestions             │   │
│   │                                                               │   │
│   └──────────────────────────────────────────────────────────────┘   │
│                                                                       │
│   ┌────────────────────────────┐    ┌──────────────────────────────┐  │
│   │     AICopilot.jsx          │    │   AuditHistoryModal.jsx       │  │
│   │  LangChain Agent Loop      │    │   localStorage persistence    │  │
│   │  • Tool: query_dataset     │    │   PDF download per audit      │  │
│   │  • Tool: export_report     │    │   Clear history button        │  │
│   │  • Multimodal image chat   │    └──────────────────────────────┘  │
│   └────────────────────────────┘                                      │
└───────────────────────────────────────────────────────────────────────┘
                         │
                         ▼ HTTPS API Calls (client-side key)
              ┌──────────────────────┐
              │     Gemini / OpenAI  │
              │     LLM Backend      │
              │  (via LangChain SDK) │
              └──────────────────────┘
```

---

## 📁 Project Structure

```
google-solution-challenge-2026/
│
├── src/
│   ├── main.jsx                    # React 19 entry point
│   ├── App.jsx                     # Root layout, routing logic, theme switching
│   ├── App.css                     # Global component-scoped overrides
│   ├── index.css                   # Design system: CSS variables, tokens, utilities
│   │
│   ├── context/
│   │   └── AppContext.jsx          # Global state provider (data, insights, history, keys)
│   │
│   ├── hooks/
│   │   └── useAlerts.js            # Notification/toast alert queue hook
│   │
│   ├── components/
│   │   ├── UploadZone.jsx          # Multi-file upload + full AI processing pipeline
│   │   ├── Dashboard.jsx           # Main analytics dashboard (charts, metrics, drill-down)
│   │   ├── AICopilot.jsx           # Agentic conversational AI with tool calls
│   │   ├── AuditHistoryModal.jsx   # Audit log viewer with PDF export & clear
│   │   ├── WhatIfSimulator.jsx     # Interactive threshold simulation tool
│   │   ├── SettingsModal.jsx       # API key config, threshold sliders
│   │   ├── NotificationsPanel.jsx  # Alert/notification slide-in panel
│   │   ├── Login.jsx               # Optional authentication gate
│   │   ├── ParticleBackground.jsx  # Three.js animated particle canvas
│   │   ├── ErrorBoundary.jsx       # React error boundary wrapper
│   │   └── ToastStack.jsx          # Auto-dismissing toast notification stack
│   │
│   └── services/
│       ├── csvAnalysis.js          # Client-side statistical analysis engine
│       ├── apiService.js           # LangChain + Gemini AI audit & copilot service
│       ├── pdfExportService.js     # jsPDF report generation (compliance PDFs)
│       └── evaluationService.js    # LLM output quality evaluation helpers
│
├── public/                         # Static assets
├── index.html                      # Vite HTML entry
├── vite.config.js                  # Vite configuration with node polyfills
├── tailwind.config.js              # Tailwind CSS v4 config
├── .env                            # API key environment variables (gitignored)
├── package.json                    # Dependencies manifest
└── README.md                       # This file
```

---

## 🔄 Data Processing Pipeline

### Phase 1 — File Ingestion
The `UploadZone` component accepts up to **3 simultaneous files** via drag-and-drop or file picker. Each file is read in parallel using the native `FileReader` API.

```
Files[] → FileReader (Promise-based) → Raw text strings
```

### Phase 2 — CSV Parsing & Aggregation
Headers from the **first file** become the canonical schema. Subsequent files' rows are appended if their header count matches, enabling multi-period or multi-department data to be unified.

```
File 1: [headers], [rows...]
File 2: [rows...]   ← appended (headers verified)
File 3: [rows...]   ← appended (headers verified)
         ↓
combinedRows[] → single unified dataset
```

### Phase 3 — Statistical Analysis (`csvAnalysis.js`)
The analysis engine runs entirely **in-browser** — no data ever leaves the client at this stage:

| Calculation | Method |
|---|---|
| **Column Classification** | Keyword matching against EEOC-protected attribute lists and binary outcome patterns |
| **Approval Rates** | For each unique value of the primary demographic column, ratio of positive outcomes |
| **Proxy Correlation** | Cramér's V (Chi-squared based) between each pair of categorical columns |
| **Demographic Parity Score** | `(min_group_rate / max_group_rate) × 100` — EEOC 4/5ths rule |
| **Fairness Score** | Composite weighted score (parity, proxy exposure, integrity) out of 10 |
| **Bias Fingerprint** | 6-axis radar vector: `[Parity, Proxy-Free, Integrity, Consistency, Coverage, Transparency]` |

### Phase 4 — Gemini AI Enrichment (`apiService.js`)
Pre-computed statistics (never raw PII rows) are sent to **Gemini** via a carefully engineered prompt:

1. **System Prompt** — Enforces expert auditor persona and JSON-only output with strict "no example echoing" instructions
2. **Human Message** — Injects live statistics: column classifications, approval rates, proxy correlations, computed metrics
3. **Streaming Response** — Token-by-token output displayed in real-time in the UI
4. **JSON Parsing** — Extracts `summary`, `riskLevel`, `keyFindings`, `predictions`, `suggestions`, `rootCauseFeatureImportance`, `historicalTrend`, and `aiMetrics`

### Phase 5 — Dashboard Rendering
Merged data (statistical + AI) powers all visual panels: bar charts, radar charts, line charts, heatmaps, and cohort drill-down tables via `Chart.js` / `react-chartjs-2`.

---

## 🤖 AI & LLM Design

### Gemini Integration via LangChain

EquiLens uses **LangChain** (`@langchain/core`, `@langchain/openai`, `@langchain/google-genai`) as the orchestration layer, providing:

- **`RunnableSequence`** — Pipeline chaining for structured prompt → parse flows
- **`ChatPromptTemplate`** — Reusable prompt templates with injected statistics
- **`StringOutputParser`** — Raw streaming text extraction
- **`tool()` + `z` (Zod)** — Strongly-typed tool definitions for the Co-Pilot agent

### The "No Dummy Data" Constraint
A key engineering decision was preventing the LLM from parroting the JSON schema examples back as actual data. This is solved by:
- Marking the JSON structure block as **"EXAMPLE VALUES ONLY"** in the system prompt
- Including a `CRITICAL INSTRUCTION` to generate data **based entirely on the provided statistics**
- Using placeholder column names like `ActualColumnName1` in the schema block rather than plausible-sounding values

### Agentic Co-Pilot Loop (`AICopilot.jsx`)
The Co-Pilot implements a full agent loop:
```
User Message
    │
    ▼
LangChain Agent (Gemini)
    │
    ├── Tool Call: query_dataset(column, filters)
    │       └── Returns: filtered rows + computed aggregations
    │
    ├── Tool Call: export_report(format: "pdf" | "markdown")
    │       └── Triggers: pdfExportService.js download
    │
    └── Final Answer → streamed to chat UI
```

---

## 🧩 Component Reference

### `UploadZone.jsx`
The entry point and data processing hub. Key responsibilities:
- Multi-file drag-and-drop with validation (CSV/JSON, max 3 files)
- 6-phase animated progress pipeline: `Parsing → Classifying → Computing → Analyzing → AI Audit → Complete`
- Calls `csvAnalysis.js` for statistics, then `performFullAudit()` for Gemini enrichment
- Fallback to statistical-only mode when no API key is configured

### `Dashboard.jsx`
The main analytics view — activated after a successful audit:
- **Approval Rates Bar Chart** with risk-level badges per demographic group
- **Interactive Cohort Drill-Down** — click a group to reveal raw data rows
- **Bias Fingerprint Radar** (6 axes)
- **Proxy Correlation Heatmap** (Cramér's V matrix cells)
- **Root-Cause Explainer** (horizontal bar chart of Gemini's feature importance)
- **Historical Trend** (line chart of Gemini's simulated quarter-over-quarter progress)
- **CSV Data Preview** (head + tail row tables)

### `AICopilot.jsx`
The agentic sidebar assistant:
- Persistent chat history per session
- Image attachment support (multimodal Gemini vision)
- Tool-calling agent with `query_dataset` and `export_report` capabilities
- Markdown rendering of AI responses via `react-markdown`

### `AuditHistoryModal.jsx`
The audit log overlay:
- Lists up to 50 past audits from `localStorage`
- Shows dataset name, date, parity score, fairness score, and risk level per entry
- Each entry has a **View Report** button to re-download the audit as PDF
- **Clear History** button to wipe all records

### `WhatIfSimulator.jsx`
An interactive fairness threshold explorer:
- Sliders for EEOC Parity threshold, Proxy correlation limit, and minimum Fairness Score
- Live re-computation of which groups pass/fail under the adjusted thresholds

### `SettingsModal.jsx`
User configuration panel:
- API key input (stored in `sessionStorage` for security)
- Threshold configuration persisted to `localStorage`

---

## ⚙️ Services Reference

### `csvAnalysis.js` — Statistical Engine
Pure functional analysis library. No external dependencies. Key exports:
- **`analyzeCSV(headers, rows)`** → Returns complete computed stats object
- Internally uses: column keyword classification, Cramér's V chi-squared correlation, approval rate grouping, fingerprint vector computation

### `apiService.js` — Gemini AI Service
LangChain-powered LLM integration layer. Key exports:
- **`performFullAudit(apiKey, computedStats, onStream)`** → Full bias audit with streaming
- **`queryCopilot(apiKey, messages, dataContext, imageBase64?)`** → Agentic chat with tool calls
- **`evaluateLLMOutput(output)`** → Internal quality scoring of LLM responses

### `pdfExportService.js` — PDF Generator
Client-side compliance document generation. Key exports:
- **`generateAuditPDF(auditRecord)`** → Downloads full PDF with metrics, findings, and recommendations
- Uses `jsPDF` with structured layout, tables, and Gemini-produced narrative content

### `evaluationService.js` — Output Quality
LLM response evaluation helpers to detect incomplete or malformed outputs before rendering.

---

## 🗃️ State Management

All global application state is managed by a single **React Context** (`AppContext.jsx`) using `useState`. No external state management library is needed due to the single-page, single-session nature of the app.

| State Key | Type | Purpose |
|---|---|---|
| `apiKey` | `string` | Gemini/OpenAI API key (session-scoped) |
| `data` | `object \| null` | Full computed + AI-enriched audit data |
| `insights` | `object \| null` | Gemini narrative output (findings, risks, etc.) |
| `isAnalyzing` | `boolean` | Upload pipeline active flag |
| `analysisPhase` | `string` | Current pipeline phase label |
| `streamingText` | `string` | Live token stream from Gemini |
| `auditError` | `string \| null` | Pipeline error message |
| `messages` | `array` | Co-Pilot chat history |
| `thresholds` | `object` | EEOC/proxy/fairness threshold config |
| `auditHistory` | `array` | Persisted audit log (localStorage) |

---

## 🎨 Design System

EquiLens uses a custom **"Vivid Authority"** design language implemented via CSS custom properties in `index.css`:

### Color Palette
| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| `--text-1` | `#0f0f17` | `#f0f0ff` | Primary text |
| `--bg-base` | `#f8f8fc` | `#0d0d14` | Page background |
| `--bg-card` | `#ffffff` | `#13131f` | Card surfaces |
| `--border` | `rgba(0,0,0,0.07)` | `rgba(255,255,255,0.06)` | Borders |
| `--indigo` | `#6366f1` | `#818cf8` | Primary accent |
| `--emerald` | `#10b981` | `#34d399` | Success / low risk |
| `--rose` | `#f43f5e` | `#fb7185` | Critical risk |
| `--amber` | `#f59e0b` | `#fbbf24` | Warning / high risk |

### Typography
- **Display / Headings**: [Space Grotesk](https://fonts.google.com/specimen/Space+Grotesk) (weights 700, 900)
- **Body / Labels**: [Inter](https://fonts.google.com/specimen/Inter) (weights 400, 500, 600, 700)
- **Monospace / Data**: System monospace stack

### Motion
All animations are implemented with **Framer Motion** `motion.*` components using:
- `initial → animate` for mount transitions
- `AnimatePresence` for exit animating
- Spring physics (`type: 'spring'`) for chart reveals and list items

---

## 🛠️ Setup & Installation

### Prerequisites
- **Node.js** v18 or higher
- An API key for the Gemini-compatible endpoint (configured via Settings or `.env`)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/google-solution-challenge-2026.git
cd google-solution-challenge-2026
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_OPENAI_API_KEY=your_api_key_here
```

> **Note:** You can also enter the API key directly in the app's **Settings** modal (⚙️ icon in the top bar) at any time. This stores the key in `sessionStorage` for the current session only.

### 4. Start the Development Server
```bash
npm run dev
```

Navigate to **`http://localhost:5173`** to open EquiLens.

### 5. Build for Production
```bash
npm run build
```

The production bundle outputs to the `dist/` directory and can be deployed to any static hosting provider (Vercel, Netlify, Firebase Hosting, etc.).

---

## 📖 Usage Guide

### Uploading Your Dataset
1. Drag and drop **1 to 3** `.csv` or `.json` HR datasets onto the Upload Zone
2. The system concatenates all files using the first file's headers as the schema
3. Watch the **6-phase animated pipeline**: Parsing → Column Classification → Statistical Analysis → Computing → AI Audit → Complete

> **Tip:** Ensure your CSV contains at least one **demographic column** (e.g., `gender`, `race`, `age`) and one **outcome/decision column** (e.g., `hired`, `approval_status`, `promoted`) for meaningful bias detection.

### Reading the Dashboard
| Panel | What to Look For |
|---|---|
| **Parity Score** | Values below 80 violate the EEOC 4/5ths rule |
| **Fairness Score** | A composite score out of 10; below 7.0 is concerning |
| **Approval Rates** | Large gaps between group rates indicate systematic bias |
| **Root-Cause Explainer** | Highest-importance features are most likely proxy variables |
| **Historical Trend** | Shows whether simulated past trajectory was improving or worsening |
| **Heatmap** | Cells above the threshold (default 60%) are flagged as high-risk proxies |

### Using the AI Co-Pilot
Open the **Co-Pilot panel** (💬 button) and ask questions like:
- *"Which demographic group has the highest rejection rate?"*
- *"Summarize the key bias risks in this dataset."*
- *"Export a full EU AI Act compliance report as PDF."*
- *"What is the average age of hired vs. not hired candidates?"*

You can also attach an image (chart screenshot) with the 📎 icon for multimodal analysis.

### Managing Audit History
Click the **History** button in the top navigation to open the Audit History Modal:
- Browse past audits sorted by date
- Click **View Report** on any entry to re-download its PDF
- Click **Clear History** to wipe the log from localStorage

---

## 📚 Technology Stack

| Layer | Technology | Version |
|---|---|---|
| **UI Framework** | React | 19.x |
| **Build Tool** | Vite | 8.x |
| **Styling** | Tailwind CSS + Vanilla CSS | v4 |
| **Animation** | Framer Motion | 12.x |
| **AI Orchestration** | LangChain Core | 1.x |
| **LLM Provider** | Gemini (via `@langchain/google-genai`) | 2.x |
| **Charts** | Chart.js + react-chartjs-2 | 4.x / 5.x |
| **PDF Generation** | jsPDF | 4.x |
| **Icons** | Lucide React | 0.469+ |
| **Markdown** | react-markdown | 10.x |
| **Schema Validation** | Zod | 4.x |
| **3D Background** | Three.js | 0.183 |
| **Node Compatibility** | vite-plugin-node-polyfills | 0.26+ |

---

## ⚖️ Compliance & Fairness Standards

EquiLens AI aligns with the following regulatory frameworks:

| Standard | Coverage |
|---|---|
| **EEOC 4/5ths Rule** | Demographic Parity Score threshold of 80/100 enforced as default |
| **EU AI Act (2024)** | High-risk AI system audit trail requirements — addressed by the PDF export pipeline |
| **GDPR** | No raw PII data is ever transmitted to the LLM — only aggregate statistics are sent |
| **ISO/IEC 42001** | AI governance documentation via structured audit history and compliance reports |

---

<div align="center">

**Built with ❤️ for the Google Solution Challenge 2026**

*Helping organizations detect bias, act on evidence, and build a fairer future of work.*

</div>
