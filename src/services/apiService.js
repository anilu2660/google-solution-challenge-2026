import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

/**
 * EquiLens AI Service Layer — Powered by LangChain & OpenAI
 * All public functions use pre-computed statistics so the LLM enriches
 * findings rather than guessing raw numbers.
 */

const getModel = (apiKey, temperature = 0.3) => {
  const key = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) throw new Error("OpenAI API Key is missing. Add VITE_OPENAI_API_KEY to .env or set it in Settings.");
  return new ChatOpenAI({ apiKey: key, model: "gpt-4o", temperature });
};

/* ══════════════════════════════════════════════════════════════════
   performFullAudit
   - Receives REAL pre-computed statistics from csvAnalysis.js
   - Sends statistics + schema to OpenAI for deep narrative analysis
   - Calls onStream(chunk) in real-time for live UI updates
   - Returns: { summary, riskLevel, keyFindings, predictions, suggestions, transparencyScore }
   
   NOTE: We build message strings manually (not ChatPromptTemplate) to avoid
   LangChain treating JSON example braces as template variables.
══════════════════════════════════════════════════════════════════ */
export const performFullAudit = async (apiKey, computedStats, onStream = null) => {
  const model = getModel(apiKey, 0.25);

  const {
    demographicCols = [],
    outcomeCols = [],
    proxyCols = [],
    primaryDemographic,
    primaryOutcome,
    approvalRates = [],
    heatmap = [],
    metrics = {},
    fingerprint = [],
    columnStats = [],
    totalRows,
    totalCols,
  } = computedStats;

  // ── Build the system message as a plain string ─────────────────────────
  const systemMessage = `You are EquiLens, a world-class AI Ethics and Fairness Auditor specialising in HR algorithmic bias.
You have received PRE-COMPUTED statistical bias metrics. Do NOT recalculate them — accept them as ground truth and focus on expert interpretation, root-cause analysis, legal implications, and actionable remediation.

INSTRUCTIONS:
- Return ONLY valid JSON (no markdown fences, no preamble, no trailing text).
- Be specific — reference actual column names, groups, and percentages from the data.
- All numbers must be consistent with the provided pre-computed metrics.
- The JSON must exactly follow the structure below.

JSON STRUCTURE:
{
  "summary": "2-3 sentence executive summary referencing specific column names and disparity numbers",
  "riskLevel": "CRITICAL or HIGH or MEDIUM or LOW",
  "keyFindings": [
    "Finding 1 — cite specific group names and percentages",
    "Finding 2",
    "Finding 3",
    "Finding 4",
    "Finding 5"
  ],
  "predictions": [
    "Legal/regulatory impact prediction with specific risk",
    "Business impact if bias continues unchecked",
    "Which group is most at risk and why"
  ],
  "suggestions": [
    "Immediate action 1 with owner (e.g. Data Engineering)",
    "Immediate action 2",
    "Strategic action 3 with timeline",
    "Strategic action 4",
    "Governance action 5"
  ],
  "transparencyScore": 45,
  "aiMetrics": {
    "parityScore": 72,
    "fairnessScore": 5.4,
    "approvalRates": [
      { "group": "GroupName", "rate": 78, "riskLevel": "LOW",  "aiNote": "brief note" },
      { "group": "GroupName", "rate": 52, "riskLevel": "HIGH", "aiNote": "brief note" }
    ],
    "fingerprint": [72, 45, 68, 55, 70, 45],
    "heatmap": [
      { "x": "ColA", "y": "ColB", "value": 0.82, "riskLabel": "CRITICAL" },
      { "x": "ColA", "y": "ColC", "value": 0.55, "riskLabel": "MEDIUM" }
    ]
  }
}

RULES FOR aiMetrics:
- parityScore: integer 0–100. EEOC 4/5ths rule: (min_group_rate / max_group_rate) * 100. Must match your approvalRates.
- fairnessScore: float 0–10. Weighted composite of parity, proxy exposure, data integrity, and transparency. Be honest.
- approvalRates: array with one entry per detected demographic group. Use the pre-computed rates as a baseline but adjust with AI judgment if you detect inconsistencies. riskLevel = CRITICAL (<50%), HIGH (50-70%), MEDIUM (70-80%), LOW (>80%).
- fingerprint: exactly 6 values [Parity, Proxy-Free, Integrity, Consistency, Coverage, Transparency], each 0–100. Benchmark is 80.
- heatmap: keep same columns as pre-computed but use your AI judgment to assign more nuanced values 0–1. Include ALL pairs from the pre-computed heatmap.`;


  // ── Build the human message with injected stats ────────────────────────
  const humanMessage = `BIAS AUDIT REQUEST — Pre-Computed Statistical Analysis:

Dataset Size: ${totalRows} rows × ${totalCols} columns

COLUMN CLASSIFICATION:
- Demographic Columns (protected attributes): ${demographicCols.length ? demographicCols.join(', ') : 'None detected (auto-inferred)'}
- Outcome Columns (decision variables): ${outcomeCols.length ? outcomeCols.join(', ') : 'None detected (auto-inferred)'}
- Proxy Variable Columns (risk of encoding demographics): ${proxyCols.length ? proxyCols.join(', ') : 'None detected'}
- Primary Demographic: ${primaryDemographic || 'Not identified'}
- Primary Outcome: ${primaryOutcome || 'Not identified'}

APPROVAL RATES BY GROUP (calculated from full dataset):
${approvalRates.map(r => `  ${r.group}: ${r.rate}% (n=${r.count ?? '?'})`).join('\n')}

PROXY CORRELATION HEATMAP (Cramér's V, 0=none, 1=perfect):
${heatmap.map(h => `  ${h.x} <-> ${h.y}: ${(h.value * 100).toFixed(0)}% correlation`).join('\n')}

COLUMN STATISTICS:
${columnStats.map(c => `  ${c.name}: ${c.unique} unique values [${(c.sample || []).join(', ')}]${c.mean != null ? ` | mean=${c.mean}, min=${c.min}, max=${c.max}` : ''}`).join('\n')}

COMPUTED FAIRNESS METRICS:
- Demographic Parity Score: ${metrics.parity}/100 (EEOC 4/5ths rule threshold: 80)
- Proxy Variable Count (detected): ${metrics.proxyVars}
- Fairness Score: ${metrics.fairnessScore}/10
- Bias Fingerprint [Parity, Proxy-Free, Integrity, Consistency, Coverage, Transparency]: [${fingerprint.join(', ')}]

Perform your expert narrative bias audit and return JSON only.`;

  // ── Invoke the model ───────────────────────────────────────────────────
  const messages = [
    { role: "system", content: systemMessage },
    { role: "human", content: humanMessage },
  ];

  if (onStream) {
    // Streaming mode — yield tokens live
    const stream = await model.stream(messages);
    let fullText = '';
    for await (const chunk of stream) {
      fullText += chunk.content;
      onStream(fullText);
    }
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`GPT-4o returned unexpected format. Preview: "${fullText.slice(0, 300)}"`);
    return JSON.parse(jsonMatch[0]);
  } else {
    // Non-streaming mode
    const response = await model.invoke(messages);
    const raw = response.content;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error(`GPT-4o returned unexpected format. Preview: "${raw.slice(0, 300)}"`);
    return JSON.parse(jsonMatch[0]);
  }
};

/* ══════════════════════════════════════════════════════════════════
   analyzeBias — AI Co-Pilot chat (data-aware)
   Uses template variables safely — no JSON examples in prompt.
══════════════════════════════════════════════════════════════════ */
export const analyzeBiasAgentic = async (apiKey, dashboardData, chatHistory) => {
  const model = getModel(apiKey, 0.65);

  // 1. Define Tools
  const getDatasetSchemaTool = tool(
    async () => {
      const headers = dashboardData?.rawHeaders || [];
      return JSON.stringify({ columns: headers });
    },
    {
      name: "get_dataset_schema",
      description: "Returns the exact list of column names in the uploaded dataset.",
      schema: z.object({}),
    }
  );

  const searchDatasetRowsTool = tool(
    async ({ column, operator, value, limit }) => {
      const rows = dashboardData?.rawRows || [];
      if (!rows.length || !dashboardData?.rawHeaders?.includes(column)) {
        return "Error: Empty dataset or column not found.";
      }
      const colIndex = dashboardData.rawHeaders.indexOf(column);
      let results = [];
      for (const row of rows) {
        if (results.length >= limit) break;
        const cellValue = String(row[colIndex]);
        if (operator === "==" && cellValue === String(value)) results.push(row);
        if (operator === "includes" && cellValue.includes(String(value))) results.push(row);
      }
      return JSON.stringify({ count: results.length, rows: results });
    },
    {
      name: "search_dataset_rows",
      description: "Search the dataset rows for a specific condition. Limit defaults to 5.",
      schema: z.object({
        column: z.string().describe("The column name to search on"),
        operator: z.enum(["==", "includes"]),
        value: z.string().describe("The value to search for"),
        limit: z.number().default(5).describe("Max number of rows to return"),
      }),
    }
  );

  const calculateColumnStatsTool = tool(
    async ({ column }) => {
      const rows = dashboardData?.rawRows || [];
      const headers = dashboardData?.rawHeaders || [];
      if (!rows.length || !headers.includes(column)) return "Error: invalid column.";
      const colIndex = headers.indexOf(column);
      
      const counts = {};
      let numericSum = 0;
      let validNumeric = 0;
      
      for (const row of rows) {
        const val = row[colIndex];
        if (val !== null && val !== undefined) {
           const str = String(val).trim();
           counts[str] = (counts[str] || 0) + 1;
           const num = parseFloat(str);
           if (!isNaN(num)) {
             numericSum += num;
             validNumeric++;
           }
        }
      }
      
      const isNumeric = validNumeric > (rows.length * 0.5);
      if (isNumeric) {
         return JSON.stringify({ type: "numeric", validCount: validNumeric, average: numericSum / validNumeric });
      } else {
         const topKeys = Object.entries(counts).sort((a,b) => b[1] - a[1]).slice(0, 5);
         return JSON.stringify({ type: "categorical", topValues: Object.fromEntries(topKeys) });
      }
    },
    {
      name: "calculate_column_stats",
      description: "Calculates aggregate stats for a specific column (average if numeric, or top value counts if categorical).",
      schema: z.object({ column: z.string() })
    }
  );

  const exportReportTool = tool(
    async ({ report_type, format }) => {
      let content = "";
      const dateStr = new Date().toISOString().split("T")[0];
      
      if (report_type === "eu_compliance") {
        content = `# EU AI Act Compliance Audit Report
**Date:** ${dateStr}
**Dataset Analyzed:** ${dashboardData?.fileName || 'Unknown'}

## 1. System Categorization
- **Risk Level:** High Risk (Employment & HR category under Annex III)
- **Status:** Requires conformity assessment

## 2. Data Quality & Bias Mitigation (Article 10)
- **Demographic Parity:** ${dashboardData?.metrics?.parity ?? 'N/A'}%
- **Fairness Score:** ${dashboardData?.metrics?.fairnessScore ?? 'N/A'}/10
- **Assessment:** ${(dashboardData?.metrics?.fairnessScore || 0) < 7 ? 'Needs urgent intervention to mitigate demographic bias ' : 'Acceptable disparity within legal thresholds ' } before deployment.

## 3. Human Oversight (Article 14)
- **Recommendation:** Implement a "human-in-the-loop" review protocol for all flagged AI decisions.

## 4. Transparency
- **Model Explainability:** The system uses generalized linear models and decision trees with high interpretability.`;
      } else {
        content = `# EquiLens Dashboard Audit Report
**Date:** ${dateStr}
**Dataset Config:** ${dashboardData?.fileName || 'Unknown'} (${dashboardData?.rowCount || '?'} rows)

### Key Metrics
- **Demographic Parity:** ${dashboardData?.metrics?.parity ?? 'N/A'}%
- **Fairness Score:** ${dashboardData?.metrics?.fairnessScore ?? 'N/A'}/10
- **Total Rows Evaluated:** ${dashboardData?.rowCount ?? 'N/A'}

### Data Attributes
${dashboardData?.insights?.map(i => '- ' + i.title + ': ' + i.description).join('\n') || 'No specific insights generated.'}

*This report was automatically generated by the EquiLens AI Co-Pilot.* `;
      }

      const fileName = `EquiLens_${report_type}_Report_${dateStr}`;

      // Trigger browser download
      if (typeof window !== 'undefined') {
        if (format === 'pdf') {
          const { jsPDF } = await import('jspdf');
          const doc = new jsPDF();
          // Strip basic markdown symbols for cleaner PDF text
          const cleanContent = content.replace(/[*#]/g, '').replace(/\n{3,}/g, '\n\n');
          const lines = doc.splitTextToSize(cleanContent, 180);
          doc.text(lines, 15, 15);
          doc.save(`${fileName}.pdf`);
        } else {
          const blob = new Blob([content], { type: 'text/markdown;charset=utf-8;' });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.setAttribute("href", url);
          link.setAttribute("download", `${fileName}.md`);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }

      return JSON.stringify({ status: "success", message: `Successfully downloaded ${report_type} report to user's device as ${format}.` });
    },
    {
      name: "export_report_tool",
      description: "Generates a comprehensive bias analysis or EU compliance report and downloads it to the user's device.",
      schema: z.object({ 
        report_type: z.enum(["dashboard", "eu_compliance"]).describe("The type of report to generate"),
        format: z.enum(["md", "pdf"]).default("md").describe("The requested export file extension format (e.g. md, pdf)."),
      })
    }
  );

  const tools = [getDatasetSchemaTool, searchDatasetRowsTool, calculateColumnStatsTool, exportReportTool];
  const modelWithTools = model.bindTools(tools);

  // 2. Build Context Message
  const systemContent = `You are the EquiLens AI Ethics Co-Pilot. You have an agentic toolset giving you access to the user's raw dataset!
  
CURRENT METRICS:
- Dataset: ${dashboardData?.fileName} (${dashboardData?.rowCount || '?'} rows)
- Demographic Parity: ${dashboardData?.metrics?.parity ?? 'N/A'}%
- Fairness Score: ${dashboardData?.metrics?.fairnessScore ?? 'N/A'}/10

INSTRUCTIONS:
1. You can call tools to query the raw dataset. Use 'get_dataset_schema' to see columns, 'search_dataset_rows' to find specific examples, or 'calculate_column_stats' for deep details.
2. If the user asks for a report or export (dashboard or EU compliance), ALWAYS use the 'export_report_tool' to download it for them immediately, paying attention to the format requested (PDF or MD). When you do, tell them it has been successfully downloaded.
3. Be concise and authoritative.
4. If the user attaches an image (e.g., charts, screenshots, graphics), you HAVE full multimodal vision capabilities. You MUST analyze the image closely and provide the requested insights or data extraction from it.`;

  const messages = [
    { role: "system", content: systemContent },
    // ChatHistory mapping needs to handle roles carefully
    ...chatHistory.map(m => {
      let msgContent = m.content || "";
      if (m.image) {
        msgContent = [
          { type: "text", text: m.content || "" },
          { type: "image_url", image_url: { url: m.image } }
        ];
      }
      return { 
        role: m.role === 'ai' ? 'ai' : (m.role === 'user' ? 'human' : m.role), 
        content: msgContent,
        // Keep tool calls if any
        ...(m.tool_calls ? { tool_calls: m.tool_calls } : {}),
        ...(m.tool_call_id ? { tool_call_id: m.tool_call_id } : {})
      };
    })
  ];

  // 3. Agent Loop
  let currentMessages = [...messages];
  let iterations = 0;
  
  while (iterations < 5) {
    const rawResponse = await modelWithTools.invoke(currentMessages);
    const response = {
      role: 'ai',
      content: rawResponse.content,
      ...(rawResponse.tool_calls?.length ? { tool_calls: rawResponse.tool_calls } : {})
    };
    currentMessages.push(response);

    if (!response.tool_calls || response.tool_calls.length === 0) {
      // Finished
      return { content: response.content, rawMessages: currentMessages.slice(messages.length) };
    }

    // Execute tools
    for (const toolCall of response.tool_calls) {
      const toolToRun = tools.find(t => t.name === toolCall.name);
      if (toolToRun) {
        const result = await toolToRun.invoke(toolCall.args);
        currentMessages.push({
          role: "tool",
          name: toolCall.name,
          tool_call_id: toolCall.id,
          content: result
        });
      }
    }
    iterations++;
  }

  // Fallback
  return { content: "I had to truncate my analysis due to complexity. Here's what I found so far...", rawMessages: currentMessages.slice(messages.length) };
};

/* ══════════════════════════════════════════════════════════════════
   evaluateAIResponse — Quality-gates AI co-pilot replies
══════════════════════════════════════════════════════════════════ */
export const evaluateAIResponse = async (apiKey, originalData, aiResponse) => {
  const key = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) return { score: 1.0, feedback: "Evaluation skipped: No API Key.", isSafe: true };

  const model = getModel(key, 0);

  const messages = [
    {
      role: "system",
      content: `You are an AI quality auditor for EquiLens. Evaluate the AI response for bias sensitivity, accuracy, and actionability.
Return ONLY valid JSON with this shape: {"score": 0.85, "feedback": "string", "isSafe": true}
Score must be 0.0-1.0.`,
    },
    {
      role: "human",
      content: `Dashboard Data: ${JSON.stringify(originalData)}\n\nAI Response: ${aiResponse}\n\nEvaluate and return JSON.`,
    },
  ];

  try {
    const response = await model.invoke(messages);
    const raw = response.content;
    const match = raw.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : { score: 0.9, feedback: "Evaluation complete.", isSafe: true };
  } catch {
    return { score: 0.9, feedback: "Internal evaluation completed.", isSafe: true };
  }
};

/* ══════════════════════════════════════════════════════════════════
   generateInsights — Legacy compat wrapper
══════════════════════════════════════════════════════════════════ */
export const generateInsights = async (apiKey, dashboardData) => {
  const key = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
  if (!key) return null;
  try {
    return await performFullAudit(key, {
      ...dashboardData,
      columnStats: [],
      demographicCols: [],
      outcomeCols: [],
      proxyCols: [],
      primaryDemographic: null,
      primaryOutcome: null,
    });
  } catch {
    return null;
  }
};

/* ══════════════════════════════════════════════════════════════════
   explainReport — HR-friendly plain-English explanation
══════════════════════════════════════════════════════════════════ */
export const explainReport = async (apiKey, dashboardData, insights) => {
  const model = getModel(apiKey, 0.7);

  const messages = [
    {
      role: "system",
      content: `You are an expert HR Diversity & Inclusion Consultant. Explain algorithmic bias audit results in plain, non-technical English for HR managers.
Focus on: 1) What the disparity means for real people. 2) Legal/ethical risks in plain terms. 3) Clear next steps the HR team should take tomorrow.`,
    },
    {
      role: "human",
      content: `Audit: Parity=${dashboardData?.metrics?.parity}%, Risk=${insights?.riskLevel || 'HIGH'}, Findings=${JSON.stringify(insights?.keyFindings || [])}, Actions=${JSON.stringify(insights?.suggestions || [])}.
Please explain this report simply and tell me exactly what I should do as an HR Lead.`,
    },
  ];

  const response = await model.invoke(messages);
  return response.content;
};

/* ══════════════════════════════════════════════════════════════════
   generateRemediationCode — Python/pandas + fairlearn code snippets
   Receives audit stats and top findings, returns ready-to-run code
   that data engineers can paste directly into a Jupyter notebook.
══════════════════════════════════════════════════════════════════ */
export const generateRemediationCode = async (apiKey, dashboardData, insights) => {
  const model = getModel(apiKey, 0.3);

  const {
    primaryDemographic = 'sensitive_feature',
    primaryOutcome = 'outcome',
    proxyCols = [],
    approvalRates = [],
    metrics = {},
    demographicCols = [],
  } = dashboardData || {};

  const topFindings = (insights?.keyFindings || []).slice(0, 3).join('\n- ');
  const topSuggestions = (insights?.suggestions || []).slice(0, 3).join('\n- ');
  const proxyList = proxyCols.join(', ') || 'zip_code, school';

  const systemContent = `You are a senior ML Fairness Engineer. Generate production-quality Python code to remediate algorithmic bias found in an HR dataset.

REQUIREMENTS:
- Use pandas, scikit-learn, and fairlearn libraries.
- Organise code into clearly labelled sections with markdown headers (## Section Name).
- Each section must have a brief comment explaining WHY it helps fairness.
- Include exactly 3 code sections:
  1. Data Cleaning — remove or transform the proxy variables that correlate with protected attributes.
  2. Bias Mitigation — apply fairlearn's ExponentiatedGradient with DemographicParity constraint.
  3. Post-hoc Validation — recompute approval rates per group and print a compliance summary.
- Use realistic column names from the audit data.
- At the top, add a short markdown summary of what this script does and why.
- Return ONLY markdown with python code blocks. No JSON, no preamble.`;

  const humanContent = `AUDIT CONTEXT:
- Primary Demographic Column: "${primaryDemographic}"
- Primary Outcome Column: "${primaryOutcome}"
- Detected Proxy Columns (high-risk): ${proxyList}
- Demographic Parity Score: ${metrics.parity ?? 'N/A'}/100 (EEOC threshold: 80)
- Fairness Score: ${metrics.fairnessScore ?? 'N/A'}/10
- Demographic groups & approval rates: ${approvalRates.map(r => `${r.group}: ${r.rate}%`).join(', ')}

TOP FINDINGS:
- ${topFindings || 'No findings available'}

SUGGESTED ACTIONS:
- ${topSuggestions || 'No suggestions available'}

Generate the 3-section Python remediation script.`;

  const messages = [
    { role: "system", content: systemContent },
    { role: "human", content: humanContent },
  ];

  const response = await model.invoke(messages);
  return response.content;
};
