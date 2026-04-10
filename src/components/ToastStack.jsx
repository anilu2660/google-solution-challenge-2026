import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldAlert, AlertTriangle, AlertCircle, Info } from 'lucide-react';

/* ── Google palette ──────────────────────────────────────────────── */
const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };

const SEVERITY = {
  critical: { color: G.red,    bg: '#1a0808', border: 'rgba(234,67,53,0.4)',   icon: ShieldAlert   },
  high:     { color: G.yellow, bg: '#1a1508', border: 'rgba(251,188,5,0.35)',  icon: AlertTriangle },
  medium:   { color: G.blue,   bg: '#080d1a', border: 'rgba(66,133,244,0.35)', icon: AlertCircle   },
  info:     { color: G.green,  bg: '#081308', border: 'rgba(52,168,83,0.3)',   icon: Info          },
};

const AUTO_DISMISS_MS = 6000;

/* ── Single toast ────────────────────────────────────────────────── */
const Toast = ({ toast, onDismiss }) => {
  const cfg = SEVERITY[toast.severity] || SEVERITY.info;
  const Icon = cfg.icon;

  /* Auto-dismiss after AUTO_DISMISS_MS */
  useEffect(() => {
    const t = setTimeout(() => onDismiss(toast.toastId), AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [toast.toastId, onDismiss]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.9 }}
      transition={{ type: 'spring', stiffness: 340, damping: 26 }}
      style={{
        display: 'flex', gap: 12, alignItems: 'flex-start',
        padding: '13px 15px', borderRadius: 12,
        background: cfg.bg,
        border: `1px solid ${cfg.border}`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px ${cfg.border}`,
        backdropFilter: 'blur(16px)',
        maxWidth: 340, width: '100%',
        position: 'relative', overflow: 'hidden',
        cursor: 'pointer',
      }}
      onClick={() => onDismiss(toast.toastId)}
    >
      {/* Countdown progress bar */}
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: AUTO_DISMISS_MS / 1000, ease: 'linear' }}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 2,
          background: cfg.color, transformOrigin: 'left',
          opacity: 0.7,
        }}
      />

      {/* Icon */}
      <div style={{
        width: 30, height: 30, borderRadius: 8, flexShrink: 0,
        background: `${cfg.color}18`, border: `1px solid ${cfg.color}30`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={14} style={{ color: cfg.color }} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{
          margin: '0 0 3px', fontSize: 12, fontWeight: 700,
          color: '#e8eaed', fontFamily: "'Space Grotesk', sans-serif",
          lineHeight: 1.3,
        }}>
          {toast.title}
        </p>
        <p style={{ margin: 0, fontSize: 11, color: '#9aa0a6', lineHeight: 1.5 }}>
          {toast.message.length > 110 ? toast.message.slice(0, 108) + '…' : toast.message}
        </p>
        <span style={{
          display: 'inline-block', marginTop: 6,
          fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
          background: `${cfg.color}20`, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          {toast.metric}
        </span>
      </div>

      {/* Dismiss X */}
      <button
        onClick={e => { e.stopPropagation(); onDismiss(toast.toastId); }}
        style={{
          flexShrink: 0, background: 'transparent', border: 'none',
          color: '#5f6368', cursor: 'pointer', padding: 2, display: 'flex',
          marginTop: -2, transition: 'color 0.15s',
        }}
        onMouseOver={e => e.currentTarget.style.color = '#e8eaed'}
        onMouseOut={e => e.currentTarget.style.color = '#5f6368'}
      >
        <X size={14} />
      </button>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   TOAST STACK — fixed bottom-right portal
═══════════════════════════════════════════════════════════════════ */
const ToastStack = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 9999,
      display: 'flex', flexDirection: 'column', gap: 10,
      alignItems: 'flex-end', pointerEvents: 'none',
    }}>
      <AnimatePresence mode="popLayout">
        {toasts.map(toast => (
          <div key={toast.toastId} style={{ pointerEvents: 'all' }}>
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default ToastStack;
