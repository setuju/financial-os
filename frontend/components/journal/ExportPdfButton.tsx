/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │  ⌂  SATURUMAH.NET · FINANCIAL OS · FILE CONTRACT                  │
 * │  ──────────────────────────────────────────────────────────────────   │
 * │  File      : frontend/components/journal/ExportPdfButton.tsx        │
 * │  Purpose   : Component: ExportPdfButton                             │
 * │  Author    : Jack — Jack[at]SatuRumah[dot]Net                      │
 * │  GitHub    : https://github.com/setuju                            │
 * │  Website   : https://saturumah.net                              │
 * │  Created   : 10-11-2026                                             │
 * │  License   : MIT                                                  │
 * └──────────────────────────────────────────────────────────────────────┘
 *
 * @author    Jack <Jack[at]SatuRumah[dot]Net>
 * @created   10-11-2026
 * @package   financial-os/frontend
 * @license   MIT
 */

'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { Transaction } from '@/lib/api';

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export default function ExportPdfButton({
  transactions,
}: {
  transactions: Transaction[];
}) {
  const [generating, setGenerating] = useState(false);
  const disabled = generating || transactions.length === 0;

  const handleExport = async () => {
    if (disabled) return;
    setGenerating(true);
    try {
      // Dynamic import keeps jspdf (~340KB) out of the initial bundle.
      // Loaded only when user clicks "Download PDF".
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
      doc.text('Transaction Journal', 40, 68);

      const exportDate = new Date().toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
      doc.text(`Exported ${exportDate}`, pageWidth - 40, 50, { align: 'right' });

      // Summary block
      const totalIn = transactions
        .filter((t) => t.type === 'income')
        .reduce((s, t) => s + Number(t.amount), 0);
      const totalOut = transactions
        .filter((t) => t.type === 'expense')
        .reduce((s, t) => s + Number(t.amount), 0);
      const net = totalIn - totalOut;

      doc.setFontSize(11);
      doc.setTextColor(24, 24, 27);
      doc.text(`Transactions: ${transactions.length}`, 40, 100);
      doc.text(`Total in:  ${usd.format(totalIn)}`, 40, 116);
      doc.text(`Total out: ${usd.format(totalOut)}`, 40, 132);
      doc.setFont('helvetica', 'bold');
      doc.text(`Net:       ${usd.format(net)}`, 40, 148);
      doc.setFont('helvetica', 'normal');

      // Table
      autoTable(doc, {
        startY: 170,
        head: [['#', 'Date', 'Description', 'Category', 'Type', 'Amount']],
        body: transactions.map((t, i) => [
                String(i + 1),

          new Date(t.occurred_at).toLocaleDateString('en-US'),
          t.raw_text,
          t.category,
          t.type,
          `${t.type === 'income' ? '+' : '-'}${usd.format(Number(t.amount))}`,
        ]  ),
        styles: { fontSize: 8, cellPadding: 4 },
        headStyles: { fillColor: [0, 112, 186], textColor: 255 },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          4: { halign: 'right' },
        },
        didDrawPage: () => {
          const pageHeight = doc.internal.pageSize.getHeight();
          doc.setFontSize(8);
          doc.setTextColor(160);
          doc.text(
            'Financial OS — generated from verified transactions',
            40,
            pageHeight - 20,
          );
        },
      });

      doc.save(`financial-os-journal-${new Date().toISOString().slice(0, 10)}.pdf`);
    } catch (err) {
      console.error('PDF export failed', err);
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
