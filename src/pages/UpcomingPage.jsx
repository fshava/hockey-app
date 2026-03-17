import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import LeagueTabs from '../components/LeagueTabs'
import { G } from '../lib/theme'

const ALL = { id: '__all__', name: 'All', color: G.white }

export default function UpcomingPage() {
  const { leagues, fixtures, venues, loading } = useData()
  const [activeId, setActiveId] = useState('__all__')

  const allLeagues = [ALL, ...leagues]
  const today = new Date().toISOString().split('T')[0]

  const upcoming = useMemo(() =>
    fixtures.filter(f => {
      const notPlayed = f.home_goals == null
      const hasDate   = !!f.match_date
      const lgMatch   = activeId === '__all__' || f.league_id === activeId
      return notPlayed && hasDate && lgMatch
    }).sort((a, b) => a.match_date.localeCompare(b.match_date) || (a.match_time||'').localeCompare(b.match_time||'')),
    [fixtures, activeId])

  const grouped = useMemo(() => {
    const g = {}
    upcoming.forEach(f => { if (!g[f.match_date]) g[f.match_date] = []; g[f.match_date].push(f) })
    return g
  }, [upcoming])

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">📅 Upcoming</div>
          <div className="section-sub">{upcoming.length} matches scheduled</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <LeagueTabs leagues={allLeagues} activeId={activeId} onChange={setActiveId} />
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="alert alert-info">No upcoming fixtures scheduled.</div>
      ) : (
        Object.entries(grouped).map(([date, dayFixtures]) => {
          const d       = new Date(date + 'T00:00:00')
          const isToday = date === today
          return (
            <div key={date} style={{ marginBottom: 24 }}>
              <div style={{
                fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem',
                color: isToday ? '#ffd700' : G.lime, letterSpacing: '0.1em', textTransform: 'uppercase',
                marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10,
                borderBottom: '1px solid rgba(126,203,53,0.2)', paddingBottom: 4,
              }}>
                {isToday && '⭐ '}{d.toLocaleDateString('en-GB', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                {isToday && <span style={{ fontSize: '0.72rem', background: '#ffd700', color: G.pitch, padding: '2px 8px', borderRadius: 10 }}>TODAY</span>}
              </div>
              {dayFixtures.map(f => {
                const venue = venues.find(v => v.id === f.venue_id)
                const lg    = leagues.find(l => l.id === f.league_id)
                return (
                  <div key={f.id} style={{
                    background: G.pitchLight, borderRadius: 6, padding: '10px 16px', marginBottom: 6,
                    borderLeft: `3px solid ${lg?.color || G.muted}`,
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: 700, color: G.white, fontSize: '0.9rem' }}>{f.home_team}</div>
                        <div style={{ fontSize: '0.68rem', color: G.muted }}>HOME</div>
                      </div>
                      <div style={{ textAlign: 'center', fontFamily: "'Barlow Condensed'", fontWeight: 800, color: G.muted }}>VS</div>
                      <div>
                        <div style={{ fontWeight: 700, color: G.white, fontSize: '0.9rem' }}>{f.away_team}</div>
                        <div style={{ fontSize: '0.68rem', color: G.muted }}>AWAY</div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 4 }}>
                      {lg && <span style={{ fontSize: '0.7rem', fontWeight: 700, color: lg.color, background: `${lg.color}15`, padding: '2px 8px', borderRadius: 10 }}>{lg.name}</span>}
                      {venue && <span className="venue-badge">{venue.name}</span>}
                      {f.match_time && <span style={{ fontSize: '0.72rem', color: G.muted, fontWeight: 600 }}>⏰ {f.match_time.slice(0,5)}</span>}
                      <span style={{ fontSize: '0.72rem', color: G.muted }}>Rd {f.round}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })
      )}
    </div>
  )
}
