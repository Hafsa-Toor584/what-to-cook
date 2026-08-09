export default function SkeletonCard() {
  return (
    <div className="overflow-hidden rounded-[1.75rem] bg-white/80 shadow-soft">
      <div className="skeleton aspect-[16/10] w-full" />
      <div className="space-y-3 p-4">
        <div className="skeleton h-5 w-2/3 rounded-lg" />
        <div className="skeleton h-4 w-1/3 rounded-lg" />
      </div>
    </div>
  );
}
