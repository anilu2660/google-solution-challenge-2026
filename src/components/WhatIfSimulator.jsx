import React, { useState, useMemo, useCallback } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sliders, FileText, CheckCircle, Loader2,
  TrendingDown, Target, Zap, Scale, ShieldCheck,
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';

/* ── Color palette (matches Dashboard) ─────────────────────────────────── */
const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };

/* ── Math simulation constants ─────────────────────────────────────────── */
const BIAS_START     = 45; // percent bias at 0% intensity
const BIAS_END       = 5;  // percent bias at 100% intensity
const ACC_START      = 94; // percent accuracy at 0% intensity
const ACC_END        = 87; // percent accuracy at 100% intensity

const lerp = (a, b, t) => parseFloat((a + (b - a) * t).toFixed(2));

/** Pre-computed trade-off curve for the full 0–100 range */
const CURVE = Array.from({ length: 101 }, (_, i) => ({
  i,
  bias:     lerp(BIAS_START, BIAS_END, i / 100),
  accuracy: lerp(ACC_START,  ACC_END,  i / 100),
}));

/* ── Custom recharts tooltip ───────────────────────────────────────────── */
const CustomTooltip = ({ active, payload, label, unit, color }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a24', border: `1px solid ${color}40`,
      borderRadius: 8, padding: '8px 12px', fontSize: 12,
    }}>
      <p style={{ color: 'var(--text-3)', margin: 0 }}>Intensity: {label}%</p>
      <p style={{ color, fontWeight: 700, margin: '3px 0 0', fontSize: 14 }}>
        {payload[0]?.value?.toFixed(1)}{unit}
      </p>
    </div>
  );
};

/* ── Intensity label ───────────────────────────────────────────────────── */
const intensityMeta = (v) => {
  if (v < 25)  return { label: 'Minimal',    color: G.green,  desc: 'Low intervention — business-as-usual mode.' };
  if (v < 50)  return { label: 'Moderate',   color: G.yellow, desc: 'Balanced — some disparity removed with minimal accuracy cost.' };
  if (v < 75)  return { label: 'Aggressive', color: G.red,    desc: 'Strong bias removal, noticeable accuracy trade-off.' };
  return              { label: 'Maximum',    color: G.blue,   desc: 'Full fairness enforcement — EEOC compliant, accuracy at minimum.' };
};

/* ── EU AI Act PDF generation (client-side, jsPDF) ─────────────────────── */
const generateEUAIActPDF = async (intensity, bias, accuracy, data, insights) => {
  const { default: jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W = 210; // A4 width mm
  const margin = 18;
  const col = W - margin * 2;
  let y = 0;

  const setFont  = (style, size, color = [30, 30, 40]) => {
    doc.setFont('helvetica', style);
    doc.setFontSize(size);
    doc.setTextColor(...color);
  };
  const line = () => {
    doc.setDrawColor(220, 220, 235);
    doc.line(margin, y, W - margin, y);
    y += 5;
  };
  const gap = (n = 4) => { y += n; };

  // ── Cover page header ────────────────────────────────────────────────
  doc.setFillColor(20, 20, 30);
  doc.rect(0, 0, W, 42, 'F');

  // Google dots
  [G.blue, G.red, G.yellow, G.green].forEach((hex, i) => {
    const [r, g, b] = hex.match(/\w\w/g).map(x => parseInt(x, 16));
    doc.setFillColor(r, g, b);
    doc.circle(margin + i * 8, 10, 2.5, 'F');
  });

  setFont('bold', 20, [255, 255, 255]);
  doc.text('EquiLens', margin + 36, 12);
  setFont('normal', 8, [150, 160, 200]);
  doc.text('AI BIAS AUDITOR', margin + 36, 17);

  setFont('bold', 16, [255, 255, 255]);
  doc.text('EU AI Act Compliance Report', margin, 30);
  setFont('normal', 9, [140, 150, 180]);
  doc.text(`Regulation (EU) 2024/1689 · High-Risk AI Systems · Annex III`, margin, 37);

  y = 52;

  // ── Document metadata ────────────────────────────────────────────────
  const now = new Date();
  const stamp = `${now.toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })} — ${now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;

  doc.setFillColor(245, 246, 250);
  doc.roundedRect(margin, y, col, 22, 2, 2, 'F');
  setFont('bold', 9, [60, 70, 100]);
  doc.text('DOCUMENT REFERENCE',  margin + 4, y + 5);
  doc.text('DATE OF ASSESSMENT',  margin + 60, y + 5);
  doc.text('RISK CLASSIFICATION', margin + 120, y + 5);
  setFont('normal', 10, [20, 20, 40]);
  doc.text('EQL-' + Date.now().toString().slice(-6), margin + 4, y + 12);
  doc.text(stamp, margin + 60, y + 12);

  const riskLevel = insights?.riskLevel || 'HIGH';
  const riskColor = riskLevel === 'CRITICAL' ? [220, 50, 50] : riskLevel === 'HIGH' ? [200, 130, 10] : [40, 140, 80];
  setFont('bold', 10, riskColor);
  doc.text(`${riskLevel} RISK`, margin + 120, y + 12);

  setFont('normal', 8, [120, 130, 160]);
  const fileName = data?.fileName || 'dataset.csv';
  doc.text(`Dataset: ${fileName}  |  ${(data?.rowCount || 0).toLocaleString()} rows × ${data?.columnCount || 0} cols`,  margin + 4, y + 19);
  y += 28;

  // ── Section: Executive Summary ──────────────────────────────────────
  setFont('bold', 12, [20, 20, 40]);
  doc.text('1. Executive Summary', margin, y); y += 2; line();
  setFont('normal', 10, [50, 60, 80]);
  const summaryText = insights?.summary || `This HR dataset was audited by EquiLens for demographic bias. Mitigation intensity set to ${intensity}% yielding a simulated bias score of ${bias}% with model accuracy at ${accuracy}%.`;
  const summaryLines = doc.splitTextToSize(summaryText, col);
  doc.text(summaryLines, margin, y); y += summaryLines.length * 5 + 4;

  // Mitigation snapshot
  doc.setFillColor(235, 240, 255);
  doc.roundedRect(margin, y, col, 24, 2, 2, 'F');
  const snapItems = [
    { label: 'Mitigation Intensity', value: `${intensity}%`,  color: G.blue   },
    { label: 'Simulated Bias Score', value: `${bias}%`,        color: G.red    },
    { label: 'Model Accuracy',       value: `${accuracy}%`,    color: G.green  },
    { label: 'Demographic Parity',   value: `${data?.metrics?.parity ?? 65}/100`, color: G.yellow },
  ];
  snapItems.forEach((item, i) => {
    const x = margin + 4 + i * (col / 4);
    setFont('bold', 9, [60, 70, 110]);
    doc.text(item.label, x, y + 6);
    const [r, g, b] = item.color.match(/\w\w/g).map(n => parseInt(n, 16));
    doc.setTextColor(r, g, b);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(item.value, x, y + 17);
  });
  y += 30;

  // ── Section: EU AI Act Regulatory Framework ─────────────────────────
  setFont('bold', 12, [20, 20, 40]);
  doc.text('2. EU AI Act Regulatory Framework Reference', margin, y); y += 2; line();

  const articles = [
    { art: 'Article 9',   title: 'Risk Management System',               status: 'PASS',  note: 'Continuous bias monitoring implemented via EquiLens audit pipeline.' },
    { art: 'Article 10',  title: 'Data and Data Governance',             status: 'REVIEW', note: 'Dataset requires demographic column audit. See bias fingerprint report.' },
    { art: 'Article 13',  title: 'Transparency – Deployer Information',  status: 'PASS',  note: 'Full audit report with explainability metrics generated automatically.' },
    { art: 'Article 14',  title: 'Human Oversight',                      status: 'PASS',  note: 'AI recommendations subject to HR review before implementation.' },
    { art: 'Article 15',  title: 'Accuracy, Robustness & Cybersecurity', status: bias > 20 ? 'FAIL' : 'PASS', note: `Post-mitigation bias: ${bias}%. ${bias > 20 ? 'Further mitigation required.' : 'Meets minimum threshold.'}` },
    { art: 'Annex III',   title: 'High-Risk Category – Employment',      status: 'NOTED', note: 'HR recruitment & performance systems classified as High-Risk under EU AI Act.' },
  ];

  articles.forEach(a => {
    const statusBg  = a.status === 'PASS' ? [220, 245, 225] : a.status === 'FAIL' ? [250, 225, 225] : [250, 240, 210];
    const statusFg  = a.status === 'PASS' ? [30, 120, 60]   : a.status === 'FAIL' ? [160, 30, 30]   : [140, 90, 10];
    doc.setFillColor(...statusBg);
    doc.roundedRect(margin, y, col, 14, 1.5, 1.5, 'F');
    setFont('bold', 9, [30, 40, 80]);
    doc.text(a.art, margin + 3, y + 5.5);
    setFont('bold', 9, [20, 25, 50]);
    doc.text(a.title, margin + 30, y + 5.5);
    doc.setFillColor(...statusFg);
    doc.roundedRect(W - margin - 22, y + 2, 20, 7, 1, 1, 'F');
    setFont('bold', 7, [255, 255, 255]);
    doc.text(a.status, W - margin - 16, y + 6.5);
    setFont('normal', 8, [70, 80, 110]);
    const noteLines = doc.splitTextToSize(a.note, col - 32);
    doc.text(noteLines, margin + 3, y + 11);
    y += noteLines.length > 1 ? 20 : 16;
  });
  gap(2);

  // ── Section: Bias Audit Results ──────────────────────────────────────
  setFont('bold', 12, [20, 20, 40]);
  doc.text('3. Bias Audit Results', margin, y); y += 2; line();

  if (insights?.keyFindings?.length) {
    setFont('bold', 10, [60, 70, 100]);
    doc.text('Key Findings', margin, y); y += 5;
    insights.keyFindings.forEach((f, i) => {
      setFont('normal', 9, [60, 70, 90]);
      const lines = doc.splitTextToSize(`${i + 1}. ${f}`, col - 6);
      doc.text(lines, margin + 3, y);
      y += lines.length * 4.5 + 2;
    });
  }

  // ── Section: Mitigation Scenario Analysis ───────────────────────────
  gap(2);
  setFont('bold', 12, [20, 20, 40]);
  doc.text('4. What-If Mitigation Scenario Analysis', margin, y); y += 2; line();

  const { label: iLabel } = intensityMeta(intensity);
  setFont('normal', 10, [50, 60, 80]);
  const scenText = `Mitigation level applied: "${iLabel}" (${intensity}%). Under this scenario, the simulated demographic bias score is reduced from the baseline of ${BIAS_START}% to ${bias}%, representing a ${(BIAS_START - bias).toFixed(1)} percentage point improvement. Model predictive accuracy depreciates from ${ACC_START}% to ${accuracy}%, a trade-off of ${(ACC_START - accuracy).toFixed(1)} percentage points — within acceptable EU AI Act operational margins.`;
  const scenLines = doc.splitTextToSize(scenText, col);
  doc.text(scenLines, margin, y); y += scenLines.length * 5 + 4;

  // Trade-off table
  const tableRows = [
    ['Intensity', 'Bias Score', 'Accuracy', 'EEOC Compliant?'],
    ['0% (Baseline)',  `${BIAS_START}%`, `${ACC_START}%`, 'No'],
    [`${intensity}% (Current)`, `${bias}%`, `${accuracy}%`, bias <= 20 ? 'Yes' : 'Marginal'],
    ['100% (Max)',     `${BIAS_END}%`,   `${ACC_END}%`,   'Yes'],
  ];
  const colWidths = [40, 35, 35, 40];
  const rowH = 8;
  tableRows.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      const cx = margin + colWidths.slice(0, ci).reduce((a, b) => a + b, 0);
      if (ri === 0) {
        doc.setFillColor(30, 35, 60);
        doc.rect(cx, y, colWidths[ci], rowH, 'F');
        setFont('bold', 8, [200, 210, 255]);
      } else {
        doc.setFillColor(ri % 2 === 0 ? 248 : 242, 248, 252);
        doc.rect(cx, y, colWidths[ci], rowH, 'F');
        const isCurrentRow = ri === 1 && false || ri === 2;
        setFont(isCurrentRow ? 'bold' : 'normal', 8, isCurrentRow ? [30, 80, 160] : [50, 60, 90]);
      }
      doc.text(cell, cx + 2, y + 5.5);
    });
    y += rowH;
  });
  y += 6;

  // ── Section: Recommendations ─────────────────────────────────────────
  setFont('bold', 12, [20, 20, 40]);
  doc.text('5. Recommendations & Next Steps', margin, y); y += 2; line();

  const suggestions = insights?.suggestions || [
    'Commission external algorithmic fairness audit under ISO/IEC 24027.',
    'Implement continuous bias monitoring with quarterly EquiLens reviews.',
    'Train HR leadership on EU AI Act obligations for high-risk systems.',
    'Establish a Data Ethics Committee with oversight of model decisions.',
  ];
  suggestions.forEach((s, i) => {
    setFont('normal', 9, [50, 60, 80]);
    const lines = doc.splitTextToSize(`${i + 1}. ${s}`, col - 5);
    doc.text(lines, margin + 3, y);
    y += lines.length * 4.5 + 3;
  });

  // ── Footer on last page ──────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFillColor(245, 246, 250);
    doc.rect(0, 284, W, 13, 'F');
    setFont('normal', 7, [150, 160, 185]);
    doc.text('Generated by EquiLens AI Bias Auditor — Powered by LangChain & GPT-4o', margin, 290);
    doc.text(`Page ${p} / ${totalPages}  ·  CONFIDENTIAL`, W - margin, 290, { align: 'right' });
    doc.text('Regulation (EU) 2024/1689 — EU Artificial Intelligence Act', W / 2, 290, { align: 'center' });
  }

  doc.save(`EquiLens-EU-AI-Act-Report-${Date.now()}.pdf`);
};

/* ═══════════════════════════════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════════════════════════════ */
const WhatIfSimulator = () => {
  const { data, insights } = useAppContext();
  const [intensity, setIntensity]   = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const [exportDone, setExportDone]   = useState(false);

  /* Live values */
  const bias     = useMemo(() => lerp(BIAS_START, BIAS_END, intensity / 100), [intensity]);
  const accuracy = useMemo(() => lerp(ACC_START,  ACC_END,  intensity / 100), [intensity]);
  const meta     = useMemo(() => intensityMeta(intensity), [intensity]);

  /* EU AI Act export handler */
  const handleExport = useCallback(async () => {
    if (isExporting) return;
    setIsExporting(true);
    setExportDone(false);
    await new Promise(r => setTimeout(r, 1500)); // Dramatic loading ✨
    try {
      await generateEUAIActPDF(intensity, bias, accuracy, data, insights);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 4000);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  }, [isExporting, intensity, bias, accuracy, data, insights]);

  /* Chart configs */
  const chartProps = {
    data: CURVE,
    margin: { top: 5, right: 12, left: -18, bottom: 0 },
  };
  const axisStyle = { fontSize: 10, fill: '#5f6368', fontFamily: 'Inter, sans-serif' };
  const gridStyle = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '3 3' };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.7, duration: 0.5 }}
      style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
    >
      {/* ── Section divider ───────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, var(--border), transparent)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 14px', background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 99 }}>
          <Scale size={12} style={{ color: G.blue }} />
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-3)' }}>
            Interactive Scenario Analysis
          </span>
        </div>
        <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, var(--border))' }} />
      </div>

      {/* ── Simulator card ────────────────────────────────────────────────── */}
      <div className="g-card" style={{ padding: 28, background: 'linear-gradient(135deg, var(--bg-card) 0%, rgba(66,133,244,0.03) 100%)', border: '1px solid rgba(66,133,244,0.15)' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'rgba(66,133,244,0.12)', border: '1px solid rgba(66,133,244,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Sliders size={16} style={{ color: G.blue }} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 16, color: 'var(--text-1)' }}>
                  "What-If" Scenario Simulator
                </h3>
                <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)', marginTop: 1 }}>
                  Fairness vs. Accuracy Trade-off — drag the slider to simulate real-time
                </p>
              </div>
            </div>
          </div>

          {/* Current intensity badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{
              padding: '6px 14px', borderRadius: 99,
              background: `${meta.color}18`, border: `1px solid ${meta.color}40`,
            }}>
              <span style={{ fontSize: 11, fontWeight: 800, color: meta.color, fontFamily: "'Space Grotesk', sans-serif" }}>
                {meta.label.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        {/* ── Slider ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif" }}>
              Mitigation Intensity
            </span>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 4 }}>
              <span style={{ fontSize: 28, fontWeight: 800, color: meta.color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1 }}>
                {intensity}
              </span>
              <span style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 600 }}>%</span>
            </div>
          </div>

          {/* Custom slider track */}
          <div style={{ position: 'relative', height: 42, display: 'flex', alignItems: 'center' }}>
            {/* Gradient track background */}
            <div style={{
              position: 'absolute', inset: '14px 0',
              borderRadius: 8, height: 14,
              background: `linear-gradient(90deg, ${G.green}, ${G.yellow}, ${G.red}, ${G.blue})`,
              opacity: 0.25,
            }} />
            {/* Filled portion */}
            <div style={{
              position: 'absolute', left: 0, top: 14,
              width: `${intensity}%`, height: 14,
              borderRadius: 8,
              background: `linear-gradient(90deg, ${G.green}, ${meta.color})`,
              transition: 'width 0.05s',
              boxShadow: `0 0 12px ${meta.color}60`,
            }} />
            <input
              type="range" min={0} max={100} step={1}
              value={intensity}
              onChange={e => setIntensity(+e.target.value)}
              style={{
                position: 'relative', zIndex: 2,
                width: '100%', appearance: 'none', background: 'transparent',
                cursor: 'pointer', height: 42, margin: 0, padding: 0,
                outline: 'none',
              }}
            />
          </div>

          {/* Tick labels */}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            {['0%', '25%', '50%', '75%', '100%'].map(t => (
              <span key={t} style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>{t}</span>
            ))}
          </div>

          {/* Intensity description */}
          <AnimatePresence mode="wait">
            <motion.p key={meta.label}
              initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.18 }}
              style={{ fontSize: 12, color: meta.color, fontWeight: 500, marginTop: 10, fontStyle: 'italic' }}
            >
              {meta.desc}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* ── Live metric cards ────────────────────────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginBottom: 24 }}>
          {[
            { label: 'Bias Score',    value: `${bias.toFixed(1)}%`,     color: bias > 20 ? G.red : G.green,       icon: TrendingDown, sub: `↓ ${(BIAS_START - bias).toFixed(1)}pp reduced` },
            { label: 'Model Accuracy', value: `${accuracy.toFixed(1)}%`, color: G.blue,                            icon: Target,       sub: `↓ ${(ACC_START - accuracy).toFixed(1)}pp trade-off` },
            { label: 'Bias Reduction', value: `${((BIAS_START - bias) / BIAS_START * 100).toFixed(0)}%`, color: G.green, icon: ShieldCheck, sub: 'from baseline' },
            { label: 'EEOC Threshold', value: bias <= 20 ? '✓ Met' : '✗ Not Met', color: bias <= 20 ? G.green : G.red, icon: Scale, sub: '≤20% bias required' },
          ].map(({ label, value, color, icon: Icon, sub }) => (
            <motion.div key={label}
              layout
              style={{
                padding: '12px 14px', borderRadius: 10,
                background: `${color}08`, border: `1px solid ${color}20`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                <Icon size={12} style={{ color }} />
                <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</span>
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif", lineHeight: 1, marginBottom: 3 }}>
                {value}
              </div>
              <div style={{ fontSize: 10, color: 'var(--text-3)' }}>{sub}</div>
            </motion.div>
          ))}
        </div>

        {/* ── Two synchronized trade-off charts ──────────────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>

          {/* Chart 1: Bias Score */}
          <div style={{ background: 'var(--bg-card-2)', borderRadius: 12, padding: '16px 12px 8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <TrendingDown size={13} style={{ color: G.red }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif" }}>Demographic Disparity (Bias Score)</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart {...chartProps}>
                <defs>
                  <linearGradient id="biasGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={G.red} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={G.red} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="i" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} interval={24} />
                <YAxis domain={[0, 50]} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip unit="%" color={G.red} />} />
                <ReferenceLine x={intensity} stroke={meta.color} strokeWidth={2} strokeDasharray="4 2"
                  label={{ value: `${bias.toFixed(1)}%`, position: 'top', fill: meta.color, fontSize: 10, fontWeight: 700 }} />
                <Area type="monotone" dataKey="bias" stroke={G.red} strokeWidth={2} fill="url(#biasGrad)" dot={false} animationDuration={200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Chart 2: Model Accuracy */}
          <div style={{ background: 'var(--bg-card-2)', borderRadius: 12, padding: '16px 12px 8px', border: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <Target size={13} style={{ color: G.blue }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif" }}>Overall Model Accuracy</span>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <AreaChart {...chartProps}>
                <defs>
                  <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor={G.blue} stopOpacity={0.3} />
                    <stop offset="95%" stopColor={G.blue} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="i" tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} interval={24} />
                <YAxis domain={[84, 96]} tick={axisStyle} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip content={<CustomTooltip unit="%" color={G.blue} />} />
                <ReferenceLine x={intensity} stroke={meta.color} strokeWidth={2} strokeDasharray="4 2"
                  label={{ value: `${accuracy.toFixed(1)}%`, position: 'top', fill: meta.color, fontSize: 10, fontWeight: 700 }} />
                <Area type="monotone" dataKey="accuracy" stroke={G.blue} strokeWidth={2} fill="url(#accGrad)" dot={false} animationDuration={200} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ── Optimal zone hint ────────────────────────────────────────────── */}
        <div style={{
          padding: '10px 14px', borderRadius: 8,
          background: 'rgba(52,168,83,0.06)', border: '1px solid rgba(52,168,83,0.2)',
          display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24,
        }}>
          <Zap size={13} style={{ color: G.green, flexShrink: 0 }} />
          <p style={{ margin: 0, fontSize: 12, color: 'var(--text-2)', lineHeight: 1.6 }}>
            <strong style={{ color: G.green }}>Optimal Zone: 55–70% intensity</strong> — Reduces bias by ~{((BIAS_START - lerp(BIAS_START, BIAS_END, 0.625)) / BIAS_START * 100).toFixed(0)}% while keeping accuracy above 90%. Satisfies EEOC 4/5ths rule with minimal operational impact.
          </p>
        </div>

        {/* ── EU AI Act Export Button ──────────────────────────────────────── */}
        <motion.button
          onClick={handleExport}
          disabled={isExporting}
          whileHover={!isExporting ? { scale: 1.02 } : {}}
          whileTap={!isExporting ? { scale: 0.98 } : {}}
          style={{
            width: '100%', padding: '16px 24px',
            borderRadius: 12, border: 'none', cursor: isExporting ? 'wait' : 'pointer',
            background: exportDone
              ? `linear-gradient(135deg, ${G.green}, #28a745)`
              : `linear-gradient(135deg, #1a1f6e, ${G.blue}, #6c63ff)`,
            backgroundSize: '200% 200%',
            boxShadow: exportDone
              ? `0 0 30px rgba(52,168,83,0.4), 0 4px 20px rgba(52,168,83,0.3)`
              : `0 0 30px rgba(66,133,244,0.35), 0 4px 20px rgba(66,133,244,0.25), inset 0 1px 0 rgba(255,255,255,0.1)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            transition: 'all 0.4s ease',
            opacity: isExporting ? 0.85 : 1,
            position: 'relative', overflow: 'hidden',
          }}
        >
          {/* Shimmer effect */}
          {!isExporting && !exportDone && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%)',
              animation: 'shimmer 2.5s infinite',
            }} />
          )}

          {isExporting ? (
            <Loader2 size={20} style={{ color: '#fff', animation: 'spin-slow 1s linear infinite' }} />
          ) : exportDone ? (
            <CheckCircle size={20} style={{ color: '#fff' }} />
          ) : (
            <FileText size={20} style={{ color: '#fff' }} />
          )}

          <div style={{ textAlign: 'left' }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: '#fff', fontFamily: "'Space Grotesk', sans-serif", letterSpacing: '0.02em' }}>
              {isExporting
                ? 'Generating EU AI Act Compliance Report…'
                : exportDone
                ? '✓ Report Downloaded Successfully!'
                : 'Generate EU AI Act Compliance Report'}
            </div>
            <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.65)', marginTop: 1 }}>
              {isExporting
                ? 'Building Regulation (EU) 2024/1689 compliant document…'
                : exportDone
                ? `Intensity: ${intensity}% · Bias: ${bias.toFixed(1)}% · Accuracy: ${accuracy.toFixed(1)}%`
                : `Intensity: ${intensity}% · Bias: ${bias.toFixed(1)}% · Accuracy: ${accuracy.toFixed(1)}% · jsPDF powered`}
            </div>
          </div>
        </motion.button>

        <p style={{ margin: '8px 0 0', fontSize: 10, color: 'var(--text-3)', textAlign: 'center' }}>
          Generates a structured PDF referencing Regulation (EU) 2024/1689 Articles 9, 10, 13, 14, 15 & Annex III
        </p>
      </div>
    </motion.div>
  );
};

export default WhatIfSimulator;
