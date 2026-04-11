import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Radar, Line } from 'react-chartjs-2';
import { useAppContext } from '../context/AppContext';
import { SlidersHorizontal } from 'lucide-react';
import {
  TrendingUp, Fingerprint, ShieldCheck, Lightbulb, Brain, Wrench,
  AlertTriangle, ChevronRight, Download, Loader2, FileSpreadsheet,
  Eye, Cpu, Zap, AlertCircle, BarChart3, Shield, Activity,
  Target, Layers, CheckCircle2, Gauge, FlaskConical
} from 'lucide-react';
import { motion } from 'framer-motion';
import { exportDashboardPDF } from '../services/pdfExportService';
import WhatIfSimulator from './WhatIfSimulator';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale,
  PointElement, LineElement, Tooltip, Legend);

/* ── Vivid Authority Palette ──────────────────────────────────────────────── */
const P = {
  sapphire: '#3B82F6',
  sapphireGlow: 'rgba(59,130,246,',
  indigo: '#818CF8',
  indigoGlow: 'rgba(129,140,248,',
  emerald: '#34D399',
  emeraldGlow: 'rgba(52,211,153,',
  amber: '#FBBF24',
  amberGlow: 'rgba(251,191,36,',
  rose: '#FB7185',
  roseGlow: 'rgba(251,113,133,',
  cyan: '#22D3EE',
  violet: '#A78BFA',
};

/* Chart colors — vivid and distinct */
const CHART_COLORS = ['#3B82F6', '#FB7185', '#FBBF24', '#34D399', '#A78BFA'];

const RISK_STYLE = {
  CRITICAL: { bg: `${P.roseGlow}0.12)`,    border: P.rose,    text: P.rose,    glow: `0 0 30px ${P.roseGlow}0.2)` },
  HIGH:     { bg: `${P.amberGlow}0.12)`,   border: P.amber,   text: P.amber,   glow: `0 0 30px ${P.amberGlow}0.15)` },
  MEDIUM:   { bg: `${P.indigoGlow}0.12)`,  border: P.indigo,  text: P.indigo,  glow: `0 0 30px ${P.indigoGlow}0.15)` },
  LOW:      { bg: `${P.emeraldGlow}0.12)`,  border: P.emerald, text: P.emerald, glow: `0 0 30px ${P.emeraldGlow}0.15)` },
};

/* ── Animated counter ──────────────────────────────────────────────────────── */
const AnimatedNum = ({ target, suffix = '', decimals = 0 }) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    let cur = 0; const step = target / 40;
    const t = setInterval(() => {
      cur += step;
      if (cur >= target) { setV(target); clearInterval(t); }
      else setV(parseFloat(cur.toFixed(decimals)));
    }, 28);
    return () => clearInterval(t);
  }, [target]);
  return <>{v}{suffix}</>;
};

/* ── Animated progress bar ─────────────────────────────────────────────────── */
const ProgressBar = ({ value, max = 100, color, delay = 0 }) => {
  const [w, setW] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setW((value / max) * 100), 300 + delay);
    return () => clearTimeout(t);
  }, [value, max, delay]);
  return (
    <div className="progress-track">
      <div className="progress-fill" style={{ width: `${w}%`, background: `linear-gradient(90deg, ${color}88, ${color})`, transitionDelay: `${delay}ms` }} />
    </div>
  );
};

/* ── Metric card with premium styling ─────────────────────────────────────── */
const MetricCard = ({ icon: Icon, title, subtitle, mainValue, mainLabel, suffix = '', color, subStats, delay = 0 }) => (
  <motion.div className="g-card"
    initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    style={{ padding: 28, position: 'relative' }}
  >
    {/* Top accent gradient bar */}
    <div style={{
      position: 'absolute', top: 0, left: 0, right: 0, height: 3,
      background: `linear-gradient(90deg, transparent 5%, ${color} 50%, transparent 95%)`,
      borderRadius: '18px 18px 0 0',
    }} />

    {/* Header */}
    <div style={{ marginBottom: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
          <div style={{
            width: 38, height: 38, borderRadius: 12,
            background: `linear-gradient(135deg, ${color}20, ${color}08)`,
            border: `1px solid ${color}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 0 20px ${color}15`,
          }}>
            {Icon && <Icon size={18} style={{ color }} />}
          </div>
          <div>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif", display: 'block' }}>{title}</span>
            <p style={{ fontSize: 11, color, fontWeight: 500, letterSpacing: '0.02em', marginTop: 2 }}>{subtitle}</p>
          </div>
        </div>
      </div>
    </div>

    {/* Big number */}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 16 }}>
      <span style={{
        fontSize: 52, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif",
        color: 'var(--text-1)', lineHeight: 1,
        textShadow: `0 0 40px ${color}25`,
      }}>
        <AnimatedNum target={mainValue} suffix="" decimals={mainValue % 1 !== 0 ? 1 : 0} />
      </span>
      <span style={{ fontSize: 18, color: 'var(--text-3)', fontWeight: 600 }}>{mainLabel}</span>
      <span className="badge" style={{
        marginLeft: 8,
        background: mainValue >= 70 ? `${P.emeraldGlow}0.15)` : mainValue >= 50 ? `${P.amberGlow}0.15)` : `${P.roseGlow}0.15)`,
        border: `1px solid ${mainValue >= 70 ? P.emerald : mainValue >= 50 ? P.amber : P.rose}40`,
        color: mainValue >= 70 ? P.emerald : mainValue >= 50 ? P.amber : P.rose,
        fontSize: 10,
        boxShadow: `0 0 12px ${mainValue >= 70 ? P.emeraldGlow : mainValue >= 50 ? P.amberGlow : P.roseGlow}0.1)`,
      }}>
        {mainValue >= 70 ? '✓ Acceptable' : mainValue >= 50 ? '▲ Caution' : '✕ Critical'}
      </span>
    </div>

    {/* Progress bar */}
    <ProgressBar value={mainValue} max={suffix === '/10' ? 10 : 100} color={color} />

    {/* Sub-stats grid */}
    {subStats && (
      <div className="stat-grid" style={{ marginTop: 20 }}>
        {subStats.map(({ label, value, color: c }) => (
          <div key={label} className="stat-item">
            <span className="stat-value" style={{ color: c || color }}>{value}%</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>
    )}
  </motion.div>
);

/* ── Section heading ──────────────────────────────────────────────────────── */
const SectionHead = ({ icon: Icon, label, color, badge, badgeColor, description }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: description ? 8 : 0 }}>
      <div style={{
        width: 38, height: 38, borderRadius: 12,
        background: `linear-gradient(135deg, ${color}20, ${color}08)`,
        border: `1px solid ${color}25`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 0 20px ${color}12`,
      }}>
        <Icon size={17} style={{ color }} />
      </div>
      <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 17, fontWeight: 800, color: 'var(--text-1)', margin: 0, letterSpacing: '-0.01em' }}>
        {label}
      </h3>
      {badge && (
        <span className="badge" style={{
          background: `${badgeColor || color}15`, border: `1px solid ${badgeColor || color}35`,
          color: badgeColor || color, fontSize: 9,
        }}>{badge}</span>
      )}
    </div>
    {description && (
      <p style={{ fontSize: 12, color: 'var(--text-3)', marginLeft: 50, lineHeight: 1.6 }}>{description}</p>
    )}
  </div>
);

/* ── List item with numbered bullet ─────────────────────────────────────── */
const ListItem = ({ text, dotColor, index, delay }) => (
  <motion.li
    initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
    style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 14, listStyle: 'none' }}
  >
    <span style={{
      width: 26, height: 26, borderRadius: 9,
      background: `linear-gradient(135deg, ${dotColor}25, ${dotColor}10)`,
      border: `1px solid ${dotColor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      flexShrink: 0, marginTop: 1,
      fontSize: 11, fontWeight: 800, color: dotColor,
      boxShadow: `0 0 12px ${dotColor}10`,
    }}>{index + 1}</span>
    <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.75 }}>{text}</span>
  </motion.li>
);

/* ── Chart defaults ────────────────────────────────────────────────────────── */
const FONT = { family: 'Inter, sans-serif' };

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
const Dashboard = ({ theme }) => {
  const { data, insights, auditError, streamingText, thresholds } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const [selectedCohort, setSelectedCohort] = useState(null);
  const dashboardRef = useRef(null);
  const isDark = theme !== 'light';
  const gridColor  = isDark ? 'rgba(99,128,255,0.07)' : 'rgba(99,102,241,0.08)';
  const tickColor  = isDark ? '#64748B' : '#94A3B8';
  const labelColor = isDark ? '#94A3B8' : '#64748B';

  /* ── Threshold-aware helpers ──────────────────────────────────── */
  const eeocThreshold   = thresholds?.eeocParity      ?? 80;
  const proxyThreshold  = thresholds?.proxyCorrelation ?? 0.6;
  const scoreThreshold  = thresholds?.minFairnessScore ?? 7.0;

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, gap: 14 }}>
      <Loader2 size={20} style={{ color: P.indigo, animation: 'spin-slow 1s linear infinite' }} />
      <span style={{ color: 'var(--text-3)', fontSize: 14, fontWeight: 500 }}>Preparing audit…</span>
    </div>
  );

  const risk = insights?.riskLevel || 'HIGH';
  const rs   = RISK_STYLE[risk] || RISK_STYLE.HIGH;

  /* Charts */
  const barData = {
    labels: data.approvalRates.map(r => r.group),
    datasets: [{
      label: 'Approval Rate (%)',
      data:  data.approvalRates.map(r => r.rate),
      backgroundColor: CHART_COLORS.slice(0, data.approvalRates.length),
      borderRadius: 8, borderSkipped: false,
    }],
  };
  const barOpts = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#0F1A36' : '#FFFFFF',
        borderColor: isDark ? 'rgba(99,128,255,0.2)' : 'rgba(99,102,241,0.15)',
        borderWidth: 1,
        padding: 14, cornerRadius: 12,
        titleColor: isDark ? '#F1F5F9' : '#0F172A',
        bodyColor: isDark ? '#94A3B8' : '#475569',
        titleFont: { ...FONT, size: 12, weight: '700' },
        bodyFont: { ...FONT, size: 11 },
      }
    },
    scales: {
      x: { max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { ...FONT, size: 10 }, callback: v => `${v}%` }, border: { color: gridColor } },
      y: { grid: { display: false }, ticks: { color: labelColor, font: { ...FONT, size: 11, weight: '600' } }, border: { display: false } },
    },
    animation: { duration: 1200, easing: 'easeOutQuart' },
  };

  const dData = {
    labels: ['Score', 'Gap'],
    datasets: [{ data: [data.metrics.fairnessScore, 10 - data.metrics.fairnessScore], backgroundColor: [`${P.sapphire}`, isDark ? '#162044' : '#E0E7FF'], borderWidth: 0 }],
  };
  const dOpts = { responsive: true, maintainAspectRatio: false, cutout: '76%', plugins: { legend: { display: false } }, animation: { duration: 1400 } };

  const radarData = {
    labels: ['Parity', 'Proxy-Free', 'Integrity', 'Consistency', 'Coverage', 'Transparency'],
    datasets: [
      { label: 'Dataset', data: data.fingerprint || [65, 45, 55, 70, 60, 50], backgroundColor: `${P.indigoGlow}0.1)`, borderColor: P.indigo, borderWidth: 2, pointBackgroundColor: P.indigo, pointRadius: 5, pointHoverRadius: 8 },
      { label: 'Benchmark', data: [80,80,80,80,80,80], backgroundColor: `${P.emeraldGlow}0.05)`, borderColor: P.emerald, borderWidth: 1, borderDash: [5,5], pointRadius: 0 },
    ],
  };
  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { min: 0, max: 100, grid: { color: gridColor }, angleLines: { color: gridColor }, pointLabels: { color: labelColor, font: { ...FONT, size: 10, weight: '600' } }, ticks: { display: false } } },
    plugins: { legend: { display: true, position: 'bottom', labels: { color: tickColor, font: { ...FONT, size: 10 }, boxWidth: 10, usePointStyle: true, padding: 14 } } },
    animation: { duration: 1300 },
  };

  const coveragePct = Math.round(Math.min(95, Math.max(10,
    (data.demographicCols?.length || 0) * 33 + (data.outcomeCols?.length || 0) * 17 + 10
  )));
  const transparencyPct = data.fingerprint?.[5] ?? 50;

  return (
    <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: 22, paddingBottom: 64 }}>

      {/* ── Header banner — vivid gradient ─────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}
        className="g-card"
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16,
          padding: '24px 28px',
          background: isDark
            ? 'linear-gradient(135deg, rgba(15,26,54,1) 0%, rgba(37,99,235,0.08) 40%, rgba(129,140,248,0.06) 70%, rgba(15,26,54,1) 100%)'
            : 'linear-gradient(135deg, #FFFFFF 0%, rgba(37,99,235,0.04) 40%, rgba(129,140,248,0.03) 100%)',
          borderTop: 'none',
        }}
      >
        {/* Decorative glow */}
        <div style={{ position: 'absolute', top: -40, right: 80, width: 200, height: 200, borderRadius: '50%', background: P.sapphire, filter: 'blur(100px)', opacity: 0.06, pointerEvents: 'none' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <Shield size={15} style={{ color: P.indigo }} />
            <span style={{ fontSize: 10, color: P.indigo, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em' }}>
              Bias Audit Report
            </span>
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 900, fontSize: 24, color: 'var(--text-1)', letterSpacing: '-0.02em' }}>
            {data.fileName}
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, fontFamily: 'Inter', display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <Layers size={13} style={{ color: P.sapphire }} />
            {data.rowCount?.toLocaleString()} rows · {data.columnCount} columns
          </span>
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <span className="badge" style={{
            background: rs.bg, border: `1px solid ${rs.border}40`, color: rs.text,
            boxShadow: rs.glow, fontSize: 10, padding: '7px 16px',
          }}>
            <div style={{ width: 7, height: 7, borderRadius: '50%', background: rs.text, animation: risk === 'CRITICAL' ? 'pulse 1s infinite' : 'none' }} />
            {risk} RISK
          </span>
          <button
            onClick={async () => {
              if (isExporting) return;
              setIsExporting(true);
              try { await exportDashboardPDF(dashboardRef, data, insights); }
              catch(e) { console.error('PDF export failed:', e); }
              finally { setIsExporting(false); }
            }}
            className="g-btn g-btn-outline"
            style={{ fontSize: 12, gap: 8, opacity: isExporting ? 0.7 : 1 }}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 size={14} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Download size={14} />}
            {isExporting ? 'Generating…' : 'Export PDF'}
          </button>
        </div>
      </motion.div>

      {/* ── Audit error banner ──────────────────────────────────────────── */}
      {auditError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="g-card" style={{
            padding: '16px 20px', borderLeft: `4px solid ${P.amber}`,
            display: 'flex', gap: 14, alignItems: 'flex-start',
          }}
        >
          <AlertCircle size={18} style={{ color: P.amber, flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: 13, color: P.amber }}>AI Analysis Incomplete — Statistical Results Shown</strong>
            <p style={{ margin: '6px 0 0', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65 }}>{auditError.slice(0, 200)}</p>
          </div>
        </motion.div>
      )}

      {/* ── Partial result / streaming banner ──────────────────────────── */}
      {data.isPartialResult && !auditError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="g-card" style={{
            padding: '16px 20px', borderLeft: `4px solid ${P.sapphire}`,
            display: 'flex', gap: 14, alignItems: 'center',
          }}
        >
          <Cpu size={18} style={{ color: P.sapphire, flexShrink: 0, animation: 'pulse 1.2s infinite' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 13, color: P.sapphire }}>Gemini Analysis Streaming…</strong>
            {streamingText && (
              <p style={{ margin: '4px 0 0', fontSize: 11, color: 'var(--text-3)', fontFamily: "'Fira Code', monospace", lineHeight: 1.55, wordBreak: 'break-all' }}>
                {streamingText.replace(/[{}"\[\]]/g, ' ').slice(-150)}
                <span style={{ display: 'inline-block', width: 7, height: 14, background: P.sapphire, borderRadius: 2, marginLeft: 3, animation: 'pulse 0.8s infinite', verticalAlign: 'middle' }} />
              </p>
            )}
          </div>
          <Zap size={15} style={{ color: P.sapphire, opacity: 0.5, animation: 'pulse 2s infinite' }} />
        </motion.div>
      )}

      {/* ── AI Summary banner ──────────────────────────────────────────── */}
      {insights?.summary && (
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="g-card" style={{
            padding: '20px 24px', borderLeft: `4px solid ${P.indigo}`,
            display: 'flex', gap: 16, alignItems: 'flex-start',
          }}
        >
          <div style={{
            width: 40, height: 40, borderRadius: 12,
            background: `linear-gradient(135deg, ${P.indigoGlow}0.2), ${P.indigoGlow}0.06))`,
            border: `1px solid ${P.indigo}30`,
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            boxShadow: `0 0 24px ${P.indigoGlow}0.1)`,
          }}>
            <Brain size={20} style={{ color: P.indigo }} />
          </div>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.8 }}>
            <strong style={{ color: P.indigo, fontWeight: 700 }}>AI Summary: </strong>{insights.summary}
          </p>
        </motion.div>
      )}

      {/* ── Metric cards (2-col) ─────────────────────────────────────── */}
      <div className="dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        <MetricCard
          icon={BarChart3}
          title="Demographic Parity Score"
          subtitle="Approval rate equity across demographic groups"
          mainValue={data.metrics.parity} mainLabel="/ 100"
          color={data.metrics.parity < eeocThreshold * 0.875 ? P.rose : data.metrics.parity < eeocThreshold ? P.amber : P.emerald}
          subStats={[
            { label: 'Highest Group', value: Math.max(...data.approvalRates.map(r => r.rate)), color: P.emerald },
            { label: 'Lowest Group', value: Math.min(...data.approvalRates.map(r => r.rate)), color: P.rose },
            { label: 'Disparity Gap', value: Math.max(...data.approvalRates.map(r => r.rate)) - Math.min(...data.approvalRates.map(r => r.rate)), color: P.amber },
            { label: `EEOC (${eeocThreshold}%)`, value: eeocThreshold, color: P.sapphire },
          ]}
          delay={0.15}
        />

        {/* Fairness doughnut card */}
        <motion.div className="g-card" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.6 }}
          style={{ padding: 28, display: 'flex', flexDirection: 'column', position: 'relative' }}
        >
          {/* Top accent gradient */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            background: `linear-gradient(90deg, transparent 5%, ${P.sapphire} 50%, transparent 95%)`,
            borderRadius: '18px 18px 0 0',
          }} />

          <div style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
              <div style={{
                width: 38, height: 38, borderRadius: 12,
                background: `linear-gradient(135deg, ${P.sapphireGlow}0.2), ${P.sapphireGlow}0.06))`,
                border: `1px solid ${P.sapphire}30`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 20px ${P.sapphireGlow}0.12)`,
              }}>
                <Gauge size={18} style={{ color: P.sapphire }} />
              </div>
              <div>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-1)', display: 'block' }}>Fairness Score</span>
                <p style={{ fontSize: 11, color: P.sapphire, fontWeight: 500, marginTop: 2 }}>Overall algorithmic bias audit score</p>
              </div>
            </div>
          </div>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 180, height: 180, filter: `drop-shadow(0 0 30px ${P.sapphireGlow}0.15))` }}>
              <Doughnut data={dData} options={dOpts} />
            </div>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 40, fontWeight: 900, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-1)', textShadow: `0 0 30px ${P.sapphireGlow}0.2)` }}>{data.metrics.fairnessScore}</span>
              <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 600 }}>/ 10</span>
            </div>
          </div>
          <div className="stat-grid" style={{ marginTop: 16 }}>
            {[
              { label: 'Parity Score',   value: data.metrics.parity, color: data.metrics.parity >= eeocThreshold ? P.emerald : P.rose },
              { label: 'Proxy Risk',     value: Math.max(5, Math.round(100 - data.metrics.proxyVars * 15)), color: P.amber },
              { label: 'Group Coverage', value: coveragePct, color: P.sapphire },
              { label: 'Transparency',   value: transparencyPct, color: P.emerald },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-value" style={{ color: s.color }}>{s.value}%</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
          {/* Threshold compliance */}
          <div style={{
            marginTop: 14, padding: '10px 14px', borderRadius: 12,
            background: data.metrics.fairnessScore >= scoreThreshold
              ? `linear-gradient(135deg, ${P.emeraldGlow}0.08), ${P.emeraldGlow}0.03))`
              : `linear-gradient(135deg, ${P.roseGlow}0.08), ${P.roseGlow}0.03))`,
            border: `1px solid ${data.metrics.fairnessScore >= scoreThreshold ? P.emerald : P.rose}25`,
            fontSize: 11, fontWeight: 600, textAlign: 'center',
            color: data.metrics.fairnessScore >= scoreThreshold ? P.emerald : P.rose,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          }}>
            {data.metrics.fairnessScore >= scoreThreshold ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
            {data.metrics.fairnessScore >= scoreThreshold
              ? `Meets threshold (≥${scoreThreshold})`
              : `Below threshold (<${scoreThreshold})`
            }
          </div>
        </motion.div>
      </div>

      {/* ── Approval Rate bar chart ───────────────────────────────────── */}
      <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.6 }}
        style={{ padding: 28 }}
      >
        <SectionHead icon={TrendingUp} label="Recruitment Disparity Matrix" color={P.sapphire}
          badge="Approval Rate by Group" badgeColor={P.sapphire}
          description="Comparative analysis of approval rates across demographic populations" />
        <div style={{ height: 200 }}>
          <Bar data={barData} options={barOpts} />
        </div>
        <div style={{ marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
          {data.approvalRates.map((r, i) => {
            const riskColor = r.riskLevel === 'CRITICAL' ? P.rose
              : r.riskLevel === 'HIGH'   ? P.amber
              : r.riskLevel === 'MEDIUM' ? P.indigo
              : P.emerald;
            return (
              <motion.div key={r.group}
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.07 }}
                onClick={() => setSelectedCohort(selectedCohort === r.group ? null : r.group)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 14,
                  padding: '10px 14px', borderRadius: 12,
                  background: selectedCohort === r.group ? `${CHART_COLORS[i % 5]}15` : 'rgba(99,128,255,0.02)',
                  border: `1px solid ${selectedCohort === r.group ? CHART_COLORS[i % 5] : 'transparent'}`,
                  transition: 'all 0.25s',
                  cursor: 'pointer',
                }}
                whileHover={{ backgroundColor: selectedCohort === r.group ? `${CHART_COLORS[i % 5]}25` : 'rgba(99,128,255,0.06)', borderColor: selectedCohort === r.group ? CHART_COLORS[i % 5] : 'rgba(99,128,255,0.12)' }}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: CHART_COLORS[i % 5], flexShrink: 0, boxShadow: `0 0 8px ${CHART_COLORS[i % 5]}40` }} />
                <span style={{ fontSize: 13, color: 'var(--text-2)', fontWeight: 600, minWidth: 110 }}>{r.group}</span>
                <div style={{ flex: 1, height: 8, borderRadius: 99, background: 'var(--bg-card-3)', overflow: 'hidden' }}>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${r.rate}%` }}
                    transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.4 + i * 0.07 }}
                    style={{ height: '100%', borderRadius: 99, background: `linear-gradient(90deg, ${CHART_COLORS[i % 5]}60, ${CHART_COLORS[i % 5]})`, boxShadow: `0 0 8px ${CHART_COLORS[i % 5]}30` }}
                  />
                </div>
                <span style={{ fontSize: 15, fontWeight: 800, color: CHART_COLORS[i % 5], fontFamily: "'Space Grotesk', sans-serif", minWidth: 48, textAlign: 'right' }}>{r.rate}%</span>
                {r.riskLevel && (
                  <span title={r.aiNote || ''} style={{
                    fontSize: 9, fontWeight: 700, padding: '4px 12px', borderRadius: 99,
                    background: `${riskColor}15`, color: riskColor,
                    border: `1px solid ${riskColor}30`,
                    textTransform: 'uppercase', letterSpacing: '0.1em', flexShrink: 0,
                    boxShadow: `0 0 8px ${riskColor}08`,
                  }}>
                    {r.riskLevel}
                  </span>
                )}
              </motion.div>
            );
          })}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6, paddingLeft: 14 }}>
            <Cpu size={11} style={{ color: P.indigo }} />
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600, fontStyle: 'italic' }}>
              Rates & risk labels computed by Gemini from your CSV data. Click a row to view raw data.
            </span>
          </div>

          {/* Interactive Cohort Drill-Down Table */}
          {selectedCohort && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="g-card" style={{ marginTop: 16, padding: '16px 20px', borderLeft: `4px solid ${P.sapphire}`, background: 'var(--bg-card-2)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h4 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: 'var(--text-1)' }}>Raw Data: {selectedCohort}</h4>
                <span style={{ fontSize: 10, color: 'var(--text-3)' }}>Showing top 5 examples</span>
              </div>
              <div style={{ width: '100%', overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 11, textAlign: 'left' }}>
                  <thead style={{ background: 'var(--bg-card)', borderBottom: '1px solid var(--border)' }}>
                    <tr>
                      {data.rawHeaders.map((h, i) => (
                        <th key={i} style={{ padding: '8px 12px', color: 'var(--text-2)', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      const demoIdx = data.rawHeaders.indexOf(data.primaryDemographic);
                      if (demoIdx === -1) return null;
                      const demoRows = data.rawRows.filter(row => row[demoIdx] === selectedCohort).slice(0, 5);
                      return demoRows.map((row, rIdx) => (
                        <tr key={rIdx} style={{ borderBottom: '1px solid var(--border)' }}>
                          {row.map((cell, cIdx) => (
                            <td key={cIdx} style={{ padding: '8px 12px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>{cell}</td>
                          ))}
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </motion.div>
          )}

        </div>
      </motion.div>

      {/* ── Key Findings + Radar ──────────────────────────────────────── */}
      {insights?.keyFindings && (
        <div className="dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.6 }}
            style={{ padding: 28, borderLeft: `4px solid ${P.amber}` }}
          >
            <SectionHead icon={Lightbulb} label="Key Findings" color={P.amber}
              badge={`${insights.keyFindings.length} Issues`} badgeColor={P.amber}
              description="Critical disparities identified in your dataset" />
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.keyFindings.slice(0, 4).map((f, i) => (
                <ListItem key={i} text={f} dotColor={CHART_COLORS[i % 5]} index={i} delay={0.4 + i * 0.08} />
              ))}
            </ul>
          </motion.div>

          <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.6 }}
            style={{ padding: 28 }}
          >
            <SectionHead icon={Activity} label="Bias Fingerprint Radar" color={P.indigo}
              badge="vs Benchmark" badgeColor={P.emerald} />
            <div style={{ height: 260 }}>
              <Radar data={radarData} options={radarOpts} />
            </div>
          </motion.div>
        </div>
      )}

      {/* ── LLM Predictions + Proxy Heatmap ───────────────────────────── */}
      <div className="dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
        {insights?.predictions && (
          <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.6 }}
            style={{ padding: 28, borderLeft: `4px solid ${P.rose}` }}
          >
            <SectionHead icon={Brain} label="LLM Predictions" color={P.rose}
              badge="HIGH" badgeColor={P.rose}
              description="If bias goes unaddressed — AI-generated forecast" />
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.predictions.map((p, i) => (
                <ListItem key={i} text={p} dotColor={P.rose} index={i} delay={0.5 + i * 0.08} />
              ))}
            </ul>
          </motion.div>
        )}

        {/* Proxy Heatmap */}
        <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          style={{ padding: 28 }}
        >
          <SectionHead icon={Fingerprint} label="Proxy Correlation Heatmap" color={P.rose} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>LOW</span>
            <div style={{ display: 'flex', gap: 4 }}>
              {[0.08,0.2,0.4,0.65,0.9].map((o,i) => <div key={i} style={{ width: 20, height: 20, borderRadius: 6, background: `rgba(251,113,133,${o})`, boxShadow: o > 0.5 ? `0 0 8px rgba(251,113,133,${o*0.3})` : 'none' }} />)}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>HIGH</span>
          </div>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18,
            padding: '8px 14px', borderRadius: 10,
            background: `${P.amberGlow}0.06)`, border: `1px solid ${P.amber}18`,
          }}>
            <SlidersHorizontal size={13} style={{ color: P.amber }} />
            <span style={{ fontSize: 11, color: P.amber, fontWeight: 600 }}>
              Threshold: &gt;{(proxyThreshold * 100).toFixed(0)}% correlation
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
            {data.heatmap.map((cell, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 + i * 0.09, type: 'spring', stiffness: 180 }}>
                <div style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, fontWeight: 900, borderRadius: 14, fontFamily: "'Space Grotesk', sans-serif",
                  background: cell.value > proxyThreshold + 0.2
                    ? `linear-gradient(135deg, ${P.rose}CC, ${P.rose}AA)`
                    : cell.value > proxyThreshold ? `${P.roseGlow}0.25)` : `${P.roseGlow}0.08)`,
                  border: `1px solid ${cell.value > proxyThreshold ? P.rose + '50' : 'var(--border)'}`,
                  color: cell.value > proxyThreshold + 0.2 ? '#fff' : 'var(--text-1)',
                  boxShadow: cell.value > proxyThreshold + 0.2 ? `0 8px 32px ${P.roseGlow}0.3)` : 'none',
                  transition: 'all 0.35s',
                }}>
                  {(cell.value * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 8, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {cell.x} ↔ {cell.y}
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: 20, paddingTop: 18, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
            {data.heatmap.filter(c => c.value > proxyThreshold).map((cell, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, fontSize: 12, color: 'var(--text-2)', alignItems: 'flex-start' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: P.rose, flexShrink: 0, marginTop: 6, animation: 'pulse 1.5s infinite', boxShadow: `0 0 6px ${P.roseGlow}0.3)` }} />
                <span>
                  <strong style={{ color: P.rose }}>{cell.x}</strong> ↔ <strong style={{ color: P.rose }}>{cell.y}</strong>
                  {' '}at <strong style={{ color: 'var(--text-1)' }}>{(cell.value*100).toFixed(0)}%</strong> — potential illegal proxy
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Root-Cause Explainer & Historical Trend ──────────────────── */}
      {(insights?.featureImportance?.length > 0 || insights?.historicalTrend?.length > 0) && (
        <div className="dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          
          {/* Root-Cause Explainer */}
          {insights.featureImportance?.length > 0 && (
            <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
              style={{ padding: 28 }}
            >
              <SectionHead icon={Lightbulb} label="Root-Cause Explainer" color={P.amber}
                badge="AI Feature Importance" badgeColor={P.amber}
                description="Top factors identified by the LLM driving algorithmic bias" />
              <div style={{ height: 220 }}>
                <Bar 
                  data={{
                    labels: insights.featureImportance.map(f => f.feature),
                    datasets: [{
                      label: 'Bias Influence Score',
                      data: insights.featureImportance.map(f => f.importance * 100),
                      backgroundColor: P.amber,
                      borderRadius: 6,
                    }]
                  }} 
                  options={{
                    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: { 
                      x: { max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
                      y: { grid: { display: false }, ticks: { color: labelColor, font: { weight: '600', size: 11 } } }
                    }
                  }} 
                />
              </div>
              <div style={{ marginTop: 14 }}>
                {insights.featureImportance.slice(0,2).map((f, i) => (
                  <p key={i} style={{ fontSize: 11, color: 'var(--text-3)', margin: '4px 0', lineHeight: 1.5 }}>
                    <strong style={{ color: P.amber }}>{f.feature}:</strong> {f.reason}
                  </p>
                ))}
              </div>
            </motion.div>
          )}

          {/* Historical Trend */}
          {insights.historicalTrend?.length > 0 && (
            <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
              style={{ padding: 28 }}
            >
              <SectionHead icon={TrendingUp} label="Historical Trend" color={P.sapphire}
                badge="Time-Series Progress" badgeColor={P.emerald}
                description="Parity and Fairness Score progression over time" />
              <div style={{ height: 220 }}>
                <Line 
                  data={{
                    labels: insights.historicalTrend.map(t => t.period),
                    datasets: [
                      {
                        label: 'Parity Score (0-100)',
                        data: insights.historicalTrend.map(t => t.parityScore),
                        borderColor: P.emerald, backgroundColor: `${P.emeraldGlow}0.2)`,
                        borderWidth: 2, tension: 0.3, pointBackgroundColor: P.emerald,
                      },
                      {
                        label: 'Fairness Score (x10)',
                        data: insights.historicalTrend.map(t => t.fairnessScore * 10),
                        borderColor: P.sapphire, backgroundColor: `${P.sapphireGlow}0.2)`,
                        borderWidth: 2, tension: 0.3, pointBackgroundColor: P.sapphire,
                      }
                    ]
                  }} 
                  options={{
                    responsive: true, maintainAspectRatio: false,
                    plugins: {
                      legend: { display: true, position: 'bottom', labels: { color: tickColor, font: { size: 10 }, padding: 14 } }
                    },
                    scales: { 
                      y: { max: 100, min: 0, grid: { color: gridColor }, ticks: { color: tickColor, font: { size: 10 } } },
                      x: { grid: { display: false }, ticks: { color: labelColor, font: { weight: '600', size: 11 } } }
                    }
                  }} 
                />
              </div>
            </motion.div>
          )}
        </div>
      )}

      {/* ── CSV Preview ──────────────────────────────────────────────── */}
      {data.csvPreview && (
        <motion.div className="g-card" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.6 }}
          style={{ padding: 28, overflow: 'hidden' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <SectionHead icon={FileSpreadsheet} label="Data Preview" color={P.sapphire} description="Head & tail snapshot of your dataset" />
            <div style={{
              fontSize: 11, color: 'var(--text-3)', padding: '8px 14px',
              background: 'var(--bg-card-2)', borderRadius: 10, fontWeight: 600,
              border: '1px solid var(--border)',
            }}>
              {data.csvPreview.head.length + data.csvPreview.tail.length} of {data.csvPreview.totalRows} rows
            </div>
          </div>

          <div style={{ width: '100%', overflowX: 'auto', borderRadius: 14, border: '1px solid var(--border)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg-card-2)', borderBottom: '2px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '14px 16px', color: P.indigo, fontWeight: 700, textTransform: 'uppercase', width: 40, fontSize: 10, letterSpacing: '0.1em' }}>#</th>
                  {data.csvPreview.headers.map((h, i) => (
                    <th key={i} style={{ padding: '14px 16px', color: 'var(--text-1)', fontWeight: 700, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-2)' }}>
                {data.csvPreview.head.map((row, rIdx) => (
                  <tr key={`head-${rIdx}`} style={{
                    borderBottom: '1px solid var(--border)',
                    background: rIdx % 2 === 0 ? 'transparent' : 'rgba(99,128,255,0.02)',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = `${P.indigoGlow}0.05)`}
                    onMouseLeave={e => e.currentTarget.style.background = rIdx % 2 === 0 ? 'transparent' : 'rgba(99,128,255,0.02)'}
                  >
                    <td style={{ padding: '12px 16px', color: P.indigo, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: 11 }}>{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{cell}</td>
                    ))}
                  </tr>
                ))}

                {data.csvPreview.tail.length > 0 && (
                  <tr style={{ background: `${P.indigoGlow}0.03)` }}>
                    <td colSpan={data.csvPreview.headers.length + 1} style={{
                      textAlign: 'center', padding: '10px', fontSize: 10, color: P.indigo,
                      letterSpacing: '0.2em', fontWeight: 700,
                    }}>
                      ⋯ {data.csvPreview.totalRows - (data.csvPreview.head.length + data.csvPreview.tail.length)} rows hidden ⋯
                    </td>
                  </tr>
                )}

                {data.csvPreview.tail.map((row, rIdx) => {
                  const actualIdx = data.csvPreview.totalRows - data.csvPreview.tail.length + rIdx + 1;
                  return (
                    <tr key={`tail-${rIdx}`} style={{
                      borderBottom: rIdx === data.csvPreview.tail.length - 1 ? 'none' : '1px solid var(--border)',
                      background: rIdx % 2 === 0 ? 'transparent' : 'rgba(99,128,255,0.02)',
                      transition: 'background 0.2s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = `${P.indigoGlow}0.05)`}
                      onMouseLeave={e => e.currentTarget.style.background = rIdx % 2 === 0 ? 'transparent' : 'rgba(99,128,255,0.02)'}
                    >
                      <td style={{ padding: '12px 16px', color: P.indigo, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", fontSize: 11 }}>{actualIdx}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '12px 16px', whiteSpace: 'nowrap' }}>{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-3)' }}>
            <Eye size={13} style={{ color: P.indigo }} />
            Data preview — only head and tail loaded into view.
          </div>
        </motion.div>
      )}

      {/* ── AI Remediation Roadmap ───────────────────────────────────── */}
      {insights?.suggestions && (
        <div className="dashboard-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 22 }}>
          <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55, duration: 0.6 }}
            style={{ padding: 28, borderTop: `4px solid ${P.rose}` }}
          >
            <SectionHead icon={AlertTriangle} label="Immediate Actions" color={P.rose}
              badge="Urgent" badgeColor={P.rose}
              description="Take these steps now to reduce legal exposure" />
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.suggestions.slice(0, 3).map((s, i) => (
                <ListItem key={i} text={s} dotColor={P.rose} index={i} delay={0.6 + i * 0.08} />
              ))}
            </ul>
          </motion.div>

          <motion.div className="g-card" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.6 }}
            style={{ padding: 28, borderTop: `4px solid ${P.emerald}` }}
          >
            <SectionHead icon={Wrench} label="Long-Term Changes" color={P.emerald}
              badge="Strategic" badgeColor={P.emerald}
              description="Structural improvements for lasting fairness" />
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.suggestions.slice(3).map((s, i) => (
                <ListItem key={i} text={s} dotColor={P.emerald} index={i + 3} delay={0.65 + i * 0.08} />
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* ── What-If Simulator ─────────────────────────────────────────── */}
      <WhatIfSimulator />

    </div>
  );
};

export default Dashboard;
