import Icon from './Icon';
import { gradients } from '../../utils/helpers';

/** Gradient swatch grid for board backgrounds. */
export default function BackgroundPicker({ value, onChange }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }} role="radiogroup" aria-label="Board background">
      {gradients.map((g, i) => {
        const selected = value === g;
        return (
          <button
            key={g} type="button" role="radio" aria-checked={selected} aria-label={`Background ${i + 1}`}
            onClick={() => onChange(g)}
            style={{
              height: 44, borderRadius: 11, background: g, border: 'none', cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: selected ? '0 0 0 2px #fff, 0 0 0 4px var(--blue)' : 'inset 0 0 0 1px rgba(0,0,0,0.06)',
              transform: selected ? 'scale(1.04)' : 'scale(1)', transition: 'transform 0.15s, box-shadow 0.15s',
            }}
          >
            {selected && <Icon name="check" size={18} strokeWidth={3} />}
          </button>
        );
      })}
    </div>
  );
}
