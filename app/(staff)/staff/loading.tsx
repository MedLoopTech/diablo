export default function Loading() {
  return (
    <div className="flex flex-col gap-6">
      <div className="h-8 w-56 animate-pulse rounded-lg bg-line" />
      <div className="h-20 animate-pulse rounded-card bg-line" />
      <div className="h-20 animate-pulse rounded-card bg-line" />
      <div className="h-40 animate-pulse rounded-card bg-line" />
    </div>
  );
}
