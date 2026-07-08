import { useState, useMemo } from 'react'
import { useOutletContext } from 'react-router-dom'
import { computeStandings } from '../../lib/standings'

function LeagueTable({ fixtures, scorers, cls }) {
  const color = cls === 'first' ? 'var(--lime)' : 'var(--sky)'
  const standings = useMemo(() => computeStandings(fixtures.filter(f=>f.class===cls), scorers), [fixtures, scorers, cls])

  return (
    <div>
      <div style={{ fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1.2rem', color, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:10 }}>
        {cls==='first'?'1st Class':'2nd Class'}
        <span className="public-badge">{standings.length} teams</span>
      </div>
      <div style={{ background:'var(--pitchLight)', borderRadius:8, overflow:'hidden', boxShadow:'0 4px 20px rgba(0,0,0,0.3)', marginBottom:24 }}>
        {standings.length === 0
          ? <div style={{ padding:'20px', color:'var(--muted)', textAlign:'center', fontSize:'0.88rem' }}>No results recorded yet</div>
          : <table className="league-table">
              <thead>
                <tr>
                  <th style={{color}}>#</th>
                  <th className="left" style={{color}}>Team</th>
                  <th>P</th><th>W</th><th>D</th><th>L</th>
                  <th>GF</th><th>GA</th><th>GD</th>
                  <th style={{color}}>Pts</th>
                  <th>Form</th>
                </tr>
              </thead>
              <tbody>
  {standings.map((row, idx) => {
    return (
      <tr key={row.name}>
        <td style={{ color:'var(--white)', fontFamily:"'Barlow Condensed'", fontWeight:800, fontSize:'1rem' }}>
          {idx===0?'🥇':idx===1?'🥈':idx===2?'🥉':idx+1}
        </td>
        <td className="left" style={{color:'var(--white)',fontWeight:700}}>{row.name}</td>
        <td style={{color:'var(--white)',fontWeight:700}}>{row.P}</td>
        <td style={{color:'var(--white)',fontWeight:700}}>{row.W}</td>
        <td style={{color:'var(--white)',fontWeight:700}}>{row.D}</td>
        <td style={{color:'var(--white)',fontWeight:700}}>{row.L}</td>
        <td style={{color:'var(--white)',fontWeight:700}}>{row.GF}</td>
        <td style={{color:'var(--white)',fontWeight:700}}>{row.GA}</td>
        <td style={{color:'var(--white)',fontWeight:700}}>{row.GD>0?'+':''}{row.GD}</td>
        <td className="pts" style={{color:'var(--white)',fontWeight:700}}>{row.Pts}</td>
        <td>
          <div style={{display:'flex',gap:2,justifyContent:'center'}}>
            {row.form.slice(-5).length===0
              ? <span style={{color:'var(--muted)',fontSize:'0.72rem'}}>—</span>
              : row.form.slice(-5).map((r,i)=><span key={i} className={`form-pill form-${r}`}>{r}</span>)
            }
          </div>
        </td>
      </tr>
    )
  })}
</tbody>            </table>
        }
      </div>
    </div>
  )
}

export default function PublicStandings() {
  const { fixtures, scorers } = useOutletContext()

  return (
    <div className="page">
      <div className="section-title">League Standings</div>
      <div className="section-sub">Win = 3pts · Draw = 1pt · Sorted by Pts → GD → GF</div>
      <LeagueTable fixtures={fixtures} scorers={scorers} cls="first" />
      <LeagueTable fixtures={fixtures} scorers={scorers} cls="second" />
    </div>
  )
}
