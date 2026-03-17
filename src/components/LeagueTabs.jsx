import { G } from '../lib/theme'

export default function LeagueTabs({ leagues, activeId, onChange, extra }) {
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
      {leagues.map(l => {
        const isActive = l.id === activeId
        return (
          <span
            key={l.id}
            onClick={() => onChange(l.id)}
            style={{
              display: 'inline-flex', alignItems: 'center',
              padding: '5px 14px', borderRadius: 20, cursor: 'pointer',
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: '0.88rem', letterSpacing: '0.05em', textTransform: 'uppercase',
              border: `2px solid ${l.color}`,
              background: isActive ? l.color : 'transparent',
              color: isActive ? (isLight(l.color) ? G.pitch : '#fff') : l.color,
              transition: 'all 0.15s',
              userSelect: 'none',
            }}
          >
            {l.name}
          </span>
        )
      })}
      {extra}
    </div>
  )
}

// rough luminance check to decide text colour on filled tab
function isLight(hex) {
  const h = hex.replace('#','')
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
  return (r*299 + g*587 + b*114) / 1000 > 140
}
