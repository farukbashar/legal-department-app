import { jsPDF } from 'jspdf';

// Minimal text-based report builder. `sections` is an array of:
//   { heading: string, rows: [[label, value], ...] }  -> label/value pairs
//   { heading: string, text: string }                 -> a paragraph
// Keeps layout simple and readable rather than trying to replicate the app's
// visual design — this is meant for printing/archiving, not screenshots.
export function exportReportPDF({ title, subtitle, sections, filename }) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const marginX = 48;
  let y = 56;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text(title, marginX, y);
  y += 22;

  if (subtitle) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(subtitle, marginX, y);
    doc.setTextColor(0);
    y += 24;
  }

  doc.setDrawColor(220);
  doc.line(marginX, y, 547, y);
  y += 20;

  const pageBottom = 780;

  const ensureSpace = (needed) => {
    if (y + needed > pageBottom) {
      doc.addPage();
      y = 56;
    }
  };

  sections.forEach((section) => {
    ensureSpace(28);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(section.heading, marginX, y);
    y += 16;

    if (section.rows) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      section.rows.forEach(([label, value]) => {
        ensureSpace(16);
        doc.setTextColor(100);
        doc.text(String(label), marginX, y);
        doc.setTextColor(0);
        doc.text(String(value ?? '—'), marginX + 160, y);
        y += 15;
      });
    }

    if (section.text) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      const lines = doc.splitTextToSize(section.text, 499);
      lines.forEach((line) => {
        ensureSpace(14);
        doc.text(line, marginX, y);
        y += 14;
      });
    }

    y += 14;
  });

  doc.save(filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
}
