import Link from 'next/link';
import GanttWrapper from '@/components/horizon/GanttWrapper';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Izinkan hingga 60 detik untuk cold start Render

export default function HorizonPage() {
  const licenseKey = process.env.BRYNTUM_LICENSE_KEY ?? '';

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold">Financial Horizon</h1>
            <p className="text-sm text-gray-600">
              Proyeksikan tujuan keuangan jangka panjang Anda. Kelola target, tabungan bulanan, dan jangka waktu pinjaman Anda.
            </p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Dashboard
          </Link>
        </div>

        <GanttWrapper licenseKey={licenseKey} />

        <p className="mt-6 text-xs text-gray-500 text-center">
          Powered by Bryntum Gantt 8.0 (Enterprise) — visualisasi targetAmount, monthlySaving, interestRate, dan loanTerm.
        </p>
      </div>
    </main>
  );
}
