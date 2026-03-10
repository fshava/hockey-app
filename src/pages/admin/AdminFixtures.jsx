import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'

export default function AdminFixtures() {
  const { venues, fixtures, updateFixture } = useOutletContext()
  const [viewClass, setViewClass] = useState('first')
  const [saving, setSaving] = useState({})

  const activeFixtures = fixtures.filter(f => f.class === viewClass)

  // Conflict detection
  const conflicts = useMemo(() => {
    const groups = {}
    fixtures.forEach(f => {
      if (f.venue_id && f.match_date && f.match_time) {
        const key = `${f.venue_id}|${f.match_date}|${f.match_time}`
        groups[key] = (groups[key]||0) + 1
      }
    })
    const over = {}
    Object.entries(groups).forEach(([k, cnt]) => {
      const vid = k.split('|')[0]
      const venue = venues.find(v => v.id === vid)
      if (venue && cnt > venue.grounds) over[k] = { count: cnt, max: venue.grounds }
    })
    return over
  }, [fixtures, venues])

  const hasConflict = (f) => {
    if (!f.venue_id || !f.match_date || !f.match_time) return false
    return !!conflicts[`${f.venue_id}|${f.match_date}|${f.match_time}`]
  }

  const save = async (id, field, val) => {
    setSaving(p => ({ ...p, [`${id}-${field}`]: true }))
    await updateFixture(id, { [field]: val || null })
    setSaving(p => ({ ...p, [`${id}-${field}`]: false }))
  }

  const rounds = [...new Set(activeFixtures.map(f => f.round))].sort((a,b)=>a-b)
  const accentColor = viewClass === 'first' ? 'var(--lime)' : 'var(--sky)'

  return (
    <div className="page">
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:20, flexWrap:'wrap' }}>
        <div>
          <div className="section-title">Fixtures</div>
          <div className="section-sub">Assign dates, times & venues</div>
        </div>
        <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
          <span className={`class-tab first ${viewClass==='first'?'sel':''}`} onClick={()=>setViewClass('first')}>1st Class ({fixtures.filter(f=>f.class==='first').length})</span>
          <span className={`class-tab second ${viewClass==='second'?'sel':''}`} onClick={()=>setViewClass('second')}>2nd Class ({fixtures.filter(f=>f.class==='second').length})</span>
        </div>
      </div>

      {activeFixtures.length === 0
        ? <div className="alert alert-warn">No fixtures yet. Go to Setup to generate fixtures.</div>
        : <>
          {Object.keys(conflicts).length > 0 && <div className="alert alert-warn">⚠ {Object.keys(conflicts).length} time slot(s) overbooked.</div>}
          {rounds.map(round => (
            <div key={round} style={{ marginBottom:20 }}>
              <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1rem', color:accentColor, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:8, borderBottom:`1px solid ${accentColor}33`, paddingBottom:4 }}>
                Round {round}
              </div>
              {activeFixtures.filter(f=>f.round===round).map((f,i) => {
                const conflict = hasConflict(f)
                return (
                  <div key={f.id} style={{ display:'grid', gridTemplateColumns:'28px 1fr 44px 1fr 170px 130px 110px', gap:8, alignItems:'center', padding:'9px 14px', borderRadius:5, marginBottom:5, background: conflict?'rgba(224,123,42,0.1)':'var(--white)', borderLeft:`3px solid ${accentColor}`, boxShadow: conflict?`0 0 0 1.5px var(--warn)`:'none' }}>
                    <span style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, color:'var(--muted)', fontSize:'1rem' }}>{i+1}</span>
                    <span style={{ fontWeight:700, textAlign:'right', fontSize:'0.88rem' }}>{f.home_team}</span>
                    <span style={{ textAlign:'center', color:'var(--muted)', fontWeight:800, fontFamily:"'Barlow Condensed'", fontSize:'0.9rem' }}>vs</span>
                    <span style={{ fontWeight:700, fontSize:'0.88rem' }}>{f.away_team}</span>
                    <select defaultValue={f.venue_id||''} onBlur={e=>save(f.id,'venue_id',e.target.value)} style={{ fontSize:'0.82rem', padding:'6px 8px' }}>
                      <option value="">— Venue —</option>
                      {venues.map(v=><option key={v.id} value={v.id}>{v.name}</option>)}
                    </select>
                    <input type="date" defaultValue={f.match_date||''} onBlur={e=>save(f.id,'match_date',e.target.value)} style={{ fontSize:'0.82rem', padding:'6px 8px' }} />
                    <input type="time" defaultValue={f.match_time||''} onBlur={e=>save(f.id,'match_time',e.target.value)} style={{ fontSize:'0.82rem', padding:'6px 8px' }} />
                  </div>
                )
              })}
            </div>
          ))}
        </>
      }
    </div>
  )
}
