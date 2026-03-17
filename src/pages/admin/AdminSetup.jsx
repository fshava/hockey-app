import { useState } from 'react'
import { useData } from '../../hooks/useData'
import { useLeagueTab } from '../../hooks/useLeagueTab'
import LeagueTabs from '../../components/LeagueTabs'
import { G } from '../../lib/theme'

const PRESET_COLORS = ['#7ecb35','#3a8fcc','#e07b2a','#c0392b','#9b59b6','#1abc9c','#f39c12','#e91e63']

export default function AdminSetupPage() {
  const { leagues, teams, fixtures, addLeague, updateLeague, removeLeague, addTeam, removeTeam, generateFixtures, loading } = useData()
  const [activeId, setActiveId, activeLeague] = useLeagueTab(leagues)

  const [newTeamName, setNewTeamName]   = useState('')
  const [newLeagueName, setNewLeagueName] = useState('')
  const [newLeagueColor, setNewLeagueColor] = useState('#7ecb35')
  const [showAddLeague, setShowAddLeague] = useState(false)
  const [busy, setBusy]   = useState(false)
  const [msg, setMsg]     = useState(null)

  const leagueTeams    = teams.filter(t => t.league_id === activeId)
  const leagueFixtures = fixtures.filter(f => f.league_id === activeId)

  const handleAddTeam = async () => {
    if (!newTeamName.trim() || !activeId) return
    await addTeam(newTeamName.trim(), activeId)
    setNewTeamName('')
  }

  const handleRemoveTeam = async (id) => {
    if (!confirm('Remove this team and all their fixtures?')) return
    await removeTeam(id)
  }

  const handleGenerate = async () => {
    if (leagueTeams.length < 2) return
    if (leagueFixtures.length > 0 && !confirm(`Delete ${leagueFixtures.length} existing fixtures and regenerate?`)) return
    setBusy(true); setMsg(null)
    await generateFixtures(activeId)
    setBusy(false)
    setMsg({ type: 'ok', text: `✓ Fixtures generated for ${activeLeague?.name}` })
    setTimeout(() => setMsg(null), 4000)
  }

  const handleAddLeague = async () => {
    if (!newLeagueName.trim()) return
    await addLeague(newLeagueName.trim(), newLeagueColor)
    setNewLeagueName(''); setShowAddLeague(false)
  }

  const handleRemoveLeague = async (id, name) => {
    if (!confirm(`Delete "${name}" and ALL its teams and fixtures? This cannot be undone.`)) return
    await removeLeague(id)
  }

  if (loading) return <div className="spinner" />

  const accent = activeLeague?.color || G.lime

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">⚙ Setup</div>
          <div className="section-sub">Manage leagues, teams & fixtures</div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <button
            className="btn btn-sm btn-ghost"
            onClick={() => setShowAddLeague(v => !v)}
          >+ New League</button>
        </div>
      </div>

      {/* Add league panel */}
      {showAddLeague && (
        <div style={{ background: G.pitchLight, borderRadius: 8, padding: 16, marginBottom: 20, borderLeft: `3px solid ${G.lime}` }}>
          <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, color: G.white, marginBottom: 10 }}>New League</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div style={{ flex: '1 1 180px' }}>
              <label>Name</label>
              <input placeholder="e.g. D League" value={newLeagueName} onChange={e => setNewLeagueName(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddLeague()} />
            </div>
            <div>
              <label>Accent Colour</label>
              <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                {PRESET_COLORS.map(c => (
                  <div key={c} onClick={() => setNewLeagueColor(c)} style={{
                    width: 28, height: 28, borderRadius: 4, background: c, cursor: 'pointer',
                    border: `3px solid ${newLeagueColor === c ? G.white : 'transparent'}`,
                  }} />
                ))}
              </div>
            </div>
            <button className="btn btn-primary btn-sm" onClick={handleAddLeague}>Add League</button>
            <button className="btn btn-ghost btn-sm" onClick={() => setShowAddLeague(false)}>Cancel</button>
          </div>
        </div>
      )}

      {leagues.length === 0 ? (
        <div className="alert alert-info">No leagues yet. Create one above.</div>
      ) : (
        <>
          {/* League tabs */}
          <div style={{ marginBottom: 20 }}>
            <LeagueTabs leagues={leagues} activeId={activeId} onChange={setActiveId} />
          </div>

          {/* Active league card */}
          {activeLeague && (
            <div style={{ background: G.pitchLight, borderRadius: 8, padding: 20, borderTop: `4px solid ${accent}` }}>
              {/* League name editor + delete */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 20, alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  value={activeLeague.name}
                  onChange={e => updateLeague(activeLeague.id, { name: e.target.value })}
                  style={{ flex: '1 1 160px', background: 'rgba(0,0,0,0.2)', border: `1.5px solid ${accent}66`, color: G.white, fontSize: '1rem', fontWeight: 700, padding: '7px 12px', borderRadius: 5 }}
                />
                <div style={{ display: 'flex', gap: 5 }}>
                  {PRESET_COLORS.map(c => (
                    <div key={c} onClick={() => updateLeague(activeLeague.id, { color: c })} style={{
                      width: 24, height: 24, borderRadius: 3, background: c, cursor: 'pointer',
                      border: `3px solid ${activeLeague.color === c ? G.white : 'transparent'}`,
                    }} />
                  ))}
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => handleRemoveLeague(activeLeague.id, activeLeague.name)}>🗑 Delete League</button>
              </div>

              {/* Stats row */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
                {[
                  [leagueTeams.length, 'Teams'],
                  [leagueFixtures.length, 'Fixtures'],
                  [leagueTeams.length >= 2 ? leagueTeams.length * (leagueTeams.length - 1) / 2 : 0, 'Total matches'],
                ].map(([num, lbl]) => (
                  <div key={lbl} style={{ background: 'rgba(0,0,0,0.2)', borderRadius: 6, padding: '8px 18px', textAlign: 'center' }}>
                    <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.5rem', color: accent }}>{num}</div>
                    <div style={{ fontSize: '0.7rem', color: G.muted, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{lbl}</div>
                  </div>
                ))}
              </div>

              {/* Add team */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
                <input
                  placeholder="Team name, e.g. Churchill High"
                  value={newTeamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddTeam()}
                  style={{ flex: 1, background: 'rgba(0,0,0,0.2)', border: `1.5px solid rgba(255,255,255,0.12)`, color: G.white, fontSize: '0.9rem', padding: '7px 12px', borderRadius: 5 }}
                />
                <button className="btn btn-sm" style={{ background: accent, color: isLight(accent) ? G.pitch : '#fff', whiteSpace: 'nowrap' }} onClick={handleAddTeam}>
                  + Add Team
                </button>
              </div>

              {/* Team list */}
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                {leagueTeams.length === 0 ? (
                  <span style={{ color: G.muted, fontSize: '0.85rem', fontStyle: 'italic' }}>No teams yet. Add at least 2 to generate fixtures.</span>
                ) : leagueTeams.map(t => (
                  <span key={t.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 7,
                    background: 'rgba(0,0,0,0.25)', color: G.white, borderRadius: 5,
                    padding: '6px 12px', fontSize: '0.88rem', fontWeight: 600,
                    borderLeft: `3px solid ${accent}`,
                  }}>
                    🏑 {t.name}
                    <span onClick={() => handleRemoveTeam(t.id)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.3)', fontSize: '1.1rem', lineHeight: 1 }}>×</span>
                  </span>
                ))}
              </div>

              {/* Generate button */}
              {leagueTeams.length >= 2 ? (
                <button
                  className="btn"
                  style={{ background: accent, color: isLight(accent) ? G.pitch : '#fff', width: '100%', justifyContent: 'center' }}
                  onClick={handleGenerate}
                  disabled={busy}
                >
                  {busy ? '⏳ Generating…' : `🗓 ${leagueFixtures.length > 0 ? 'Regenerate' : 'Generate'} Fixtures (${leagueTeams.length * (leagueTeams.length-1)/2} matches)`}
                </button>
              ) : (
                <div className="alert alert-warn">Add at least 2 teams to generate fixtures.</div>
              )}

              {msg && <div className={`alert alert-${msg.type}`} style={{ marginTop: 12 }}>{msg.text}</div>}
            </div>
          )}
        </>
      )}
    </div>
  )
}

function isLight(hex) {
  const h = hex.replace('#','')
  const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16)
  return (r*299 + g*587 + b*114) / 1000 > 140
}
