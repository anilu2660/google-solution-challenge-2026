import React, { useState, useRef, useEffect } from 'react';
import {
  Send, Sparkles, User, Bot, Loader2, ShieldCheck, AlertCircle,
  Code2, Copy, Check, X, ChevronDown, ChevronUp, Terminal, ImagePlus
} from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import { analyzeBiasAgentic, explainReport, evaluateAIResponse, generateRemediationCode } from '../services/apiService';
import ReactMarkdown from 'react-markdown';
import { motion, AnimatePresence } from 'framer-motion';

/* ── Google palette ──────────────────────────────────────────────────── */
const G = { blue: '#4285F4', red: '#EA4335', yellow: '#FBBC05', green: '#34A853' };

/* ── Simple syntax-highlight code block renderer for react-markdown ─── */
const CodeBlock = ({ children, className }) => {
  const [copied, setCopied] = useState(false);
  const isInline = !className;
  const code = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return (
      <code style={{
        background: 'rgba(66,133,244,0.12)', color: '#93C5FD',
        padding: '1px 5px', borderRadius: 4, fontSize: '0.88em',
        fontFamily: "'Fira Code', 'Cascadia Code', monospace",
      }}>{children}</code>
    );
  }

  return (
    <div style={{
      position: 'relative', marginBottom: 14,
      borderRadius: 10, overflow: 'hidden',
      border: '1px solid rgba(66,133,244,0.2)',
      background: 'rgba(10,10,18,0.9)',
    }}>
      {/* Code block header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '6px 12px',
        background: 'rgba(66,133,244,0.08)',
        borderBottom: '1px solid rgba(66,133,244,0.15)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <Terminal size={11} style={{ color: G.blue }} />
          <span style={{ fontSize: 10, fontWeight: 700, color: G.blue, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Python
          </span>
        </div>
        <button
          onClick={handleCopy}
          style={{
            display: 'flex', alignItems: 'center', gap: 5,
            padding: '2px 8px', borderRadius: 5, border: '1px solid rgba(66,133,244,0.25)',
            background: 'transparent', cursor: 'pointer', fontSize: 10, fontWeight: 600,
            color: copied ? G.green : G.blue, transition: 'all 0.2s',
          }}
        >
          {copied ? <Check size={10} /> : <Copy size={10} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
      <pre style={{
        margin: 0, padding: '14px 16px', overflowX: 'auto',
        fontFamily: "'Fira Code', 'Cascadia Code', 'Courier New', monospace",
        fontSize: 12, lineHeight: 1.7, color: '#e2e8f0',
      }}>
        <code>{code}</code>
      </pre>
    </div>
  );
};

/* ── Code Viewer slide-over panel ───────────────────────────────────── */
const CodeViewer = ({ code, onClose }) => {
  const [globalCopied, setGlobalCopied] = useState(false);

  const handleGlobalCopy = () => {
    // Strip markdown fences and copy raw code
    const raw = code.replace(/```[\w]*\n?/g, '').replace(/```/g, '').trim();
    navigator.clipboard.writeText(raw);
    setGlobalCopied(true);
    setTimeout(() => setGlobalCopied(false), 2500);
  };

  return (
    <motion.div
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        position: 'absolute', inset: 0, zIndex: 20,
        background: 'var(--bg-card)', display: 'flex', flexDirection: 'column',
        borderRadius: 12, overflow: 'hidden',
      }}
    >
      {/* Panel Header */}
      <div style={{
        padding: '14px 18px', borderBottom: '1px solid var(--border)',
        background: 'var(--bg-card-2)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: 'rgba(52,168,83,0.12)', border: '1px solid rgba(52,168,83,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <Code2 size={14} style={{ color: G.green }} />
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-1)', fontFamily: "'Space Grotesk', sans-serif", textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              AI Remediation Code
            </div>
            <div style={{ fontSize: 10, color: 'var(--text-3)' }}>Python · pandas · fairlearn</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleGlobalCopy}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '5px 12px', borderRadius: 7,
              border: `1px solid ${globalCopied ? G.green : G.blue}40`,
              background: globalCopied ? 'rgba(52,168,83,0.1)' : 'rgba(66,133,244,0.08)',
              color: globalCopied ? G.green : G.blue,
              fontSize: 11, fontWeight: 700, cursor: 'pointer', transition: 'all 0.2s',
            }}
          >
            {globalCopied ? <Check size={12} /> : <Copy size={12} />}
            {globalCopied ? 'Copied!' : 'Copy All'}
          </button>
          <button
            onClick={onClose}
            style={{
              padding: '5px 8px', borderRadius: 7,
              border: '1px solid var(--border)', background: 'var(--bg-card-3)',
              color: 'var(--text-2)', cursor: 'pointer', display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>
      </div>

      {/* Code content */}
      <div className="no-scrollbar" style={{ flex: 1, overflowY: 'auto', padding: 16 }}>
        <div className="markdown-body" style={{ fontSize: 13 }}>
          <ReactMarkdown
            components={{
              code: ({ node, inline, className, children, ...props }) => (
                <CodeBlock className={className} {...props}>{children}</CodeBlock>
              ),
              h2: ({ children }) => (
                <h2 style={{
                  fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 14,
                  color: G.blue, margin: '18px 0 10px',
                  paddingBottom: 6, borderBottom: '1px solid rgba(66,133,244,0.2)',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <span style={{ width: 3, height: 14, background: G.blue, borderRadius: 2, display: 'inline-block' }} />
                  {children}
                </h2>
              ),
              p: ({ children }) => (
                <p style={{ fontSize: 12, color: 'var(--text-3)', lineHeight: 1.65, marginBottom: 10 }}>{children}</p>
              ),
            }}
          >
            {code}
          </ReactMarkdown>
        </div>
      </div>

      {/* Footer notice */}
      <div style={{
        padding: '10px 18px', borderTop: '1px solid var(--border)',
        background: 'var(--bg-card-2)', flexShrink: 0, display: 'flex', gap: 8, alignItems: 'center',
      }}>
        <AlertCircle size={11} style={{ color: G.yellow, flexShrink: 0 }} />
        <span style={{ fontSize: 10, color: 'var(--text-3)', lineHeight: 1.5 }}>
          AI-generated code. Review with your data engineering team before running on production data.
          Install dependencies: <code style={{ color: G.blue }}>pip install pandas scikit-learn fairlearn</code>
        </span>
      </div>
    </motion.div>
  );
};

/* ═══════════════════════════════════════════════════════════════════
   AI CO-PILOT MAIN COMPONENT
═══════════════════════════════════════════════════════════════════ */
const AICopilot = ({ theme }) => {
  const { messages, addMessage, setMessages, apiKey, data, insights, resetAudit } = useAppContext();
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingCode, setIsGeneratingCode] = useState(false);
  const [remediationCode, setRemediationCode] = useState(null);
  const [showCodeViewer, setShowCodeViewer] = useState(false);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isLoading]);

  /* ── Explain for HR ─────────────────────────────────────────────── */
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

  /* ── Generate Code Remediation ──────────────────────────────────── */
  const handleGenerateCode = async () => {
    if (isGeneratingCode || !data) return;
    setIsGeneratingCode(true);
    addMessage({ role: 'user', content: '⚙️ Generate Python remediation code to fix the detected bias.' });
    try {
      const code = await generateRemediationCode(apiKey, data, insights);
      setRemediationCode(code);
      setShowCodeViewer(true);
      addMessage({
        role: 'ai',
        content: `✅ **Remediation code generated!** I've prepared a 3-section Python script (Data Cleaning → Bias Mitigation → Validation) tailored to your dataset.\n\nClick **"View Code"** to see the full script, copy it, and run it in your Jupyter notebook.`,
        hasCode: true,
      });
    } catch (error) {
      addMessage({ role: 'ai', content: `Code generation failed: ${error.message}` });
    } finally {
      setIsGeneratingCode(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  /* ── Chat send ──────────────────────────────────────────────────── */
  const handleSend = async (e) => {
    if (e) e.preventDefault();
    if ((!input.trim() && !selectedImage) || isLoading) return;
    const userMsg = input.trim();
    const currentImg = selectedImage;
    setInput('');
    setSelectedImage(null);
    const newContext = [...messages, { role: 'user', content: userMsg, image: currentImg }];
    setMessages(newContext);
    setIsLoading(true);

    try {
      const { content: aiResponse, rawMessages } = await analyzeBiasAgentic(apiKey, data, newContext);

      // Update global context directly with everything including tool calls
      setMessages([...newContext, ...rawMessages]);
    } catch (error) {
      addMessage({ role: 'ai', content: `Audit System Error: ${error.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      height: '100%', position: 'relative', display: 'flex', flexDirection: 'column',
      background: 'var(--bg-card)', borderRadius: 12,
      border: '1px solid var(--border)', overflow: 'hidden',
      boxShadow: 'var(--shadow-card)',
    }}>

      {/* ── Header ─────────────────────────────────────────────────────── */}
      <div style={{
        padding: '16px 20px', borderBottom: '1px solid rgba(129,140,248,0.15)',
        background: 'linear-gradient(180deg, rgba(6,11,24,0.95) 0%, rgba(10,15,30,0.8) 100%)',
        backdropFilter: 'blur(20px)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 10,
            background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 20px rgba(129,140,248,0.2)',
          }}>
            <Sparkles size={16} style={{ color: '#818CF8' }} />
          </div>
          <h3 style={{
            margin: 0, fontSize: 13, fontFamily: "'Space Grotesk', sans-serif",
            fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.15em',
            background: 'linear-gradient(135deg, #818CF8 0%, #3B82F6 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>AI Copilot</h3>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '3px 10px', background: 'rgba(52,168,83,0.1)',
            borderRadius: 99, border: '1px solid rgba(52,168,83,0.25)',
          }}>
            <ShieldCheck size={11} style={{ color: G.green }} />
            <span style={{ fontSize: 9, color: G.green, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>Gemini 3.1 Pro</span>
          </div>
          {data && (
            <button
              onClick={resetAudit}
              title="Start a new audit"
              style={{
                padding: '3px 10px', borderRadius: 99,
                border: '1px solid var(--border-md)', background: 'var(--bg-card-3)',
                color: 'var(--text-3)', fontSize: 9, fontWeight: 700,
                cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.1em',
              }}
            >New Audit</button>
          )}
        </div>
      </div>

      {/* ── Quick Action Buttons ────────────────────────────────────────── */}
      {data && (
        <div style={{
          padding: '8px 16px', borderBottom: '1px solid var(--border)',
          background: 'rgba(66,133,244,0.03)',
          display: 'flex', gap: 8, flexWrap: 'wrap',
        }}>
          {/* Explain for HR */}
          <button
            onClick={handleExplainReport}
            disabled={isLoading || isGeneratingCode}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              border: `1px solid ${G.blue}`, background: 'transparent',
              color: G.blue, fontSize: 10, fontWeight: 700,
              cursor: 'pointer', textTransform: 'uppercase',
              letterSpacing: '0.05em', transition: 'all 0.2s',
              opacity: isLoading || isGeneratingCode ? 0.5 : 1,
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(66,133,244,0.08)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'transparent'; }}
          >
            <Bot size={12} /> Explain for HR
          </button>

          {/* Generate Code Fix */}
          <button
            onClick={handleGenerateCode}
            disabled={isLoading || isGeneratingCode}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '6px 12px', borderRadius: 6,
              border: `1px solid ${G.green}`,
              background: isGeneratingCode ? 'rgba(52,168,83,0.08)' : 'transparent',
              color: G.green, fontSize: 10, fontWeight: 700,
              cursor: isGeneratingCode ? 'wait' : 'pointer',
              textTransform: 'uppercase', letterSpacing: '0.05em',
              transition: 'all 0.2s',
              opacity: isLoading || isGeneratingCode ? 0.7 : 1,
            }}
            onMouseOver={e => { if (!isGeneratingCode) e.currentTarget.style.background = 'rgba(52,168,83,0.08)'; }}
            onMouseOut={e => { if (!isGeneratingCode) e.currentTarget.style.background = 'transparent'; }}
          >
            {isGeneratingCode
              ? <Loader2 size={12} style={{ animation: 'spin-slow 1s linear infinite' }} />
              : <Code2 size={12} />
            }
            {isGeneratingCode ? 'Generating…' : 'Code Fix'}
          </button>

          {/* View Code button — only shown after code is ready */}
          {remediationCode && (
            <button
              onClick={() => setShowCodeViewer(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 5,
                padding: '6px 12px', borderRadius: 6,
                border: `1px solid ${G.yellow}40`,
                background: 'rgba(251,188,5,0.06)',
                color: G.yellow, fontSize: 10, fontWeight: 700,
                cursor: 'pointer', textTransform: 'uppercase',
                letterSpacing: '0.05em', transition: 'all 0.2s',
              }}
            >
              <Terminal size={11} /> View Code
            </button>
          )}
        </div>
      )}

      {/* ── Messages Feed ───────────────────────────────────────────────── */}
      <div ref={scrollRef} className="no-scrollbar" style={{
        flex: 1, overflowY: 'auto', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 16,
      }}>
        {messages.filter(msg => msg.role !== 'tool' && !(msg.tool_calls && !msg.content)).map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: msg.role === 'user' ? 'flex-end' : 'flex-start' }}
          >
            <div style={{ display: 'flex', gap: 10, width: '100%', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
              <div style={{
                width: 34, height: 34, borderRadius: 10, display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                background: msg.role === 'user' ? (theme === 'dark' ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.05)') : (msg.role === 'tool' || msg.tool_calls) ? 'rgba(52,211,153,0.1)' : 'rgba(129,140,248,0.12)',
                border: `1px solid ${msg.role === 'user' ? (theme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.05)') : (msg.role === 'tool' || msg.tool_calls) ? 'rgba(52,211,153,0.3)' : 'rgba(129,140,248,0.3)'}`,
                boxShadow: msg.role === 'user' ? 'none' : '0 0 16px rgba(129,140,248,0.15)',
                color: msg.role === 'user' ? (theme === 'light' ? 'var(--text-2)' : '#4B5563') : (msg.role === 'tool' || msg.tool_calls) ? '#34D399' : '#818CF8',
              }}>
                {msg.role === 'user' ? <User size={16} /> : (msg.role === 'tool' || msg.tool_calls) ? <Terminal size={16} /> : <Bot size={16} />}
              </div>
              <div style={{
                padding: '14px 18px', borderRadius: 14, maxWidth: '85%',
                fontSize: 13, lineHeight: 1.65,
                background: msg.role === 'user' ? (theme === 'dark' ? 'rgba(255,255,255,0.02)' : '#ffffff') : (theme === 'dark' ? 'rgba(10,15,30,0.6)' : '#ffffff'),
                border: msg.role === 'user' ? (theme === 'dark' ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(0,0,0,0.05)') : '1px solid rgba(129,140,248,0.15)',
                boxShadow: theme === 'dark' ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.04)',
                color: 'var(--text-1)',
                backdropFilter: 'blur(10px)',
              }}>
                <div className="markdown-body">
                  {msg.image && (
                    <img 
                      src={msg.image} 
                      alt="User uploaded" 
                      style={{ maxWidth: '100%', borderRadius: 8, marginBottom: 8, maxHeight: 200, objectFit: 'contain' }} 
                    />
                  )}
                  <ReactMarkdown>{msg.content || (msg.tool_calls ? `Using dataset tools: ${msg.tool_calls.map(t => t.name).join(', ')}...` : `Tool result for ${msg.name}`)}</ReactMarkdown>
                </div>

                {/* "View Code" inline link for code messages */}
                {msg.hasCode && remediationCode && (
                  <button
                    onClick={() => setShowCodeViewer(true)}
                    style={{
                      marginTop: 10, display: 'flex', alignItems: 'center', gap: 6,
                      padding: '6px 12px', borderRadius: 7,
                      border: `1px solid ${G.green}40`,
                      background: 'rgba(52,168,83,0.08)',
                      color: G.green, fontSize: 11, fontWeight: 700,
                      cursor: 'pointer', transition: 'all 0.2s',
                    }}
                  >
                    <Code2 size={12} /> Open Code Viewer
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        ))}

        {/* Typing / Tool indicator */}
        {(isLoading || isGeneratingCode) && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: 'rgba(129,140,248,0.1)', border: '1px solid rgba(129,140,248,0.3)',
              color: '#818CF8', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 15px rgba(129,140,248,0.2)', position: 'relative',
            }}>
              <div style={{ position: 'absolute', inset: -2, border: '1px solid transparent', borderTopColor: '#818CF8', borderRadius: 'inherit', animation: 'spin-slow 1.5s linear infinite' }} />
              <Bot size={16} style={{ animation: 'pulse 1.5s infinite' }} />
            </div>
            <div style={{
              padding: '12px 18px', background: theme === 'dark' ? 'rgba(10,15,30,0.6)' : '#ffffff',
              border: '1px solid rgba(129,140,248,0.15)', borderRadius: 14,
              display: 'flex', alignItems: 'center', gap: 14,
              boxShadow: theme === 'dark' ? '0 4px 24px rgba(0,0,0,0.2)' : '0 4px 16px rgba(0,0,0,0.04)', backdropFilter: 'blur(10px)',
            }}>
              <div style={{ display: 'flex', gap: 5 }}>
                {['#818CF8', '#34D399', '#3B82F6'].map((c, i) => (
                  <motion.span key={i}
                    animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 1, repeat: Infinity, delay: i * 0.2 }}
                    style={{
                      width: 6, height: 6, borderRadius: '50%', background: c,
                      display: 'inline-block', boxShadow: `0 0 8px ${c}`
                    }}
                  />
                ))}
              </div>
              <span style={{
                fontSize: 10, color: '#818CF8', textTransform: 'uppercase',
                letterSpacing: '0.15em', fontWeight: 800,
              }}>
                {isGeneratingCode ? 'Building Remediation…' : 'Agent computing…'}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* ── Input Form ──────────────────────────────────────────────────── */}
      <form onSubmit={handleSend} style={{
        padding: '16px', borderTop: '1px solid rgba(129,140,248,0.15)',
        background: theme === 'dark' ? 'linear-gradient(0deg, rgba(6,11,24,0.95) 0%, rgba(10,15,30,0.8) 100%)' : '#ffffff', flexShrink: 0,
        position: 'relative', zIndex: 10, backdropFilter: 'blur(20px)',
      }}>
        {selectedImage && (
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <img src={selectedImage} alt="Preview" style={{ height: 60, borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card-2)' }} />
            <button 
              type="button" 
              onClick={() => setSelectedImage(null)}
              style={{ position: 'absolute', top: -6, right: -6, background: '#EF4444', color: 'white', border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
            >
              <X size={12} />
            </button>
          </div>
        )}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: 8 }}>
          <input 
            type="file" 
            accept="image/*" 
            ref={fileInputRef} 
            onChange={handleImageUpload} 
            style={{ display: 'none' }} 
          />
          <button 
            type="button" 
            onClick={() => fileInputRef.current.click()}
            style={{
              padding: 10, borderRadius: 12, border: '1px solid rgba(129,140,248,0.3)',
              background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(129,140,248,0.03)',
              color: 'var(--text-1)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.3s'
            }}
          >
            <ImagePlus size={18} />
          </button>
          <input
            type="text" value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask anything or attach a chart..."
            style={{
              width: '100%', background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(129,140,248,0.03)',
              border: '1px solid rgba(129,140,248,0.3)',
              borderRadius: 12, padding: '14px 50px 14px 18px', fontSize: 13,
              color: 'var(--text-1)', outline: 'none', boxSizing: 'border-box',
              fontFamily: 'Inter, sans-serif', transition: 'all 0.3s',
              boxShadow: theme === 'dark' ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none',
            }}
            onFocus={e => { e.target.style.borderColor = '#818CF8'; e.target.style.boxShadow = theme === 'dark' ? 'inset 0 2px 4px rgba(0,0,0,0.2), 0 0 15px rgba(129,140,248,0.2)' : '0 0 15px rgba(129,140,248,0.2)'; }}
            onBlur={e => { e.target.style.borderColor = 'rgba(129,140,248,0.3)'; e.target.style.boxShadow = theme === 'dark' ? 'inset 0 2px 4px rgba(0,0,0,0.2)' : 'none'; }}
          />
          <button type="submit" disabled={isLoading || isGeneratingCode} style={{
            position: 'absolute', right: 8,
            padding: 8, borderRadius: 8, border: 'none',
            background: isLoading || isGeneratingCode ? 'transparent' : 'linear-gradient(135deg, #818CF8 0%, #3B82F6 100%)',
            color: '#fff', cursor: 'pointer', display: 'flex',
            opacity: isLoading || isGeneratingCode ? 0.4 : 1, transition: 'all 0.2s',
            boxShadow: isLoading || isGeneratingCode ? 'none' : '0 4px 12px rgba(59,130,246,0.3)',
          }}>
            {isLoading ? <Loader2 size={16} style={{ animation: 'spin-slow 1s linear infinite' }} /> : <Send size={16} />}
          </button>
        </div>
        <div style={{
          marginTop: 10, display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: 12,
          fontSize: 10, color: 'var(--text-3)', fontWeight: 700,
          textTransform: 'uppercase', letterSpacing: '0.1em',
        }}>
          <span>LangChain Orchestrator</span>
          <div style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--border-md)' }} />
          <span>Privacy Secured</span>
        </div>
      </form>

      {/* ── Code Viewer Slide-Over ───────────────────────────────────────── */}
      <AnimatePresence>
        {showCodeViewer && remediationCode && (
          <CodeViewer code={remediationCode} onClose={() => setShowCodeViewer(false)} />
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICopilot;
