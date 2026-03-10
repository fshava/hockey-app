import { useMemo, useState } from 'react'
import { useData } from '../hooks/useData'
import { computeTopScorers } from '../lib/hockey'
import { G } from '../lib/theme'

export default function LeaderboardPage() {
  const { fixtures, scorers, loading } = useData()
  const [cls, setCls] = useState('first')

  const clsFixtures = useMemo(() => fixtures.filter(f => f.class === cls), [fixtures, cls])
  const topScorers = useMemo(() => computeTopScorers(clsFixtures, scorers), [clsFixtures, scorers])
  const maxGoals = topScorers[0]?.goals || 1
  const color = cls === 'first' ? G.lime : G.sky

  if (loading) return <div className="spinner" />

  return (
    <div className="page">
      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, flexWrap: 'wrap' }}>
        <div>
          <div className="section-title">🥾 Top Goal Scorers</div>
          <div className="section-sub">Golden boot leaderboard</div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <span className={`class-tab first ${cls === 'first' ? 'sel' : ''}`} onClick={() => setCls('first')}>1st Class</span>
          <span className={`class-tab second ${cls === 'second' ? 'sel' : ''}`} onClick={() => setCls('second')}>2nd Class</span>
        </div>
      </div>

      {topScorers.length === 0 ? (
        <div className="alert alert-info">No goal scorer data yet for this class.</div>
      ) : (
        <div style={{ background: G.pitchLight, borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
          {topScorers.map((s, idx) => {
            const medalColor = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : G.white
            const barColor = idx === 0 ? '#ffd700' : color
            const pct = Math.round((s.goals / maxGoals) * 100)
            return (
              <div key={`${s.playerName}-${s.team}`} style={{
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
                <div className="scorer-bar-wrap">
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
