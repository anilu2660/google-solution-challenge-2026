/**
 * EquiLens PDF Export Service
 * Uses html2canvas to snapshot the dashboard, then jsPDF to build a multi-page PDF.
 */
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const G = {
  blue:   [66,  133, 244],
  red:    [234, 67,  53 ],
  yellow: [251, 188, 5  ],
  green:  [52,  168, 83 ],
};

const addGoogleBar = (pdf, width) => {
  const h = 4;
  const segW = width / 4;
  [G.blue, G.red, G.yellow, G.green].forEach(([r,g,b], i) => {
    pdf.setFillColor(r, g, b);
    pdf.rect(i * segW, 0, segW, h, 'F');
  });
};

export const exportDashboardPDF = async (containerRef, data, insights) => {
  if (!containerRef?.current) return;

  // 1. Screenshot the dashboard element at 2× resolution for crisp text
  const canvas = await html2canvas(containerRef.current, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#0d0d10',
    logging: false,
    ignoreElements: el => el.tagName === 'CANVAS', // skip Three.js canvas
  });

  const imgData  = canvas.toDataURL('image/png');
  const pdfW     = 210; // A4 width mm
  const pdfH     = 297; // A4 height mm
  const margin   = 12;
  const innerW   = pdfW - margin * 2;

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // ── Page 1: cover / summary ─────────────────────────────────────────────────
  pdf.setFillColor(13, 13, 16);
  pdf.rect(0, 0, pdfW, pdfH, 'F');
  addGoogleBar(pdf, pdfW);

  // Logo dots
  const dotR = 3.5;
  [G.blue, G.red, G.yellow, G.green].forEach(([r,g,b], i) => {
    pdf.setFillColor(r, g, b);
    pdf.circle(margin + i * (dotR * 2 + 2), 22, dotR, 'F');
  });

  // Title
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(28);
  pdf.setTextColor(232, 234, 237);
  pdf.text('EquiLens', margin, 38);

  pdf.setFontSize(10);
  pdf.setTextColor(...G.blue);
  pdf.text('AI Bias Audit Report', margin, 46);

  // Horizontal rule
  pdf.setDrawColor(...G.blue);
  pdf.setLineWidth(0.4);
  pdf.line(margin, 50, pdfW - margin, 50);

  // Dataset info
  pdf.setFontSize(10);
  pdf.setTextColor(154, 160, 166);
  pdf.text(`Dataset: ${data?.fileName || 'Untitled'}`, margin, 60);
  pdf.text(`Records: ${data?.rowCount?.toLocaleString() || 'N/A'}  ·  Columns: ${data?.columnCount || 'N/A'}`, margin, 67);
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}`, margin, 74);

  // Risk badge
  const risk   = insights?.riskLevel || 'HIGH';
  const riskRGB = risk === 'CRITICAL' ? G.red : risk === 'HIGH' ? G.yellow : risk === 'MEDIUM' ? G.blue : G.green;
  pdf.setFillColor(...riskRGB.map(c => Math.floor(c * 0.15)));
  pdf.roundedRect(margin, 80, 40, 10, 2, 2, 'F');
  pdf.setTextColor(...riskRGB);
  pdf.setFontSize(8);
  pdf.setFont('helvetica', 'bold');
  pdf.text(`${risk} RISK`, margin + 5, 86.5);

  // AI Summary
  if (insights?.summary) {
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9.5);
    pdf.setTextColor(154, 160, 166);
    const lines = pdf.splitTextToSize(insights.summary, innerW);
    pdf.text(lines, margin, 100);
  }

  // Key metrics
  let yPos = 128;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...G.blue);
  pdf.text('Key Metrics', margin, yPos);
  yPos += 8;

  const metrics = [
    { label: 'Demographic Parity Score', value: `${data?.metrics?.parity || 0}%`, color: G.red },
    { label: 'Proxy Variables Detected',  value: `${data?.metrics?.proxyVars || 0}`,   color: G.yellow },
    { label: 'Overall Fairness Score',    value: `${data?.metrics?.fairnessScore || 0} / 10`, color: G.blue },
  ];
  metrics.forEach(({ label, value, color }) => {
    pdf.setFillColor(30, 30, 40);
    pdf.roundedRect(margin, yPos, innerW, 12, 2, 2, 'F');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(154, 160, 166);
    pdf.text(label, margin + 4, yPos + 7.5);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(...color);
    pdf.text(value, pdfW - margin - 4, yPos + 7.5, { align: 'right' });
    yPos += 16;
  });

  // ── Page 2: Key Findings ────────────────────────────────────────────────────
  if (insights?.keyFindings?.length) {
    pdf.addPage();
    pdf.setFillColor(13, 13, 16);
    pdf.rect(0, 0, pdfW, pdfH, 'F');
    addGoogleBar(pdf, pdfW);

    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(...G.yellow);
    pdf.text('Key Findings', margin, 22);

    let y = 32;
    insights.keyFindings.forEach((finding, i) => {
      pdf.setFillColor(30, 30, 28);
      const wrapped = pdf.splitTextToSize(finding, innerW - 14);
      const blockH  = wrapped.length * 5 + 10;
      pdf.roundedRect(margin, y, innerW, blockH, 2, 2, 'F');

      // Number badge
      const badgeColors = [G.blue, G.red, G.yellow, G.green];
      pdf.setFillColor(...badgeColors[i % 4]);
      pdf.circle(margin + 5, y + blockH / 2, 4, 'F');
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(255, 255, 255);
      pdf.text(`${i + 1}`, margin + 5, y + blockH / 2 + 2, { align: 'center' });

      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(154, 160, 166);
      pdf.text(wrapped, margin + 13, y + 7);
      y += blockH + 5;
    });
  }

  // ── Page 3: LLM Predictions + Remediation ──────────────────────────────────
  if (insights?.predictions?.length || insights?.suggestions?.length) {
    pdf.addPage();
    pdf.setFillColor(13, 13, 16);
    pdf.rect(0, 0, pdfW, pdfH, 'F');
    addGoogleBar(pdf, pdfW);

    let y = 22;

    if (insights?.predictions?.length) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...G.red);
      pdf.text('LLM Predictions', margin, y);
      y += 10;

      insights.predictions.forEach(pred => {
        const wrapped = pdf.splitTextToSize(pred, innerW - 10);
        const blockH  = wrapped.length * 5 + 10;
        pdf.setFillColor(40, 20, 20);
        pdf.roundedRect(margin, y, innerW, blockH, 2, 2, 'F');
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(154, 160, 166);
        pdf.text(wrapped, margin + 6, y + 7);
        y += blockH + 5;
      });
      y += 6;
    }

    if (insights?.suggestions?.length) {
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(...G.green);
      pdf.text('AI Remediation Roadmap', margin, y);
      y += 10;

      insights.suggestions.forEach((sug, i) => {
        const wrapped = pdf.splitTextToSize(sug, innerW - 14);
        const blockH  = wrapped.length * 5 + 10;
        pdf.setFillColor(15, 30, 20);
        pdf.roundedRect(margin, y, innerW, blockH, 2, 2, 'F');

        pdf.setFillColor(...G.green);
        pdf.roundedRect(margin + 2, y + blockH / 2 - 4, 8, 8, 1, 1, 'F');
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${i + 1}`, margin + 6, y + blockH / 2 + 1.5, { align: 'center' });

        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(154, 160, 166);
        pdf.text(wrapped, margin + 14, y + 7);
        y += blockH + 5;

        if (y > pdfH - 30) { pdf.addPage(); pdf.setFillColor(13, 13, 16); pdf.rect(0, 0, pdfW, pdfH, 'F'); addGoogleBar(pdf, pdfW); y = 22; }
      });
    }
  }

  // ── Page N: Dashboard screenshot ────────────────────────────────────────────
  const imgH = (canvas.height / canvas.width) * innerW;
  let imgY   = 0;
  let page   = 0;

  while (imgY < imgH) {
    pdf.addPage();
    pdf.setFillColor(13, 13, 16);
    pdf.rect(0, 0, pdfW, pdfH, 'F');
    addGoogleBar(pdf, pdfW);

    const pageImgH = Math.min(pdfH - 20, imgH - imgY);
    pdf.addImage(imgData, 'PNG', margin, 8, innerW, pageImgH, undefined, 'FAST', 0, -imgY);
    imgY += pdfH - 20;
    page++;
    if (page > 6) break; // safety cap
  }

  // ── Footer on every page ────────────────────────────────────────────────────
  const totalPages = pdf.internal.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    pdf.setPage(p);
    pdf.setFontSize(7);
    pdf.setTextColor(95, 99, 104);
    pdf.text(`EquiLens AI Bias Audit  ·  Page ${p} of ${totalPages}  ·  Confidential`, pdfW / 2, pdfH - 5, { align: 'center' });
  }

  pdf.save(`EquiLens_Bias_Report_${new Date().toISOString().slice(0, 10)}.pdf`);
};
