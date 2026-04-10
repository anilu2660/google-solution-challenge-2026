import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Bell, BellOff, CheckCheck, Trash2,
  AlertTriangle, AlertCircle, Info, ShieldAlert,
} from 'lucide-react';

/* ── Google palette ──────────────────────────────────────────────── */
const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };

/* ── Severity config ─────────────────────────────────────────────── */
const SEVERITY = {
  critical: { color: G.red,    bg: 'rgba(234,67,53,0.1)',   border: 'rgba(234,67,53,0.25)',   icon: ShieldAlert, label: 'Critical' },
  high:     { color: G.yellow, bg: 'rgba(251,188,5,0.08)',  border: 'rgba(251,188,5,0.2)',    icon: AlertTriangle, label: 'High' },
  medium:   { color: G.blue,   bg: 'rgba(66,133,244,0.08)', border: 'rgba(66,133,244,0.2)',   icon: AlertCircle, label: 'Medium' },
  info:     { color: G.green,  bg: 'rgba(52,168,83,0.08)',  border: 'rgba(52,168,83,0.2)',    icon: Info, label: 'Info' },
};

const timeAgo = (ts) => {
  const secs = Math.floor((Date.now() - ts) / 1000);
  if (secs < 60)  return 'Just now';
  if (secs < 3600) return `${Math.floor(secs / 60)}m ago`;
  return `${Math.floor(secs / 3600)}h ago`;
};

/* ── Single alert row ────────────────────────────────────────────── */
const AlertRow = ({ alert, onMarkRead }) => {
  const cfg = SEVERITY[alert.severity] || SEVERITY.info;
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      onClick={() => onMarkRead(alert.id)}
      style={{
        padding: '12px 14px',
        borderRadius: 10,
        background: alert.read ? 'transparent' : cfg.bg,
        border: `1px solid ${alert.read ? 'var(--border)' : cfg.border}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        opacity: alert.read ? 0.55 : 1,
      }}
    >
      <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
        {/* Icon */}
        <div style={{
          width: 28, height: 28, borderRadius: 8, flexShrink: 0,
          background: `${cfg.color}18`,
          border: `1px solid ${cfg.color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <Icon size={13} style={{ color: cfg.color }} />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title row */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span style={{
              fontSize: 12, fontWeight: 700, color: 'var(--text-1)',
              fontFamily: "'Space Grotesk', sans-serif",
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {alert.title}
            </span>
            {!alert.read && (
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: cfg.color, flexShrink: 0, animation: 'pulse 1.5s infinite' }} />
            )}
          </div>

          {/* Message */}
          <p style={{ fontSize: 11, color: 'var(--text-2)', lineHeight: 1.55, margin: '0 0 6px' }}>
            {alert.message}
          </p>

          {/* Footer */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{
              fontSize: 9, fontWeight: 700, padding: '2px 7px', borderRadius: 99,
              background: `${cfg.color}18`, color: cfg.color, textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>
              {cfg.label}
            </span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>{alert.metric}</span>
            <span style={{ fontSize: 10, color: 'var(--text-3)', marginLeft: 'auto' }}>{timeAgo(alert.timestamp)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   NOTIFICATIONS PANEL
═══════════════════════════════════════════════════════════════════ */
const NotificationsPanel = ({ isOpen, onClose, alerts, unreadCount, onMarkAllRead, onMarkRead, onClearAll }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 40,
              background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(2px)',
            }}
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 60, right: 0, bottom: 0, zIndex: 41,
              width: 380,
              background: 'var(--bg-card)',
              borderLeft: '1px solid var(--border)',
              display: 'flex', flexDirection: 'column',
              boxShadow: '-8px 0 32px rgba(0,0,0,0.3)',
            }}
          >
            {/* Panel Header */}
            <div style={{
              padding: '16px 18px', borderBottom: '1px solid var(--border)',
              background: 'var(--bg-card-2)',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 9,
                  background: unreadCount > 0 ? 'rgba(234,67,53,0.12)' : 'rgba(66,133,244,0.1)',
                  border: `1px solid ${unreadCount > 0 ? 'rgba(234,67,53,0.3)' : 'rgba(66,133,244,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Bell size={15} style={{ color: unreadCount > 0 ? G.red : G.blue }} />
                </div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif" }}>
                    Bias Alerts
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--text-3)' }}>
                    {unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'All caught up'}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {unreadCount > 0 && (
                  <button
                    onClick={onMarkAllRead}
                    title="Mark all as read"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 10px', borderRadius: 7,
                      border: `1px solid ${G.green}40`, background: 'rgba(52,168,83,0.08)',
                      color: G.green, fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <CheckCheck size={12} /> Read all
                  </button>
                )}
                {alerts.length > 0 && (
                  <button
                    onClick={onClearAll}
                    title="Clear all alerts"
                    style={{
                      display: 'flex', alignItems: 'center', gap: 5, padding: '5px 8px', borderRadius: 7,
                      border: '1px solid var(--border)', background: 'var(--bg-card-3)',
                      color: 'var(--text-3)', fontSize: 10, fontWeight: 700, cursor: 'pointer',
                    }}
                  >
                    <Trash2 size={11} />
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', padding: '5px 8px', borderRadius: 7,
                    border: '1px solid var(--border)', background: 'var(--bg-card-3)',
                    color: 'var(--text-2)', cursor: 'pointer',
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Alert List */}
            <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
              {alerts.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 60 }}
                >
                  <div style={{
                    width: 56, height: 56, borderRadius: 16,
                    background: 'rgba(52,168,83,0.08)', border: '1px solid rgba(52,168,83,0.2)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <BellOff size={22} style={{ color: G.green }} />
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-1)', margin: '0 0 4px', fontFamily: "'Space Grotesk', sans-serif" }}>
                      No alerts yet
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--text-3)', margin: 0 }}>
                      Upload a dataset to begin monitoring bias thresholds
                    </p>
                  </div>
                </motion.div>
              ) : (
                <AnimatePresence>
                  {alerts.map(alert => (
                    <AlertRow key={alert.id} alert={alert} onMarkRead={onMarkRead} />
                  ))}
                </AnimatePresence>
              )}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 18px', borderTop: '1px solid var(--border)',
              background: 'var(--bg-card-2)', flexShrink: 0,
              display: 'flex', alignItems: 'center', gap: 6,
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: G.green, animation: 'pulse 2s infinite' }} />
              <span style={{ fontSize: 10, color: 'var(--text-3)', fontWeight: 600 }}>
                Monitoring {Object.entries({ EEOC: true, Proxy: true, Fairness: true, Disparity: true }).filter(([,v]) => v).length} bias indicators in real-time
              </span>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default NotificationsPanel;
