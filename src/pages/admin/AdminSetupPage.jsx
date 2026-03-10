import { useState } from 'react'
import { useData } from '../../hooks/useData'
import { buildFixtureRows } from '../../lib/hockey'
import { G } from '../../lib/theme'

export default function AdminSetupPage() {
  const { teams, fixtures, addTeam, removeTeam, addFixtures, clearFixtures, loading } = useData()
  const [newName, setNewName] = useState({ first: '', second: '' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState(null)

  const firstTeams = teams.filter(t => t.class === 'first')
  const secondTeams = teams.filter(t => t.class === 'second')
  const firstFixtures = fixtures.filter(f => f.class === 'first')
  const secondFixtures = fixtures.filter(f => f.class === 'second')

  const handleAdd = async (cls) => {
    const name = newName[cls].trim()
    if (!name) return
    const { error } = await addTeam(name, cls)
    if (error) setMsg({ type: 'error', text: error.message })
    else setNewName(prev => ({ ...prev, [cls]: '' }))
  }

  const handleRemove = async (id) => {
    if (!confirm('Remove this team? Their fixtures will remain but be orphaned.')) return
    const { error } = await removeTeam(id)
    if (error) setMsg({ type: 'error', text: error.message })
  }

  const handleGenerate = async (cls) => {
    const list = cls === 'first' ? firstTeams : secondTeams
    if (list.length < 2) return
    const existing = cls === 'first' ? firstFixtures : secondFixtures
    if (existing.length > 0) {
      if (!confirm(`This will delete the ${existing.length} existing ${cls} class fixtures and regenerate. Continue?`)) return
    }
    setBusy(true)
    setMsg(null)
    await clearFixtures(cls)
    const rows = buildFixtureRows(list, cls)
    const { error } = await addFixtures(rows)
    setBusy(false)
    if (error) setMsg({ type: 'error', text: error.message })
    else setMsg({ type: 'ok', text: `Generated ${rows.length} fixtures for ${cls} class.` })
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div className="section-title">⚙ Team Setup</div>
      <div className="section-sub">Register teams and generate fixtures</div>

      {msg && (
        <div className={`alert ${msg.type === 'ok' ? 'alert-ok' : 'alert-danger'}`} style={{ marginBottom: 16 }}>
          {msg.text}
        </div>
      )}

      <div className="grid2">
        {[
          { cls: 'first', label: '1st Class', color: G.lime, teams: firstTeams, fixtures: firstFixtures },
          { cls: 'second', label: '2nd Class', color: G.sky, teams: secondTeams, fixtures: secondFixtures },
        ].map(({ cls, label, color, teams: list, fixtures: fx }) => (
          <div key={cls}>
            <div className="card" style={{ borderTop: `4px solid ${color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span style={{ background: color, color: cls === 'first' ? G.pitch : 'white', borderRadius: 4, padding: '3px 10px', fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '0.95rem', letterSpacing: '0.06em' }}>{label}</span>
                <span style={{ color: G.muted, fontWeight: 600, fontSize: '0.85rem' }}>{list.length} teams · {list.length >= 2 ? list.length * (list.length - 1) / 2 : 0} matches</span>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <div style={{ flex: 1 }}>
                  <label>Add Team</label>
                  <input
                    placeholder="e.g. Churchill High"
                    value={newName[cls]}
                    onChange={e => setNewName(prev => ({ ...prev, [cls]: e.target.value }))}
                    onKeyDown={e => e.key === 'Enter' && handleAdd(cls)}
                  />
                </div>
                <div style={{ paddingTop: 22 }}>
                  <button className={`btn ${cls === 'first' ? 'btn-primary' : 'btn-sky'}`} onClick={() => handleAdd(cls)}>+ Add</button>
                </div>
              </div>

              <div style={{ marginBottom: 14 }}>
                {list.length === 0 ? (
                  <div style={{ color: G.muted, fontSize: '0.85rem', fontStyle: 'italic' }}>No teams yet.</div>
                ) : list.map(t => (
                  <span key={t.id} style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    background: G.pitchLight, color: G.white, borderRadius: 5,
                    padding: '6px 11px', margin: 3, fontSize: '0.88rem', fontWeight: 600,
                    borderLeft: `3px solid ${color}`,
                  }}>
                    🏑 {t.name}
                    <span onClick={() => handleRemove(t.id)} style={{ cursor: 'pointer', color: 'rgba(255,255,255,0.35)', fontSize: '1.1rem', lineHeight: 1 }}>×</span>
                  </span>
                ))}
              </div>

              {list.length >= 2 ? (
                <button
                  className={`btn ${cls === 'first' ? 'btn-primary' : 'btn-sky'}`}
                  style={{ width: '100%', justifyContent: 'center' }}
                  onClick={() => handleGenerate(cls)}
                  disabled={busy}
                >
                  {busy ? '⏳ Generating…' : `🗓 ${fx.length > 0 ? 'Regenerate' : 'Generate'} Fixtures`}
                </button>
              ) : (
                <div className="alert alert-warn" style={{ fontSize: '0.82rem' }}>Add at least 2 teams to generate fixtures.</div>
              )}

              {fx.length > 0 && (
                <div style={{ marginTop: 10, color: G.lime, fontSize: '0.8rem', fontWeight: 600 }}>
                  ✓ {fx.length} fixtures generated
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
