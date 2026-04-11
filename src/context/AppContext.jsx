import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

/* ── Default fairness thresholds ───────────────────────────────────────── */
const DEFAULT_THRESHOLDS = {
  eeocParity: 80,         // EEOC 4/5ths rule minimum parity score (0-100)
  proxyCorrelation: 0.6,  // Cramér's V above which a proxy is "high risk" (0-1)
  minFairnessScore: 7.0,  // Minimum acceptable fairness score out of 10 (0-10)
};

const loadThresholds = () => {
  try {
    const saved = localStorage.getItem('equilens-thresholds');
    return saved ? { ...DEFAULT_THRESHOLDS, ...JSON.parse(saved) } : DEFAULT_THRESHOLDS;
  } catch {
    return DEFAULT_THRESHOLDS;
  }
};

export const AppProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState(
    sessionStorage.getItem('EQUILENS_API_KEY') || import.meta.env.VITE_OPENAI_API_KEY || ''
  );
  const [data, setData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [auditError, setAuditError] = useState(null);
  const [streamingText, setStreamingText] = useState('');
  const [analysisPhase, setAnalysisPhase] = useState('');
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Welcome to EquiLens. Upload your HR dataset to begin the bias audit.' }
  ]);

  /* ── Fairness threshold state ───────────────────────────────────────── */
  const [thresholds, setThresholds] = useState(loadThresholds);

  /* ── Audit History ──────────────────────────────────────────────────── */
  const loadHistory = () => {
    try {
      const saved = localStorage.getItem('equilens-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  };
  const [auditHistory, setAuditHistory] = useState(loadHistory);

  const addAuditToHistory = (auditRecord) => {
    setAuditHistory(prev => {
      // Avoid duplicate exact timestamps if they somehow happen
      if (prev.length > 0 && prev[0].date === auditRecord.date) return prev;
      const updated = [auditRecord, ...prev].slice(0, 50); // Keep last 50 audits
      localStorage.setItem('equilens-history', JSON.stringify(updated));
      return updated;
    });
  };

  const clearAuditHistory = () => {
    setAuditHistory([]);
    localStorage.removeItem('equilens-history');
  };

  const saveApiKey = (key) => {
    setApiKey(key);
    sessionStorage.setItem('EQUILENS_API_KEY', key);
  };

  const saveThresholds = (newThresholds) => {
    const merged = { ...thresholds, ...newThresholds };
    setThresholds(merged);
    localStorage.setItem('equilens-thresholds', JSON.stringify(merged));
  };

  const addMessage = (msg) => {
    setMessages(prev => [...prev, msg]);
  };

  const resetAudit = () => {
    setData(null);
    setInsights(null);
    setAuditError(null);
    setStreamingText('');
    setAnalysisPhase('');
  };

  return (
    <AppContext.Provider value={{
      apiKey, saveApiKey,
      data, setData,
      isAnalyzing, setIsAnalyzing,
      insights, setInsights,
      auditError, setAuditError,
      streamingText, setStreamingText,
      analysisPhase, setAnalysisPhase,
      messages, addMessage, setMessages,
      thresholds, saveThresholds,
      auditHistory, addAuditToHistory, clearAuditHistory,
      resetAudit,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
