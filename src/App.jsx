import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import AICopilot from './components/AICopilot';
import SettingsModal from './components/SettingsModal';
import ParticleBackground from './components/ParticleBackground';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import NotificationsPanel from './components/NotificationsPanel';
import ToastStack from './components/ToastStack';
import { useAlerts } from './hooks/useAlerts';
import { Settings, Sun, Moon, Bell } from 'lucide-react';
import './index.css';

/* ── Theme toggle hook ───────────────────────────────────────────────────── */
const useTheme = () => {
  const [theme, setTheme] = useState(
    () => localStorage.getItem('equilens-theme') || 'dark'
  );

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('equilens-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  return { theme, toggle };
};

/* ── EquiLens SVG Logo mark ──────────────────────────────────────────────── */
const EquiLensLogo = ({ size = 36 }) => (
  <svg
    width={size} height={size}
    viewBox="0 0 36 36"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block', flexShrink: 0 }}
    aria-label="EquiLens logo"
  >
    {/* ── Outer ring: 4 Google-colour arc segments ── */}
    {/* Blue  — top-right  (0°  → 90°)  */}
    <path d="M18 2 A16 16 0 0 1 34 18" stroke="#4285F4" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
    {/* Red   — bottom-right (90° → 180°) */}
    <path d="M34 18 A16 16 0 0 1 18 34" stroke="#EA4335" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
    {/* Yellow — bottom-left (180° → 270°) */}
    <path d="M18 34 A16 16 0 0 1 2 18"  stroke="#FBBC05" strokeWidth="3.2" strokeLinecap="round" fill="none"/>
    {/* Green  — top-left  (270° → 360°) */}
    <path d="M2 18 A16 16 0 0 1 18 2"   stroke="#34A853" strokeWidth="3.2" strokeLinecap="round" fill="none"/>

    {/* ── Inner lens / iris ── */}
    <circle cx="18" cy="18" r="9" fill="none" stroke="rgba(66,133,244,0.18)" strokeWidth="1"/>

    {/* ── Lens cross-hairs (subtle) ── */}
    <line x1="18" y1="10" x2="18" y2="26" stroke="rgba(66,133,244,0.12)" strokeWidth="0.8"/>
    <line x1="10" y1="18" x2="26" y2="18" stroke="rgba(66,133,244,0.12)" strokeWidth="0.8"/>

    {/* ── Central pupil with Google-blue fill ── */}
    <circle cx="18" cy="18" r="4.5" fill="#4285F4"/>
    {/* Pupil highlight */}
    <circle cx="16.5" cy="16.5" r="1.4" fill="rgba(255,255,255,0.55)"/>

    {/* ── Scan / audit tick mark ── */}
    <path d="M15.2 18.1 L17.2 20.1 L21 16" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

/* ── Main App ────────────────────────────────────────────────────────────── */
const EquiLensApp = () => {
  const { data, insights, thresholds } = useAppContext();
  const { theme, toggle } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDark = theme === 'dark';

  /* ── Alert system ─────────────────────────────────────────────────────── */
  const {
    alerts, toasts, unreadCount,
    dismissToast, markAllRead, markRead, clearAll,
  } = useAlerts(data, insights, thresholds);

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-page)', color: 'var(--text-1)',
      overflow: 'hidden', position: 'relative', transition: 'background 0.3s, color 0.3s',
    }}>
      {/* Three.js particle background — always rendered; adapts for dark/light */}
      <ErrorBoundary name="ParticleBackground">
        <ParticleBackground isDark={isDark} />
      </ErrorBoundary>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header style={{
        position: 'relative', zIndex: 20,
        padding: '0 24px',
        height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: isDark ? 'rgba(6,11,24,0.94)' : 'rgba(240,244,255,0.96)',
        backdropFilter: 'blur(20px) saturate(1.4)',
        borderBottom: '1px solid var(--border)',
        boxShadow: isDark ? '0 1px 0 rgba(129,140,248,0.06), 0 4px 24px rgba(0,0,0,0.3)' : '0 1px 0 rgba(99,102,241,0.08)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* SVG mark */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 42, height: 42, borderRadius: 12,
            background: isDark ? 'rgba(129,140,248,0.1)' : 'rgba(129,140,248,0.08)',
            border: '1px solid rgba(129,140,248,0.25)',
            boxShadow: '0 0 24px rgba(129,140,248,0.15)',
            transition: 'transform 0.25s, box-shadow 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.08)'; e.currentTarget.style.boxShadow = '0 0 36px rgba(129,140,248,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 0 24px rgba(129,140,248,0.15)'; }}
          >
            <EquiLensLogo size={28} />
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em',
              background: 'linear-gradient(135deg, #818CF8 0%, #3B82F6 50%, #34D399 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
            }}>EquiLens</span>
            <span style={{
              fontSize: 9, fontWeight: 700, letterSpacing: '0.18em',
              textTransform: 'uppercase', color: 'var(--text-3)',
              lineHeight: 1,
            }}>AI Bias Auditor</span>
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Live audit badge */}
          {data && (
            <div className="badge" style={{ background: 'rgba(52,211,153,0.12)', border: '1px solid rgba(52,211,153,0.25)', color: '#34D399', boxShadow: '0 0 12px rgba(52,211,153,0.1)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#34D399', animation: 'pulse 1.5s infinite', boxShadow: '0 0 6px rgba(52,211,153,0.4)' }} />
              Live Audit
            </div>
          )}

          {/* ── Bell / Notifications ──────────────────────────────── */}
          <button
            id="notifications-btn"
            onClick={() => { setIsNotifOpen(v => !v); if (unreadCount > 0) markAllRead(); }}
            title={unreadCount > 0 ? `${unreadCount} unread alert${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
            style={{
              position: 'relative',
              padding: 8, border: '1px solid var(--border)', borderRadius: 8,
              background: unreadCount > 0 ? 'rgba(251,113,133,0.1)' : 'var(--bg-card-2)',
              color: unreadCount > 0 ? '#FB7185' : 'var(--text-2)',
              cursor: 'pointer', display: 'flex', transition: 'all 0.2s',
            }}
          >
            <Bell size={16} style={{ animation: unreadCount > 0 ? 'bellRing 0.5s ease 0.2s 2' : 'none' }} />

            {/* Unread badge */}
            {unreadCount > 0 && (
              <span style={{
                position: 'absolute', top: -5, right: -5,
                minWidth: 18, height: 18, borderRadius: 99,
                background: '#FB7185', color: '#fff',
                fontSize: 9, fontWeight: 800, fontFamily: "'Space Grotesk', sans-serif",
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '0 4px', border: '2px solid var(--bg-page)',
                animation: 'pulse 1.5s infinite',
                lineHeight: 1,
              }}>
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border-md)',
              background: 'var(--bg-card-2)', color: 'var(--text-2)',
              cursor: 'pointer', fontSize: 12, fontWeight: 600, transition: 'all 0.2s',
            }}
          >
            {isDark ? <Sun size={14} /> : <Moon size={14} />}
            {isDark ? 'Light' : 'Dark'}
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            style={{
              padding: 8, border: '1px solid var(--border)', borderRadius: 8,
              background: 'var(--bg-card-2)', color: 'var(--text-2)',
              cursor: 'pointer', display: 'flex', transition: 'all 0.2s',
            }}
            title="Settings"
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main style={{ flex: 1, position: 'relative', zIndex: 10, display: 'flex', overflow: 'hidden' }}>
        {!isAuthenticated ? (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <ErrorBoundary name="Login">
              <Login onLogin={() => setIsAuthenticated(true)} />
            </ErrorBoundary>
          </div>
        ) : !data ? (
          <div style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 32 }}>
            <ErrorBoundary name="UploadZone">
              <UploadZone />
            </ErrorBoundary>
          </div>
        ) : (
          <DashboardLayout />
        )}
      </main>

      {/* ── Settings Modal ──────────────────────────────────────────────────── */}
      <ErrorBoundary name="SettingsModal">
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </ErrorBoundary>

      {/* ── Notifications Panel (slide-in drawer) ───────────────────────────── */}
      <NotificationsPanel
        isOpen={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
        alerts={alerts}
        unreadCount={unreadCount}
        onMarkAllRead={markAllRead}
        onMarkRead={markRead}
        onClearAll={clearAll}
      />

      {/* ── Toast Stack (bottom-right auto-dismiss) ──────────────────────────── */}
      <ToastStack toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <EquiLensApp />
    </AppProvider>
  );
}

/* ── Split Layout Component ─────────────────────────────────────────────────── */
const DashboardLayout = () => {
  const { theme } = useTheme();
  const [copilotWidth, setCopilotWidth] = useState(400);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDragging) return;
    const handleMouseMove = (e) => {
      // Calculate new width based on mouse position
      const newWidth = window.innerWidth - e.clientX - 16;
      if (newWidth >= 300 && newWidth <= 800) {
        setCopilotWidth(newWidth);
      }
    };
    const handleMouseUp = () => setIsDragging(false);
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  return (
    <div style={{
      flex: 1, display: 'flex', flexDirection: 'row', padding: '16px',
      height: 'calc(100vh - 60px)', overflow: 'hidden', position: 'relative'
    }}>
      {/* Left: dashboard */}
      <div style={{ flex: 1, overflowY: 'auto', paddingRight: '16px' }} className="no-scrollbar">
        <ErrorBoundary name="Dashboard">
          <Dashboard theme={theme} />
        </ErrorBoundary>
      </div>

      {/* Drag Resizer Handle */}
      <div 
        onMouseDown={() => setIsDragging(true)}
        style={{
          width: '6px',
          cursor: 'col-resize',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: isDragging ? 'rgba(129,140,248,0.4)' : 'transparent',
          transition: 'background 0.2s',
          borderRadius: '4px',
          zIndex: 20
        }}
        onMouseOver={e => { if (!isDragging) e.currentTarget.style.background = 'rgba(129,140,248,0.2)'; }}
        onMouseOut={e => { if (!isDragging) e.currentTarget.style.background = 'transparent'; }}
      >
        <div style={{ width: 2, height: 30, background: 'rgba(129,140,248,0.5)', borderRadius: 2 }} />
      </div>

      {/* Right: AI copilot */}
      <div style={{ width: copilotWidth, flexShrink: 0, display: 'flex', flexDirection: 'column', marginLeft: '10px' }}>
        <ErrorBoundary name="AICopilot">
          <AICopilot theme={theme} />
        </ErrorBoundary>
      </div>
      
      {/* Invisible overlay to prevent iframe/text selection issues while dragging */}
      {isDragging && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, cursor: 'col-resize' }} />
      )}
    </div>
  );
};
