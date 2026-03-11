import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import { computeStandings } from '../lib/hockey'
import { generateStandingsPDF } from '../lib/exportPDF'
import { G } from '../lib/theme'

export default function StandingsPage() {
  const { fixtures, scorers, loading } = useData()
  const [cls, setCls] = useState('first')
  const [downloading, setDownloading] = useState(false)

  const clsFixtures = useMemo(() => fixtures.filter(f => f.class === cls), [fixtures, cls])
  const standings   = useMemo(() => computeStandings(clsFixtures, scorers), [clsFixtures, scorers])

  const handleDownload = async () => {
    setDownloading(true)
    try { await generateStandingsPDF({ cls, standings }) }
    catch (e) { console.error(e); alert('PDF failed, try again.') }
    finally { setDownloading(false) }
  }

  if (loading) return <div className="spinner" />

  const color = cls === 'first' ? G.lime : G.sky

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">League Standings</div>
          <div className="section-sub">Updated in real time</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`class-tab first ${cls === 'first' ? 'sel' : ''}`} onClick={() => setCls('first')}>1st Class</span>
          <span className={`class-tab second ${cls === 'second' ? 'sel' : ''}`} onClick={() => setCls('second')}>2nd Class</span>
          {standings.length > 0 && (
            <button
              onClick={handleDownload}
              disabled={downloading}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '6px 14px', borderRadius: 4, border: `1px solid ${color}55`,
                cursor: downloading ? 'wait' : 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                background: `${color}18`, color, transition: 'all 0.15s',
              }}
            >
              {downloading ? '⏳ Generating…' : '⬇ Download PDF'}
            </button>
          )}
        </div>
      </div>

      {standings.length === 0 ? (
        <div className="alert alert-info">No data yet for this class.</div>
      ) : (
        <div className="league-table-wrap" style={{ background: G.pitchLight, borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <table className="league-table">
            <thead>
              <tr>
                <th style={{ color }}>#</th>
                <th className="left" style={{ color }}>Team</th>
                <th>P</th>
                <th>W</th>
                <th className="hide-mobile">D</th>
                <th className="hide-mobile">L</th>
                <th className="hide-mobile">GF</th>
                <th className="hide-mobile">GA</th>
                <th>GD</th>
                <th style={{ color }}>Pts</th>
                <th className="hide-mobile">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => {
                const posColor = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : G.white
                return (
                  <tr key={row.name} style={{ background: idx === 0 ? 'rgba(255,215,0,0.04)' : undefined }}>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.1rem', color: posColor, width: 36 }}>
                      {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                    </td>
                    <td className="left">{row.name}</td>
                    <td style={{ color: G.muted }}>{row.P}</td>
                    <td style={{ color: G.lime }}>{row.W}</td>
                    <td className="hide-mobile" style={{ color: G.muted }}>{row.D}</td>
                    <td className="hide-mobile" style={{ color: G.danger }}>{row.L}</td>
                    <td className="hide-mobile">{row.GF}</td>
                    <td className="hide-mobile">{row.GA}</td>
                    <td style={{ color: row.GD > 0 ? G.lime : row.GD < 0 ? G.danger : G.muted, fontWeight: 700 }}>
                      {row.GD > 0 ? '+' : ''}{row.GD}
                    </td>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.1rem', color }}>{row.Pts}</td>
                    <td className="hide-mobile">
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {row.form.slice(-5).length === 0
                          ? <span style={{ color: G.muted, fontSize: '0.72rem' }}>—</span>
                          : row.form.slice(-5).map((r, i) => (
                              <span key={i} className={`form-pill form-${r}`}>{r}</span>
                            ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: '0.75rem', color: G.muted, display: 'flex', gap: 16 }}>
        <span>Win = 3 pts</span><span>Draw = 1 pt</span><span>Loss = 0 pts</span>
        <span>Sorted: Pts → GD → GF</span>
      </div>
    </div>
  )
}
