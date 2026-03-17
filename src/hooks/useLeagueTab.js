// Shared hook: returns [activeLeagueId, setActiveLeagueId, activeLeague]
import { useState, useEffect } from 'react'

export function useLeagueTab(leagues) {
  const [activeId, setActiveId] = useState(null)

  useEffect(() => {
    if (leagues.length > 0 && !activeId) {
      setActiveId(leagues[0].id)
    }
  }, [leagues, activeId])

  const active = leagues.find(l => l.id === activeId) || leagues[0] || null
  return [activeId || active?.id, setActiveId, active]
}