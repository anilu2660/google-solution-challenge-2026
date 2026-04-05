import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, User, Bot, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { analyzeBias, explainReport, evaluateAIResponse } from '../services/apiService';
import ReactMarkdown from 'react-markdown';
import { motion } from 'framer-motion';

const AICopilot = () => {
  const { messages, addMessage, apiKey, data, insights, resetAudit } = useAppContext();
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  const handleExplainReport = async () => {
    if (isLoading || !data) return;
    setIsLoading(true);
    addMessage({ role: 'user', content: 'Please explain this audit report in simple terms for HR.' });
    try {
      const explanation = await explainReport(apiKey, data, insights);
      addMessage({ role: 'ai', content: explanation });
    } catch (error) {
      addMessage({ role: 'ai', content: `Explanation Error: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    addMessage({ role: 'user', content: userMsg });
    setIsLoading(true);
    try {
      const aiResponse = await analyzeBias(apiKey, data, userMsg);
      const evaluation = await evaluateAIResponse(apiKey, data, aiResponse);
      addMessage({ role: 'ai', content: aiResponse, evaluation });
    } catch (error) {
      addMessage({ role: 'ai', content: `Audit System Error: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-card)' }}>

      {/* Header */}
      <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: 'var(--bg-card-2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={15} style={{ color: '#4285F4' }} />
          <h3 style={{ margin: 0, fontSize: 12, fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-1)' }}>AI Ethics Co-Pilot</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 10px', background: 'rgba(52,168,83,0.1)', borderRadius: 99, border: '1px solid rgba(52,168,83,0.25)' }}>
            <ShieldCheck size={11} style={{ color: '#34A853' }} />
            <span style={{ fontSize: 9, color: '#34A853', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gemini 3.1 Pro</span>
          </div>
          {data && (
            <button
              onClick={resetAudit}
              title="Start a new audit"
              style={{ padding: '3px 10px', borderRadius: 99, border: '1px solid var(--border-md)', background: 'var(--bg-card-3)', color: 'var(--text-3)', fontSize: 9, fontWeight: 700, cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em' }}
            >New Audit</button>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      {data && (
        <div style={{ padding: '8px 16px', borderBottom: '1px solid var(--border)', background: 'rgba(66,133,244,0.03)', display: 'flex', gap: 8 }}>
          <button 
            onClick={handleExplainReport}
            disabled={isLoading}
            style={{ 
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', 
              borderRadius: 6, border: '1px solid #4285F4', background: 'transparent', 
              color: '#4285F4', fontSize: 10, fontWeight: 700, cursor: 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.05em', transition: 'all 0.2s'
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(66,133,244,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Bot size={12} />
            Explain for HR
          </button>
        </div>
      )}

      {/* Messages Feed */}
      <div ref={scrollRef} className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16, display: 'flex', flexDirection: 'column', gap: 16 }}>
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{ display: 'flex', gap: 10, width: '100%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 32, height: 32, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: msg.role === 'user' ? 'var(--bg-card-3)' : 'rgba(66,133,244,0.12)',
                border: `1px solid ${msg.role === 'user' ? 'var(--border-md)' : 'rgba(66,133,244,0.25)'}`,
                color: msg.role === 'user' ? 'var(--text-2)' : '#4285F4',
              }}>
                {msg.role === 'user' ? <User size={15} /> : <Bot size={15} />}
              </div>
              <div style={{
                padding: '12px 14px', borderRadius: 10, maxWidth: '88%', fontSize: 13, lineHeight: 1.65,
                background: msg.role === 'user' ? 'var(--bg-card-2)' : 'var(--bg-card)',
                border: '1px solid var(--border)', color: 'var(--text-2)',
              }}>
                <div className="markdown-body">
                  <ReactMarkdown>{msg.content}</ReactMarkdown>
                </div>
              </div>
            </div>

            {msg.role === 'ai' && msg.evaluation && (
              <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }}
                style={{ marginLeft: 42, maxWidth: '85%', padding: 12, background: 'var(--bg-card-2)', border: '1px solid var(--border)', borderRadius: 8 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <span style={{ fontSize: 9, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-3)', fontWeight: 700 }}>Audit Fairness Match</span>
                  <span style={{
                    fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
                    background: msg.evaluation.score >= 0.8 ? 'rgba(52,168,83,0.15)' : 'rgba(234,67,53,0.15)',
                    color: msg.evaluation.score >= 0.8 ? '#34A853' : '#EA4335',
                  }}>
                    {(msg.evaluation.score * 100).toFixed(0)}%
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <AlertCircle size={10} style={{ marginTop: 2, color: 'var(--text-3)' }} />
                  <p style={{ fontSize: 10, color: 'var(--text-3)', margin: 0, lineHeight: 1.5, fontStyle: 'italic' }}>{msg.evaluation.feedback}</p>
                </div>
              </motion.div>
            )}
          </motion.div>
        ))}

        {isLoading && (
          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(66,133,244,0.1)', border: '1px solid rgba(66,133,244,0.2)', color: '#4285F4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Bot size={15} />
            </div>
            <div style={{ padding: '12px 16px', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ display: 'flex', gap: 4 }}>
                {['#4285F4', '#EA4335', '#FBBC05'].map((c, i) => (
                  <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: c, display: 'inline-block', animation: 'pulse 1.2s ease-in-out infinite', animationDelay: `${i * 0.2}s` }} />
                ))}
              </div>
              <span style={{ fontSize: 10, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.12em', fontWeight: 700 }}>Computing Ethics…</span>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSend} style={{ padding: 14, borderTop: '1px solid var(--border)', background: 'var(--bg-card-2)', flexShrink: 0 }}>
        <div style={{ position: 'relative' }}>
          <input
            type="text" value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about bias patterns…"
            style={{
              width: '100%', background: 'var(--bg-card)', border: '1px solid var(--border-md)',
              borderRadius: 8, padding: '12px 44px 12px 14px', fontSize: 13,
              color: 'var(--text-1)', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif', transition: 'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor = '#4285F4'}
            onBlur={e => e.target.style.borderColor = 'var(--border-md)'}
          />
          <button type="submit" disabled={isLoading} style={{
            position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
            padding: 6, borderRadius: 6, border: 'none',
            background: isLoading ? 'transparent' : '#4285F4',
            color: '#fff', cursor: 'pointer', display: 'flex',
            opacity: isLoading ? 0.4 : 1, transition: 'all 0.2s',
          }}>
            {isLoading ? <Loader2 size={18} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Send size={18} />}
          </button>
        </div>
        <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, fontSize: 10, color: 'var(--text-3)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
          <span>LangChain Orchestrator</span>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-md)' }} />
          <span>Privacy Secured</span>
        </div>
      </form>
    </div>
  );
};

export default AICopilot;
