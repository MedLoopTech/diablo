export default function Loading() {
  return (
    <div className="flex flex-col gap-4">
      <div className="h-8 w-40 animate-pulse rounded-lg bg-line" />
      <div className="h-44 animate-pulse rounded-card bg-line" />
      <div className="h-24 animate-pulse rounded-card bg-line" />
      <div className="h-16 animate-pulse rounded-card bg-line" />
    </div>
  );
}
