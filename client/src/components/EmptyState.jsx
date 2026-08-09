export default function EmptyState({ icon = '🍽️', title, message, action }) {
  return (
    <div className="surface flex flex-col items-center gap-3 px-6 py-12 text-center animate-fade-up">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-leaf-100 text-4xl">{icon}</span>
      <h3 className="font-display text-xl font-bold text-leaf-900">{title}</h3>
      {message && <p className="max-w-xs font-semibold text-leaf-600">{message}</p>}
      {action}
    </div>
  );
}
