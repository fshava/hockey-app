import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function AdminPlayers() {
  const { teams, players, addPlayer, removePlayer } = useOutletContext()
  const [newName, setNewName] = useState({})
  const [busy, setBusy] = useState({})

  const getTeamPlayers = (teamId) => players.filter(p => p.team_id === teamId)

  const handleAdd = async (team) => {
    const name = (newName[team.id] || '').trim()
    if (!name) return
    setBusy(p => ({ ...p, [team.id]: true }))
    await addPlayer(team.id, name)
    setNewName(p => ({ ...p, [team.id]: '' }))
    setBusy(p => ({ ...p, [team.id]: false }))
  }

  return (
    <div className="page">
      <div className="section-title">Player Registration</div>
      <div className="section-sub">Register players per team for goal scorer tracking</div>

      {['first','second'].map(cls => {
        const clsTeams = teams.filter(t => t.class === cls)
        const color = cls === 'first' ? 'var(--lime)' : 'var(--sky)'
        return (
          <div key={cls} style={{ marginBottom:28 }}>
            <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.2rem', color, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:12, borderBottom:`2px solid ${color}33`, paddingBottom:6 }}>
              {cls === 'first' ? '1st Class' : '2nd Class'}
            </div>
            {clsTeams.length === 0
              ? <div className="alert alert-warn">No teams. Add teams in Setup first.</div>
              : <div className="grid2">
                  {clsTeams.map(team => {
                    const tp = getTeamPlayers(team.id)
                    return (
                      <div key={team.id} style={{ background:'var(--pitchLight)', borderRadius:8, padding:16, borderTop:`3px solid ${color}` }}>
                        <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1rem', color:'var(--white)', marginBottom:10 }}>
                          🏑 {team.name} <span style={{ fontSize:'0.75rem', color:'var(--muted)', fontWeight:600 }}>{tp.length} players</span>
                        </div>
                        <div style={{ display:'flex', gap:6, marginBottom:10 }}>
                          <input placeholder="Player name" value={newName[team.id]||''} onChange={e=>setNewName(p=>({...p,[team.id]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleAdd(team)}
                            style={{ background:'rgba(0,0,0,0.2)', border:'1.5px solid rgba(255,255,255,0.12)', color:'var(--white)', fontSize:'0.88rem', padding:'6px 10px' }} />
                          <button className="btn btn-sm" style={{ background:color, color:cls==='first'?'var(--pitch)':'white', whiteSpace:'nowrap' }} onClick={()=>handleAdd(team)} disabled={busy[team.id]}>
                            {busy[team.id]?'…':'+ Add'}
                          </button>
                        </div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:5 }}>
                          {tp.length === 0
                            ? <span style={{ color:'var(--muted)', fontSize:'0.82rem', fontStyle:'italic' }}>No players yet</span>
                            : tp.map(p => (
                              <span key={p.id} style={{ display:'inline-flex', alignItems:'center', gap:5, background:'rgba(0,0,0,0.25)', color:'var(--white)', borderRadius:4, padding:'4px 9px', fontSize:'0.83rem', fontWeight:600 }}>
                                {p.name}
                                <span style={{ cursor:'pointer', color:'rgba(255,255,255,0.3)', fontSize:'1rem' }} onClick={()=>removePlayer(p.id)}>×</span>
                              </span>
                            ))
                          }
                        </div>
                      </div>
                    )
                  })}
                </div>
            }
          </div>
        )
      })}
    </div>
  )
}
