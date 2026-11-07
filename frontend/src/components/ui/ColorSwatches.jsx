import Icon from './Icon';

/** Colour picker used for workspaces and labels. `shape` is 'square' (rounded) or 'circle'. */
export default function ColorSwatches({ colors, value, onChange, shape = 'square', size = 30 }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }} role="radiogroup">
      {colors.map((c) => {
        const selected = value === c;
        return (
          <button
            key={c}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={c}
            onClick={() => onChange(c)}
            style={{
              width: size, height: size, borderRadius: shape === 'circle' ? 99 : 9, background: c,
              border: 'none', cursor: 'pointer', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: selected ? `0 0 0 2px #fff, 0 0 0 4px ${c}` : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
              transform: selected ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            {selected && <Icon name="check" size={size * 0.5} strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
