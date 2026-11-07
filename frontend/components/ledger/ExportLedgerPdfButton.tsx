'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { SummaryBucket, ReportGroupBy, ReportType } from '@/lib/api';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const GROUP_LABELS: Record<ReportGroupBy, string> = {
  day: 'Day',
  week: 'Week',
  month: 'Month',
  year: 'Year',
};

const TYPE_LABELS: Record<ReportType, string> = {
  all: 'Income + Expense',
  income: 'Income only',
  expense: 'Expense only',
};

export default function ExportLedgerPdfButton({
  buckets,
  totals,
  from,
  to,
  groupBy,
  type,
  includeProjections,
}: {
  buckets: SummaryBucket[];
  totals: { income: number; expense: number; net: number };
  from: string;
  to: string;
  groupBy: ReportGroupBy;
  type: ReportType;
  includeProjections: boolean;
}) {
  const [generating, setGenerating] = useState(false);
  const disabled = generating || buckets.length === 0;

  const handleExport = async () => {
    if (disabled) return;
    setGenerating(true);
    try {
      // Dynamic import keeps jspdf out of the initial /ledger bundle.
      const { jsPDF } = await import('jspdf');
      const autoTableMod = await import('jspdf-autotable');
      const autoTable = autoTableMod.default;

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header
      doc.setFontSize(18);
      doc.setTextColor(24, 24, 27);
      doc.text('Financial OS', 40, 50);

      doc.setFontSize(10);
      doc.setTextColor(120, 120, 127);
      doc.text('Ledger Report', 40, 68);

      const exportDate = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      doc.text(`Exported ${exportDate}`, pageWidth - 40, 50, { align: 'right' });

      // Filter context line
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 87);
      const projLabel = includeProjections ? 'including projections' : 'actuals only';
      doc.text(
        `Range ${from} → ${to}  ·  ${TYPE_LABELS[type]}  ·  Grouped by ${GROUP_LABELS[groupBy]}  ·  ${projLabel}`,
        40,
        86,
      );

      // Summary block
      doc.setFontSize(11);
      doc.setTextColor(24, 24, 27);
      doc.text(`Periods: ${buckets.length}`, 40, 112);
      doc.text(`Total in:  ${usd.format(totals.income)}`, 40, 128);
      doc.text(`Total out: ${usd.format(totals.expense)}`, 40, 144);
      doc.setFont('helvetica', 'bold');
      doc.text(`Net:       ${usd.format(totals.net)}`, 40, 160);
      doc.setFont('helvetica', 'normal');

      // Table
      autoTable(doc, {
        startY: 182,
        head: [['Period', 'Income', 'Expense', 'Net', 'Status']],
        body: buckets.map((b) => [
          b.label,
          b.income > 0 ? usd.format(b.income) : '—',
          b.expense > 0 ? usd.format(b.expense) : '—',
          `${b.net >= 0 ? '+' : ''}${usd.format(b.net)}`,
          b.isProjection ? 'Projected' : 'Actual',
        ]),
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [0, 112, 186], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          1: { halign: 'right' },
          2: { halign: 'right' },
          3: { halign: 'right' },
        },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(8);
          doc.setTextColor(160);
          doc.text(
            'Financial OS — ledger report generated from verified transactions',
            40,
            pageHeight - 20,
          );
        },
      });

      doc.save(`financial-os-ledger-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('Ledger PDF export failed', err);
      window.alert('PDF export failed. Check browser console for details.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleExport}
      disabled={disabled}
      className="inline-flex items-center gap-2 rounded-lg border border-line-strong bg-surface-raised px-4 py-2.5 text-sm font-medium text-ink transition-colors hover:bg-surface-sunken disabled:cursor-not-allowed disabled:opacity-60"
    >
      {generating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {generating ? 'Generating…' : 'Download PDF'}
    </button>
  );
}
