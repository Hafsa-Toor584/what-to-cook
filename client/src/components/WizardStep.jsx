export default function WizardStep({ title, options, value, onChange }) {
  return (
    <div className="animate-fade-up space-y-4">
      <h2 className="font-display text-2xl font-bold text-leaf-900">{title}</h2>
      <div className="grid grid-cols-1 gap-3">
        {options.map((opt) => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={`flex min-h-[4.75rem] items-center gap-4 rounded-3xl border-2 px-4 py-3 text-start text-lg font-extrabold transition active:scale-[0.98] ${
                active
                  ? 'border-leaf-700 bg-leaf-700 text-white shadow-md'
                  : 'border-leaf-200 bg-white/90 text-leaf-900 hover:border-leaf-400 hover:bg-white'
              }`}
            >
              <span className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ${active ? 'bg-white/20' : 'bg-leaf-50'}`} aria-hidden>
                {opt.icon}
              </span>
              <span>{opt.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
