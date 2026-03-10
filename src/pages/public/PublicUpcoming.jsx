import { useOutletContext } from 'react-router-dom'

export default function PublicUpcoming() {
  const { fixtures, venues } = useOutletContext()

  const today = new Date().toISOString().split('T')[0]

  const upcoming = fixtures
    .filter(f => f.match_date && f.match_date >= today && f.home_goals == null)
    .sort((a,b) => {
      if (a.match_date !== b.match_date) return a.match_date.localeCompare(b.match_date)
      return (a.match_time||'').localeCompare(b.match_time||'')
    })

  const recent = fixtures
    .filter(f => f.home_goals != null)
    .sort((a,b) => (b.match_date||'').localeCompare(a.match_date||''))
    .slice(0, 10)

  const vName = (id) => venues.find(v=>v.id===id)?.name || '—'

  const formatDate = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'2-digit',month:'short'}) : '—'
  const formatTime = (t) => t ? t.slice(0,5) : ''

  const FixCard = ({ f, showResult }) => (
    <div className={`upcoming-card ${f.class==='second'?'second':''}`}>
      <div className="upcoming-date">{formatDate(f.match_date)}</div>
      <div className="upcoming-match">
        {showResult
          ? <div className="upcoming-teams">{f.home_team} <strong style={{color:'var(--lime)'}}>{f.home_goals} – {f.away_goals}</strong> {f.away_team}</div>
          : <div className="upcoming-teams">{f.home_team} <span style={{color:'var(--muted)'}}>vs</span> {f.away_team}</div>
        }
        <div className="upcoming-meta">
          {formatTime(f.match_time) && <span>{formatTime(f.match_time)} · </span>}
          {vName(f.venue_id)}
          {' · '}
          <span style={{ color: f.class==='first'?'var(--lime)':'var(--sky)', fontWeight:700 }}>
            {f.class==='first'?'1st Class':'2nd Class'}
          </span>
        </div>
      </div>
    </div>
  )

  return (
    <div className="page">
      <div className="section-title">Upcoming Fixtures</div>
      <div className="section-sub">All scheduled matches yet to be played</div>

      {upcoming.length === 0
        ? <div className="alert alert-info">No upcoming fixtures scheduled yet.</div>
        : upcoming.map(f => <FixCard key={f.id} f={f} showResult={false} />)
      }

      {recent.length > 0 && (
        <>
          <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.2rem', color:'var(--lime)', letterSpacing:'0.06em', textTransform:'uppercase', margin:'28px 0 12px' }}>
            Recent Results
          </div>
          {recent.map(f => <FixCard key={f.id} f={f} showResult={true} />)}
        </>
      )}
    </div>
  )
}
