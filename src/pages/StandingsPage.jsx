import { useMemo } from 'react'
import { useData } from '../hooks/useData'
import { useLeagueTab } from '../hooks/useLeagueTab'
import LeagueTabs from '../components/LeagueTabs'
import { computeStandings } from '../lib/hockey'
import { generateStandingsPDF } from '../lib/exportPDF'
import { G } from '../lib/theme'
import { useState } from 'react'

// Single consistent text color for readability, with accent reserved for emphasis
const TEXT = '#E8EAED'
const TEXT_DIM = 'rgba(232, 234, 235, 0.55)' // for secondary info (P, D, GF, GA)
const FONT_BODY = "'Inter', -apple-system, sans-serif"
const FONT_HEAD = "'Barlow Condensed', sans-serif"

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
    <div className="page" style={{ fontFamily: FONT_BODY, color: TEXT }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title" style={{ fontFamily: FONT_HEAD, color: TEXT }}>🏆 Standings</div>
          <div className="section-sub" style={{ color: TEXT_DIM }}>Updated in real time</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <LeagueTabs leagues={leagues} activeId={activeId} onChange={setActiveId}
            extra={standings.length > 0 && (
              <button onClick={handleDownload} disabled={downloading} style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '5px 12px', borderRadius: 4, border: `1px solid ${accent}55`,
                cursor: downloading ? 'wait' : 'pointer',
                fontFamily: FONT_HEAD, fontWeight: 700,
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
        <div className="alert alert-info" style={{ color: TEXT }}>No data yet for {activeLeague?.name || 'this league'}.</div>
      ) : (
        <div className="league-table-wrap" style={{ background: G.pitchLight, borderRadius: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          <table className="league-table" style={{ fontFamily: FONT_BODY, color: TEXT }}>
            <thead>
              <tr style={{ fontFamily: FONT_HEAD }}>
                <th style={{ color: accent }}>#</th>
                <th className="left" style={{ color: accent }}>Team</th>
                <th style={{ color: TEXT }}>P</th>
                <th style={{ color: TEXT }}>W</th>
                <th className="hide-mobile" style={{ color: TEXT }}>D</th>
                <th className="hide-mobile" style={{ color: TEXT }}>L</th>
                <th className="hide-mobile" style={{ color: TEXT }}>GF</th>
                <th className="hide-mobile" style={{ color: TEXT }}>GA</th>
                <th style={{ color: TEXT }}>GD</th>
                <th style={{ color: accent }}>Pts</th>
                <th className="hide-mobile" style={{ color: TEXT }}>Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => {
                const pos = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : TEXT
                return (
                  <tr key={row.name} style={{ background: idx === 0 ? 'rgba(255,215,0,0.04)' : undefined }}>
                    <td style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: '1.1rem', color: pos, width: 36 }}>
                      {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                    </td>
                    <td className="left" style={{ color: TEXT, fontWeight: 500 }}>{row.name}</td>
                    <td style={{ color: TEXT_DIM }}>{row.P}</td>
                    <td style={{ color: TEXT }}>{row.W}</td>
                    <td className="hide-mobile" style={{ color: TEXT_DIM }}>{row.D}</td>
                    <td className="hide-mobile" style={{ color: TEXT_DIM }}>{row.L}</td>
                    <td className="hide-mobile" style={{ color: TEXT_DIM }}>{row.GF}</td>
                    <td className="hide-mobile" style={{ color: TEXT_DIM }}>{row.GA}</td>
                    <td style={{ color: TEXT, fontWeight: 700 }}>
                      {row.GD > 0 ? '+' : ''}{row.GD}
                    </td>
                    <td style={{ fontFamily: FONT_HEAD, fontWeight: 800, fontSize: '1.1rem', color: accent }}>{row.Pts}</td>
                    <td className="hide-mobile">
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {row.form.slice(-5).length === 0
                          ? <span style={{ color: TEXT_DIM, fontSize: '0.72rem' }}>—</span>
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
      <div style={{ marginTop: 10, fontSize: '0.75rem', color: TEXT_DIM, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Win = 3 pts</span><span>Draw = 1 pt</span><span>Loss = 0 pts</span><span>Sorted: Pts → GD → GF</span>
      </div>
    </div>
  )
}
