import { useState } from 'react'
import { useData } from '../hooks/useData'
import { generateTeamPDF } from '../lib/exportPDF'
import { G } from '../lib/theme'

export default function TeamPDFButton({ teamName, leagueId, leagueName, leagueColor, standings = [], style = {} }) {
  const { fixtures, scorers, venues } = useData()
  const [loading, setLoading] = useState(false)
  const accent = leagueColor || G.lime

  const handleDownload = async () => {
    setLoading(true)
    try {
      await generateTeamPDF({ teamName, leagueId, leagueName, leagueColor: accent, fixtures, scorers, venues, standings })
    } catch (e) {
      console.error('PDF generation failed:', e)
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 4, border: `1px solid ${accent}44`,
        cursor: loading ? 'wait' : 'pointer',
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
        fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase',
        background: `${accent}15`, color: accent, transition: 'all 0.15s',
        ...style,
      }}
    >
      {loading ? '⏳ Generating…' : '⬇ PDF Report'}
    </button>
  )
}
