import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export type PdfTableRow = Array<string | number>;

export function makeReportPdf({
  title,
  subtitle,
  metrics,
  sections,
}: {
  title: string;
  subtitle?: string;
  metrics?: Array<{ label: string; value: string }>;
  sections?: Array<{ title: string; head: string[]; body: PdfTableRow[] }>;
}) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(20, 83, 45);
  doc.rect(0, 0, pageWidth, 96, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.text(title, 40, 42);
  if (subtitle) {
    doc.setFontSize(10);
    doc.text(subtitle, 40, 62);
  }

  let y = 124;
  if (metrics?.length) {
    const colWidth = (pageWidth - 80) / Math.min(metrics.length, 4);
    metrics.slice(0, 4).forEach((metric, index) => {
      const x = 40 + index * colWidth;
      doc.setDrawColor(220, 226, 220);
      doc.roundedRect(x, y, colWidth - 10, 58, 6, 6);
      doc.setTextColor(95, 108, 101);
      doc.setFontSize(9);
      doc.text(metric.label, x + 12, y + 20);
      doc.setTextColor(23, 37, 30);
      doc.setFontSize(15);
      doc.text(metric.value, x + 12, y + 42);
    });
    y += 86;
  }

  sections?.forEach((section) => {
    doc.setTextColor(23, 37, 30);
    doc.setFontSize(13);
    doc.text(section.title, 40, y);
    autoTable(doc, {
      startY: y + 12,
      head: [section.head],
      body: section.body,
      styles: { fontSize: 8, cellPadding: 5 },
      headStyles: { fillColor: [20, 83, 45], textColor: 255 },
      alternateRowStyles: { fillColor: [246, 248, 246] },
      margin: { left: 40, right: 40 },
    });
    y = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY
      ? (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 32
      : y + 120;
  });

  return doc;
}

export function downloadPdf(doc: jsPDF, filename: string) {
  doc.save(filename);
}
