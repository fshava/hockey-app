import { useState } from 'react'
import { useData } from '../hooks/useData'
import { generateTeamPDF } from '../lib/exportPDF'
import { G } from '../lib/theme'

export default function TeamPDFButton({ teamName, cls, standings = [], style = {} }) {
  const { fixtures, scorers, venues } = useData()
  const [loading, setLoading] = useState(false)

  const handleDownload = async () => {
    setLoading(true)
    try {
      await generateTeamPDF({ teamName, cls, fixtures, scorers, venues, standings })
    } catch (e) {
      console.error('PDF generation failed:', e)
      alert('PDF generation failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      title={`Download ${teamName} full report PDF`}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        padding: '6px 14px', borderRadius: 4, border: `1px solid rgba(126,203,53,0.35)`,
        cursor: loading ? 'wait' : 'pointer',
        fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
        fontSize: '0.8rem', letterSpacing: '0.06em', textTransform: 'uppercase',
        background: loading ? 'rgba(126,203,53,0.2)' : 'rgba(126,203,53,0.12)',
        color: G.lime, transition: 'all 0.15s',
        ...style,
      }}
      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'rgba(126,203,53,0.25)' }}
      onMouseLeave={e => { e.currentTarget.style.background = loading ? 'rgba(126,203,53,0.2)' : 'rgba(126,203,53,0.12)' }}
    >
      {loading ? '⏳ Generating…' : '⬇ PDF Report'}
    </button>
  )
}
