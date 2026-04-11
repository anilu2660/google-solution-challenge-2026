import React, { useState, useRef, useEffect } from 'react';
import {
  Upload, FileCode, AlertCircle, RefreshCw, Shield, Zap, BarChart3,
  FileText, Lock, Cpu, CheckCircle2, ArrowRight, Sparkles
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { analyzeCSV } from '../services/csvAnalysis';
import { performFullAudit } from '../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Vivid Authority Palette ──────────────────────────────────────────────── */
const P = {
  sapphire: '#3B82F6',
  indigo: '#818CF8',
  emerald: '#34D399',
  amber: '#FBBF24',
  rose: '#FB7185',
  cyan: '#22D3EE',
  violet: '#A78BFA',
};

/* ── Analysis step definitions ───────────────────────────────────────────── */
const PHASES = [
  { id: 'parsing', label: 'Parsing CSV structure…', icon: FileText, color: P.sapphire },
  { id: 'stats', label: 'Computing statistical metrics…', icon: BarChart3, color: P.indigo },
  { id: 'correlate', label: 'Detecting proxy correlations…', icon: Zap, color: P.amber },
  { id: 'parity', label: 'Calculating demographic parity…', icon: Shield, color: P.emerald },
  { id: 'llm', label: 'Gemini 3.1 Pro deep analysis…', icon: Cpu, color: P.violet },
  { id: 'done', label: 'Audit complete — building dashboard…', icon: CheckCircle2, color: P.emerald },
];

/* ── Rotating hero words ────────────────────────────────────────────────── */
const HERO_WORDS = ['Bias', 'Disparity', 'Inequity', 'Risk'];

const RotatingWord = () => {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setIdx(i => (i + 1) % HERO_WORDS.length), 2400);
    return () => clearInterval(t);
  }, []);
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={HERO_WORDS[idx]}
        initial={{ opacity: 0, y: 18, filter: 'blur(6px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        exit={{ opacity: 0, y: -18, filter: 'blur(6px)' }}
        transition={{ duration: 0.4 }}
        className="gradient-text"
        style={{ display: 'inline-block' }}
      >
        {HERO_WORDS[idx]}
      </motion.span>
    </AnimatePresence>
  );
};

/* ── Animated orbit ring ─────────────────────────────────────────────────── */
const Ring3D = ({ size, color, animDuration, style = {} }) => (
  <div style={{
    position: 'absolute', width: size, height: size,
    borderRadius: '50%', border: `1.5px solid ${color}`,
    opacity: 0.5, animation: `spin-slow ${animDuration}s linear infinite`,
    ...style,
  }} />
);

/* ── Feature card ────────────────────────────────────────────────────────── */
const FeatureCard = ({ icon: Icon, title, desc, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    className="g-card"
    style={{
      flex: 1, minWidth: 180, padding: '22px 20px', position: 'relative', cursor: 'default',
    }}
  >
    {/* Top glow line */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, transparent 10%, ${color} 50%, transparent 90%)`,
      borderRadius: '18px 18px 0 0',
    }} />
    <div style={{
      width: 42, height: 42, borderRadius: 12,
      background: `linear-gradient(135deg, ${color}25, ${color}08)`,
      border: `1px solid ${color}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: 14, boxShadow: `0 0 20px ${color}15`,
    }}>
      <Icon size={20} style={{ color }} />
    </div>
    <h4 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>{title}</h4>
    <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65 }}>{desc}</p>
  </motion.div>
);

/* ═════════════════════════════════════════════════════════════════════════ */
const UploadZone = () => {
  const {
    setData, setInsights, setIsAnalyzing, isAnalyzing,
    apiKey, setAuditError, auditError,
    setStreamingText, setAnalysisPhase,
    addAuditToHistory,
  } = useAppContext();

  const [isHovered, setIsHovered] = useState(false);
  const [phase, setPhase] = useState(0);
  const [fileName, setFileName] = useState('');
  const [statsReady, setStatsReady] = useState(null);
  const [llmRaw, setLlmRaw] = useState('');
  const [llmError, setLlmError] = useState(null);
  const [rowCount, setRowCount] = useState(0);
  const fileInputRef = useRef(null);

  const advancePhase = (idx) => {
    setPhase(idx);
    setAnalysisPhase(PHASES[idx]?.id || '');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsHovered(false);
    if (!e.dataTransfer.files || e.dataTransfer.files.length === 0) return;
    const droppedFiles = Array.from(e.dataTransfer.files).slice(0, 3);
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const selectedFiles = Array.from(e.target.files).slice(0, 3);
    processFiles(selectedFiles);
    e.target.value = '';
  };

  /* ── Core processing pipeline ─────────────────────────────────────────── */
  const processFiles = async (files) => {
    if (!files || files.length === 0) return;

    for (let f of files) {
      if (!f.name.match(/\.(csv|json)$/i)) {
        setLlmError('Only .csv and .json files are supported.');
        return;
      }
    }

    const combinedName = files.map(f => f.name).join(', ');
    setFileName(combinedName);
    setIsAnalyzing(true);
    setLlmError(null);
    setAuditError(null);
    setLlmRaw('');
    setStatsReady(null);
    advancePhase(0);

    let allHeaders = [];
    let combinedRows = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result || '');
          reader.onerror = reject;
          reader.readAsText(files[i]);
        });

        const rawLines = text.split('\n').filter(l => l.trim());
        const parseLine = (line) => {
          const result = [];
          let current = '';
          let inQuotes = false;
          for (const ch of line) {
            if (ch === '"') { inQuotes = !inQuotes; }
            else if (ch === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
            else { current += ch; }
          }
          result.push(current.trim());
          return result;
        };
        const headers = rawLines.length > 0 ? parseLine(rawLines[0]) : [];
        if (i === 0) allHeaders = headers;

        const rows = rawLines.slice(1).map(parseLine).filter(r => r.some(c => c));
        combinedRows.push(...rows);
      }
      setRowCount(combinedRows.length);
    } catch (parseErr) {
      setLlmError(`CSV parse error: ${parseErr.message}`);
      setIsAnalyzing(false);
      return;
    }

    await new Promise(r => setTimeout(r, 300));

    advancePhase(1);
    await new Promise(r => setTimeout(r, 200));

    let computed;
    try {
      computed = analyzeCSV(allHeaders, combinedRows);
      setStatsReady(computed);
    } catch (statErr) {
      setLlmError(`Statistical analysis error: ${statErr.message}`);
      setIsAnalyzing(false);
      return;
    }

    advancePhase(2);
    await new Promise(r => setTimeout(r, 250));
    advancePhase(3);
    await new Promise(r => setTimeout(r, 250));

    const head = combinedRows.slice(0, 5);
    const tail = combinedRows.length > 10 ? combinedRows.slice(-5) : [];

    const baseData = {
      fileName: combinedName,
      rowCount: combinedRows.length,
      columnCount: allHeaders.length,
      metrics: computed.metrics,
      approvalRates: computed.approvalRates,
      heatmap: computed.heatmap,
      fingerprint: computed.fingerprint,
      csvPreview: { headers: allHeaders, head, tail, totalRows: combinedRows.length },
      rawHeaders: allHeaders,
      rawRows: combinedRows,
      demographicCols: computed.demographicCols,
      outcomeCols: computed.outcomeCols,
      proxyCols: computed.proxyCols,
      primaryDemographic: computed.primaryDemographic,
      primaryOutcome: computed.primaryOutcome,
      isPartialResult: true,
    };

    advancePhase(4);

    const activeKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
    if (!activeKey) {
      setData(baseData);
      setInsights({
        summary: `Statistical analysis complete. ${computed.approvalRates.length} demographic groups detected across ${combinedRows.length} records. Demographic Parity Score: ${computed.metrics.parity}/100. Add an OpenAI API Key in Settings for AI-generated insights and recommendations.`,
        riskLevel: computed.metrics.parity < 65 ? 'CRITICAL' : computed.metrics.parity < 80 ? 'HIGH' : computed.metrics.parity < 90 ? 'MEDIUM' : 'LOW',
        keyFindings: [
          `Demographic Parity Score is ${computed.metrics.parity}/100 (EEOC threshold: 80/100).`,
          `${computed.approvalRates.length} groups detected. Highest: ${computed.approvalRates[0]?.group} at ${computed.approvalRates[0]?.rate}%.`,
          computed.approvalRates.length > 1
            ? `Lowest group: ${computed.approvalRates[computed.approvalRates.length - 1]?.group} at ${computed.approvalRates[computed.approvalRates.length - 1]?.rate}%.`
            : 'Only one group detected — could not compute disparity gap.',
          `${computed.proxyCols.length} proxy variable columns identified: ${computed.proxyCols.join(', ') || 'none'}.`,
          `Fairness Score: ${computed.metrics.fairnessScore}/10. Add API key for detailed AI-powered narrative.`,
        ],
        predictions: [
          'Connect OpenAI API key for AI-generated predictions tailored to your dataset.',
          'Statistical analysis shows potential bias — full LLM audit recommended.',
        ],
        suggestions: [
          'Add your OpenAI API Key via the Settings (⚙) button to unlock full AI analysis.',
          `Review the ${computed.primaryDemographic || 'demographic'} column for disparate impact.`,
          computed.primaryOutcome
            ? `Audit ${computed.primaryOutcome} decisions for demographic fairness.`
            : 'Identify outcome columns (Hired, Approved, etc.) for full parity analysis.',
        ],
      });
      advancePhase(5);
      await new Promise(r => setTimeout(r, 400));
      setIsAnalyzing(false);
      return;
    }

    try {
      let streamBuffer = '';
      const llmResult = await performFullAudit(activeKey, computed, (chunk) => {
        streamBuffer = chunk;
        setLlmRaw(chunk);
        setStreamingText(chunk);
      });

      const aiM = llmResult.aiMetrics || {};
      const aiApprovalRates = Array.isArray(aiM.approvalRates) && aiM.approvalRates.length > 0
        ? aiM.approvalRates : computed.approvalRates;
      const aiFingerprint = Array.isArray(aiM.fingerprint) && aiM.fingerprint.length === 6
        ? aiM.fingerprint : computed.fingerprint;
      const aiHeatmap = Array.isArray(aiM.heatmap) && aiM.heatmap.length > 0
        ? aiM.heatmap : computed.heatmap;
      const aiParity = Number.isFinite(aiM.parityScore) ? aiM.parityScore : computed.metrics.parity;
      const aiFairness = Number.isFinite(aiM.fairnessScore) ? aiM.fairnessScore : computed.metrics.fairnessScore;
      const aiTransparency = Number.isFinite(llmResult.transparencyScore) ? llmResult.transparencyScore : aiFingerprint[5];

      const finalData = {
        ...baseData,
        isPartialResult: false,
        approvalRates: aiApprovalRates,
        fingerprint: aiFingerprint,
        heatmap: aiHeatmap,
        metrics: { ...computed.metrics, parity: aiParity, fairnessScore: aiFairness },
      };

      const finalInsights = {
        summary: llmResult.summary || 'Analysis complete.',
        riskLevel: llmResult.riskLevel || 'HIGH',
        keyFindings: llmResult.keyFindings || [],
        predictions: llmResult.predictions || [],
        suggestions: llmResult.suggestions || [],
        transparency: aiTransparency,
        featureImportance: llmResult.rootCauseFeatureImportance || [],
        historicalTrend: llmResult.historicalTrend || [],
      };

      if (Number.isFinite(aiTransparency)) {
        finalData.fingerprint = [...aiFingerprint];
        finalData.fingerprint[5] = Math.min(100, Math.max(0, aiTransparency));
      }

      advancePhase(5);
      await new Promise(r => setTimeout(r, 300));
      setData(finalData);
      setInsights(finalInsights);
      setStreamingText('');

      addAuditToHistory({
        date: new Date().toISOString(),
        fileName: finalData.fileName,
        parity: aiParity,
        fairnessScore: aiFairness,
        riskLevel: finalInsights.riskLevel,
        summary: finalInsights.summary,
        keyFindings: finalInsights.keyFindings,
        suggestions: finalInsights.suggestions,
      });

    } catch (llmErr) {
      console.error('LLM audit failed:', llmErr);
      setLlmError(`AI narrative failed: ${llmErr.message}`);
      setAuditError(llmErr.message);
      setData({ ...baseData, isPartialResult: false });
      const fallbackInsights = {
        summary: `Statistical analysis complete with ${combinedRows.length} rows. AI narrative unavailable: ${llmErr.message.slice(0, 120)}`,
        riskLevel: computed.metrics.parity < 65 ? 'CRITICAL' : computed.metrics.parity < 80 ? 'HIGH' : 'MEDIUM',
        keyFindings: [
          `Demographic Parity Score: ${computed.metrics.parity}/100 (EEOC threshold: 80).`,
          `Highest approval group: ${computed.approvalRates[0]?.group ?? 'N/A'} at ${computed.approvalRates[0]?.rate ?? 0}%.`,
          `Lowest approval group: ${computed.approvalRates[computed.approvalRates.length - 1]?.group ?? 'N/A'} at ${computed.approvalRates[computed.approvalRates.length - 1]?.rate ?? 0}%.`,
          `Disparity gap: ${(Math.max(...computed.approvalRates.map(r => r.rate)) - Math.min(...computed.approvalRates.map(r => r.rate)))} percentage points.`,
          `Proxy variables detected: ${computed.proxyCols.join(', ') || 'none'}.`,
        ],
        predictions: ['Verify API key and retry for AI-powered predictions.'],
        suggestions: ['Check your OpenAI API key in Settings and re-upload the file for full AI analysis.'],
      };
      setInsights(fallbackInsights);

      addAuditToHistory({
        date: new Date().toISOString(),
        fileName: baseData.fileName,
        parity: computed.metrics.parity,
        fairnessScore: computed.metrics.fairnessScore,
        riskLevel: fallbackInsights.riskLevel,
        summary: fallbackInsights.summary,
        keyFindings: fallbackInsights.keyFindings,
        suggestions: fallbackInsights.suggestions,
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const streamPreview = llmRaw
    ? llmRaw.replace(/[{}[\]"]/g, ' ').replace(/\s+/g, ' ').slice(-180).trim()
    : '';

  const progressPct = Math.round(((phase + 1) / PHASES.length) * 100);

  return (
    <div style={{ width: '100%', maxWidth: 800, textAlign: 'center' }}>
      <input ref={fileInputRef} type="file" multiple accept=".csv,.json" style={{ display: 'none' }} onChange={handleFileSelect} />

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          /* ── ANALYZING STATE ─────────────────────────────────────────── */
          <motion.div key="analyzing"
            initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.45 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 40, padding: '44px 0' }}
          >
            {/* Orbital scanner */}
            <div style={{ position: 'relative', width: 180, height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {[P.sapphire, P.rose, P.amber, P.emerald].map((c, i) => (
                <div key={i} style={{
                  position: 'absolute', width: 65, height: 65, borderRadius: '50%',
                  background: c, filter: 'blur(28px)', opacity: 0.2,
                  transform: `rotate(${i * 90}deg) translateX(65px)`,
                  animation: `glow-pulse ${2.2 + i * 0.5}s ease-in-out infinite`,
                  animationDelay: `${i * 0.35}s`,
                }} />
              ))}
              <Ring3D size={175} color={P.sapphire} animDuration={4} style={{ top: 2, left: 2 }} />
              <Ring3D size={140} color={P.indigo} animDuration={6} style={{ top: 20, left: 20, animationDirection: 'reverse' }} />
              <Ring3D size={108} color={P.violet} animDuration={3.5} style={{ top: 36, left: 36 }} />
              <Ring3D size={78} color={P.emerald} animDuration={5} style={{ top: 51, left: 51, animationDirection: 'reverse' }} />
              <div style={{
                position: 'absolute', left: '8%', right: '8%',
                height: 2, background: `linear-gradient(90deg, transparent, ${P.indigo}, transparent)`,
                boxShadow: `0 0 14px ${P.indigo}`, animation: 'scan-line 1.8s ease-in-out infinite',
              }} />
              <FileCode size={34} style={{ color: P.indigo, opacity: 0.8, position: 'relative', zIndex: 2 }} />
            </div>

            {/* Status */}
            <div style={{ width: '100%', maxWidth: 540, textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 900, marginBottom: 8, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
                {phase < 4 ? 'Statistical Analysis' : phase < 5 ? 'Gemini 3.1 Pro Analysis' : 'Finalizing Dashboard'}
              </h2>
              {fileName && (
                <p style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: "'Space Grotesk', monospace", marginBottom: 18 }}>
                  {fileName}{rowCount > 0 ? ` · ${rowCount.toLocaleString()} rows` : ''}
                </p>
              )}

              {/* Progress bar */}
              <div style={{ width: '100%', height: 8, borderRadius: 99, background: 'var(--bg-card-3)', overflow: 'hidden', marginBottom: 20 }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPct}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  style={{
                    height: '100%', borderRadius: 99,
                    background: `linear-gradient(90deg, ${P.sapphire}, ${P.indigo}, ${P.violet})`,
                    boxShadow: `0 0 16px ${P.indigo}50`,
                  }}
                />
              </div>

              {/* Current step */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginBottom: 22 }}>
                <AnimatePresence mode="wait">
                  <motion.div key={phase}
                    initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    {PHASES[phase] && React.createElement(PHASES[phase].icon, {
                      size: 16, style: { color: PHASES[phase].color },
                    })}
                    <span style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}>
                      {PHASES[phase]?.label}
                    </span>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Phase timeline */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 26 }}>
                {PHASES.map((p, i) => (
                  <div key={i} style={{
                    width: i <= phase ? 28 : 10, height: 10, borderRadius: 99,
                    background: i < phase ? P.emerald : i === phase ? `linear-gradient(90deg, ${P.sapphire}, ${P.indigo})` : 'var(--bg-card-3)',
                    boxShadow: i === phase ? `0 0 12px ${P.indigo}50` : i < phase ? `0 0 8px ${P.emerald}30` : 'none',
                    transition: 'all 0.4s ease',
                  }} title={p.label} />
                ))}
              </div>

              {/* Live streaming preview */}
              {phase === 4 && streamPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  className="g-card"
                  style={{
                    padding: '14px 18px', marginTop: 8,
                    fontFamily: "'Fira Code', monospace", fontSize: 11, color: 'var(--text-3)',
                    textAlign: 'left', lineHeight: 1.65, wordBreak: 'break-all',
                    maxHeight: 100, overflow: 'hidden',
                    borderLeft: `3px solid ${P.violet}`,
                  }}
                >
                  <span style={{ color: P.violet, fontWeight: 700, fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Gemini 3.1 Pro → </span>
                  {streamPreview}
                  <span style={{ animation: 'pulse 1s infinite', display: 'inline-block', width: 7, height: 14, background: P.violet, verticalAlign: 'middle', marginLeft: 3, borderRadius: 2 }} />
                </motion.div>
              )}

              {/* Stats ready badges */}
              {statsReady && phase >= 4 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 22, flexWrap: 'wrap' }}
                >
                  {[
                    { label: 'Parity', val: `${statsReady.metrics.parity}/100`, c: statsReady.metrics.parity < 80 ? P.rose : P.emerald },
                    { label: 'Groups', val: statsReady.approvalRates.length, c: P.sapphire },
                    { label: 'Proxies', val: statsReady.proxyCols.length, c: P.amber },
                    { label: 'Fairness', val: `${statsReady.metrics.fairnessScore}/10`, c: P.emerald },
                  ].map(({ label, val, c }) => (
                    <div key={label} className="g-card" style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      padding: '12px 20px', position: 'relative',
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 10, right: 10, height: 2, background: `linear-gradient(90deg, transparent, ${c}80, transparent)`, borderRadius: '0 0 4px 4px' }} />
                      <span style={{ fontSize: 20, fontWeight: 900, color: c, fontFamily: "'Space Grotesk', sans-serif", textShadow: `0 0 20px ${c}30` }}>{val}</span>
                      <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

        ) : llmError && !isAnalyzing ? (
          /* ── ERROR STATE ─────────────────────────────────────────────── */
          <motion.div key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 28, padding: '60px 0' }}
          >
            <div style={{
              width: 80, height: 80, borderRadius: 22,
              background: `linear-gradient(135deg, ${P.rose}18, ${P.rose}06)`,
              border: `1px solid ${P.rose}25`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 0 40px ${P.rose}15`,
            }}>
              <AlertCircle size={34} style={{ color: P.rose }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 900, color: 'var(--text-1)', marginBottom: 10 }}>Upload Error</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 420, lineHeight: 1.7 }}>{llmError}</p>
            </div>
            <button
              onClick={() => { setLlmError(null); setFileName(''); }}
              className="g-btn g-btn-outline"
              style={{ gap: 8, fontSize: 13 }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
          </motion.div>

        ) : (
          /* ── UPLOAD STATE ────────────────────────────────────────────── */
          <motion.div key="upload"
            initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          >
            {/* Hero heading */}
            <motion.div style={{ marginBottom: 48 }}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.55 }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <Sparkles size={16} style={{ color: P.indigo }} />
                <span style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: P.indigo }}>
                  AI-Powered Bias Auditing
                </span>
              </div>
              <h1 style={{
                fontFamily: "'Space Grotesk', sans-serif", fontSize: 48, fontWeight: 900,
                lineHeight: 1.12, marginBottom: 20, letterSpacing: '-0.03em',
              }}>
                <span style={{ color: 'var(--text-1)' }}>Detect </span>
                <RotatingWord />
                <span style={{ color: 'var(--text-1)' }}>.</span>
                <br />
                <span style={{ color: 'var(--text-1)' }}>Build </span>
                <span className="gradient-text">Fairness.</span>
              </h1>
              <p style={{ fontSize: 16, color: 'var(--text-2)', maxWidth: 520, margin: '0 auto', lineHeight: 1.8 }}>
                Upload your HR dataset — EquiLens computes real statistical bias metrics,
                then streams <strong style={{ color: P.indigo }}>Gemini 3.1 Pro</strong> analysis for deep insights.
              </p>
            </motion.div>

            {/* Drop zone */}
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
              onDragLeave={() => setIsHovered(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.55 }}
              style={{
                cursor: 'pointer', padding: '60px 52px', borderRadius: 22,
                border: `2px dashed ${isHovered ? P.indigo : 'var(--border-md)'}`,
                background: isHovered
                  ? `linear-gradient(135deg, ${P.sapphire}08, ${P.indigo}06, ${P.violet}04)`
                  : 'var(--gradient-card)',
                boxShadow: isHovered
                  ? `0 0 80px ${P.indigo}15, 0 0 0 1px ${P.indigo}20, var(--shadow-card)`
                  : 'var(--shadow-card)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Corner accents */}
              {[
                { top: 0, left: 0, borderTop: `3px solid ${P.sapphire}`, borderLeft: `3px solid ${P.sapphire}`, borderRadius: '22px 0 0 0' },
                { top: 0, right: 0, borderTop: `3px solid ${P.indigo}`, borderRight: `3px solid ${P.indigo}`, borderRadius: '0 22px 0 0' },
                { bottom: 0, left: 0, borderBottom: `3px solid ${P.emerald}`, borderLeft: `3px solid ${P.emerald}`, borderRadius: '0 0 0 22px' },
                { bottom: 0, right: 0, borderBottom: `3px solid ${P.amber}`, borderRight: `3px solid ${P.amber}`, borderRadius: '0 0 22px 0' },
              ].map((s, i) => (
                <div key={i} style={{
                  position: 'absolute', width: 32, height: 32, ...s,
                  transition: 'all 0.35s',
                  opacity: isHovered ? 1 : 0.6,
                }} />
              ))}

              {/* Background orbs — vivid */}
              {[P.sapphire, P.indigo, P.violet, P.emerald].map((c, i) => (
                <div key={i} style={{
                  position: 'absolute', width: 160, height: 160, borderRadius: '50%',
                  background: c, filter: 'blur(70px)', opacity: isHovered ? 0.08 : 0.04,
                  top: ['5%', '50%', '10%', '48%'][i], left: ['3%', '65%', '58%', '10%'][i],
                  animation: `glow-pulse ${4 + i}s ease-in-out infinite`,
                  animationDelay: `${i * 0.6}s`, pointerEvents: 'none',
                  transition: 'opacity 0.4s',
                }} />
              ))}

              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
                <motion.div
                  animate={isHovered ? { y: -10, scale: 1.12 } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  style={{
                    width: 88, height: 88, borderRadius: 24,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isHovered
                      ? `linear-gradient(135deg, ${P.sapphire}, ${P.indigo}, ${P.violet})`
                      : 'var(--bg-card-2)',
                    border: `1px solid ${isHovered ? 'transparent' : 'var(--border-md)'}`,
                    boxShadow: isHovered
                      ? `0 16px 48px ${P.indigo}50, 0 0 0 1px ${P.indigo}30`
                      : '0 4px 16px rgba(0,0,0,0.2)',
                    transition: 'all 0.4s', color: isHovered ? '#fff' : 'var(--text-3)',
                  }}
                >
                  <Upload size={36} />
                </motion.div>

                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 26, fontWeight: 900, color: 'var(--text-1)', marginBottom: 12, letterSpacing: '-0.02em' }}>
                    Import HR Dataset
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.75, maxWidth: 440 }}>
                    Drop a CSV file — EquiLens will <strong style={{ color: P.sapphire }}>compute real bias metrics</strong>,
                    then use <strong style={{ color: P.emerald }}>Gemini 3.1 Pro</strong> for expert analysis.
                  </p>
                </div>

                {/* Pipeline badges */}
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { label: '① Statistical Analysis', color: P.sapphire },
                    { label: '② Parity Scoring', color: P.indigo },
                    { label: '③ Proxy Detection', color: P.amber },
                    { label: '④ AI Deep Analysis', color: P.violet },
                  ].map(({ label, color }) => (
                    <span key={label} className="badge" style={{
                      background: `${color}12`, border: `1px solid ${color}28`, color,
                      fontSize: 10, padding: '6px 14px',
                      boxShadow: `0 0 8px ${color}08`,
                    }}>{label}</span>
                  ))}
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-3)', marginTop: 6 }}>
                  or{' '}
                  <span style={{ color: P.indigo, textDecoration: 'underline', cursor: 'pointer', fontWeight: 700 }}>
                    click to browse files
                  </span>
                  {' '}· CSV, JSON up to 50MB
                </p>
              </div>
            </motion.div>

            {/* Feature cards */}
            <div style={{ display: 'flex', gap: 18, marginTop: 32, flexWrap: 'wrap' }}>
              <FeatureCard icon={BarChart3} title="Real-Time Analysis"
                desc="Statistical parity, proxy detection, and disparity metrics in milliseconds."
                color={P.sapphire} delay={0.45} />
              <FeatureCard icon={Sparkles} title="AI-Powered Insights"
                desc="Gemini 3.1 Pro generates narrative findings, predictions, and roadmaps."
                color={P.indigo} delay={0.5} />
              <FeatureCard icon={Shield} title="Compliance Reports"
                desc="EEOC/EU AI Act audit reports with PDF export and What-If simulation."
                color={P.emerald} delay={0.55} />
            </div>

            {/* Trust signals */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
              className="g-card"
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 28, marginTop: 28,
                padding: '16px 28px',
              }}
            >
              {[
                { icon: Lock, label: 'End-to-End Encrypted', color: P.sapphire },
                { icon: Sparkles, label: 'Gemini 3.1 Pro', color: P.violet },
                { icon: Shield, label: 'GDPR Compliant', color: P.emerald },
              ].map(({ icon: TIcon, label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 1, height: 18, background: 'var(--border-md)' }} />}
                  <span style={{
                    fontSize: 11, color: 'var(--text-3)', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    display: 'flex', alignItems: 'center', gap: 8,
                  }}>
                    <TIcon size={14} style={{ color }} />
                    {label}
                  </span>
                </React.Fragment>
              ))}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

};
export default UploadZone;
