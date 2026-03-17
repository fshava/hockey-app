import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function generateRoundRobin(teams) {
  const list = [...teams]
  if (list.length % 2 !== 0) list.push({ id: '__bye__', name: 'BYE' })
  const n   = list.length
  const arr = list.slice(1)
  const rounds = []
  for (let r = 0; r < n - 1; r++) {
    const round  = []
    const top    = list[0]
    const bottom = arr[(r + Math.floor(n / 2) - 1) % (n - 1)]
    if (top.id !== '__bye__' && bottom.id !== '__bye__') round.push([top, bottom])
    for (let i = 1; i < n / 2; i++) {
      const a = arr[(r + i - 1) % (n - 1)]
      const b = arr[(r + n - 1 - i - 1 + (n - 1)) % (n - 1)]
      if (a.id !== '__bye__' && b.id !== '__bye__') round.push([a, b])
    }
    rounds.push(round)
  }
  return rounds
}

export function useData() {
  const [leagues,  setLeagues]  = useState([])
  const [venues,   setVenues]   = useState([])
  const [teams,    setTeams]    = useState([])
  const [players,  setPlayers]  = useState([])
  const [fixtures, setFixtures] = useState([])
  const [scorers,  setScorers]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      const [lg, v, t, p, f, s] = await Promise.all([
        supabase.from('leagues').select('*').order('sort_order').order('name'),
        supabase.from('venues').select('*').order('name'),
        supabase.from('teams').select('*').order('name'),
        supabase.from('players').select('*').order('name'),
        supabase.from('fixtures').select('*').order('round').order('created_at'),
        supabase.from('goal_scorers').select('*'),
      ])
      for (const r of [lg, v, t, p, f, s]) if (r.error) throw r.error
      setLeagues(lg.data); setVenues(v.data); setTeams(t.data)
      setPlayers(p.data);  setFixtures(f.data); setScorers(s.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const tables = ['leagues','venues','teams','players','fixtures','goal_scorers']
    const channels = tables.map(table =>
      supabase.channel('rt-' + table)
        .on('postgres_changes', { event: '*', schema: 'public', table }, fetchAll)
        .subscribe()
    )
    return () => channels.forEach(c => supabase.removeChannel(c))
  }, [fetchAll])

  // ── Leagues ──────────────────────────────────────────────────
  const addLeague    = async (name, color) => {
    const maxOrder = leagues.reduce((m, l) => Math.max(m, l.sort_order), 0)
    await supabase.from('leagues').insert({ name: name.trim(), color: color || '#7ecb35', sort_order: maxOrder + 1 })
    await fetchAll()
  }
  const updateLeague = async (id, changes) => { await supabase.from('leagues').update(changes).eq('id', id); await fetchAll() }
  const removeLeague = async (id) => { await supabase.from('leagues').delete().eq('id', id); await fetchAll() }

  // ── Venues ───────────────────────────────────────────────────
  const updateVenue  = async (id, ch) => { await supabase.from('venues').update(ch).eq('id', id); await fetchAll() }

  // ── Teams ────────────────────────────────────────────────────
  const addTeam      = async (name, leagueId) => {
    await supabase.from('teams').insert({ name: name.trim(), league_id: leagueId })
    await fetchAll()
  }
  const removeTeam   = async (id) => { await supabase.from('teams').delete().eq('id', id); await fetchAll() }

  // ── Players ──────────────────────────────────────────────────
  const addPlayer    = async (name, teamId) => {
    await supabase.from('players').insert({ name: name.trim(), team_id: teamId })
    await fetchAll()
    return {}
  }
  const removePlayer = async (id) => { await supabase.from('players').delete().eq('id', id); await fetchAll() }

  // ── Fixtures ─────────────────────────────────────────────────
  const generateFixtures = async (leagueId) => {
    const leagueTeams = teams.filter(t => t.league_id === leagueId)
    if (leagueTeams.length < 2) return
    await supabase.from('fixtures').delete().eq('league_id', leagueId)
    const rounds = generateRoundRobin(leagueTeams)
    const rows = []
    rounds.forEach((round, ri) => {
      round.forEach(([home, away]) => {
        rows.push({ league_id: leagueId, round: ri + 1, home_team: home.name, away_team: away.name })
      })
    })
    await supabase.from('fixtures').insert(rows)
    await fetchAll()
  }

  const updateFixture = async (id, changes) => {
    await supabase.from('fixtures').update(changes).eq('id', id)
    await fetchAll()
  }

  // ── Scorers ──────────────────────────────────────────────────
  // Bulk replace all scorers for a fixture
  const upsertScorers = async (fixtureId, scorerList) => {
    await supabase.from('goal_scorers').delete().eq('fixture_id', fixtureId)
    if (scorerList.length > 0) {
      await supabase.from('goal_scorers').insert(
        scorerList.map(s => ({
          fixture_id:  fixtureId,
          player_name: s.player_name,
          team_name:   s.team_name,
          goals:       s.goals || 1,
          own_goal:    !!s.own_goal,
        }))
      )
    }
    await fetchAll()
  }

  return {
    leagues, venues, teams, players, fixtures, scorers,
    loading, error, fetchAll,
    addLeague, updateLeague, removeLeague,
    updateVenue,
    addTeam, removeTeam,
    addPlayer, removePlayer,
    generateFixtures, updateFixture,
    upsertScorers,
  }
}