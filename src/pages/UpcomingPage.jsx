import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import { G } from '../lib/theme'

export default function UpcomingPage() {
  const { fixtures, venues, loading } = useData()
  const [cls, setCls] = useState('all')

  const today = new Date().toISOString().split('T')[0]

  const upcoming = useMemo(() => {
    return fixtures
      .filter(f => {
        const notPlayed = f.home_goals == null
        const hasDate = f.match_date
        const clsMatch = cls === 'all' || f.class === cls
        return notPlayed && hasDate && clsMatch
      })
      .sort((a, b) => {
        const d = a.match_date.localeCompare(b.match_date)
        if (d !== 0) return d
        return (a.match_time || '').localeCompare(b.match_time || '')
      })
  }, [fixtures, cls])

  // Group by date
  const grouped = useMemo(() => {
    const g = {}
    upcoming.forEach(f => {
      const d = f.match_date
      if (!g[d]) g[d] = []
      g[d].push(f)
    })
    return g
  }, [upcoming])

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">📅 Upcoming Fixtures</div>
          <div className="section-sub">{upcoming.length} matches to be played</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          {[['all', 'All', G.white], ['first', '1st Class', G.lime], ['second', '2nd Class', G.sky]].map(([v, label, c]) => (
            <span
              key={v}
              onClick={() => setCls(v)}
              style={{
                padding: '6px 14px', borderRadius: 20, cursor: 'pointer',
                fontFamily: "'Barlow Condensed'", fontWeight: 700, fontSize: '0.88rem',
                letterSpacing: '0.06em', textTransform: 'uppercase',
                border: `2px solid ${c}`,
                background: cls === v ? c : 'transparent',
                color: cls === v ? (v === 'first' ? G.pitch : v === 'all' ? G.pitch : 'white') : c,
                transition: 'all 0.15s',
              }}
            >{label}</span>
          ))}
        </div>
      </div>

      {upcoming.length === 0 ? (
        <div className="alert alert-info">No upcoming fixtures scheduled.</div>
      ) : (
        Object.entries(grouped).map(([date, dayFixtures]) => {
          const d = new Date(date + 'T00:00:00')
          const isToday = date === today
          const isPast = date < today
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
                return (
                  <div key={f.id} style={{
                    display: 'grid', gridTemplateColumns: '1fr 50px 1fr 120px 80px',
                    gap: 10, alignItems: 'center',
                    background: G.pitchLight, borderRadius: 6, padding: '10px 16px', marginBottom: 6,
                    borderLeft: `3px solid ${f.class === 'first' ? G.lime : G.sky}`,
                  }}>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 700, color: G.white, fontSize: '0.9rem' }}>{f.home_team}</div>
                      <div style={{ fontSize: '0.7rem', color: G.muted }}>HOME</div>
                    </div>
                    <div style={{ textAlign: 'center', fontFamily: "'Barlow Condensed'", fontWeight: 800, color: G.muted, fontSize: '1rem' }}>VS</div>
                    <div>
                      <div style={{ fontWeight: 700, color: G.white, fontSize: '0.9rem' }}>{f.away_team}</div>
                      <div style={{ fontSize: '0.7rem', color: G.muted }}>AWAY</div>
                    </div>
                    <div>
                      {venue && <span className="venue-badge" style={{ borderColor: f.class === 'first' ? G.lime : G.sky }}>{venue.name}</span>}
                    </div>
                    <div style={{ textAlign: 'right', color: G.muted, fontSize: '0.85rem', fontWeight: 600 }}>
                      {f.match_time ? f.match_time.slice(0, 5) : '—'}
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
