import React, { useState, useEffect } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import UploadZone from './components/UploadZone';
import Dashboard from './components/Dashboard';
import AICopilot from './components/AICopilot';
import SettingsModal from './components/SettingsModal';
import ParticleBackground from './components/ParticleBackground';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './components/Login';
import { Settings, Sun, Moon, BarChart3 } from 'lucide-react';
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
  const { data } = useAppContext();
  const { theme, toggle } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isDark = theme === 'dark';

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
        background: isDark ? 'rgba(20,20,24,0.9)' : 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid var(--border)',
        boxShadow: isDark ? '0 1px 0 rgba(255,255,255,0.04)' : '0 1px 0 rgba(0,0,0,0.06)',
      }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          {/* SVG mark */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            width: 42, height: 42, borderRadius: 12,
            background: isDark ? 'rgba(66,133,244,0.07)' : 'rgba(66,133,244,0.06)',
            border: '1px solid rgba(66,133,244,0.18)',
            boxShadow: '0 0 18px rgba(66,133,244,0.15)',
            transition: 'transform 0.25s, box-shadow 0.25s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.07)'; e.currentTarget.style.boxShadow = '0 0 26px rgba(66,133,244,0.3)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)';    e.currentTarget.style.boxShadow = '0 0 18px rgba(66,133,244,0.15)'; }}
          >
            <EquiLensLogo size={28} />
          </div>

          {/* Wordmark */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <span style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #4285F4 0%, #34A853 55%, #FBBC05 100%)',
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
            <div className="badge" style={{ background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(52,168,83,0.25)', color: '#34A853' }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#34A853', animation: 'pulse 1.5s infinite' }} />
              Live Audit
            </div>
          )}

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
          <div style={{
            flex: 1, display: 'flex', flexDirection: 'row', padding: '16px',
            gap: 16, height: 'calc(100vh - 60px)', overflow: 'hidden',
          }}>
            {/* Left: dashboard */}
            <div style={{ flex: 1, overflowY: 'auto' }} className="no-scrollbar">
              <ErrorBoundary name="Dashboard">
                <Dashboard theme={theme} />
              </ErrorBoundary>
            </div>
            {/* Right: AI copilot */}
            <div style={{ width: 380, flexShrink: 0, display: 'flex', flexDirection: 'column' }}>
              <ErrorBoundary name="AICopilot">
                <AICopilot />
              </ErrorBoundary>
            </div>
          </div>
        )}
      </main>

      <ErrorBoundary name="SettingsModal">
        <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </ErrorBoundary>
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
