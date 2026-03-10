import { useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { computeTopScorers } from '../../lib/standings'

function ScorerBoard({ fixtures, scorers, cls }) {
  const color = cls === 'first' ? 'var(--lime)' : 'var(--sky)'
  const top = useMemo(() => computeTopScorers(fixtures.filter(f=>f.class===cls), scorers), [fixtures, scorers, cls])
  const max = top[0]?.goals || 1

  return (
    <div>
      <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.2rem', color, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>
        🥾 {cls==='first'?'1st Class':'2nd Class'} Top Scorers
      </div>
      <div style={{ background:'var(--pitchLight)', borderRadius:8, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)', marginBottom:28 }}>
        {top.length === 0
          ? <div style={{ padding:'20px', color:'var(--muted)', textAlign:'center', fontSize:'0.88rem' }}>No goals recorded yet</div>
          : top.map((s, idx) => {
              const mc = idx===0?'#ffd700':idx===1?'#c0c0c0':idx===2?'#cd7f32':'var(--white)'
              const pct = Math.round((s.goals/max)*100)
              return (
                <div key={`${s.playerName}-${s.team}`} style={{ display:'grid', gridTemplateColumns:'36px 1fr 120px 56px', gap:10, alignItems:'center', padding:'12px 16px', borderBottom: idx<top.length-1?'1px solid rgba(255,255,255,0.06)':'none', background: idx===0?'rgba(255,215,0,0.04)':undefined }}>
                  <span style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.2rem', color:mc, textAlign:'center' }}>
                    {idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':idx+1}
                  </span>
                  <div>
                    <div style={{ fontWeight:700, color:'var(--white)', fontSize:'0.92rem' }}>{s.playerName}</div>
                    <div style={{ fontSize:'0.74rem', color:'var(--muted)' }}>{s.team}</div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <div style={{ flex:1, height:7, background:'rgba(255,255,255,0.1)', borderRadius:4, overflow:'hidden' }}>
                      <div style={{ width:`${pct}%`, height:'100%', background: idx===0?'#ffd700':color, borderRadius:4, transition:'width 0.4s' }} />
                    </div>
                  </div>
                  <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.5rem', color:mc, textAlign:'right' }}>
                    {s.goals}<span style={{ fontSize:'0.65rem', color:'var(--muted)', marginLeft:2 }}>gls</span>
                  </div>
                </div>
              )
            })
        }
      </div>
    </div>
  )
}

export default function PublicLeaderboard() {
  const { fixtures, scorers } = useOutletContext()
  return (
    <div className="page">
      <div className="section-title">Top Goal Scorers</div>
      <div className="section-sub">Own goals excluded from rankings</div>
      <ScorerBoard fixtures={fixtures} scorers={scorers} cls="first" />
      <ScorerBoard fixtures={fixtures} scorers={scorers} cls="second" />
    </div>
  )
}
