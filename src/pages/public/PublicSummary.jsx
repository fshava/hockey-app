import { useOutletContext } from 'react-router-dom'

export default function PublicSummary() {
  const { fixtures, venues, teams } = useOutletContext()

  const total     = fixtures.length
  const played    = fixtures.filter(f=>f.home_goals!=null).length
  const scheduled = fixtures.filter(f=>f.match_date && f.home_goals==null).length
  const unset     = total - played - scheduled

  const vName = (id) => venues.find(v=>v.id===id)?.name||'—'
  const formatDate = (d) => d ? new Date(d+'T00:00:00').toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : '—'

  return (
    <div className="page">
      <div className="section-title">Full Summary</div>
      <div className="section-sub">Complete fixture list for both classes</div>

      {/* Stats */}
      <div className="grid3" style={{ marginBottom:24 }}>
        {[
          ['Total Matches', total, 'var(--white)'],
          ['Played', played, played>0?'var(--lime)':'var(--muted)'],
          ['Scheduled', scheduled, 'var(--sky)'],
          ['Unscheduled', unset, unset===0?'var(--lime)':'var(--warn)'],
          ['1st Class Teams', teams.filter(t=>t.class==='first').length, 'var(--lime)'],
          ['2nd Class Teams', teams.filter(t=>t.class==='second').length, 'var(--sky)'],
        ].map(([lbl,num,col])=>(
          <div className="stat-box" key={lbl}>
            <div className="stat-num" style={{color:col}}>{num}</div>
            <div className="stat-lbl">{lbl}</div>
          </div>
        ))}
      </div>

      {['first','second'].map(cls => {
        const clsFix = fixtures.filter(f=>f.class===cls)
        const color  = cls==='first'?'var(--lime)':'var(--sky)'
        if (clsFix.length === 0) return null
        return (
          <div key={cls} style={{ marginBottom:28 }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.3rem', color, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>
              {cls==='first'?'1st Class':'2nd Class'}
              <span style={{ fontSize:'0.8rem', color:'var(--muted)', fontWeight:600, marginLeft:10 }}>{clsFix.length} matches</span>
            </div>
            <div className="scroll-table">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Rnd</th><th>Home</th><th>Away</th>
                    <th>Result</th><th>Venue</th><th>Date</th><th>Time</th>
                  </tr>
                </thead>
                <tbody>
                  {clsFix.map((f,i)=>(
                    <tr key={f.id}>
                      <td style={{color:'var(--muted)',fontWeight:700}}>{i+1}</td>
                      <td><span style={{background:'var(--pitchLight)',color,borderRadius:3,padding:'2px 7px',fontSize:'0.78rem',fontWeight:800}}>R{f.round}</span></td>
                      <td style={{fontWeight:700}}>{f.home_team}</td>
                      <td style={{fontWeight:700}}>{f.away_team}</td>
                      <td>
                        {f.home_goals!=null
                          ? <strong style={{color:'var(--lime)'}}>{f.home_goals} – {f.away_goals}</strong>
                          : <span style={{color:'var(--muted)'}}>—</span>
                        }
                      </td>
                      <td><span className="venue-badge">{vName(f.venue_id)}</span></td>
                      <td>{formatDate(f.match_date)}</td>
                      <td>{f.match_time?f.match_time.slice(0,5):<span style={{color:'var(--muted)'}}>—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
