/**
 * ┌────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT
 * ├────────────────────────────────────────────────────────────────────┤
 * │  File      : frontend/components/ledger/ExportLedgerPdfButton.tsx
 * │  Purpose   : Component: ExportLedgerPdfButton
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net
 * │  GitHub    : https://github.com/setuju
 * │  Website   : https://saturumah.net
 * │  Created   : 10-11-2026
 * │  License   : MIT
 * └────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

/**
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

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

function fmtPeriod(iso: string, groupBy: ReportGroupBy): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  if (groupBy === 'year') return String(d.getUTCFullYear());
  if (groupBy === 'month') {
    return d.toLocaleString('en-US', {
      month: 'short',
      year: 'numeric',
      timeZone: 'UTC',
    });
  }
  if (groupBy === 'week') {
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      timeZone: 'UTC',
    });
  }
  return d.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

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
      const { jsPDF } = await import('jspdf');
      const autoTableMod = await import('jspdf-autotable');
      const autoTable = autoTableMod.default;

      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = doc.internal.pageSize.getWidth();

      // ── Header ──
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

      // ── Filter context line ──
      doc.setFontSize(9);
      doc.setTextColor(80, 80, 87);
      const projLabel = includeProjections ? 'including projections' : 'actuals only';
      const contextLine = `Range ${from} to ${to} | ${TYPE_LABELS[type]} | Grouped by ${GROUP_LABELS[groupBy]} | ${projLabel}`;
      doc.text(contextLine, 40, 86);

      // ── Summary block ──
      doc.setFontSize(11);
      doc.setTextColor(24, 24, 27);
      doc.text(`Periods: ${buckets.length}`, 40, 112);
      doc.text(`Total in:  ${usd.format(totals.income)}`, 40, 128);
      doc.text(`Total out: ${usd.format(totals.expense)}`, 40, 144);
      doc.setFont('helvetica', 'bold');
      doc.text(`Net:       ${usd.format(totals.net)}`, 40, 160);
      doc.setFont('helvetica', 'normal');

      // ── Table (conditional columns) ──
      const hasBalances = groupBy === 'month' || groupBy === 'year';
      const head = hasBalances
        ? [['#', 'Period', 'Income', 'Expense', 'Net', 'Opening', 'Closing']]
        : [['#', 'Period', 'Income', 'Expense', 'Net']];

      const body = buckets.map((b, i) => {
        const base: string[] = [
          String(i + 1),
          fmtPeriod(b.period, groupBy),
          b.income > 0 ? usd.format(b.income) : '—',
          b.expense > 0 ? usd.format(b.expense) : '—',
          `${b.net >= 0 ? '+' : ''}${usd.format(b.net)}`,
        ];
        if (hasBalances) {
          base.push(usd.format(b.opening ?? 0), usd.format(b.closing ?? 0));
        }
        return base;
      });

      // Column styles: # center, Period left, all numerics right-aligned.
      // Explicit cellWidth prevents autotable from squashing the numeric
      // columns (root cause of the misalignment).
      type ColStyle = { halign: 'left' | 'center' | 'right'; cellWidth?: number };
      const columnStyles: Record<number, ColStyle> = {
        0: { halign: 'center', cellWidth: 28 },
        1: { halign: 'left', cellWidth: 110 },
        2: { halign: 'right', cellWidth: 85 },
        3: { halign: 'right', cellWidth: 85 },
        4: { halign: 'right', cellWidth: 85 },
      };
      if (hasBalances) {
        columnStyles[5] = { halign: 'right', cellWidth: 85 };
        columnStyles[6] = { halign: 'right', cellWidth: 85 };
      }

      autoTable(doc, {
        tableWidth: 'auto',
        margin: { left: 40, right: 40 },
        startY: 182,
        head,
        body,
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [0, 112, 186], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles,
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(8);
          doc.setTextColor(160);
          doc.text(
            'Financial OS - ledger report generated from verified transactions',
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
