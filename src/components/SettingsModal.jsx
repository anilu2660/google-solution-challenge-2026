import React, { useState } from 'react';
import { X, ShieldCheck, Key, SlidersHorizontal, RotateCcw, Save } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Google brand ─────────────────────────────────────────────────────── */
const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };

/* ── Threshold slider row ─────────────────────────────────────────────── */
const ThresholdRow = ({ label, description, value, min, max, step, unit, color, onChange }) => {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
        <div>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif" }}>
            {label}
          </span>
          <p style={{ margin: '2px 0 0', fontSize: 10, color: 'var(--text-3)', lineHeight: 1.4 }}>{description}</p>
        </div>
        <span style={{
          fontSize: 18, fontWeight: 800, color, fontFamily: "'Space Grotesk', sans-serif",
          minWidth: 56, textAlign: 'right',
        }}>
          {value}{unit}
        </span>
      </div>

      {/* Track */}
      <div style={{ position: 'relative', height: 28, display: 'flex', alignItems: 'center' }}>
        <div style={{
          position: 'absolute', inset: '10px 0', borderRadius: 6, height: 8,
          background: 'var(--bg-card-3)',
        }} />
        <div style={{
          position: 'absolute', left: 0, top: 10,
          width: `${pct}%`, height: 8, borderRadius: 6,
          background: `linear-gradient(90deg, ${G.blue}, ${color})`,
          boxShadow: `0 0 10px ${color}50`,
          transition: 'width 0.05s',
        }} />
        <input
          type="range" min={min} max={max} step={step} value={value}
          onChange={e => onChange(+e.target.value)}
          style={{
            position: 'relative', zIndex: 2, width: '100%',
            appearance: 'none', background: 'transparent',
            cursor: 'pointer', height: 28, margin: 0, padding: 0, outline: 'none',
          }}
        />
      </div>

      {/* Min/Max labels */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 2 }}>
        <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>{min}{unit}</span>
        <span style={{ fontSize: 9, color: 'var(--text-3)', fontWeight: 600 }}>{max}{unit}</span>
      </div>
    </div>
  );
};

const DEFAULT_THRESHOLDS = {
  eeocParity: 80,
  proxyCorrelation: 0.6,
  minFairnessScore: 7.0,
};

/* ═══════════════════════════════════════════════════════════════════════
   SETTINGS MODAL
═══════════════════════════════════════════════════════════════════════ */
const SettingsModal = ({ isOpen, onClose }) => {
  const { apiKey, saveApiKey, thresholds, saveThresholds } = useAppContext();
  const [localKey, setLocalKey] = useState(apiKey);
  const [localThresholds, setLocalThresholds] = useState({ ...thresholds });
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    saveApiKey(localKey);
    saveThresholds(localThresholds);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const handleReset = () => {
    setLocalThresholds({ ...DEFAULT_THRESHOLDS });
  };

  const update = (key, val) => setLocalThresholds(prev => ({ ...prev, [key]: val }));

  return (
    <AnimatePresence>
      {isOpen && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
        }}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal panel */}
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 16 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 16 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            style={{
              position: 'relative', width: '100%', maxWidth: 520,
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: 16, padding: 28, boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
              maxHeight: '90vh', overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10,
                  background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <ShieldCheck size={18} style={{ color: G.blue }} />
                </div>
                <div>
                  <h2 style={{ margin: 0, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 17, color: 'var(--text-1)' }}>
                    Configuration
                  </h2>
                  <p style={{ margin: 0, fontSize: 11, color: 'var(--text-3)' }}>API key &amp; fairness thresholds</p>
                </div>
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: 6, border: '1px solid var(--border)', borderRadius: 8,
                  background: 'var(--bg-card-2)', color: 'var(--text-2)', cursor: 'pointer',
                  display: 'flex', transition: 'all 0.15s',
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* ── Section: API Key ──────────────────────────────────────────── */}
            <div style={{
              padding: '16px 18px', borderRadius: 12,
              background: 'var(--bg-card-2)', border: '1px solid var(--border)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Key size={13} style={{ color: G.yellow }} />
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)' }}>
                  AI Service API Key (Gemini)
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="password"
                  value={localKey}
                  onChange={e => setLocalKey(e.target.value)}
                  placeholder={import.meta.env.VITE_OPENAI_API_KEY ? 'Using key from .env' : 'Enter your Gemini / OpenAI API Key…'}
                  style={{
                    width: '100%', background: 'var(--bg-page)', border: '1px solid var(--border-md)',
                    borderRadius: 8, padding: '10px 12px', fontSize: 13, color: 'var(--text-1)',
                    outline: 'none', boxSizing: 'border-box', fontFamily: 'monospace',
                  }}
                />
              </div>
              <p style={{ margin: '6px 0 0', fontSize: 10, color: 'var(--text-3)' }}>
                Place <code>VITE_GEMINI_API_KEY</code> in your <code>.env</code> for automatic loading. Stored in <code>sessionStorage</code>.
              </p>
            </div>

            {/* ── Section: Fairness Thresholds ──────────────────────────────── */}
            <div style={{
              padding: '18px 18px 4px', borderRadius: 12,
              background: 'var(--bg-card-2)', border: '1px solid var(--border)',
              marginBottom: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <SlidersHorizontal size={13} style={{ color: G.green }} />
                  <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--text-3)' }}>
                    Fairness Thresholds
                  </span>
                </div>
                <button
                  onClick={handleReset}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '4px 10px', borderRadius: 6, fontSize: 11, fontWeight: 600,
                    border: '1px solid var(--border)', background: 'transparent',
                    color: 'var(--text-3)', cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  title="Reset to defaults"
                >
                  <RotateCcw size={11} /> Reset
                </button>
              </div>

              <ThresholdRow
                label="EEOC Parity Threshold"
                description="Minimum approval-rate ratio (%) between lowest and highest group. Below this = non-compliant."
                value={localThresholds.eeocParity}
                min={60} max={95} step={1} unit="%"
                color={G.blue}
                onChange={val => update('eeocParity', val)}
              />

              <ThresholdRow
                label="High-Risk Proxy Correlation"
                description="Cramér's V correlation above which a column is flagged as a high-risk proxy variable."
                value={localThresholds.proxyCorrelation}
                min={0.3} max={0.9} step={0.05} unit=""
                color={G.red}
                onChange={val => update('proxyCorrelation', val)}
              />

              <ThresholdRow
                label="Minimum Fairness Score"
                description="Overall fairness score (out of 10) below which the audit is flagged as unacceptable."
                value={localThresholds.minFairnessScore}
                min={4.0} max={9.5} step={0.5} unit="/10"
                color={G.green}
                onChange={val => update('minFairnessScore', val)}
              />

              {/* Legend rows */}
              <div style={{
                borderTop: '1px solid var(--border)', paddingTop: 12, marginTop: 4, marginBottom: 14,
                display: 'flex', gap: 16, flexWrap: 'wrap',
              }}>
                {[
                  { label: 'EEOC Default', value: '80%', color: G.blue },
                  { label: 'Proxy Default', value: '0.6', color: G.red },
                  { label: 'Score Default', value: '7.0', color: G.green },
                ].map(({ label, value, color }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: 10, color: 'var(--text-3)' }}>{label}: <strong style={{ color }}>{value}</strong></span>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Save button ──────────────────────────────────────────────── */}
            <button
              onClick={handleSave}
              style={{
                width: '100%', padding: '13px 20px', borderRadius: 10, border: 'none',
                background: saved
                  ? `linear-gradient(135deg, ${G.green}, #28a745)`
                  : `linear-gradient(135deg, #1a1f6e, ${G.blue})`,
                color: '#fff', fontSize: 14, fontWeight: 700,
                fontFamily: "'Space Grotesk', sans-serif",
                cursor: 'pointer', display: 'flex', alignItems: 'center',
                justifyContent: 'center', gap: 8, transition: 'all 0.3s',
                boxShadow: `0 4px 20px ${saved ? G.green : G.blue}40`,
              }}
            >
              {saved ? '✓ Saved!' : <><Save size={15} /> Save Configuration</>}
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
