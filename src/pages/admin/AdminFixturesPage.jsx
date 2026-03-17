import { useState, useMemo } from 'react'
import { useData } from '../../hooks/useData'
import { useLeagueTab } from '../../hooks/useLeagueTab'
import LeagueTabs from '../../components/LeagueTabs'
import { G } from '../../lib/theme'

export default function AdminFixturesPage() {
  const { leagues, fixtures, venues, updateFixture, loading } = useData()
  const [activeId, setActiveId, activeLeague] = useLeagueTab(leagues)

  const clsFixtures = useMemo(() => fixtures.filter(f => f.league_id === activeId), [fixtures, activeId])

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
      if (venue && cnt > venue.grounds) over[k] = true
    })
    return over
  }, [fixtures, venues])

  const hasConflict = (f) =>
    f.venue_id && f.match_date && f.match_time
      ? !!conflicts[`${f.venue_id}|${f.match_date}|${f.match_time}`]
      : false

  if (loading) return <div className="spinner" />

  const accent = activeLeague?.color || G.lime
  const conflictCount = Object.keys(conflicts).length

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">📝 Fixtures</div>
          <div className="section-sub">Assign venues, dates and times</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <LeagueTabs leagues={leagues} activeId={activeId} onChange={setActiveId} />
        </div>
      </div>

      {conflictCount > 0 && (
        <div className="alert alert-warn" style={{ marginBottom: 14 }}>
          ⚠ {conflictCount} time slot(s) overbooked. Check highlighted fixtures.
        </div>
      )}

      {clsFixtures.length === 0 ? (
        <div className="alert alert-warn">No fixtures for {activeLeague?.name}. Go to Setup to generate them.</div>
      ) : (
        Array.from(new Set(clsFixtures.map(f => f.round))).map(round => (
          <div key={round} style={{ marginBottom: 20 }}>
            <div style={{
              fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem',
              color: accent, letterSpacing: '0.1em', textTransform: 'uppercase',
              marginBottom: 8, borderBottom: `1px solid ${accent}33`, paddingBottom: 4,
            }}>
              Round {round}
            </div>
            {clsFixtures.filter(f => f.round === round).map((f, i) => {
              const conflict = hasConflict(f)
              return (
                <div key={f.id} style={{
                  padding: '10px 14px', borderRadius: 5, marginBottom: 6,
                  background: conflict ? 'rgba(224,123,42,0.1)' : G.white,
                  borderLeft: `3px solid ${conflict ? G.warn : accent}`,
                  boxShadow: conflict ? `0 0 0 1.5px ${G.warn}` : 'none',
                }}>
                  <div style={{ display: 'flex', gap: 6, fontWeight: 700, fontSize: '0.88rem', marginBottom: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                    <span style={{ color: G.muted, fontSize: '0.78rem', minWidth: 22 }}>{i+1}</span>
                    <span style={{ flex: 1, textAlign: 'right' }}>{f.home_team}</span>
                    <span style={{ color: G.muted, fontWeight: 800, fontFamily: "'Barlow Condensed'", padding: '0 4px' }}>vs</span>
                    <span style={{ flex: 1 }}>{f.away_team}</span>
                    {conflict && <span style={{ fontSize: '0.72rem', color: G.warn }}>⚠ conflict</span>}
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 6 }}>
                    <select value={f.venue_id || ''} onChange={e => updateFixture(f.id, { venue_id: e.target.value || null })} style={{ fontSize: '0.82rem', padding: '6px 8px' }}>
                      <option value="">— Venue —</option>
                      {venues.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <input type="date" value={f.match_date || ''} onChange={e => updateFixture(f.id, { match_date: e.target.value || null })} style={{ fontSize: '0.82rem', padding: '6px 8px' }} />
                    <input type="time" value={f.match_time || ''} onChange={e => updateFixture(f.id, { match_time: e.target.value || null })} style={{ fontSize: '0.82rem', padding: '6px 8px' }} />
                  </div>
                </div>
              )
            })}
          </div>
        ))
      )}
    </div>
  )
}
