import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { computeStandings, computeTopScorers } from '../../lib/standings'

export default function AdminResults() {
  const { teams, players, fixtures, scorers, venues, updateFixture, upsertScorer, removeScorer } = useOutletContext()
  const [viewClass, setViewClass]       = useState('first')
  const [expandedFix, setExpandedFix]   = useState(null)
  const [pendingScorer, setPendingScorer] = useState({}) // local edits before save
  const [saving, setSaving]             = useState({})

  const activeFixtures = fixtures.filter(f => f.class === viewClass)
  const activeStandings = useMemo(() => computeStandings(activeFixtures, scorers), [activeFixtures, scorers])
  const activeTopScorers = useMemo(() => computeTopScorers(activeFixtures, scorers), [activeFixtures, scorers])

  const accentColor = viewClass === 'first' ? 'var(--lime)' : 'var(--sky)'

  // Save score on blur
  const saveScore = async (fid, field, val) => {
    const num = val === '' ? null : parseInt(val)
    setSaving(p=>({...p,[`${fid}-${field}`]:true}))
    await updateFixture(fid, { [field]: num })
    setSaving(p=>({...p,[`${fid}-${field}`]:false}))
  }

  // Pending new scorers
  const addPendingScorer = (fid, teamName) => {
    setPendingScorer(p => ({
      ...p,
      [fid]: [...(p[fid]||[]), { id:`new-${Date.now()}`, fixture_id:fid, player_name:'', team_name:teamName, goals:1, own_goal:false }]
    }))
  }
  const updatePending = (fid, pid, field, val) => {
    setPendingScorer(p => ({ ...p, [fid]: p[fid].map(s => s.id===pid ? {...s,[field]:val} : s) }))
  }
  const savePending = async (fid, scorer) => {
    if (!scorer.player_name) return
    setSaving(p=>({...p,[scorer.id]:true}))
    await upsertScorer(scorer)
    setPendingScorer(p => ({ ...p, [fid]: (p[fid]||[]).filter(s=>s.id!==scorer.id) }))
    setSaving(p=>({...p,[scorer.id]:false}))
  }
  const removePending = (fid, pid) => {
    setPendingScorer(p=>({...p,[fid]:(p[fid]||[]).filter(s=>s.id!==pid)}))
  }

  const getTeamPlayers = (teamName) => {
    const team = teams.find(t=>t.name===teamName && t.class===viewClass)
    return team ? players.filter(p=>p.team_id===team.id) : []
  }

  const fixtureScorers = (fid) => scorers.filter(s=>s.fixture_id===fid)

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <div>
          <div className="section-title">Results & Scorers</div>
          <div className="section-sub">Enter match scores and goal scorers</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <span className={`class-tab first ${viewClass==='first'?'sel':''}`} onClick={()=>setViewClass('first')}>1st Class</span>
          <span className={`class-tab second ${viewClass==='second'?'sel':''}`} onClick={()=>setViewClass('second')}>2nd Class</span>
        </div>
      </div>

      {activeFixtures.length === 0
        ? <div className="alert alert-warn">No fixtures yet. Generate from Setup first.</div>
        : <div className="grid2" style={{ gap:20, alignItems:'start' }}>

          {/* League table */}
          <div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.1rem', color:accentColor, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>🏆 Current Standings</div>
            <div style={{ background:'var(--pitchLight)', borderRadius:8, overflow:'hidden' }}>
              <table className="league-table">
                <thead>
                  <tr>
                    <th style={{color:accentColor}}>#</th>
                    <th className="left" style={{color:accentColor}}>Team</th>
                    <th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th>
                    <th style={{color:accentColor}}>Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {activeStandings.map((row, idx) => (
                    <tr key={row.name}>
                      <td style={{ color: idx===0?'#ffd700':idx===1?'#c0c0c0':idx===2?'#cd7f32':'var(--white)', fontFamily:"'Barlow Condensed'", fontWeight:800 }}>
                        {idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':idx+1}
                      </td>
                      <td className="left">{row.name}</td>
                      <td style={{color:'var(--muted)'}}>{row.P}</td>
                      <td style={{color:'var(--lime)'}}>{row.W}</td>
                      <td style={{color:'var(--muted)'}}>{row.D}</td>
                      <td style={{color:'var(--danger)'}}>{row.L}</td>
                      <td style={{color:row.GD>0?'var(--lime)':row.GD<0?'var(--danger)':'var(--muted)',fontWeight:700}}>{row.GD>0?'+':''}{row.GD}</td>
                      <td className="pts" style={{color:accentColor}}>{row.Pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {activeTopScorers.length > 0 && (
              <>
                <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.1rem', color:accentColor, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10, marginTop:18 }}>🥾 Top Scorers</div>
                <div style={{ background:'var(--pitchLight)', borderRadius:8, overflow:'hidden' }}>
                  {activeTopScorers.slice(0,10).map((s,idx)=>{
                    const mc = idx===0?'#ffd700':idx===1?'#c0c0c0':idx===2?'#cd7f32':'var(--white)'
                    return (
                      <div key={`${s.playerName}-${s.team}`} style={{ display:'grid', gridTemplateColumns:'28px 1fr 52px', gap:10, alignItems:'center', padding:'9px 14px', borderBottom:idx<activeTopScorers.length-1?'1px solid rgba(255,255,255,0.06)':'none' }}>
                        <span style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1rem', color:mc, textAlign:'center' }}>{idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':idx+1}</span>
                        <div>
                          <div style={{ fontWeight:700, color:'var(--white)', fontSize:'0.88rem' }}>{s.playerName}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--muted)' }}>{s.team}</div>
                        </div>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.3rem', color:mc, textAlign:'right' }}>{s.goals}<span style={{fontSize:'0.65rem',color:'var(--muted)',marginLeft:2}}>gls</span></div>
                      </div>
                    )
                  })}
                </div>
              </>
            )}
          </div>

          {/* Score + scorer entry */}
          <div>
            <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.1rem', color:accentColor, letterSpacing:'0.08em', textTransform:'uppercase', marginBottom:10 }}>📝 Enter Results</div>
            <div style={{ maxHeight:600, overflowY:'auto', paddingRight:4 }}>
              {activeFixtures.map(f => {
                const played = f.home_goals != null && f.away_goals != null
                const fScorers = fixtureScorers(f.id)
                const pending = pendingScorer[f.id] || []
                const isExpanded = expandedFix === f.id
                return (
                  <div key={f.id} style={{ marginBottom:8 }}>
                    <div className="result-row" style={{ borderLeft:`3px solid ${accentColor}` }}>
                      <span className="team-name right">{f.home_team}</span>
                      <input type="number" min="0" max="99" className="score-input" placeholder="—" defaultValue={f.home_goals??''} onBlur={e=>saveScore(f.id,'home_goals',e.target.value)} style={{ borderColor: accentColor }} />
                      <span className="score-vs">:</span>
                      <input type="number" min="0" max="99" className="score-input" placeholder="—" defaultValue={f.away_goals??''} onBlur={e=>saveScore(f.id,'away_goals',e.target.value)} style={{ borderColor: accentColor }} />
                      <span className="team-name" style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                        {f.away_team}
                        <span style={{ display:'flex', gap:5, alignItems:'center' }}>
                          {played && <span className="played-badge">✓</span>}
                          <span onClick={()=>setExpandedFix(isExpanded?null:f.id)} style={{ cursor:'pointer', fontSize:'0.72rem', fontWeight:700, color:accentColor, border:`1px solid ${accentColor}44`, borderRadius:3, padding:'2px 6px', userSelect:'none' }}>
                            ⚽ {fScorers.length+pending.length||'+'}
                          </span>
                        </span>
                      </span>
                    </div>

                    {isExpanded && (
                      <div className="scorer-panel">
                        {[f.home_team, f.away_team].map(teamName => {
                          const tp = getTeamPlayers(teamName)
                          const saved = fScorers.filter(s=>s.team_name===teamName)
                          const pend  = pending.filter(s=>s.team_name===teamName)
                          return (
                            <div key={teamName} style={{ marginBottom:10 }}>
                              <div className="scorer-panel-title">{teamName}</div>
                              {/* Saved scorers */}
                              {saved.map(s=>(
                                <div key={s.id} className="scorer-entry">
                                  <span style={{ color:'var(--white)', fontSize:'0.85rem', flex:1 }}>{s.player_name}</span>
                                  <span style={{ color:'var(--muted)', fontSize:'0.78rem' }}>{s.goals} goal{s.goals>1?'s':''}</span>
                                  {s.own_goal && <span className="og-badge active">OG</span>}
                                  <span className="rm-scorer" onClick={()=>removeScorer(s.id)}>×</span>
                                </div>
                              ))}
                              {/* Pending new */}
                              {pend.map(s=>(
                                <div key={s.id} className="scorer-entry">
                                  {tp.length > 0
                                    ? <select value={s.player_name} onChange={e=>updatePending(f.id,s.id,'player_name',e.target.value)} style={{flex:1,minWidth:120}}>
                                        <option value="">— Player —</option>
                                        {tp.map(p=><option key={p.id} value={p.name}>{p.name}</option>)}
                                      </select>
                                    : <input placeholder="Player name" value={s.player_name} onChange={e=>updatePending(f.id,s.id,'player_name',e.target.value)} style={{flex:1,minWidth:120}} />
                                  }
                                  <input type="number" min="1" max="20" value={s.goals} onChange={e=>updatePending(f.id,s.id,'goals',Math.max(1,parseInt(e.target.value)||1))} style={{ width:48 }} />
                                  <span style={{ color:'var(--muted)', fontSize:'0.75rem' }}>goal{s.goals>1?'s':''}</span>
                                  <span className={`og-badge ${s.own_goal?'active':''}`} onClick={()=>updatePending(f.id,s.id,'own_goal',!s.own_goal)}>OG</span>
                                  <button className="btn btn-sm btn-primary" onClick={()=>savePending(f.id,s)} disabled={saving[s.id]||!s.player_name} style={{padding:'4px 10px',fontSize:'0.72rem'}}>
                                    {saving[s.id]?'…':'Save'}
                                  </button>
                                  <span className="rm-scorer" onClick={()=>removePending(f.id,s.id)}>×</span>
                                </div>
                              ))}
                              <button className="add-scorer-btn" onClick={()=>addPendingScorer(f.id,teamName)}>+ Add scorer</button>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      }
    </div>
  )
}
