import React, { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [apiKey, setApiKey] = useState(
    sessionStorage.getItem('EQUILENS_API_KEY') || import.meta.env.VITE_OPENAI_API_KEY || ''
  );
  const [data, setData] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [insights, setInsights] = useState(null);
  const [auditError, setAuditError] = useState(null);    // error message string
  const [streamingText, setStreamingText] = useState(''); // live LLM token stream
  const [analysisPhase, setAnalysisPhase] = useState(''); // e.g. 'parsing' | 'stats' | 'llm' | 'done'
  const [messages, setMessages] = useState([
    { role: 'ai', content: 'Welcome to EquiLens. Upload your HR dataset to begin the bias audit.' }
  ]);

  const saveApiKey = (key) => {
    setApiKey(key);
    sessionStorage.setItem('EQUILENS_API_KEY', key);
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
      messages, addMessage,
      resetAudit,
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);
