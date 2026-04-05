import React, { useState } from 'react';
import { Mail, Lock, LogIn, Shield, CheckCircle2, AlertCircle } from 'lucide-react';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('idle'); // idle, loading, success, error
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      setStatus('error');
      return;
    }
    
    setStatus('loading');
    setErrorMsg('');

    // Simulate network request
    setTimeout(() => {
      // Dummy credential validation (accepts anything for demo, but checks if matching 'admin')
      if (email.includes('@') && password.length > 0) {
        setStatus('success');
        setTimeout(() => {
          onLogin();
        }, 800);
      } else {
        setStatus('error');
        setErrorMsg('Invalid credentials format.');
      }
    }, 1500);
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-card-2)',
    border: '1px solid var(--border-md)',
    color: 'var(--text-1)',
    padding: '14px 16px 14px 44px',
    borderRadius: '12px',
    fontSize: '15px',
    outline: 'none',
    transition: 'all 0.25s ease',
    fontFamily: 'inherit'
  };

  return (
    <div style={{
      width: '100%', maxWidth: '440px',
      background: 'var(--bg-card)',
      backdropFilter: 'blur(20px)',
      border: '1px solid var(--border)',
      borderRadius: '24px',
      padding: '40px 32px',
      boxShadow: 'var(--shadow-card), 0 0 40px rgba(66, 133, 244, 0.05)',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
      animation: 'fadeSlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
    }}>
      {/* Decorative top gradient line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '4px',
        background: 'var(--g-gradient)',
      }} />

      <div style={{ textAlign: 'center', marginBottom: '32px' }}>
        <div style={{
          width: '56px', height: '56px',
          background: 'rgba(66, 133, 244, 0.1)',
          border: '1px solid rgba(66, 133, 244, 0.2)',
          borderRadius: '16px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
          color: 'var(--g-blue)'
        }}>
          <Shield size={28} />
        </div>
        <h2 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-1)', marginBottom: '8px', letterSpacing: '-0.02em' }}>
          Welcome back
        </h2>
        <p style={{ color: 'var(--text-2)', fontSize: '14px' }}>
          Sign in to access your AI audit dashboard
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {status === 'error' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: '8px',
            padding: '12px 16px', borderRadius: '8px',
            background: 'rgba(234, 67, 53, 0.1)',
            border: '1px solid rgba(234, 67, 53, 0.2)',
            color: 'var(--g-red)', fontSize: '13px', fontWeight: '500',
            animation: 'fadeIn 0.3s ease'
          }}>
            <AlertCircle size={16} />
            {errorMsg}
          </div>
        )}

        {/* Email Field */}
        <div style={{ position: 'relative' }}>
          <Mail size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="email"
            placeholder="admin@equilens.ai"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ ...inputStyle, borderColor: status === 'error' && !email ? 'var(--g-red)' : 'var(--border-md)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--g-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-md)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Password Field */}
        <div style={{ position: 'relative' }}>
          <Lock size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-3)' }} />
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, borderColor: status === 'error' && !password ? 'var(--g-red)' : 'var(--border-md)' }}
            onFocus={(e) => { e.target.style.borderColor = 'var(--g-blue)'; e.target.style.boxShadow = '0 0 0 3px rgba(66, 133, 244, 0.1)'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--border-md)'; e.target.style.boxShadow = 'none'; }}
          />
        </div>

        {/* Hint text */}
        <div style={{ fontSize: '12px', color: 'var(--text-3)', textAlign: 'center', marginTop: '-8px' }}>
          Hint: Use any valid email format for this demo
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          style={{
            marginTop: '8px',
            width: '100%',
            padding: '14px',
            borderRadius: '12px',
            background: status === 'success' ? 'var(--g-green)' : 'var(--g-blue)',
            color: '#fff',
            border: 'none',
            fontSize: '15px',
            fontWeight: '600',
            cursor: (status === 'loading' || status === 'success') ? 'default' : 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
            transition: 'all 0.3s ease',
            boxShadow: status === 'success' ? 'var(--shadow-glow-green)' : 'var(--shadow-glow-blue)',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {status === 'loading' ? (
            <div style={{ 
              width: '20px', height: '20px', border: '3px solid rgba(255,255,255,0.3)', 
              borderTopColor: '#fff', borderRadius: '50%', 
              animation: 'spin-slow 0.8s linear infinite' 
            }} />
          ) : status === 'success' ? (
            <>
              <CheckCircle2 size={18} />
              Authenticated
            </>
          ) : (
            <>
              Sign In
              <LogIn size={18} />
            </>
          )}

          {/* Shimmer effect inside button */}
          {status !== 'loading' && status !== 'success' && (
            <div style={{
              position: 'absolute', top: 0, left: 0, width: '50%', height: '100%',
              background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.2), transparent)',
              transform: 'skewX(-20deg) translateX(-150%)',
              animation: 'shimmer 3s infinite'
            }} />
          )}
        </button>
      </form>
    </div>
  );
};

export default Login;
