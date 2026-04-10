# EquiLens AI – Next-Gen HR Bias Auditing Platform

EquiLens AI is a comprehensive, agentic platform designed to detect, analyze, and mitigate demographic bias in HR and employment datasets. Built for the Google Solution Challenge 2026, it accelerates and automates ethical AI compliance, specifically aligning with frameworks like the EU AI Act.

## ✨ Features

- **Agentic AI Co-Pilot**: An onboard, LangChain-powered assistant (`gpt-4o`) that actively chats with you, has *direct system tool access* to query your dataset rows, schema, and column statistics, and answers questions intelligently without guessing.
- **Multimodal AI Vision**: Go beyond text datasets. Upload demographic charts or visual distributions to the Co-Pilot using the image attachment tool, and it will analyze them contextually alongside your HR data.
- **Live Dataset Streaming**: Upload raw CSV files which are chunked and streamed to the LLM for deep narrative analytics, dynamic metric generation (Fairness Scores, Demographic Parity), and automated bias discovery.
- **On-Demand Compliance Exporting**: The AI Co-Pilot can automatically generate, format, and download professional Markdown or PDF audit reports to your device (including structured EU AI Act compliance reports).
- **Vivid Authority Design System**: A premium, visually stunning interface supporting seamless Light and Dark modes. Features include adaptive glassmorphism, fluid Framer Motion micro-animations, and a fully resizable dual-pane layout.

## 🚀 Technology Stack

- **Framework**: React 19 + Vite
- **Styling**: Tailwind CSS (v4), Framer Motion, conditional Vanilla CSS
- **AI/LLM Architecture**: LangChain, `@langchain/openai`, Zod (Structured LLM outputs)
- **Data Visualization**: Recharts, Chart.js
- **Document Generation**: jsPDF (Client-side PDF compilation)

## 🛠️ Setup Instructions

### 1. Requirements
- Node.js (v18 or higher)
- OpenAI API Key

### 2. Installation
Clone the repository and install dependencies using NPM:

\`\`\`bash
git clone <repository-url>
cd google-solution-challenge-2026
npm install
\`\`\`

### 3. Environment Variables
Create a \`.env\` file in the root directory and add your OpenAI API Key:

\`\`\`env
VITE_OPENAI_API_KEY=your_openai_api_key_here
\`\`\`

*Note: Alternatively, you can input your API key directly via the dashboard's built-in Settings UI.*

### 4. Running the Development Server
Start the Vite development server:

\`\`\`bash
npm run dev
\`\`\`

Open your browser to the local address provided (typically `http://localhost:5173`) to view the application.

## 🤖 Using the AI Co-Pilot

1. **Upload Data**: Drag and drop your HR `.csv` dataset into the Upload Zone. Wait for the live metrics to finish analyzing.
2. **Chat & Query**: Open the side panel to chat with the EquiLens Co-Pilot. Ask it anything about your dataset (e.g., *"What is the average experience years by gender?"*).
3. **Analyze Charts**: Click the **Image+** icon to upload a screenshot of your data distributions and ask the AI to verify or interpret the visuals.
4. **Generate Reports**: Simply type *"Export an EU compliance report as a PDF"* and the LLM will structure the data and initiate a direct browser download.

## 📜 License
Developed for the Google Solution Challenge 2026.
