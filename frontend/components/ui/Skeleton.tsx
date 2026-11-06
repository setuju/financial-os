export default function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-surface-sunken ${className}`}
      aria-hidden
    />
  );
}
