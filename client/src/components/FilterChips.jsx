export default function FilterChips({ options, value, onChange, getLabel, layout = 'wrap' }) {
  const layoutClass =
    layout === 'grid'
      ? 'grid w-full min-w-0 grid-cols-2 gap-2 sm:grid-cols-3'
      : 'flex w-full min-w-0 flex-wrap gap-2';

  return (
    <div className={`${layoutClass} overflow-visible`}>
      {options.map((opt) => {
        const id = typeof opt === 'string' ? opt : opt.id || opt._id || opt.value;
        const active = value === id;
        return (
          <button
            key={id || 'all'}
            type="button"
            onClick={() => onChange(active ? '' : id)}
            className={`chip ${layout === 'grid' ? 'w-full' : ''} ${active ? 'chip-active' : ''}`}
          >
            {getLabel ? getLabel(opt) : opt.label || opt}
          </button>
        );
      })}
    </div>
  );
}
