import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import { useLeagueTab } from '../hooks/useLeagueTab'
import LeagueTabs from '../components/LeagueTabs'
import { computeTopScorers } from '../lib/hockey'
import { generateLeaderboardPDF } from '../lib/exportPDF'
import { G } from '../lib/theme'

export default function LeaderboardPage() {
  const { leagues, fixtures, scorers, loading } = useData()
  const [activeId, setActiveId, activeLeague] = useLeagueTab(leagues)
  const [downloading, setDownloading] = useState(false)

  const clsFixtures = useMemo(() => fixtures.filter(f => f.league_id === activeId), [fixtures, activeId])
  const topScorers  = useMemo(() => computeTopScorers(clsFixtures, scorers), [clsFixtures, scorers])
  const maxGoals    = topScorers[0]?.goals || 1
  const accent      = activeLeague?.color || G.lime

  const handleDownload = async () => {
    setDownloading(true)
    try { await generateLeaderboardPDF({ leagueName: activeLeague?.name, leagueColor: accent, topScorers }) }
    catch (e) { console.error(e) }
    finally { setDownloading(false) }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">🥾 Top Scorers</div>
          <div className="section-sub">Golden boot leaderboard</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <LeagueTabs leagues={leagues} activeId={activeId} onChange={setActiveId}
            extra={topScorers.length > 0 && (
              <button onClick={handleDownload} disabled={downloading} style={{
                padding: '5px 12px', borderRadius: 4, border: `1px solid ${accent}55`,
                cursor: downloading ? 'wait' : 'pointer',
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                fontSize: '0.78rem', letterSpacing: '0.06em', textTransform: 'uppercase',
                background: `${accent}15`, color: accent, border: `1px solid ${accent}44`,
              }}>
                {downloading ? '⏳' : '⬇ PDF'}
              </button>
            )}
          />
        </div>
      </div>

      {topScorers.length === 0 ? (
        <div className="alert alert-info">No scorer data yet for {activeLeague?.name || 'this league'}.</div>
      ) : (
        <div style={{ background: G.pitchLight, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {topScorers.map((s, idx) => {
            const medal  = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : G.white
            const barClr = idx === 0 ? '#ffd700' : accent
            const pct    = Math.round((s.goals / maxGoals) * 100)
            return (
              <div key={`${s.playerName}-${s.team}`} className="leaderboard-row" style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 180px 70px',
                gap: 12, alignItems: 'center', padding: '13px 20px',
                borderBottom: idx < topScorers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: idx === 0 ? 'rgba(255,215,0,0.05)' : undefined,
              }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.4rem', color: medal, textAlign: 'center' }}>
                  {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: G.white, fontSize: '0.95rem' }}>{s.playerName}</div>
                  <div style={{ fontSize: '0.76rem', color: G.muted }}>{s.team}</div>
                </div>
                <div className="scorer-bar-wrap leaderboard-bar">
                  <div className="scorer-bar-bg" style={{ height: 8 }}>
                    <div className="scorer-bar-fill" style={{ width: `${pct}%`, background: barClr }} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.8rem', color: medal, textAlign: 'right' }}>
                  {s.goals}<span style={{ fontSize: '0.72rem', color: G.muted, marginLeft: 3 }}>gls</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
