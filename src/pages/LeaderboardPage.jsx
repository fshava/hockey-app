import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import { computeTopScorers } from '../lib/hockey'
import { generateLeaderboardPDF } from '../lib/exportPDF'
import { G } from '../lib/theme'

export default function LeaderboardPage() {
  const { fixtures, scorers, loading } = useData()
  const [cls, setCls] = useState('first')
  const [downloading, setDownloading] = useState(false)

  const clsFixtures = useMemo(() => fixtures.filter(f => f.class === cls), [fixtures, cls])
  const topScorers  = useMemo(() => computeTopScorers(clsFixtures, scorers), [clsFixtures, scorers])
  const maxGoals    = topScorers[0]?.goals || 1
  const color       = cls === 'first' ? G.lime : G.sky

  const handleDownload = async () => {
    setDownloading(true)
    try { await generateLeaderboardPDF({ cls, topScorers }) }
    catch (e) { console.error(e); alert('PDF failed, try again.') }
    finally { setDownloading(false) }
  }

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">🥾 Top Goal Scorers</div>
          <div className="section-sub">Golden boot leaderboard</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className={`class-tab first ${cls === 'first' ? 'sel' : ''}`} onClick={() => setCls('first')}>1st Class</span>
          <span className={`class-tab second ${cls === 'second' ? 'sel' : ''}`} onClick={() => setCls('second')}>2nd Class</span>
          {topScorers.length > 0 && (
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

      {topScorers.length === 0 ? (
        <div className="alert alert-info">No goal scorer data yet for this class.</div>
      ) : (
        <div style={{ background: G.pitchLight, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {topScorers.map((s, idx) => {
            const medalColor = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : G.white
            const barColor   = idx === 0 ? '#ffd700' : color
            const pct        = Math.round((s.goals / maxGoals) * 100)
            return (
              <div key={`${s.playerName}-${s.team}`} className="leaderboard-row" style={{
                display: 'grid', gridTemplateColumns: '44px 1fr 180px 70px',
                gap: 12, alignItems: 'center',
                padding: '13px 20px',
                borderBottom: idx < topScorers.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                background: idx === 0 ? 'rgba(255,215,0,0.05)' : undefined,
              }}>
                <span style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.4rem', color: medalColor, textAlign: 'center' }}>
                  {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                </span>
                <div>
                  <div style={{ fontWeight: 700, color: G.white, fontSize: '0.95rem' }}>{s.playerName}</div>
                  <div style={{ fontSize: '0.76rem', color: G.muted }}>{s.team}</div>
                </div>
                <div className="scorer-bar-wrap leaderboard-bar">
                  <div className="scorer-bar-bg" style={{ height: 8 }}>
                    <div className="scorer-bar-fill" style={{ width: `${pct}%`, background: barColor }} />
                  </div>
                </div>
                <div style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.8rem', color: medalColor, textAlign: 'right' }}>
                  {s.goals}
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, color: G.muted, marginLeft: 3 }}>gls</span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
