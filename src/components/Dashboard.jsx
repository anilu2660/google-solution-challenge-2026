import React, { useEffect, useRef, useState } from 'react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, RadialLinearScale, PointElement, LineElement, Tooltip, Legend,
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import { useAppContext } from '../context/AppContext';
import { TrendingUp, Fingerprint, ShieldCheck, Lightbulb, Brain, Wrench, AlertTriangle, ChevronRight, Download, Loader2, FileSpreadsheet, Eye, Cpu, Zap, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { exportDashboardPDF } from '../services/pdfExportService';
import WhatIfSimulator from './WhatIfSimulator';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, RadialLinearScale,
  PointElement, LineElement, Tooltip, Legend);

/* ── Google colors ─────────────────────────────────────────────────────────── */
const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };
const GOOGLE = [G.blue, G.red, G.yellow, G.green];

const RISK_STYLE = {
  CRITICAL: { bg: 'rgba(234,67,53,0.1)',  border: '#EA4335', text: '#EA4335' },
  HIGH:     { bg: 'rgba(251,188,5,0.12)', border: '#FBBC05', text: '#FBBC05' },
  MEDIUM:   { bg: 'rgba(66,133,244,0.1)', border: '#4285F4', text: '#4285F4' },
  LOW:      { bg: 'rgba(52,168,83,0.1)',  border: '#34A853', text: '#34A853' },
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
      <div className="progress-fill" style={{ width: `${w}%`, background: color, transitionDelay: `${delay}ms` }} />
    </div>
  );
};

/* ── Metric card (like CV Score card in screenshots) ──────────────────────── */
const MetricCard = ({ title, subtitle, mainValue, mainLabel, suffix = '', color, subStats, delay = 0 }) => (
  <motion.div className="g-card"
    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay, duration: 0.45 }}
    style={{ padding: 24 }}
  >
    {/* Header */}
    <div style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
        <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif" }}>{title}</span>
      </div>
      <p style={{ fontSize: 11, color: color, fontWeight: 500 }}>{subtitle}</p>
    </div>

    {/* Big number */}
    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 12 }}>
      <span style={{ fontSize: 42, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-1)', lineHeight: 1 }}>
        <AnimatedNum target={mainValue} suffix="" decimals={mainValue % 1 !== 0 ? 1 : 0} />
      </span>
      <span style={{ fontSize: 16, color: 'var(--text-2)', fontWeight: 600 }}>{mainLabel}</span>
      {/* Excellent / Poor badge */}
      <span className="badge" style={{
        marginLeft: 4,
        background: mainValue >= 70 ? 'rgba(52,168,83,0.12)' : mainValue >= 50 ? 'rgba(251,188,5,0.12)' : 'rgba(234,67,53,0.12)',
        border: `1px solid ${mainValue >= 70 ? G.green : mainValue >= 50 ? G.yellow : G.red}40`,
        color: mainValue >= 70 ? G.green : mainValue >= 50 ? G.yellow : G.red,
        fontSize: 10,
      }}>
        {mainValue >= 70 ? 'Acceptable' : mainValue >= 50 ? 'Caution' : 'Critical'}
      </span>
    </div>

    {/* Progress bar */}
    <ProgressBar value={mainValue} max={suffix === '/10' ? 10 : 100} color={color} />

    {/* Sub-stats grid */}
    {subStats && (
      <div className="stat-grid" style={{ marginTop: 16 }}>
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

/* ── Section heading (like the screenshots) ────────────────────────────────── */
const SectionHead = ({ icon: Icon, label, color, badge, badgeColor }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
    <Icon size={18} style={{ color }} />
    <h3 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 16, fontWeight: 700, color: 'var(--text-1)', margin: 0 }}>
      {label}
    </h3>
    {badge && (
      <span className="badge" style={{
        background: `${badgeColor || color}18`, border: `1px solid ${badgeColor || color}40`,
        color: badgeColor || color, fontSize: 9,
      }}>{badge}</span>
    )}
  </div>
);

/* ── List item with bullet ─────────────────────────────────────────────────── */
const ListItem = ({ text, dotColor, index, delay }) => (
  <motion.li
    initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.35 }}
    style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10, listStyle: 'none' }}
  >
    <span style={{
      width: 20, height: 20, borderRadius: 6, background: `${dotColor}18`, border: `1px solid ${dotColor}30`,
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
      fontSize: 10, fontWeight: 700, color: dotColor,
    }}>{index + 1}</span>
    <span style={{ fontSize: 13, color: 'var(--text-2)', lineHeight: 1.65 }}>{text}</span>
  </motion.li>
);

/* ── Chart defaults ────────────────────────────────────────────────────────── */
const FONT = { family: 'Inter, sans-serif' };
const GRID_C = 'rgba(255,255,255,0.05)';
const TICK_C  = '#5f6368';

/* ═══════════════════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════════════════ */
const Dashboard = ({ theme }) => {
  const { data, insights, auditError, streamingText } = useAppContext();
  const [isExporting, setIsExporting] = useState(false);
  const dashboardRef = useRef(null);
  const isDark = theme !== 'light';
  const gridColor  = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.06)';
  const tickColor  = isDark ? '#5f6368' : '#9aa0a6';
  const labelColor = isDark ? '#9aa0a6' : '#5f6368';

  if (!data) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200 }}>
      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>Preparing audit…</span>
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
      backgroundColor: [G.blue, G.red, G.yellow, G.green].slice(0, data.approvalRates.length),
      borderRadius: 6, borderSkipped: false,
    }],
  };
  const barOpts = {
    indexAxis: 'y', responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor: 'var(--bg-card-2)', padding: 10, titleColor: '#fff', bodyColor: '#9aa0a6', titleFont: { ...FONT, size: 12 }, bodyFont: { ...FONT, size: 11 } } },
    scales: {
      x: { max: 100, grid: { color: gridColor }, ticks: { color: tickColor, font: { ...FONT, size: 10 }, callback: v => `${v}%` }, border: { color: gridColor } },
      y: { grid: { display: false }, ticks: { color: labelColor, font: { ...FONT, size: 11, weight: '600' } }, border: { display: false } },
    },
    animation: { duration: 1100, easing: 'easeOutQuart' },
  };

  const dData = {
    labels: ['Score', 'Gap'],
    datasets: [{ data: [data.metrics.fairnessScore, 10 - data.metrics.fairnessScore], backgroundColor: [G.blue, isDark ? '#2a2a32' : '#e8eaed'], borderWidth: 0 }],
  };
  const dOpts = { responsive: true, maintainAspectRatio: false, cutout: '80%', plugins: { legend: { display: false } }, animation: { duration: 1400 } };

  const radarData = {
    labels: ['Parity', 'Proxy-Free', 'Integrity', 'Consistency', 'Coverage', 'Transparency'],
    datasets: [
      { label: 'Dataset', data: data.fingerprint || [65, 45, 55, 70, 60, 50], backgroundColor: 'rgba(66,133,244,0.1)', borderColor: G.blue, borderWidth: 2, pointBackgroundColor: G.blue, pointRadius: 4 },
      { label: 'Benchmark', data: [80,80,80,80,80,80], backgroundColor: 'rgba(52,168,83,0.06)', borderColor: G.green, borderWidth: 1, borderDash: [4,4], pointRadius: 0 },
    ],
  };
  const radarOpts = {
    responsive: true, maintainAspectRatio: false,
    scales: { r: { min: 0, max: 100, grid: { color: gridColor }, angleLines: { color: gridColor }, pointLabels: { color: labelColor, font: { ...FONT, size: 10, weight: '600' } }, ticks: { display: false } } },
    plugins: { legend: { display: true, position: 'bottom', labels: { color: tickColor, font: { ...FONT, size: 10 }, boxWidth: 10, usePointStyle: true, padding: 12 } } },
    animation: { duration: 1300 },
  };

  // Coverage = demographic cols * 33 + outcome cols * 17, capped 10–95
  const coveragePct = Math.round(Math.min(95, Math.max(10,
    (data.demographicCols?.length || 0) * 33 + (data.outcomeCols?.length || 0) * 17 + 10
  )));
  // Transparency from fingerprint[5] (updated by LLM)
  const transparencyPct = data.fingerprint?.[5] ?? 50;

  return (
    <div ref={dashboardRef} style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: 64 }}>

      {/* ── File header ─────────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}
        style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, padding: '4px 0' }}
      >
        <div>
          <div style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: 4 }}>
            Bias Audit Report
          </div>
          <div style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 20, color: 'var(--text-1)' }}>
            {data.fileName}
            <span style={{ fontSize: 12, color: 'var(--text-3)', fontWeight: 500, marginLeft: 10, fontFamily: 'Inter' }}>
              {data.rowCount?.toLocaleString()} rows · {data.columnCount} columns
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span className="badge" style={{ background: rs.bg, border: `1px solid ${rs.border}40`, color: rs.text }}>
            <div style={{ width: 5, height: 5, borderRadius: '50%', background: rs.text, animation: risk === 'CRITICAL' ? 'pulse 1s infinite' : 'none' }} />
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
            style={{ fontSize: 12, gap: 6, opacity: isExporting ? 0.7 : 1 }}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 size={13} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Download size={13} />}
            {isExporting ? 'Generating PDF…' : 'Export Report'}
          </button>
        </div>
      </motion.div>

      {/* ── Audit error banner ─────────────────────────────────────────────── */}
      {auditError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(251,188,5,0.07)', border: '1px solid rgba(251,188,5,0.25)', borderLeft: `3px solid ${G.yellow}`, display: 'flex', gap: 12, alignItems: 'flex-start' }}
        >
          <AlertCircle size={15} style={{ color: G.yellow, flexShrink: 0, marginTop: 2 }} />
          <div>
            <strong style={{ fontSize: 12, color: G.yellow }}>AI Analysis Incomplete — Statistical Results Shown</strong>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--text-3)', lineHeight: 1.6 }}>{auditError.slice(0, 200)}</p>
          </div>
        </motion.div>
      )}

      {/* ── Partial result / streaming banner ────────────────────────────── */}
      {data.isPartialResult && !auditError && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          style={{ padding: '12px 16px', borderRadius: 10, background: 'rgba(66,133,244,0.06)', border: '1px solid rgba(66,133,244,0.2)', borderLeft: `3px solid ${G.blue}`, display: 'flex', gap: 12, alignItems: 'center' }}
        >
          <Cpu size={15} style={{ color: G.blue, flexShrink: 0, animation: 'pulse 1.2s infinite' }} />
          <div style={{ flex: 1 }}>
            <strong style={{ fontSize: 12, color: G.blue }}>GPT-4o Analysis Streaming…</strong>
            {streamingText && (
              <p style={{ margin: '3px 0 0', fontSize: 11, color: 'var(--text-3)', fontFamily: 'monospace', lineHeight: 1.5, wordBreak: 'break-all' }}>
                {streamingText.replace(/[{}"\[\]]/g, ' ').slice(-150)}
                <span style={{ display: 'inline-block', width: 6, height: 10, background: G.blue, borderRadius: 2, marginLeft: 2, animation: 'pulse 0.8s infinite', verticalAlign: 'middle' }} />
              </p>
            )}
          </div>
          <Zap size={13} style={{ color: G.blue, opacity: 0.6 }} />
        </motion.div>
      )}

      {/* ── AI Summary banner ────────────────────────────────────────────── */}
      {insights?.summary && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          style={{ padding: '14px 18px', borderRadius: 10, background: 'rgba(66,133,244,0.05)', border: '1px solid rgba(66,133,244,0.15)', borderLeft: `3px solid ${G.blue}`, display: 'flex', gap: 12 }}
        >
          <Brain size={16} style={{ color: G.blue, flexShrink: 0, marginTop: 2 }} />
          <p style={{ margin: 0, fontSize: 13, color: 'var(--text-2)', lineHeight: 1.7 }}>
            <strong style={{ color: G.blue }}>AI Summary: </strong>{insights.summary}
          </p>
        </motion.div>
      )}

      {/* ── Metric cards (2-col like screenshots) ───────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <MetricCard
          title="Demographic Parity Score"
          subtitle="Approval rate equity across demographic groups"
          mainValue={data.metrics.parity} mainLabel="/ 100"
          color={data.metrics.parity < 70 ? G.red : data.metrics.parity < 80 ? G.yellow : G.green}
          subStats={[
            {
              label: 'Highest Group',
              value: Math.max(...data.approvalRates.map(r => r.rate)),
              color: G.green,
            },
            {
              label: 'Lowest Group',
              value: Math.min(...data.approvalRates.map(r => r.rate)),
              color: G.red,
            },
            {
              label: 'Disparity Gap',
              value: Math.max(...data.approvalRates.map(r => r.rate)) - Math.min(...data.approvalRates.map(r => r.rate)),
              color: G.yellow,
            },
            {
              label: 'EEOC Threshold',
              value: 80,
              color: G.blue,
            },
          ]}
          delay={0.15}
        />

        {/* Fairness doughnut card */}
        <motion.div className="g-card" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22, duration: 0.45 }}
          style={{ padding: 24, display: 'flex', flexDirection: 'column' }}
        >
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: G.blue }} />
              <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-1)' }}>Fairness Score</span>
            </div>
            <p style={{ fontSize: 11, color: G.blue, fontWeight: 500 }}>Overall algorithmic bias audit score</p>
          </div>
          <div style={{ position: 'relative', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 160, height: 160 }}>
              <Doughnut data={dData} options={dOpts} />
            </div>
            <div style={{ position: 'absolute', display: 'flex', flexDirection: 'column', alignItems: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 32, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif", color: 'var(--text-1)' }}>{data.metrics.fairnessScore}</span>
              <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600 }}>/ 10</span>
            </div>
          </div>
          <div className="stat-grid" style={{ marginTop: 12 }}>
            {[
              { label: 'Parity Score',   value: data.metrics.parity,                                           color: G.red    },
              { label: 'Proxy Risk',     value: Math.max(5, Math.round(100 - data.metrics.proxyVars * 15)),    color: G.yellow },
              { label: 'Group Coverage', value: coveragePct,                                                   color: G.blue   },
              { label: 'Transparency',   value: transparencyPct,                                               color: G.green  },
            ].map(s => (
              <div key={s.label} className="stat-item">
                <span className="stat-value" style={{ color: s.color }}>{s.value}%</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── Approval Rate bar chart ─────────────────────────────────────── */}
      <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        style={{ padding: 24 }}
      >
        <SectionHead icon={TrendingUp} label="Recruitment Disparity Matrix" color={G.blue}
          badge="Approval Rate by Group" badgeColor={G.blue} />
        <div style={{ height: 200 }}>
          <Bar data={barData} options={barOpts} />
        </div>
        {/* Approval % row */}
        <div className="stat-grid" style={{ marginTop: 16 }}>
          {data.approvalRates.map((r, i) => (
            <div key={r.group} className="stat-item">
              <span className="stat-value" style={{ color: GOOGLE[i % 4] }}>{r.rate}%</span>
              <span className="stat-label">{r.group.split(' ')[0]} {r.group.split(' ')[1]}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* ── Key Findings ─────────────────────────────────────────────────── */}
      {insights?.keyFindings && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Strengths-style findings */}
          <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
            style={{ padding: 24 }}
          >
            <SectionHead icon={Lightbulb} label="Key Findings" color={G.yellow} badge={`${insights.keyFindings.length} Issues`} badgeColor={G.yellow} />
            <p style={{ fontSize: 12, color: G.yellow, fontWeight: 500, marginBottom: 14 }}>
              Critical disparities identified in your dataset
            </p>
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.keyFindings.slice(0, 4).map((f, i) => (
                <ListItem key={i} text={f} dotColor={GOOGLE[i % 4]} index={i} delay={0.4 + i * 0.07} />
              ))}
            </ul>
          </motion.div>

          {/* Radar */}
          <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
            style={{ padding: 24 }}
          >
            <SectionHead icon={AlertTriangle} label="Bias Fingerprint Radar" color={G.green} badge="vs Benchmark" badgeColor={G.green} />
            <div style={{ height: 250 }}>
              <Radar data={radarData} options={radarOpts} />
            </div>
          </motion.div>
        </div>
      )}

      {/* ── LLM Predictions + Proxy Heatmap ─────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Predictions (weakness-style) */}
        {insights?.predictions && (
          <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            style={{ padding: 24 }}
          >
            <SectionHead icon={Brain} label="LLM Predictions" color={G.red} badge="HIGH" badgeColor={G.red} />
            <p style={{ fontSize: 12, color: G.red, fontWeight: 500, marginBottom: 14 }}>
              If bias goes unaddressed — AI-generated forecast
            </p>
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.predictions.map((p, i) => (
                <ListItem key={i} text={p} dotColor={G.red} index={i} delay={0.5 + i * 0.08} />
              ))}
            </ul>
          </motion.div>
        )}

        {/* Proxy Heatmap */}
        <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ padding: 24 }}
        >
          <SectionHead icon={Fingerprint} label="Proxy Correlation Heatmap" color={G.red} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>LOW</span>
            <div style={{ display: 'flex', gap: 3 }}>
              {[0.1,0.25,0.5,0.75,1].map((o,i) => <div key={i} style={{ width: 16, height: 16, borderRadius: 4, background: `rgba(234,67,53,${o})` }} />)}
            </div>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 700 }}>HIGH</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
            {data.heatmap.map((cell, i) => (
              <motion.div key={i} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 + i * 0.08 }}>
                <div style={{
                  aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 20, fontWeight: 800, borderRadius: 10, fontFamily: "'Space Grotesk', sans-serif",
                  background: cell.value > 0.8 ? `${G.red}CC` : cell.value > 0.6 ? `${G.red}55` : `${G.red}18`,
                  border: `1px solid ${cell.value > 0.6 ? G.red + '50' : 'var(--border)'}`,
                  color: cell.value > 0.8 ? '#fff' : 'var(--text-1)',
                  boxShadow: cell.value > 0.8 ? `0 0 20px ${G.red}40` : 'none',
                }}>
                  {(cell.value * 100).toFixed(0)}%
                </div>
                <div style={{ fontSize: 10, color: 'var(--text-3)', textAlign: 'center', marginTop: 6, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {cell.x} ↔ {cell.y}
                </div>
              </motion.div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 7 }}>
            {data.heatmap.filter(c => c.value > 0.6).map((cell, i) => (
              <div key={i} style={{ display: 'flex', gap: 8, fontSize: 12, color: 'var(--text-2)' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: G.red, flexShrink: 0, marginTop: 5, animation: 'pulse 1.5s infinite' }} />
                <span>
                  <strong style={{ color: G.red }}>{cell.x}</strong> ↔ <strong style={{ color: G.red }}>{cell.y}</strong>
                  {' '}at <strong style={{ color: 'var(--text-1)' }}>{(cell.value*100).toFixed(0)}%</strong> — potential illegal proxy
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* ── CSV Preview (Head + Tail) ─────────────────────────────────── */}
      {data.csvPreview && (
        <motion.div className="g-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
          style={{ padding: 24, overflow: 'hidden', marginBottom: 16 }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <SectionHead icon={FileSpreadsheet} label="Data Preview (Head & Tail)" color={G.blue} />
            <div style={{ fontSize: 11, color: 'var(--text-3)', padding: '4px 8px', background: 'var(--bg-card-3)', borderRadius: 6, fontWeight: 600 }}>
              Showing {data.csvPreview.head.length + data.csvPreview.tail.length} of {data.csvPreview.totalRows} rows
            </div>
          </div>
          
          <div style={{ width: '100%', overflowX: 'auto', borderRadius: 8, border: '1px solid var(--border)' }} className="no-scrollbar">
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, textAlign: 'left' }}>
              <thead style={{ background: 'var(--bg-card-2)', borderBottom: '1px solid var(--border)' }}>
                <tr>
                  <th style={{ padding: '10px 12px', color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', width: 40 }}>#</th>
                  {data.csvPreview.headers.map((h, i) => (
                    <th key={i} style={{ padding: '10px 12px', color: 'var(--text-1)', fontWeight: 700 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody style={{ color: 'var(--text-2)' }}>
                {data.csvPreview.head.map((row, rIdx) => (
                  <tr key={`head-${rIdx}`} style={{ borderBottom: '1px solid var(--border)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                    <td style={{ padding: '8px 12px', color: 'var(--text-3)', fontWeight: 600 }}>{rIdx + 1}</td>
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} style={{ padding: '8px 12px' }}>{cell}</td>
                    ))}
                  </tr>
                ))}
                
                {data.csvPreview.tail.length > 0 && (
                  <tr style={{ background: 'rgba(52,168,83,0.03)' }}>
                    <td colSpan={data.csvPreview.headers.length + 1} style={{ textAlign: 'center', padding: '6px', fontSize: 10, color: 'var(--text-3)', letterSpacing: '0.2em', fontWeight: 700 }}>
                      ••• SNIP ({data.csvPreview.totalRows - (data.csvPreview.head.length + data.csvPreview.tail.length)} rows hidden) •••
                    </td>
                  </tr>
                )}
                
                {data.csvPreview.tail.map((row, rIdx) => {
                  const actualIdx = data.csvPreview.totalRows - data.csvPreview.tail.length + rIdx + 1;
                  return (
                    <tr key={`tail-${rIdx}`} style={{ borderBottom: rIdx === data.csvPreview.tail.length - 1 ? 'none' : '1px solid var(--border)', background: rIdx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}>
                      <td style={{ padding: '8px 12px', color: 'var(--text-3)', fontWeight: 600 }}>{actualIdx}</td>
                      {row.map((cell, cIdx) => (
                        <td key={cIdx} style={{ padding: '8px 12px' }}>{cell}</td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: 'var(--text-3)' }}>
            <Eye size={12} />
            GitHub-style data preview enabled. Only head and tail of the dataset are loaded into view.
          </div>
        </motion.div>
      )}

      {/* ── AI Remediation Roadmap ───────────────────────────────────────── */}
      {insights?.suggestions && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          {/* Immediate Actions */}
          <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
            style={{ padding: 24, borderTop: `3px solid ${G.red}` }}
          >
            <SectionHead icon={AlertTriangle} label="Immediate Actions" color={G.red} badge="High" badgeColor={G.red} />
            <p style={{ fontSize: 12, color: G.red, fontWeight: 500, marginBottom: 14 }}>
              Take these steps now to reduce legal exposure
            </p>
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.suggestions.slice(0, 3).map((s, i) => (
                <ListItem key={i} text={s} dotColor={G.red} index={i} delay={0.6 + i * 0.08} />
              ))}
            </ul>
          </motion.div>

          <motion.div className="g-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            style={{ padding: 24, borderTop: `3px solid ${G.green}` }}
          >
            <SectionHead icon={Wrench} label="Long-Term Changes" color={G.green} badge="Medium Priority" badgeColor={G.green} />
            <p style={{ fontSize: 12, color: G.green, fontWeight: 500, marginBottom: 14 }}>
              Structural improvements for lasting fairness
            </p>
            <ul style={{ padding: 0, margin: 0 }}>
              {insights.suggestions.slice(3).map((s, i) => (
                <ListItem key={i} text={s} dotColor={G.green} index={i + 3} delay={0.65 + i * 0.08} />
              ))}
            </ul>
          </motion.div>
        </div>
      )}

      {/* ── What-If Simulator + EU AI Act Export ─────────────────────── */}
      <WhatIfSimulator />

    </div>
  );
};

export default Dashboard;
