import { useState } from 'react'
import { useData } from '../../hooks/useData'
import { G } from '../../lib/theme'

export default function AdminPlayersPage() {
  const { teams, players, addPlayer, removePlayer, loading } = useData()
  const [newName, setNewName] = useState({})

  const getTeamPlayers = (teamId) => players.filter(p => p.team_id === teamId)

  const handleAdd = async (team) => {
    const name = (newName[team.id] || '').trim()
    if (!name) return
    const { error } = await addPlayer(name, team.id)
    if (!error) setNewName(prev => ({ ...prev, [team.id]: '' }))
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div className="section-title">👤 Player Registration</div>
      <div className="section-sub">Register players per team for goal scorer tracking</div>

      {['first', 'second'].map(cls => {
        const clsTeams = teams.filter(t => t.class === cls)
        const color = cls === 'first' ? G.lime : G.sky
        return (
          <div key={cls} style={{ marginBottom: 28 }}>
            <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.2rem', color, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12, borderBottom: `2px solid ${color}33`, paddingBottom: 6 }}>
              {cls === 'first' ? '1st' : '2nd'} Class
            </div>
            {clsTeams.length === 0 ? (
              <div className="alert alert-warn">No teams yet. Add teams in Setup first.</div>
            ) : (
              <div className="grid2">
                {clsTeams.map(team => {
                  const tp = getTeamPlayers(team.id)
                  return (
                    <div key={team.id} style={{ background: G.pitchLight, borderRadius: 8, padding: 16, borderTop: `3px solid ${color}` }}>
                      <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.white, marginBottom: 10 }}>
                        🏑 {team.name}
                        <span style={{ marginLeft: 8, fontSize: '0.75rem', color: G.muted, fontWeight: 600 }}>{tp.length} players</span>
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                        <input
                          placeholder="Player name"
                          value={newName[team.id] || ''}
                          onChange={e => setNewName(prev => ({ ...prev, [team.id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && handleAdd(team)}
                          style={{ background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.12)', color: G.white, fontSize: '0.88rem', padding: '6px 10px' }}
                        />
                        <button
                          className="btn btn-sm"
                          style={{ background: color, color: cls === 'first' ? G.pitch : 'white', whiteSpace: 'nowrap' }}
                          onClick={() => handleAdd(team)}
                        >+ Add</button>
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
                        {tp.length === 0 ? (
                          <span style={{ color: G.muted, fontSize: '0.82rem', fontStyle: 'italic' }}>No players yet</span>
                        ) : tp.map(p => (
                          <span key={p.id} style={{
                            display: 'inline-flex', alignItems: 'center', gap: 5,
                            background: 'rgba(0,0,0,0.25)', color: G.white, borderRadius: 4,
                            padding: '4px 9px', fontSize: '0.83rem', fontWeight: 600,
                          }}>
                            {p.name}
                            <span onClick={() => removePlayer(p.id)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '1rem' }}>×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
