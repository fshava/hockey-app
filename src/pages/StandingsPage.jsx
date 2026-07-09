import { useMemo } from 'react'
import { useData } from '../hooks/useData'
import { useLeagueTab } from '../hooks/useLeagueTab'
import LeagueTabs from '../components/LeagueTabs'
import { computeStandings } from '../lib/hockey'
import { generateStandingsPDF } from '../lib/exportPDF'
import { G } from '../lib/theme'
import { useState } from 'react'

export default function StandingsPage() {
  const { leagues, fixtures, scorers, loading } = useData()
  const [activeId, setActiveId, activeLeague] = useLeagueTab(leagues)
  const [downloading, setDownloading] = useState(false)

  const clsFixtures = useMemo(() => fixtures.filter(f => f.league_id === activeId), [fixtures, activeId])
  const standings   = useMemo(() => computeStandings(clsFixtures, scorers), [clsFixtures, scorers])

  const handleDownload = async () => {
    setDownloading(true)
    try { await generateStandingsPDF({ leagueName: activeLeague?.name, leagueColor: activeLeague?.color, standings }) }
    catch (e) { console.error(e) }
    finally { setDownloading(false) }
  }

  if (loading) return <div className="spinner" />

  const accent = activeLeague?.color || G.lime

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">🏆 Standings</div>
          <div className="section-sub">Updated in real time</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <LeagueTabs leagues={leagues} activeId={activeId} onChange={setActiveId}
            extra={standings.length > 0 && (
              <button onClick={handleDownload} disabled={downloading} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 4, border: `1px solid ${accent}55`,
                cursor: downloading ? 'wait' : 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                background: `${accent}15`, color: accent,
              }}>
                {downloading ? '⏳' : '⬇ PDF'}
              </button>
            )}
          />
        </div>
      </div>

      {standings.length === 0 ? (
        <div className="alert alert-info">No data yet for {activeLeague?.name || 'this league'}.</div>
      ) : (
        <div className="league-table-wrap" style={{ background: G.pitchLight, borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <table className="league-table">
            <thead>
              <tr>
                <th style={{ color: accent }}>#</th>
                <th className="left">Team</th>
                <th>P</th><th>W</th>
                <th className="hide-mobile">D</th>
                <th className="hide-mobile">L</th>
                <th className="hide-mobile">GF</th>
                <th className="hide-mobile">GA</th>
                <th>GD</th>
                <th>Pts</th>
                <th className="hide-mobile">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => {
                const pos = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : G.white
                return (
                  <tr key={row.name} style={{ background: idx === 0 ? 'rgba(255,215,0,0.04)' : undefined }}>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.1rem', color: pos, width: 36 }}>
                      {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                    </td>
                    <td className="left">{row.name}</td>
                    <td>{row.P}</td>
                    <td>{row.W}</td>
                    <td>{row.D}</td>
                    <td>{row.L}</td>
                    <td>{row.GF}</td>
                    <td>{row.GA}</td>
                    <td>
                      {row.GD > 0 ? '+' : ''}{row.GD}
                    </td>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontSize: '1.1rem'}}>{row.Pts}</td>
                    <td className="hide-mobile">
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {row.form.slice(-5).length === 0
                          ? <span style={{ color: G.muted, fontSize: '0.72rem' }}>—</span>
                          : row.form.slice(-5).map((r, i) => <span key={i} className={`form-pill form-${r}`}>{r}</span>)}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: '0.75rem', color: G.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Win = 3 pts</span><span>Draw = 1 pt</span><span>Loss = 0 pts</span><span>Sorted: Pts → GD → GF</span>
      </div>
    </div>
  )
}
