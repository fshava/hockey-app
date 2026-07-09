// ─────────────────────────────────────────────────────────────
//  exportPDF.js  –  all PDF exports for Hockey Fixtures Manager
//  Exports:
//    generateTeamPDF({ teamName, leagueId, leagueName, leagueColor, fixtures, scorers, venues, standings })
//    generateStandingsPDF({ leagueName, leagueColor, standings })
//    generateLeaderboardPDF({ leagueName, leagueColor, topScorers })
//
//  DESIGN NOTES (this pass):
//   - Running text is never coloured. Every label, name, number and
//     stat is set in INK or INK_SOFT (near-black / warm grey). Colour
//     is used only for: the cover banner, thin accent rule lines, and
//     small filled badges/pills/bars — never for the letterforms of
//     ordinary text sitting on a plain background.
//   - Layout constants were recalculated so every table (standings,
//     results, upcoming, leaderboard) sums to exactly COL width —
//     the old file let the form-pill row run ~25mm past the page
//     edge on a 5-game streak. Nothing should clip or overflow now.
//   - Alternating row shading + generous row height replaces the
//     "everything is bold and colourful" look with something closer
//     to a normal printed report.
// ─────────────────────────────────────────────────────────────

// Neutral ink palette — the ONLY colours ever used for text on a
// plain (white/panel) background.
const INK       = [28,  32,  30]   // primary text
const INK_SOFT  = [104, 112, 107]  // secondary / muted text
const INK_FAINT = [156, 162, 157]  // tertiary / hairline labels

// Structural neutrals
const WHITE      = [255, 255, 255]
const PANEL      = [245, 246, 243]  // alternating row tint
const PANEL_DARK = [235, 237, 232]  // stronger panel (headers, boxes)
const LINE       = [224, 227, 220]  // hairlines / borders
const COVER_BG   = [22,  27,  25]   // dark cover / footer band

// Colour is reserved for badge fills, bars and rule lines — never
// for the text that sits directly on a white/panel background.
const GOLD   = [176, 141, 60]
const SILVER = [148, 152, 156]
const BRONZE = [163, 116, 74]
const WIN    = [86,  138, 101]
const LOSS   = [176, 92,  84]
const DRAW   = [150, 152, 148]

const W_PAGE = 210
const MARGIN = 15
const COL    = W_PAGE - MARGIN * 2   // 180

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtTime(t) { return t ? t.slice(0, 5) : '—' }
function hexToRgb(hex) {
  const h = (hex || '7ecb35').replace('#', '')
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)]
}
// Mix a colour toward white — used to get a soft, print-friendly
// tint of the league accent for backgrounds (never for text).
function tint(rgb, amount) {
  // amount 0 = pure white, 1 = full colour
  return rgb.map(c => Math.round(255 + (c - 255) * amount))
}
function truncate(str, max) {
  if (!str) return ''
  return str.length > max ? str.slice(0, max - 1) + '…' : str
}

async function loadJsPDF() {
  if (window.jspdf) return window.jspdf.jsPDF
  await new Promise((resolve, reject) => {
    const s = document.createElement('script')
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
    s.onload = resolve; s.onerror = reject
    document.head.appendChild(s)
  })
  return window.jspdf.jsPDF
}

// ── Shared doc helpers ────────────────────────────────────────
function makeHelpers(doc) {
  const setFont  = (style = 'normal', size = 10) => { doc.setFont('helvetica', style); doc.setFontSize(size) }
  const setColor = (...rgb) => doc.setTextColor(...(rgb.length === 1 ? rgb[0] : rgb))
  const setFill  = (...rgb) => doc.setFillColor(...(rgb.length === 1 ? rgb[0] : rgb))
  const setDraw  = (...rgb) => doc.setDrawColor(...(rgb.length === 1 ? rgb[0] : rgb))
  const text     = (str, x, y, opts = {}) => doc.text(String(str), x, y, opts)
  const rect     = (x, w, y, h, rgb, rnd = 0) => { setFill(rgb); doc.roundedRect(x, y, w, h, rnd, rnd, 'F') }
  const hline    = (x1, y1, x2, y2, w = 0.2, rgb = LINE) => { setDraw(rgb); doc.setLineWidth(w); doc.line(x1, y1, x2, y2) }
  return { setFont, setColor, setFill, setDraw, text, rect, hline }
}

// ── Cover ────────────────────────────────────────────────────
function drawCover(doc, h, accent, title, subtitle) {
  const { rect, setFont, setColor, text } = h
  rect(0, W_PAGE, 0, 50, COVER_BG)
  rect(0, W_PAGE, 0, 3, accent)
  setFont('normal', 8); setColor(WHITE)
  text('SCHOOL HOCKEY  ·  SEASON REPORT', MARGIN, 15)
  setFont('bold', 24); setColor(WHITE)
  text(truncate(title, 32).toUpperCase(), MARGIN, 30)
  if (subtitle) {
    setFont('normal', 9); setColor([200, 205, 200])
    text(subtitle, MARGIN, 39)
  }
  setFont('normal', 7.5); setColor([170, 178, 172])
  text(`Generated ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`, W_PAGE - MARGIN, 39, { align: 'right' })
}

// ── Continuation page header ────────────────────────────────
function makePageHeader(doc, h, accent, label) {
  return () => {
    const { hline, setFont, setColor, text } = h
    hline(MARGIN, 12, W_PAGE - MARGIN, 12, 0.6, accent)
    setFont('bold', 8); setColor(INK_SOFT)
    text(label, MARGIN, 9)
  }
}

// ── Footer ───────────────────────────────────────────────────
function drawFooters(doc, h) {
  const { hline, setFont, setColor, text } = h
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    hline(MARGIN, 285, W_PAGE - MARGIN, 285, 0.2, LINE)
    setFont('normal', 7.5); setColor(INK_FAINT)
    text('School Hockey Fixtures Manager', MARGIN, 291)
    text(`Page ${i} of ${total}`, W_PAGE - MARGIN, 291, { align: 'right' })
  }
}

// ── Small helpers for section titles ───────────────────────
function drawSectionTitle(doc, h, accent, label, y) {
  const { setFont, setColor, hline, text } = h
  setFont('bold', 10); setColor(INK)
  text(label, MARGIN, y)
  hline(MARGIN, y + 2, MARGIN + COL, y + 2, 0.7, accent)
  return y + 9
}

// ── Standings table (shared by team PDF + standings PDF) ────
function drawStandingsSection(doc, h, accent, standings, y, teamHighlight) {
  const { setFont, setColor, rect, text, hline } = h
  let cy = drawSectionTitle(doc, h, accent, 'LEAGUE STANDINGS', y)

  // Column plan (sums to COL = 180mm, nothing runs off the page)
  const C = {
    pos:  MARGIN + 7,
    team: MARGIN + 15,
    P:    MARGIN + 77,
    W:    MARGIN + 87,
    D:    MARGIN + 97,
    L:    MARGIN + 107,
    GF:   MARGIN + 117,
    GA:   MARGIN + 127,
    GD:   MARGIN + 137,
    Pts:  MARGIN + 149,
    form: MARGIN + 162,
  }
  const PILL_W = 3.1, PILL_GAP = 0.5   // 5 pills fit inside 18mm

  setFont('bold', 6.8); setColor(INK_FAINT)
  text('#', C.pos, cy, { align: 'center' })
  text('TEAM', C.team, cy)
  ;['P', 'W', 'D', 'L', 'GF', 'GA', 'GD'].forEach((lbl, i) => text(lbl, C.P + i * 10, cy, { align: 'center' }))
  text('PTS', C.Pts, cy, { align: 'center' })
  text('FORM', C.form, cy)
  hline(MARGIN, cy + 2, MARGIN + COL, cy + 2, 0.3)
  cy += 8

  standings.forEach((row, idx) => {
    const ROW_H = 10
    const isHighlight = teamHighlight && row.name === teamHighlight
    const medal = idx === 0 ? GOLD : idx === 1 ? SILVER : idx === 2 ? BRONZE : null
    const gdStr = row.GD > 0 ? `+${row.GD}` : String(row.GD)

    rect(MARGIN, COL, cy - 5.5, ROW_H, isHighlight ? tint(accent, 0.15) : (idx % 2 ? PANEL : WHITE), 1)
    if (isHighlight) rect(MARGIN, 1.2, cy - 5.5, ROW_H, accent)

    // Position — medal badge for top 3, plain ink number otherwise
    if (medal) {
      rect(C.pos - 3.4, 6.8, cy - 4.3, 6.8, medal, 3.4)
      setFont('bold', 8); setColor(WHITE)
      text(String(idx + 1), C.pos, cy - 0.1, { align: 'center' })
    } else {
      setFont('bold', 8.5); setColor(INK)
      text(String(idx + 1), C.pos, cy - 0.1, { align: 'center' })
    }

    // Team name
    setFont(isHighlight ? 'bold' : 'normal', 9); setColor(INK)
    text(truncate(row.name, 32), C.team, cy - 0.1)

    // Stats — ink text throughout; weight (not colour) signals W
    setFont('normal', 8.5); setColor(INK_SOFT)
    text(String(row.P), C.P, cy - 0.1, { align: 'center' })
    setFont('bold', 8.5);  setColor(INK); text(String(row.W), C.W, cy - 0.1, { align: 'center' })
    setFont('normal', 8.5); setColor(INK_SOFT)
    text(String(row.D), C.D, cy - 0.1, { align: 'center' })
    text(String(row.L), C.L, cy - 0.1, { align: 'center' })
    setColor(INK)
    text(String(row.GF), C.GF, cy - 0.1, { align: 'center' })
    text(String(row.GA), C.GA, cy - 0.1, { align: 'center' })
    setFont('bold', 8.5)
    text(gdStr, C.GD, cy - 0.1, { align: 'center' })

    // Points — the primary metric, given a soft tint chip (colour as
    // background, not as font colour)
    rect(C.Pts - 6, 12, cy - 4.6, 6.4, tint(accent, 0.14), 2)
    setFont('bold', 9.5); setColor(INK)
    text(String(row.Pts), C.Pts, cy - 0.1, { align: 'center' })

    // Form pills — small filled squares (colour as fill, white text)
    const form = (row.form || []).slice(-5)
    form.forEach((r, fi) => {
      const fc = r === 'W' ? WIN : r === 'L' ? LOSS : DRAW
      const px = C.form + fi * (PILL_W + PILL_GAP)
      rect(px, PILL_W, cy - 4.3, 6.2, fc, 0.8)
      setFont('bold', 6); setColor(WHITE)
      text(r, px + PILL_W / 2, cy - 0.1, { align: 'center' })
    })

    cy += ROW_H
    hline(MARGIN, cy - 0.7, MARGIN + COL, cy - 0.7, 0.15)
  })

  cy += 4
  setFont('normal', 7); setColor(INK_FAINT)
  text('Win = 3 pts   ·   Draw = 1 pt   ·   Loss = 0 pts   ·   Sorted by Pts, then GD, then GF', MARGIN, cy)
  return cy + 6
}

// ── Leaderboard table ────────────────────────────────────────
function drawLeaderboardSection(doc, h, accent, topScorers, y) {
  const { setFont, setColor, rect, text, hline } = h
  let cy = drawSectionTitle(doc, h, accent, 'TOP GOAL SCORERS', y)
  const maxGoals = topScorers[0]?.goals || 1

  const C = { rank: MARGIN + 7, player: MARGIN + 16, team: MARGIN + 98, barStart: MARGIN + 130, goals: W_PAGE - MARGIN }
  const BAR_MAX = 34

  setFont('bold', 6.8); setColor(INK_FAINT)
  text('#', C.rank, cy, { align: 'center' })
  text('PLAYER', C.player, cy)
  text('TEAM', C.team, cy)
  text('GOALS', C.goals, cy, { align: 'right' })
  hline(MARGIN, cy + 2, MARGIN + COL, cy + 2, 0.3)
  cy += 8

  topScorers.forEach((s, idx) => {
    const ROW_H = 10.5
    const medal = idx === 0 ? GOLD : idx === 1 ? SILVER : idx === 2 ? BRONZE : null
    const barW  = Math.max(2, (s.goals / maxGoals) * BAR_MAX)

    rect(MARGIN, COL, cy - 5.7, ROW_H, idx % 2 ? PANEL : WHITE, 1)

    if (medal) {
      rect(C.rank - 3.6, 7.2, cy - 4.3, 7.2, medal, 3.6)
      setFont('bold', 8.5); setColor(WHITE)
      text(String(idx + 1), C.rank, cy - 0.2, { align: 'center' })
    } else {
      setFont('bold', 8.5); setColor(INK)
      text(String(idx + 1), C.rank, cy - 0.2, { align: 'center' })
    }

    setFont(idx === 0 ? 'bold' : 'normal', 9); setColor(INK)
    text(truncate(s.playerName, 38), C.player, cy - 0.2)

    setFont('normal', 7.5); setColor(INK_SOFT)
    text(truncate(s.team, 22), C.team, cy - 0.2)

    // Bar — coloured fill only, no coloured text
    rect(C.barStart, BAR_MAX, cy - 3.2, 3.4, PANEL_DARK, 1)
    rect(C.barStart, barW, cy - 3.2, 3.4, accent, 1)

    setFont('bold', 10.5); setColor(INK)
    text(String(s.goals), C.goals, cy - 0.1, { align: 'right' })

    cy += ROW_H
    hline(MARGIN, cy - 0.8, MARGIN + COL, cy - 0.8, 0.15)
  })

  return cy + 4
}

// ═══════════════════════════════════════════════════════════════
//  1.  TEAM PDF  (fixtures + standings + results)
// ═══════════════════════════════════════════════════════════════
export async function generateTeamPDF({ teamName, leagueId, leagueName, leagueColor, fixtures, scorers, venues, standings }) {
  const jsPDF  = await loadJsPDF()
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const accent = hexToRgb(leagueColor)
  const h      = makeHelpers(doc)
  const { setFont, setColor, rect, text, hline } = h

  const teamFixtures = fixtures
    .filter(f => (f.league_id === leagueId) && (f.home_team === teamName || f.away_team === teamName))
    .sort((a, b) => (a.match_date || '').localeCompare(b.match_date || '') || a.round - b.round)
  const played   = teamFixtures.filter(f => f.home_goals != null)
  const upcoming = teamFixtures.filter(f => f.home_goals == null)

  let W = 0, D = 0, L = 0, GF = 0, GA = 0
  played.forEach(f => {
    const isHome = f.home_team === teamName
    const myG = isHome ? f.home_goals : f.away_goals
    const oppG = isHome ? f.away_goals : f.home_goals
    GF += myG; GA += oppG
    if (myG > oppG) W++; else if (myG < oppG) L++; else D++
  })

  const drawPageHeader = makePageHeader(doc, h, accent, `${teamName}${leagueName ? '  ·  ' + leagueName : ''}`)
  let y = 0

  const checkPage = (needed = 20) => {
    if (y + needed > 272) { doc.addPage(); y = 20; drawPageHeader() }
  }

  // Cover
  drawCover(doc, h, accent, teamName, `${leagueName || 'League'} Season Report`)
  y = 60

  // Stat strip
  if (played.length > 0) {
    const GD = GF - GA
    const stats = [
      ['P', played.length],
      ['W', W],
      ['D', D],
      ['L', L],
      ['GF', GF],
      ['GA', GA],
      ['GD', GD > 0 ? `+${GD}` : GD],
      ['PTS', W * 3 + D],
    ]
    const gap = 2
    const boxW = (COL - gap * (stats.length - 1)) / stats.length
    stats.forEach(([lbl, val], i) => {
      const bx = MARGIN + i * (boxW + gap)
      const isPts = lbl === 'PTS'
      rect(bx, boxW, y, 22, isPts ? tint(accent, 0.16) : PANEL, 2)
      hline(bx, y, bx, y + 22, 0, LINE)
      setFont('bold', 15); setColor(INK)
      text(String(val), bx + boxW / 2, y + 12, { align: 'center' })
      setFont('normal', 6.5); setColor(INK_SOFT)
      text(lbl, bx + boxW / 2, y + 18.5, { align: 'center' })
    })
    y += 30
  }

  // LEAGUE STANDING
  if (standings && standings.length > 0) {
    checkPage(standings.length * 10 + 34)
    y = drawStandingsSection(doc, h, accent, standings, y, teamName)
    y += 4
  }

  // RESULTS
  if (played.length > 0) {
    checkPage(24)
    y = drawSectionTitle(doc, h, accent, 'RESULTS', y)

    const C = { rnd: MARGIN + 5, date: MARGIN + 18, opp: MARGIN + 50, score: MARGIN + 128, venue: MARGIN + 150 }
    setFont('bold', 6.8); setColor(INK_FAINT)
    text('RND', C.rnd, y, { align: 'center' }); text('DATE', C.date, y); text('OPPONENT', C.opp, y)
    text('SCORE', C.score, y, { align: 'center' }); text('VENUE', C.venue, y)
    hline(MARGIN, y + 2, MARGIN + COL, y + 2, 0.3)
    y += 8

    played.forEach(f => {
      checkPage(14)
      const isHome  = f.home_team === teamName
      const opp     = isHome ? f.away_team : f.home_team
      const myG     = isHome ? f.home_goals : f.away_goals
      const oppG    = isHome ? f.away_goals : f.home_goals
      const outcome = myG > oppG ? 'W' : myG < oppG ? 'L' : 'D'
      const outFill = outcome === 'W' ? WIN : outcome === 'L' ? LOSS : DRAW
      const venue   = venues.find(v => v.id === f.venue_id)

      const fScorers = scorers.filter(s => s.fixture_id === f.id && s.team_name === teamName && !s.own_goal && s.player_name)
      const rowH = fScorers.length > 0 ? 15 : 10

      rect(MARGIN, COL, y - 5.5, rowH, PANEL, 1)
      rect(C.rnd - 3.4, 6.8, y - 4.3, 6.8, outFill, 3.4)
      setFont('bold', 7.5); setColor(WHITE)
      text(outcome, C.rnd, y - 0.2, { align: 'center' })

      setFont('normal', 7); setColor(INK_FAINT); text(`R${f.round}`, C.rnd, y + 4.4, { align: 'center' })
      setFont('normal', 8.5); setColor(INK); text(fmtDate(f.match_date), C.date, y - 0.1)
      text(truncate(opp, 26), C.opp, y - 0.1)
      setFont('bold', 9.5); setColor(INK)
      text(`${myG} – ${oppG}`, C.score, y - 0.1, { align: 'center' })
      setFont('normal', 7.5); setColor(INK_SOFT)
      text(truncate(venue ? venue.name : '—', 20), C.venue, y - 0.1)

      if (fScorers.length > 0) {
        setFont('normal', 6.8); setColor(INK_FAINT)
        text(fScorers.map(s => `${s.player_name}${s.goals > 1 ? ` (${s.goals})` : ''}`).join('   ·   '), C.opp, y + 5)
      }

      y += rowH
      hline(MARGIN, y - 0.7, MARGIN + COL, y - 0.7, 0.15)
    })
    y += 4
  }

  // UPCOMING
  if (upcoming.length > 0) {
    checkPage(24)
    y = drawSectionTitle(doc, h, accent, 'UPCOMING FIXTURES', y)

    const C = { rnd: MARGIN + 5, date: MARGIN + 18, time: MARGIN + 56, opp: MARGIN + 78, venue: MARGIN + 142 }
    setFont('bold', 6.8); setColor(INK_FAINT)
    text('RND', C.rnd, y, { align: 'center' }); text('DATE', C.date, y); text('TIME', C.time, y)
    text('OPPONENT', C.opp, y); text('VENUE', C.venue, y)
    hline(MARGIN, y + 2, MARGIN + COL, y + 2, 0.3)
    y += 8

    upcoming.forEach(f => {
      checkPage(11)
      const isHome = f.home_team === teamName
      const opp    = isHome ? f.away_team : f.home_team
      const venue  = venues.find(v => v.id === f.venue_id)

      rect(MARGIN, COL, y - 5.5, 10, PANEL, 1)
      rect(C.rnd - 3.4, 6.8, y - 4.3, 6.8, isHome ? accent : PANEL_DARK, 3.4)
      setFont('bold', 7); setColor(isHome ? WHITE : INK_SOFT)
      text(isHome ? 'H' : 'A', C.rnd, y - 0.2, { align: 'center' })

      setFont('normal', 7); setColor(INK_FAINT); text(`R${f.round}`, C.rnd, y + 4.4, { align: 'center' })
      setFont('normal', 8.5); setColor(INK); text(fmtDate(f.match_date), C.date, y - 0.1)
      setColor(f.match_time ? INK : INK_FAINT); text(fmtTime(f.match_time), C.time, y - 0.1)
      setColor(INK); text(truncate(opp, 26), C.opp, y - 0.1)
      setFont('normal', 7.5); setColor(INK_SOFT); text(truncate(venue ? venue.name : '—', 22), C.venue, y - 0.1)

      y += 10
      hline(MARGIN, y - 0.7, MARGIN + COL, y - 0.7, 0.15)
    })
  }

  drawFooters(doc, h)
  const safe = teamName.replace(/[^a-z0-9]/gi, '_')
  doc.save(`${safe}_${(leagueName || 'league').replace(/[^a-z0-9]/gi, '_')}_report.pdf`)
}
// ═══════════════════════════════════════════════════════════════
//  2.  STANDINGS PDF
// ═══════════════════════════════════════════════════════════════
export async function generateStandingsPDF({ leagueName, leagueColor, standings }) {
  const jsPDF  = await loadJsPDF()
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const accent = hexToRgb(leagueColor)
  const h      = makeHelpers(doc)

  drawCover(doc, h, accent, 'League Standings', `${leagueName || 'League'} — Full Table`)
  let y = 60

  if (standings.length === 0) {
    h.setFont('normal', 10); h.setColor(INK_SOFT)
    h.text('No standings data available yet.', MARGIN, y + 10)
  } else {
    y = drawStandingsSection(doc, h, accent, standings, y, null)
  }

  drawFooters(doc, h)
  doc.save(`standings_${(leagueName || 'league').replace(/[^a-z0-9]/gi, '_')}.pdf`)
}

// ═══════════════════════════════════════════════════════════════
//  3.  LEADERBOARD PDF
// ═══════════════════════════════════════════════════════════════
export async function generateLeaderboardPDF({ leagueName, leagueColor, topScorers }) {
  const jsPDF  = await loadJsPDF()
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const accent = hexToRgb(leagueColor)
  const h      = makeHelpers(doc)

  drawCover(doc, h, accent, 'Top Goal Scorers', `${leagueName || 'League'} — Golden Boot`)
  let y = 60

  if (topScorers.length === 0) {
    h.setFont('normal', 10); h.setColor(INK_SOFT)
    h.text('No scorer data available yet.', MARGIN, y + 10)
  } else {
    y = drawLeaderboardSection(doc, h, accent, topScorers, y)
  }

  drawFooters(doc, h)
  doc.save(`leaderboard_${(leagueName || 'league').replace(/[^a-z0-9]/gi, '_')}.pdf`)
}
