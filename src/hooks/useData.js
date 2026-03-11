import { useEffect, useState, useCallback } from 'react'
import { supabase } from '../lib/supabase'

function generateRoundRobin(teams) {
  const list = [...teams]
  if (list.length % 2 !== 0) list.push({ id: '__bye__', name: 'BYE' })
  const n = list.length
  const arr = list.slice(1)
  const rounds = []
  for (let r = 0; r < n - 1; r++) {
    const round = []
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
      const [v, t, p, f, s] = await Promise.all([
        supabase.from('venues').select('*').order('name'),
        supabase.from('teams').select('*').order('name'),
        supabase.from('players').select('*').order('name'),
        supabase.from('fixtures').select('*').order('round').order('created_at'),
        supabase.from('goal_scorers').select('*'),
      ])
      if (v.error) throw v.error
      if (t.error) throw t.error
      if (p.error) throw p.error
      if (f.error) throw f.error
      if (s.error) throw s.error
      setVenues(v.data); setTeams(t.data); setPlayers(p.data)
      setFixtures(f.data); setScorers(s.data)
    } catch (e) { setError(e.message) }
    finally { setLoading(false) }
  }, [])

  useEffect(() => { fetchAll() }, [fetchAll])

  useEffect(() => {
    const channels = ['venues','teams','players','fixtures','goal_scorers'].map(table =>
      supabase.channel('rt-'+table)
        .on('postgres_changes', { event: '*', schema: 'public', table }, fetchAll)
        .subscribe()
    )
    return () => channels.forEach(c => supabase.removeChannel(c))
  }, [fetchAll])

  const updateVenue    = async (id, ch) => { await supabase.from('venues').update(ch).eq('id',id); await fetchAll() }
  const addTeam        = async (name, cls) => { await supabase.from('teams').insert({ name: name.trim(), class: cls }); await fetchAll() }
  const removeTeam     = async (id) => { await supabase.from('teams').delete().eq('id',id); await fetchAll() }
  const addPlayer      = async (teamId, name) => { await supabase.from('players').insert({ team_id: teamId, name: name.trim() }); await fetchAll() }
  const removePlayer   = async (id) => { await supabase.from('players').delete().eq('id',id); await fetchAll() }

  const generateFixtures = async (cls) => {
    const classTeams = teams.filter(t => t.class === cls)
    if (classTeams.length < 2) return
    await supabase.from('fixtures').delete().eq('class', cls)
    const rounds = generateRoundRobin(classTeams)
    const rows = []
    rounds.forEach((round, ri) => {
      round.forEach(([home, away]) => {
        rows.push({ class: cls, round: ri + 1, home_team: home.name, away_team: away.name })
      })
    })
    await supabase.from('fixtures').insert(rows)
    await fetchAll()
  }

  const updateFixture = async (id, changes) => { await supabase.from('fixtures').update(changes).eq('id',id); await fetchAll() }

  const upsertScorer = async (scorer) => {
    if (scorer.id && !scorer.id.startsWith('new-')) {
      await supabase.from('goal_scorers').update({ player_name: scorer.player_name, team_name: scorer.team_name, goals: scorer.goals, own_goal: scorer.own_goal }).eq('id', scorer.id)
    } else {
      await supabase.from('goal_scorers').insert({ fixture_id: scorer.fixture_id, player_name: scorer.player_name, team_name: scorer.team_name, goals: scorer.goals, own_goal: scorer.own_goal })
    }
    await fetchAll()
  }

  const removeScorer = async (id) => { await supabase.from('goal_scorers').delete().eq('id',id); await fetchAll() }

  // Bulk replace all scorers for a fixture (delete + re-insert)
  const upsertScorers = async (fixtureId, scorerList) => {
    await supabase.from('goal_scorers').delete().eq('fixture_id', fixtureId)
    if (scorerList.length > 0) {
      await supabase.from('goal_scorers').insert(
        scorerList.map(s => ({
          fixture_id: fixtureId,
          player_name: s.player_name,
          team_name: s.team_name,
          goals: s.goals || 1,
          own_goal: !!s.own_goal,
        }))
      )
    }
    await fetchAll()
  }

  return { venues, teams, players, fixtures, scorers, loading, error, fetchAll, updateVenue, addTeam, removeTeam, addPlayer, removePlayer, generateFixtures, updateFixture, upsertScorer, upsertScorers, removeScorer }
}
