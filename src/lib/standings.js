export function computeStandings(fixtures, scorers) {
  const table = {}
  const init = (name) => {
    if (!table[name]) table[name] = { name, P:0, W:0, D:0, L:0, GF:0, GA:0, form:[] }
  }
  fixtures.forEach(f => {
    init(f.home_team); init(f.away_team)
    if (f.home_goals != null && f.away_goals != null) {
      const hg = f.home_goals, ag = f.away_goals
      table[f.home_team].P++; table[f.away_team].P++
      table[f.home_team].GF += hg; table[f.home_team].GA += ag
      table[f.away_team].GF += ag; table[f.away_team].GA += hg
      if (hg > ag) {
        table[f.home_team].W++; table[f.away_team].L++
        table[f.home_team].form.push('W'); table[f.away_team].form.push('L')
      } else if (hg < ag) {
        table[f.away_team].W++; table[f.home_team].L++
        table[f.away_team].form.push('W'); table[f.home_team].form.push('L')
      } else {
        table[f.home_team].D++; table[f.away_team].D++
        table[f.home_team].form.push('D'); table[f.away_team].form.push('D')
      }
    }
  })
  return Object.values(table).map(t => ({ ...t, GD: t.GF - t.GA, Pts: t.W*3 + t.D }))
    .sort((a,b) => b.Pts-a.Pts || b.GD-a.GD || b.GF-a.GF || a.name.localeCompare(b.name))
}

export function computeTopScorers(fixtures, scorers) {
  const tally = {}
  const fixtureIds = new Set(fixtures.map(f => f.id))
  scorers.filter(s => fixtureIds.has(s.fixture_id) && !s.own_goal && s.player_name).forEach(s => {
    const key = `${s.player_name}|||${s.team_name}`
    tally[key] = (tally[key] || 0) + (s.goals || 0)
  })
  return Object.entries(tally)
    .map(([key, goals]) => { const [playerName, team] = key.split('|||'); return { playerName, team, goals } })
    .sort((a,b) => b.goals - a.goals)
}
