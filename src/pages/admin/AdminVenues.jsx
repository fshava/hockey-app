import { useOutletContext } from 'react-router-dom'
import { useState } from 'react'

export default function AdminVenues() {
  const { venues, updateVenue } = useOutletContext()
  const [saving, setSaving] = useState({})

  const handle = async (id, field, val) => {
    setSaving(p => ({ ...p, [id]: true }))
    await updateVenue(id, { [field]: field === 'grounds' ? Math.max(1, parseInt(val)||1) : val })
    setSaving(p => ({ ...p, [id]: false }))
  }

  return (
    <div className="page">
      <div className="section-title">Venue Management</div>
      <div className="section-sub">Configure the 5 clusters and their number of grounds</div>
      <div className="grid2">
        {venues.map(v => (
          <div className="card" key={v.id}>
            <div style={{ marginBottom:12 }}>
              <label>Venue / Cluster Name</label>
              <input defaultValue={v.name} onBlur={e => handle(v.id, 'name', e.target.value)} />
            </div>
            <div>
              <label>Number of Grounds (simultaneous matches)</label>
              <input type="number" min="1" max="10" defaultValue={v.grounds} onBlur={e => handle(v.id, 'grounds', e.target.value)} />
            </div>
            <div style={{ marginTop:10, display:'flex', gap:6, flexWrap:'wrap' }}>
              {Array.from({ length: v.grounds }).map((_,i) => (
                <span key={i} style={{ background:'var(--pitchLight)', color:'var(--lime)', borderRadius:4, padding:'3px 9px', fontSize:'0.78rem', fontWeight:700 }}>Ground {i+1}</span>
              ))}
              {saving[v.id] && <span style={{ color:'var(--muted)', fontSize:'0.78rem' }}>saving…</span>}
            </div>
          </div>
        ))}
      </div>
      <div className="alert alert-info">ℹ Each ground at a venue can host one match simultaneously. Changes are saved when you click away from the field.</div>
    </div>
  )
}
