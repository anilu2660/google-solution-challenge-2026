import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * useAlerts — watches audit data & insights, fires threshold-based alerts.
 * Each alert: { id, severity, title, message, metric, timestamp, read }
 *
 * Severity levels: 'critical' | 'high' | 'medium' | 'info'
 */
export const useAlerts = (data, insights, thresholds) => {
  const [alerts, setAlerts]     = useState([]);
  const [toasts, setToasts]     = useState([]);   // auto-dismiss toasts
  const prevDataRef             = useRef(null);

  /* ── Generate alerts from current data ──────────────────────────── */
  const generateAlerts = useCallback((data, insights, thresholds) => {
    if (!data) return [];

    const eeoc  = thresholds?.eeocParity      ?? 80;
    const proxy = thresholds?.proxyCorrelation ?? 0.6;
    const score = thresholds?.minFairnessScore ?? 7.0;

    const newAlerts = [];
    const ts = Date.now();

    /* ── 1. Demographic Parity ─────────────────────────────────────── */
    const parity = data.metrics?.parity ?? 100;
    if (parity < eeoc * 0.75) {
      newAlerts.push({
        id: `parity-critical-${ts}`,
        severity: 'critical',
        title: '🚨 Critical Parity Violation',
        message: `Demographic Parity Score is ${parity}/100 — far below the ${eeoc}% EEOC threshold. Immediate legal review required.`,
        metric: `Parity: ${parity}/100`,
        timestamp: ts,
        read: false,
      });
    } else if (parity < eeoc) {
      newAlerts.push({
        id: `parity-high-${ts}`,
        severity: 'high',
        title: '⚠️ EEOC Threshold Not Met',
        message: `Parity Score ${parity}/100 is below your configured threshold of ${eeoc}%. Your dataset may not satisfy the 4/5ths rule.`,
        metric: `Parity: ${parity}/100`,
        timestamp: ts,
        read: false,
      });
    }

    /* ── 2. Fairness Score ──────────────────────────────────────────── */
    const fairness = data.metrics?.fairnessScore ?? 10;
    if (fairness < score) {
      newAlerts.push({
        id: `fairness-${ts}`,
        severity: fairness < score * 0.7 ? 'critical' : 'high',
        title: fairness < score * 0.7 ? '🚨 Very Low Fairness Score' : '⚠️ Fairness Score Below Threshold',
        message: `Overall Fairness Score is ${fairness}/10, below your minimum of ${score}/10. The dataset shows significant bias risk across multiple dimensions.`,
        metric: `Fairness: ${fairness}/10`,
        timestamp: ts + 1,
        read: false,
      });
    }

    /* ── 3. High-Risk Proxy Correlations ────────────────────────────── */
    const highRiskProxies = (data.heatmap || []).filter(c => c.value > proxy);
    if (highRiskProxies.length > 0) {
      newAlerts.push({
        id: `proxy-${ts}`,
        severity: highRiskProxies.length >= 3 ? 'critical' : 'high',
        title: `⚠️ ${highRiskProxies.length} High-Risk Proxy Variable${highRiskProxies.length > 1 ? 's' : ''} Detected`,
        message: `Columns ${highRiskProxies.map(c => `"${c.x} ↔ ${c.y}"`).join(', ')} exceed the ${(proxy * 100).toFixed(0)}% Cramér's V threshold. These may encode protected attributes.`,
        metric: `Proxies: ${highRiskProxies.length} at >${(proxy * 100).toFixed(0)}%`,
        timestamp: ts + 2,
        read: false,
      });
    }

    /* ── 4. Approval Rate Disparity ─────────────────────────────────── */
    const rates = (data.approvalRates || []).map(r => r.rate);
    if (rates.length >= 2) {
      const gap = Math.max(...rates) - Math.min(...rates);
      if (gap > 30) {
        newAlerts.push({
          id: `gap-${ts}`,
          severity: gap > 50 ? 'critical' : 'medium',
          title: gap > 50 ? '🚨 Extreme Approval Rate Gap' : '⚠️ Large Approval Rate Disparity',
          message: `A ${gap}-percentage-point gap exists between the highest (${Math.max(...rates)}%) and lowest (${Math.min(...rates)}%) approval rate groups.`,
          metric: `Gap: ${gap}pp`,
          timestamp: ts + 3,
          read: false,
        });
      }
    }

    /* ── 5. AI Risk Level ────────────────────────────────────────────── */
    if (insights?.riskLevel === 'CRITICAL') {
      newAlerts.push({
        id: `risk-critical-${ts}`,
        severity: 'critical',
        title: '🚨 AI Risk Assessment: CRITICAL',
        message: `Gemini has assessed this dataset as CRITICAL risk. ${insights?.summary?.slice(0, 120) || 'Immediate remediation required.'}`,
        metric: `Risk: CRITICAL`,
        timestamp: ts + 4,
        read: false,
      });
    } else if (insights?.riskLevel === 'HIGH') {
      newAlerts.push({
        id: `risk-high-${ts}`,
        severity: 'high',
        title: '⚠️ AI Risk Assessment: HIGH',
        message: `Gemini has flagged this dataset as HIGH risk. Review key findings for immediate actions.`,
        metric: `Risk: HIGH`,
        timestamp: ts + 5,
        read: false,
      });
    }

    /* ── 6. Missing demographic detection ───────────────────────────── */
    if (!data.primaryDemographic || data.demographicCols?.length === 0) {
      newAlerts.push({
        id: `no-demo-${ts}`,
        severity: 'medium',
        title: 'ℹ️ No Demographic Column Found',
        message: 'EquiLens could not auto-detect a protected attribute column. Use Column Mapping to manually assign a demographic column for accurate parity analysis.',
        metric: `Demographics: 0 detected`,
        timestamp: ts + 6,
        read: false,
      });
    }

    return newAlerts;
  }, []);

  /* ── Watch data changes and fire alerts ─────────────────────────── */
  useEffect(() => {
    if (!data) return;

    // Only re-generate alerts if the data actually changed (new upload)
    if (prevDataRef.current?.fileName === data.fileName &&
        prevDataRef.current?.rowCount === data.rowCount) return;

    prevDataRef.current = { fileName: data.fileName, rowCount: data.rowCount };

    const newAlerts = generateAlerts(data, insights, thresholds);
    if (newAlerts.length === 0) return;

    setAlerts(prev => [...newAlerts, ...prev].slice(0, 50)); // cap at 50

    // Fire toasts for critical/high alerts (max 3 at a time)
    const urgentAlerts = newAlerts.filter(a => a.severity === 'critical' || a.severity === 'high');
    urgentAlerts.slice(0, 3).forEach((alert, i) => {
      setTimeout(() => {
        setToasts(prev => [...prev, { ...alert, toastId: `toast-${alert.id}` }]);
      }, i * 600); // stagger them
    });
  }, [data, insights, thresholds, generateAlerts]);

  /* ── Dismiss a toast ────────────────────────────────────────────── */
  const dismissToast = useCallback((toastId) => {
    setToasts(prev => prev.filter(t => t.toastId !== toastId));
  }, []);

  /* ── Mark all as read ───────────────────────────────────────────── */
  const markAllRead = useCallback(() => {
    setAlerts(prev => prev.map(a => ({ ...a, read: true })));
  }, []);

  /* ── Mark single as read ────────────────────────────────────────── */
  const markRead = useCallback((id) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  }, []);

  /* ── Clear all ──────────────────────────────────────────────────── */
  const clearAll = useCallback(() => {
    setAlerts([]);
    setToasts([]);
  }, []);

  const unreadCount = alerts.filter(a => !a.read).length;

  return { alerts, toasts, unreadCount, dismissToast, markAllRead, markRead, clearAll };
};
