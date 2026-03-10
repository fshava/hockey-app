import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function AdminSetup() {
  const { teams, fixtures, addTeam, removeTeam, generateFixtures } = useOutletContext()
  const [newName, setNewName] = useState({ first: '', second: '' })
  const [busy, setBusy] = useState({})
  const [err, setErr] = useState('')

  const firstTeams  = teams.filter(t => t.class === 'first')
  const secondTeams = teams.filter(t => t.class === 'second')
  const firstFix    = fixtures.filter(f => f.class === 'first')
  const secondFix   = fixtures.filter(f => f.class === 'second')

  const handleAdd = async (cls) => {
    const name = newName[cls].trim()
    if (!name) return
    setErr('')
    try {
      await addTeam(name, cls)
      setNewName(p => ({ ...p, [cls]: '' }))
    } catch (e) { setErr(e.message) }
  }

  const handleGenerate = async (cls) => {
    setBusy(p => ({ ...p, [cls]: true }))
    try { await generateFixtures(cls) } catch (e) { setErr(e.message) }
    setBusy(p => ({ ...p, [cls]: false }))
  }

  const ClassCard = ({ cls, teams, fixtures, color, btnClass, label }) => (
    <div className="card">
      <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
        <span style={{ background: color === 'lime' ? 'var(--lime)' : 'var(--sky)', color: color === 'lime' ? 'var(--pitch)' : 'white', borderRadius:4, padding:'3px 10px', fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'0.95rem', letterSpacing:'0.06em' }}>{label}</span>
        <span style={{ color:'var(--muted)', fontWeight:600, fontSize:'0.85rem' }}>{teams.length} teams · {teams.length >= 2 ? Math.floor(teams.length*(teams.length-1)/2) : 0} matches</span>
      </div>
      <div style={{ display:'flex', gap:8 }}>
        <div style={{ flex:1 }}>
          <label>Add Team</label>
          <input placeholder="e.g. Churchill High" value={newName[cls]} onChange={e => setNewName(p=>({...p,[cls]:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleAdd(cls)} />
        </div>
        <div style={{ paddingTop:22 }}>
          <button className={`btn ${btnClass}`} onClick={() => handleAdd(cls)}>+ Add</button>
        </div>
      </div>
      <div style={{ marginTop:12, marginBottom:14 }}>
        {teams.length === 0
          ? <span style={{ color:'var(--muted)', fontSize:'0.85rem', fontStyle:'italic' }}>No teams yet.</span>
          : teams.map(t => (
            <span key={t.id} className="team-chip" style={{ borderLeftColor: color==='lime'?'var(--lime)':'var(--sky)' }}>
              🏑 {t.name}
              <span className="rm" onClick={() => removeTeam(t.id)}>×</span>
            </span>
          ))
        }
      </div>
      {teams.length >= 2 && (
        <div style={{ borderTop:'1px solid var(--sand)', paddingTop:12, display:'flex', alignItems:'center', gap:12 }}>
          <button className={`btn ${btnClass} btn-sm`} onClick={() => handleGenerate(cls)} disabled={busy[cls]}>
            {busy[cls] ? <><span className="spinner"/>  Generating…</> : '🗓 Generate Fixtures'}
          </button>
          {fixtures.length > 0 && <span style={{ color:'var(--muted)', fontSize:'0.8rem' }}>⚠ Re-generating will clear existing fixtures &amp; results for this class.</span>}
        </div>
      )}
    </div>
  )

  return (
    <div className="page">
      <div className="section-title">Team Setup</div>
      <div className="section-sub">Register teams and generate round-robin fixtures</div>
      {err && <div className="alert alert-err">{err}</div>}
      <div className="grid2">
        <ClassCard cls="first"  teams={firstTeams}  fixtures={firstFix}  color="lime" btnClass="btn-primary" label="1ST CLASS" />
        <ClassCard cls="second" teams={secondTeams} fixtures={secondFix} color="sky"  btnClass="btn-sky"     label="2ND CLASS" />
      </div>
    </div>
  )
}
