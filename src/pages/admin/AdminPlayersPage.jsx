import { useState } from 'react'
import { useData } from '../../hooks/useData'
import { useLeagueTab } from '../../hooks/useLeagueTab'
import LeagueTabs from '../../components/LeagueTabs'
import { G } from '../../lib/theme'

export default function AdminPlayersPage() {
  const { leagues, teams, players, addPlayer, removePlayer, loading } = useData()
  const [activeId, setActiveId, activeLeague] = useLeagueTab(leagues)
  const [newName, setNewName] = useState({})

  const leagueTeams = teams.filter(t => t.league_id === activeId)

  const handleAdd = async (teamId) => {
    const name = (newName[teamId] || '').trim()
    if (!name) return
    await addPlayer(name, teamId)
    setNewName(prev => ({ ...prev, [teamId]: '' }))
  }

  if (loading) return <div className="spinner" />

  const accent = activeLeague?.color || G.lime

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">👤 Players</div>
          <div className="section-sub">Register players per team for goal scorer tracking</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <LeagueTabs leagues={leagues} activeId={activeId} onChange={setActiveId} />
        </div>
      </div>

      {leagues.length === 0 && <div className="alert alert-info">No leagues yet. Set up leagues first.</div>}

      {leagueTeams.length === 0 ? (
        <div className="alert alert-warn">No teams in {activeLeague?.name || 'this league'}. Add teams in Setup first.</div>
      ) : (
        <div className="grid2">
          {leagueTeams.map(team => {
            const tp = players.filter(p => p.team_id === team.id)
            return (
              <div key={team.id} style={{ background: G.pitchLight, borderRadius: 8, padding: 16, borderTop: `3px solid ${accent}` }}>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1rem', color: G.white, marginBottom: 10 }}>
                  🏑 {team.name}
                  <span style={{ marginLeft: 8, fontSize: '0.75rem', color: G.muted, fontWeight: 600 }}>{tp.length} players</span>
                </div>
                <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                  <input
                    placeholder="Player name"
                    value={newName[team.id] || ''}
                    onChange={e => setNewName(prev => ({ ...prev, [team.id]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdd(team.id)}
                    style={{ background: 'rgba(0,0,0,0.2)', border: '1.5px solid rgba(255,255,255,0.12)', color: G.white, fontSize: '0.88rem', padding: '6px 10px', flex: 1 }}
                  />
                  <button
                    className="btn btn-sm"
                    style={{ background: accent, color: isLight(accent) ? G.pitch : 'white', whiteSpace: 'nowrap' }}
                    onClick={() => handleAdd(team.id)}
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
}

function isLight(hex) {
  const h = hex.replace('#','')
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
  return (r*299 + g*587 + b*114) / 1000 > 140
}
