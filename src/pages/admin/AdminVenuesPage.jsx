import { useData } from '../../hooks/useData'
import { G } from '../../lib/theme'

export default function AdminVenuesPage() {
  const { venues, updateVenue, loading } = useData()

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div className="section-title">🏟 Venues</div>
      <div className="section-sub">Configure the 5 clusters and their number of grounds</div>

      <div className="grid2">
        {venues.map(v => (
          <div className="card" key={v.id}>
            <div style={{ marginBottom: 12 }}>
              <label>Venue / Cluster Name</label>
              <input
                value={v.name}
                onChange={e => updateVenue(v.id, { name: e.target.value })}
              />
            </div>
            <div>
              <label>Number of Grounds (simultaneous matches)</label>
              <input
                type="number" min="1" max="10"
                value={v.grounds}
                onChange={e => updateVenue(v.id, { grounds: Math.max(1, parseInt(e.target.value) || 1) })}
              />
            </div>
            <div style={{ marginTop: 10, display: 'flex', gap: 5, flexWrap: 'wrap' }}>
              {Array.from({ length: v.grounds }).map((_, i) => (
                <span key={i} style={{ background: G.pitchLight, color: G.lime, borderRadius: 4, padding: '3px 9px', fontSize: '0.78rem', fontWeight: 700 }}>
                  Ground {i + 1}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-info">
        ℹ Changes save automatically. Each ground can host one match at the same time.
      </div>
    </div>
  )
}
