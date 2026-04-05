import React, { useState, useRef } from 'react';
import { Upload, FileCode, AlertCircle, RefreshCw } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { analyzeCSV } from '../services/csvAnalysis';
import { performFullAudit } from '../services/apiService';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Analysis step definitions ───────────────────────────────────────────── */
const PHASES = [
  { id: 'parsing',    label: 'Parsing CSV structure…',               icon: '📂' },
  { id: 'stats',      label: 'Computing real statistical metrics…',   icon: '📊' },
  { id: 'correlate',  label: 'Detecting proxy variable correlations…', icon: '🔗' },
  { id: 'parity',     label: 'Calculating demographic parity scores…', icon: '⚖️' },
  { id: 'llm',        label: 'GPT-4o bias narrative analysis…',        icon: '🧠' },
  { id: 'done',       label: 'Audit complete — building dashboard…',   icon: '✅' },
];

/* ── Google-color ring component ─────────────────────────────────────────── */
const Ring3D = ({ size, color, animDuration, style = {} }) => (
  <div style={{
    position: 'absolute', width: size, height: size,
    borderRadius: '50%', border: `2px solid ${color}`,
    opacity: 0.5, animation: `spin-slow ${animDuration}s linear infinite`,
    ...style,
  }} />
);

/* ═════════════════════════════════════════════════════════════════════════ */
const UploadZone = () => {
  const {
    setData, setInsights, setIsAnalyzing, isAnalyzing,
    apiKey, setAuditError, auditError,
    setStreamingText, setAnalysisPhase,
  } = useAppContext();

  const [isHovered,  setIsHovered]  = useState(false);
  const [phase,      setPhase]       = useState(0);       // index into PHASES
  const [fileName,   setFileName]    = useState('');
  const [statsReady, setStatsReady]  = useState(null);    // computed stats obj
  const [llmRaw,     setLlmRaw]      = useState('');      // live streaming preview
  const [llmError,   setLlmError]    = useState(null);    // error message
  const [rowCount,   setRowCount]    = useState(0);
  const fileInputRef = useRef(null);
  const GOOGLE = ['#4285F4','#EA4335','#FBBC05','#34A853'];

  const advancePhase = (idx) => {
    setPhase(idx);
    setAnalysisPhase(PHASES[idx]?.id || '');
  };

  /* ── Core processing pipeline ─────────────────────────────────────────── */
  const processFile = async (file) => {
    if (!file) return;
    if (!file.name.match(/\.(csv|json)$/i)) {
      setLlmError('Only .csv and .json files are supported.');
      return;
    }

    setFileName(file.name);
    setIsAnalyzing(true);
    setLlmError(null);
    setAuditError(null);
    setLlmRaw('');
    setStatsReady(null);
    advancePhase(0);

    const reader = new FileReader();
    reader.onload = async () => {
      const text = reader.result || '';

      // ── Phase 0: Parse CSV ─────────────────────────────────────────────
      let headers = [], allRows = [];
      try {
        const rawLines = text.split('\n').filter(l => l.trim());
        const parseLine = (line) => {
          // Handle quoted commas
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
        headers  = rawLines.length > 0 ? parseLine(rawLines[0]) : [];
        allRows  = rawLines.slice(1).map(parseLine).filter(r => r.some(c => c));
        setRowCount(allRows.length);
      } catch (parseErr) {
        setLlmError(`CSV parse error: ${parseErr.message}`);
        setIsAnalyzing(false);
        return;
      }

      await new Promise(r => setTimeout(r, 300));

      // ── Phase 1–3: Real statistical analysis ──────────────────────────
      advancePhase(1);
      await new Promise(r => setTimeout(r, 200));

      let computed;
      try {
        computed = analyzeCSV(headers, allRows);
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

      // ── Build preview data for the dashboard (available immediately) ──
      const head = allRows.slice(0, 5);
      const tail = allRows.length > 10 ? allRows.slice(-5) : [];

      const baseData = {
        fileName: file.name,
        rowCount: allRows.length,
        columnCount: headers.length,
        metrics: computed.metrics,
        approvalRates: computed.approvalRates,
        heatmap: computed.heatmap,
        fingerprint: computed.fingerprint,
        csvPreview: { headers, head, tail, totalRows: allRows.length },
        demographicCols: computed.demographicCols,
        outcomeCols: computed.outcomeCols,
        proxyCols: computed.proxyCols,
        primaryDemographic: computed.primaryDemographic,
        primaryOutcome: computed.primaryOutcome,
        isPartialResult: true, // flag: LLM analysis still pending
      };

      // ── Phase 4: LLM streaming analysis ───────────────────────────────
      advancePhase(4);

      const activeKey = apiKey || import.meta.env.VITE_OPENAI_API_KEY;
      if (!activeKey) {
        // No API key — show computed stats with a warning, no LLM narrative
        setData(baseData);
        setInsights({
          summary: `Statistical analysis complete. ${computed.approvalRates.length} demographic groups detected across ${allRows.length} records. Demographic Parity Score: ${computed.metrics.parity}/100. Add an OpenAI API Key in Settings for AI-generated insights and recommendations.`,
          riskLevel: computed.metrics.parity < 65 ? 'CRITICAL' : computed.metrics.parity < 80 ? 'HIGH' : computed.metrics.parity < 90 ? 'MEDIUM' : 'LOW',
          keyFindings: [
            `Demographic Parity Score is ${computed.metrics.parity}/100 (EEOC threshold: 80/100).`,
            `${computed.approvalRates.length} groups detected. Highest: ${computed.approvalRates[0]?.group} at ${computed.approvalRates[0]?.rate}%.`,
            computed.approvalRates.length > 1
              ? `Lowest group: ${computed.approvalRates[computed.approvalRates.length-1]?.group} at ${computed.approvalRates[computed.approvalRates.length-1]?.rate}%.`
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

      // Stream the LLM response live
      try {
        let streamBuffer = '';
        const llmResult = await performFullAudit(activeKey, computed, (chunk) => {
          streamBuffer = chunk;
          setLlmRaw(chunk);
          setStreamingText(chunk);
        });

        // ── Merge LLM narrative with computed stats ────────────────────
        const finalData = {
          ...baseData,
          isPartialResult: false,
        };

        const finalInsights = {
          summary:      llmResult.summary      || 'Analysis complete.',
          riskLevel:    llmResult.riskLevel     || 'HIGH',
          keyFindings:  llmResult.keyFindings   || [],
          predictions:  llmResult.predictions   || [],
          suggestions:  llmResult.suggestions   || [],
          transparency: llmResult.transparencyScore || computed.fingerprint[5],
        };

        // Update fingerprint transparency from LLM
        if (llmResult.transparencyScore) {
          finalData.fingerprint = [...computed.fingerprint];
          finalData.fingerprint[5] = Math.min(100, Math.max(0, llmResult.transparencyScore));
        }

        advancePhase(5);
        await new Promise(r => setTimeout(r, 300));
        setData(finalData);
        setInsights(finalInsights);
        setStreamingText('');

      } catch (llmErr) {
        console.error('LLM audit failed:', llmErr);
        // Show computed stats with an error notice — don't silently mock
        setLlmError(`AI narrative failed: ${llmErr.message}`);
        setAuditError(llmErr.message);
        setData({
          ...baseData,
          isPartialResult: false,
        });
        setInsights({
          summary: `Statistical analysis complete with ${allRows.length} rows. AI narrative unavailable: ${llmErr.message.slice(0, 120)}`,
          riskLevel: computed.metrics.parity < 65 ? 'CRITICAL' : computed.metrics.parity < 80 ? 'HIGH' : 'MEDIUM',
          keyFindings: [
            `Demographic Parity Score: ${computed.metrics.parity}/100 (EEOC threshold: 80).`,
            `Highest approval group: ${computed.approvalRates[0]?.group ?? 'N/A'} at ${computed.approvalRates[0]?.rate ?? 0}%.`,
            `Lowest approval group: ${computed.approvalRates[computed.approvalRates.length-1]?.group ?? 'N/A'} at ${computed.approvalRates[computed.approvalRates.length-1]?.rate ?? 0}%.`,
            `Disparity gap: ${(Math.max(...computed.approvalRates.map(r=>r.rate)) - Math.min(...computed.approvalRates.map(r=>r.rate)))} percentage points.`,
            `Proxy variables detected: ${computed.proxyCols.join(', ') || 'none'}.`,
          ],
          predictions: ['Verify API key and retry for AI-powered predictions.'],
          suggestions: ['Check your OpenAI API key in Settings and re-upload the file for full AI analysis.'],
        });
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsText(file);
  };

  const handleFileSelect = (e) => { processFile(e.target.files?.[0]); e.target.value = ''; };
  const handleDrop = (e) => { e.preventDefault(); setIsHovered(false); processFile(e.dataTransfer?.files?.[0]); };

  /* ── Streaming preview text — extract JSON tokens for display ─────────── */
  const streamPreview = llmRaw
    ? llmRaw
        .replace(/[{}[\]"]/g, ' ')
        .replace(/\s+/g, ' ')
        .slice(-180)
        .trim()
    : '';

  return (
    <div style={{ width: '100%', maxWidth: 720, textAlign: 'center' }}>
      <input ref={fileInputRef} type="file" accept=".csv,.json" style={{ display: 'none' }} onChange={handleFileSelect} />

      <AnimatePresence mode="wait">
        {isAnalyzing ? (
          /* ── ANALYZING STATE ──────────────────────────────────────────── */
          <motion.div key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 32, padding: '60px 0' }}
          >
            {/* 3D ring scanner */}
            <div style={{ position: 'relative', width: 160, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {GOOGLE.map((c, i) => (
                <div key={i} style={{
                  position: 'absolute', width: 56, height: 56, borderRadius: '50%',
                  background: c, filter: 'blur(20px)', opacity: 0.2,
                  transform: `rotate(${i * 90}deg) translateX(56px)`,
                  animation: `glow-pulse ${2 + i * 0.4}s ease-in-out infinite`,
                  animationDelay: `${i * 0.5}s`,
                }} />
              ))}
              <Ring3D size={155} color="#4285F4" animDuration={4} style={{ top: 3, left: 3 }} />
              <Ring3D size={128} color="#EA4335" animDuration={6} style={{ top: 16, left: 16, animationDirection: 'reverse' }} />
              <Ring3D size={100} color="#FBBC05" animDuration={3} style={{ top: 30, left: 30 }} />
              <Ring3D size={76}  color="#34A853" animDuration={5} style={{ top: 42, left: 42, animationDirection: 'reverse' }} />
              <div style={{
                position: 'absolute', left: '10%', right: '10%',
                height: 1.5, background: 'linear-gradient(90deg, transparent, #4285F4, transparent)',
                boxShadow: '0 0 8px #4285F4', animation: 'scan-line 1.8s ease-in-out infinite',
              }} />
              <FileCode size={30} style={{ color: '#4285F4', opacity: 0.7, position: 'relative', zIndex: 2 }} />
            </div>

            {/* Status */}
            <div style={{ width: '100%', maxWidth: 500, textAlign: 'center' }}>
              <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, marginBottom: 6, color: 'var(--text-1)' }}>
                {phase < 4 ? 'Statistical Analysis Running' : phase < 5 ? 'Gemini 3.1 pro Live Analysis' : 'Finalizing Dashboard'}
              </h2>
              {fileName && (
                <p style={{ fontSize: 12, color: 'var(--text-3)', fontFamily: 'monospace', marginBottom: 12 }}>
                  {fileName}{rowCount > 0 ? ` · ${rowCount.toLocaleString()} rows` : ''}
                </p>
              )}

              {/* Current step */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 16 }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#4285F4', animation: 'pulse 1.2s infinite' }} />
                <AnimatePresence mode="wait">
                  <motion.span key={phase}
                    initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.18 }}
                    style={{ fontSize: 14, color: 'var(--text-2)', fontWeight: 500 }}
                  >
                    {PHASES[phase]?.icon} {PHASES[phase]?.label}
                  </motion.span>
                </AnimatePresence>
              </div>

              {/* Step dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 5, marginBottom: 20 }}>
                {PHASES.map((p, i) => (
                  <div key={i} style={{
                    width: i <= phase ? 20 : 6, height: 6, borderRadius: 99,
                    background: i <= phase ? GOOGLE[i % 4] : 'var(--bg-card-3)',
                    transition: 'all 0.4s',
                  }} title={p.label} />
                ))}
              </div>

              {/* Live streaming preview — shown only during LLM phase */}
              {phase === 4 && streamPreview && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                  style={{
                    background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.15)',
                    borderRadius: 10, padding: '10px 14px', marginTop: 8,
                    fontFamily: 'monospace', fontSize: 11, color: 'var(--text-3)',
                    textAlign: 'left', lineHeight: 1.6, wordBreak: 'break-all',
                    maxHeight: 90, overflow: 'hidden',
                  }}
                >
                  <span style={{ color: '#4285F4', fontWeight: 700 }}>Gemini3.1 pro » </span>
                  {streamPreview}<span style={{ animation: 'pulse 1s infinite', display: 'inline-block', width: 6, height: 12, background: '#4285F4', verticalAlign: 'middle', marginLeft: 2, borderRadius: 2 }} />
                </motion.div>
              )}

              {/* Stats ready badge */}
              {statsReady && phase >= 4 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 16, flexWrap: 'wrap' }}
                >
                  {[
                    { label: 'Parity', val: `${statsReady.metrics.parity}/100`, c: statsReady.metrics.parity < 80 ? '#EA4335' : '#34A853' },
                    { label: 'Groups', val: statsReady.approvalRates.length, c: '#4285F4' },
                    { label: 'Proxies', val: statsReady.proxyCols.length, c: '#FBBC05' },
                    { label: 'Fairness', val: `${statsReady.metrics.fairnessScore}/10`, c: '#34A853' },
                  ].map(({ label, val, c }) => (
                    <div key={label} style={{
                      display: 'flex', flexDirection: 'column', alignItems: 'center',
                      background: 'var(--bg-card)', border: '1px solid var(--border)',
                      borderRadius: 10, padding: '8px 14px',
                    }}>
                      <span style={{ fontSize: 16, fontWeight: 800, color: c, fontFamily: "'Space Grotesk', sans-serif" }}>{val}</span>
                      <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</span>
                    </div>
                  ))}
                </motion.div>
              )}
            </div>
          </motion.div>

        ) : llmError && !isAnalyzing ? (
          /* ── ERROR / WARNING STATE ────────────────────────────────────── */
          <motion.div key="error"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, padding: '60px 0' }}
          >
            <div style={{ width: 64, height: 64, borderRadius: 20, background: 'rgba(234,67,53,0.1)', border: '1px solid rgba(234,67,53,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertCircle size={28} style={{ color: '#EA4335' }} />
            </div>
            <div>
              <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 18, fontWeight: 700, color: 'var(--text-1)', marginBottom: 6 }}>Upload Error</h3>
              <p style={{ fontSize: 13, color: 'var(--text-2)', maxWidth: 400, lineHeight: 1.6 }}>{llmError}</p>
            </div>
            <button
              onClick={() => { setLlmError(null); setFileName(''); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 22px', borderRadius: 10, border: '1px solid rgba(234,67,53,0.3)', background: 'rgba(234,67,53,0.1)', color: '#EA4335', cursor: 'pointer', fontWeight: 600, fontSize: 13 }}
            >
              <RefreshCw size={14} /> Try Again
            </button>
          </motion.div>

        ) : (
          /* ── UPLOAD STATE ─────────────────────────────────────────────── */
          <motion.div key="upload"
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }} transition={{ duration: 0.4 }}
          >
            {/* Hero heading */}
            <div style={{ marginBottom: 40 }}>
              <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 38, fontWeight: 800, lineHeight: 1.2, marginBottom: 12 }}>
                <span className="gradient-text">Detect Bias.</span>{' '}
                <span style={{ color: 'var(--text-1)' }}>Build Fairness.</span>
              </h1>
              <p style={{ fontSize: 15, color: 'var(--text-2)', maxWidth: 480, margin: '0 auto', lineHeight: 1.7 }}>
                Upload your HR dataset — EquiLens computes real statistical bias metrics instantly,
                then streams Gemini 3.1 pro analysis for deep insights and a remediation roadmap.
              </p>
            </div>

            {/* Drop zone */}
            <motion.div
              onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
              onDragLeave={() => setIsHovered(false)}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              animate={isHovered ? { scale: 1.015 } : { scale: 1 }}
              transition={{ duration: 0.2 }}
              style={{
                cursor: 'pointer', padding: '52px 48px', borderRadius: 16,
                border: `2px dashed ${isHovered ? '#4285F4' : 'var(--border-md)'}`,
                background: isHovered ? 'rgba(66,133,244,0.04)' : 'var(--bg-card)',
                boxShadow: isHovered ? '0 0 48px rgba(66,133,244,0.12), var(--shadow-card)' : 'var(--shadow-card)',
                transition: 'all 0.25s', position: 'relative', overflow: 'hidden',
              }}
            >
              {/* Corner accents */}
              {[
                { top: 0, left: 0, borderTop: `3px solid #4285F4`, borderLeft: `3px solid #4285F4`, borderRadius: '16px 0 0 0' },
                { top: 0, right: 0, borderTop: `3px solid #EA4335`, borderRight: `3px solid #EA4335`, borderRadius: '0 16px 0 0' },
                { bottom: 0, left: 0, borderBottom: `3px solid #34A853`, borderLeft: `3px solid #34A853`, borderRadius: '0 0 0 16px' },
                { bottom: 0, right: 0, borderBottom: `3px solid #FBBC05`, borderRight: `3px solid #FBBC05`, borderRadius: '0 0 16px 0' },
              ].map((s, i) => (
                <div key={i} style={{ position: 'absolute', width: 24, height: 24, ...s }} />
              ))}

              {/* Background orbs */}
              {GOOGLE.map((c, i) => (
                <div key={i} style={{
                  position: 'absolute', width: 120, height: 120, borderRadius: '50%',
                  background: c, filter: 'blur(50px)', opacity: 0.06,
                  top: ['10%','60%','15%','55%'][i], left: ['5%','70%','65%','15%'][i],
                  animation: `glow-pulse ${4 + i}s ease-in-out infinite`, animationDelay: `${i * 0.8}s`,
                  pointerEvents: 'none',
                }} />
              ))}

              <div style={{ position: 'relative', zIndex: 2, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
                <motion.div
                  animate={isHovered ? { y: -6, scale: 1.08 } : { y: 0, scale: 1 }}
                  transition={{ duration: 0.25 }}
                  style={{
                    width: 72, height: 72, borderRadius: 20,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: isHovered ? 'linear-gradient(135deg, #4285F4, #34A853)' : 'var(--bg-card-2)',
                    border: `1px solid ${isHovered ? 'transparent' : 'var(--border-md)'}`,
                    boxShadow: isHovered ? '0 8px 32px rgba(66,133,244,0.4)' : 'none',
                    transition: 'all 0.3s', color: isHovered ? '#fff' : 'var(--text-3)',
                  }}
                >
                  <Upload size={30} />
                </motion.div>

                <div>
                  <h2 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 22, fontWeight: 700, color: 'var(--text-1)', marginBottom: 8 }}>
                    Import HR Dataset
                  </h2>
                  <p style={{ fontSize: 14, color: 'var(--text-2)', lineHeight: 1.6, maxWidth: 400 }}>
                    Drop a CSV file — EquiLens will <strong style={{ color: '#4285F4' }}>statistically compute</strong> real bias
                    metrics, then use <strong style={{ color: '#34A853' }}>GPT-4o streaming</strong> for expert analysis.
                  </p>
                </div>

                {/* Pipeline badges */}
                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[
                    { label: '① Real CSV Stats', color: '#4285F4' },
                    { label: '② Parity Calc',    color: '#EA4335' },
                    { label: '③ Proxy Detect',   color: '#FBBC05' },
                    { label: '④ GPT-4o Stream',  color: '#34A853' },
                  ].map(({ label, color }) => (
                    <span key={label} className="badge" style={{
                      background: `${color}14`, border: `1px solid ${color}30`, color,
                    }}>{label}</span>
                  ))}
                </div>

                <p style={{ fontSize: 12, color: 'var(--text-3)' }}>
                  or{' '}
                  <span style={{ color: '#4285F4', textDecoration: 'underline', cursor: 'pointer', fontWeight: 600 }}>
                    click to browse files
                  </span>
                  {' '}· CSV, JSON up to 50MB
                </p>
              </div>
            </motion.div>

            {/* Trust signals */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 20, marginTop: 24 }}>
              {[
                { label: 'End-to-End Encrypted', color: '#4285F4' },
                { label: 'LangChain + Gemini ',   color: '#34A853' },
                { label: 'GDPR Safe',            color: '#FBBC05' },
              ].map(({ label, color }, i) => (
                <React.Fragment key={label}>
                  {i > 0 && <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-md)' }} />}
                  <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 5, height: 5, borderRadius: '50%', background: color }} />
                    {label}
                  </span>
                </React.Fragment>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UploadZone;
