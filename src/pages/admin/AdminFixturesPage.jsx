import { useState, useMemo } from 'react'
import { useData } from '../../hooks/useData'
import { G } from '../../lib/theme'

export default function AdminFixturesPage() {
  const { fixtures, venues, updateFixture, loading } = useData()
  const [cls, setCls] = useState('first')

  const clsFixtures = useMemo(() => fixtures.filter(f => f.class === cls), [fixtures, cls])

  // Conflict detection
  const conflicts = useMemo(() => {
    const groups = {}
    fixtures.forEach(f => {
      if (f.venue_id && f.match_date && f.match_time) {
        const key = `${f.venue_id}|${f.match_date}|${f.match_time}`
        groups[key] = (groups[key] || 0) + 1
      }
    })
    const over = {}
    Object.entries(groups).forEach(([k, cnt]) => {
      const vid = k.split('|')[0]
      const venue = venues.find(v => v.id === vid)
      if (venue && cnt > venue.grounds) over[k] = { count: cnt, max: venue.grounds }
    })
    return over
  }, [fixtures, venues])

  const hasConflict = (f) => {
    if (!f.venue_id || !f.match_date || !f.match_time) return false
    return !!conflicts[`${f.venue_id}|${f.match_date}|${f.match_time}`]
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">📝 Fixtures</div>
          <div className="section-sub">Assign venues, dates and times</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className={`class-tab first ${cls === 'first' ? 'sel' : ''}`} onClick={() => setCls('first')}>1st Class ({fixtures.filter(f => f.class === 'first').length})</span>
          <span className={`class-tab second ${cls === 'second' ? 'sel' : ''}`} onClick={() => setCls('second')}>2nd Class ({fixtures.filter(f => f.class === 'second').length})</span>
        </div>
      </div>

      {clsFixtures.length === 0 ? (
        <div className="alert alert-warn">No fixtures yet. Go to Setup to generate them.</div>
      ) : (
        <>
          {Object.keys(conflicts).length > 0 && (
            <div className="alert alert-warn" style={{ marginBottom: 14 }}>
              ⚠ {Object.keys(conflicts).length} time slot(s) overbooked. Highlighted rows below.
            </div>
          )}
          {Array.from(new Set(clsFixtures.map(f => f.round))).map(round => (
            <div key={round} style={{ marginBottom: 20 }}>
              <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: cls === 'first' ? G.lime : G.sky, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 8, borderBottom: '1px solid rgba(126,203,53,0.2)', paddingBottom: 4 }}>
                Round {round}
              </div>
              {clsFixtures.filter(f => f.round === round).map((f, i) => {
                const conflict = hasConflict(f)
                return (
                  <div key={f.id} style={{
                    display: 'grid', gridTemplateColumns: '24px 1fr 40px 1fr 160px 130px 110px',
                    gap: 8, alignItems: 'center',
                    padding: '9px 14px', borderRadius: 5, marginBottom: 5,
                    background: conflict ? 'rgba(224,123,42,0.1)' : G.white,
                    borderLeft: `3px solid ${cls === 'first' ? G.lime : G.sky}`,
                    boxShadow: conflict ? `0 0 0 1.5px ${G.warn}` : 'none',
                  }}>
                    <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, color: G.muted, fontSize: '0.9rem' }}>{i + 1}</span>
                    <span style={{ fontWeight: 700, textAlign: 'right', fontSize: '0.88rem' }}>{f.home_team}</span>
                    <span style={{ textAlign: 'center', color: G.muted, fontWeight: 800, fontFamily: "'Barlow Condensed'", fontSize: '0.9rem' }}>vs</span>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{f.away_team}</span>
                    <select
                      value={f.venue_id || ''}
                      onChange={e => updateFixture(f.id, { venue_id: e.target.value || null })}
                      style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                    >
                      <option value="">— Venue —</option>
                      {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <input
                      type="date"
                      value={f.match_date || ''}
                      onChange={e => updateFixture(f.id, { match_date: e.target.value || null })}
                      style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                    />
                    <input
                      type="time"
                      value={f.match_time || ''}
                      onChange={e => updateFixture(f.id, { match_time: e.target.value || null })}
                      style={{ fontSize: '0.82rem', padding: '6px 8px' }}
                    />
                  </div>
                )
              })}
            </div>
          ))}
        </>
      )}
    </div>
  )
}
