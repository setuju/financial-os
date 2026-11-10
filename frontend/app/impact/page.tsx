import Link from 'next/link';
import { getSurplus, getImpactReceivers } from '@/lib/api';
import DistributeButton from '@/components/DistributeButton';

export const dynamic = 'force-dynamic';

export default async function ImpactWallet() {
  const [surplusData, receiversData] = await Promise.all([
    getSurplus(),
    getImpactReceivers(),
  ]);
  const currentSurplus = surplusData?.metrics.currentSurplus || 0;
  const receivers = receiversData?.receivers || [];

  return (
    <main className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="mb-1 text-3xl font-bold">Impact Wallet</h1>
            <p className="text-sm text-gray-600">
              Distribute your verified surplus to vetted causes via PayPal Payouts.
            </p>
          </div>
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            ← Dashboard
          </Link>
        </div>

        <DistributeButton currentSurplus={currentSurplus} receivers={receivers} />

        <div className="mt-8 rounded-lg border border-blue-100 bg-blue-50 p-4">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> This transaction is processed via PayPal Sandbox. No real money is moved.
          </p>
        </div>
      </div>
    </main>
  );
}
