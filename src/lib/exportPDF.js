// ─────────────────────────────────────────────────────────────
//  exportPDF.js  –  all PDF exports for Hockey Fixtures Manager
//  Exports:
//    generateTeamPDF({ teamName, cls, fixtures, scorers, venues, standings })
//    generateStandingsPDF({ cls, standings })
//    generateLeaderboardPDF({ cls, topScorers })
// ─────────────────────────────────────────────────────────────

const PITCH  = [26,  60,  42]
const PITCHL = [42,  92,  64]
const PITCHM = [35,  70,  50]
const LIME   = [126, 203, 53]
const SKY    = [58,  143, 204]
const WHITE  = [255, 255, 255]
const MUTED  = [140, 160, 145]
const DANGER = [192, 57,  43]
const GOLD   = [212, 175, 55]
const SILVER = [192, 192, 192]
const BRONZE = [205, 127, 50]

const W_PAGE = 210
const MARGIN = 14
const COL    = W_PAGE - MARGIN * 2

function fmtDate(d) {
  if (!d) return '—'
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}
function fmtTime(t) { return t ? t.slice(0, 5) : '—' }
function clsLabel(cls) { return cls === 'first' ? '1st Class' : '2nd Class' }
function accentOf(cls) { return cls === 'first' ? LIME : SKY }

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
function makeHelpers(doc, accent) {
  const setFont  = (style = 'normal', size = 10) => { doc.setFont('helvetica', style); doc.setFontSize(size) }
  const setColor = (...rgb) => doc.setTextColor(...(rgb.length === 1 ? rgb[0] : rgb))
  const setFill  = (...rgb) => doc.setFillColor(...(rgb.length === 1 ? rgb[0] : rgb))
  const setDraw  = (...rgb) => doc.setDrawColor(...(rgb.length === 1 ? rgb[0] : rgb))
  const text     = (str, x, y, opts = {}) => doc.text(String(str), x, y, opts)
  const rect     = (x, w, y, h, rgb, rnd = 0) => { setFill(rgb); doc.roundedRect(x, y, w, h, rnd, rnd, 'F') }
  const line     = (x1, y1, x2, y2, w = 0.2) => { doc.setLineWidth(w); doc.line(x1, y1, x2, y2) }
  return { setFont, setColor, setFill, setDraw, text, rect, line }
}

// ── Shared cover header ───────────────────────────────────────
function drawCover(doc, h, accent, title, subtitle, cls) {
  const { rect, setFont, setColor, text } = h
  rect(0, W_PAGE, 0, 52, PITCH)
  rect(0, W_PAGE, 0, 5, accent)
  setFont('bold', 8); setColor(accent)
  text('SCHOOL HOCKEY', MARGIN, 14)
  setFont('bold', 26); setColor(WHITE)
  // truncate long titles
  const displayTitle = title.length > 28 ? title.slice(0, 27) + '…' : title
  text(displayTitle.toUpperCase(), MARGIN, 31)
  rect(MARGIN, 30, 35, 8, accent, 2)
  setFont('bold', 8); setColor(cls === 'first' ? PITCH : WHITE)
  text(clsLabel(cls).toUpperCase(), MARGIN + 15, 40.5, { align: 'center' })
  setFont('normal', 7.5); setColor(MUTED)
  text(`Generated ${new Date().toLocaleDateString('en-GB', { day:'2-digit', month:'long', year:'numeric' })}`, W_PAGE - MARGIN, 40.5, { align: 'right' })
  if (subtitle) {
    setFont('normal', 8); setColor(MUTED)
    text(subtitle, MARGIN, 47)
  }
}

// ── Shared page continuation header ──────────────────────────
function makePageHeader(doc, h, accent, label) {
  return () => {
    const { rect, setFont, setColor, text } = h
    rect(0, W_PAGE, 0, 4, accent)
    setFont('bold', 7); setColor(MUTED)
    text(label, W_PAGE - MARGIN, 10, { align: 'right' })
  }
}

// ── Shared footer ─────────────────────────────────────────────
function drawFooters(doc, h, accent) {
  const { rect, setFont, setColor, text } = h
  const total = doc.internal.getNumberOfPages()
  for (let i = 1; i <= total; i++) {
    doc.setPage(i)
    rect(0, W_PAGE, 288, 9, PITCH)
    rect(0, W_PAGE, 288, 1, accent)
    setFont('normal', 7); setColor(MUTED)
    text('School Hockey Fixtures Manager', MARGIN, 294)
    text(`Page ${i} of ${total}`, W_PAGE - MARGIN, 294, { align: 'right' })
  }
}

// ── Standings table section (shared by team PDF + standings PDF) ──
function drawStandingsSection(doc, h, accent, standings, y, teamHighlight) {
  const { setFont, setColor, rect, text, line } = h
  let cy = y

  setFont('bold', 9); setColor(accent)
  text('LEAGUE STANDINGS', MARGIN, cy)
  doc.setLineWidth(0.3); setColor(accent)
  doc.line(MARGIN, cy + 1, MARGIN + COL, cy + 1)
  cy += 7

  // Header row
  const C = {
    pos:  MARGIN + 5,
    team: MARGIN + 18,
    P:    MARGIN + 82,
    W:    MARGIN + 95,
    D:    MARGIN + 108,
    L:    MARGIN + 121,
    GF:   MARGIN + 134,
    GA:   MARGIN + 147,
    GD:   MARGIN + 160,
    Pts:  MARGIN + 174,
    form: MARGIN + 185,
  }
  setFont('bold', 7); setColor(MUTED)
  text('#',    C.pos,  cy, { align: 'center' })
  text('TEAM', C.team, cy)
  ;['P','W','D','L','GF','GA','GD','PTS'].forEach((lbl, i) => {
    text(lbl, C.P + i * 13, cy, { align: 'center' })
  })
  text('FORM', C.form, cy)
  doc.setLineWidth(0.2)
  doc.line(MARGIN, cy + 1.5, MARGIN + COL, cy + 1.5)
  cy += 6

  standings.forEach((row, idx) => {
    const ROW_H = 9
    const isHighlight = teamHighlight && row.name === teamHighlight
    const posRgb = idx === 0 ? GOLD : idx === 1 ? SILVER : idx === 2 ? BRONZE : WHITE
    const gdRgb  = row.GD > 0 ? LIME : row.GD < 0 ? DANGER : MUTED
    const gdStr  = row.GD > 0 ? `+${row.GD}` : String(row.GD)

    // Row background
    rect(MARGIN, COL, cy - 4.5, ROW_H, isHighlight ? [50, 100, 60] : PITCHM, 1)
    if (isHighlight) {
      doc.setDrawColor(...accent)
      doc.setLineWidth(0.5)
      doc.roundedRect(MARGIN, cy - 4.5, COL, ROW_H, 1, 1, 'S')
    }

    // Position
    setFont('bold', 8); setColor(posRgb)
    text(String(idx + 1), C.pos, cy + 0.5, { align: 'center' })

    // Team name (truncate)
    setFont(isHighlight ? 'bold' : 'normal', 8)
    setColor(isHighlight ? accent : WHITE)
    const displayName = row.name.length > 20 ? row.name.slice(0, 19) + '…' : row.name
    text(displayName, C.team, cy + 0.5)

    // Stats
    setFont('normal', 8); setColor(MUTED)
    text(row.P, C.P,   cy + 0.5, { align: 'center' })
    setColor(LIME);   text(row.W, C.W,  cy + 0.5, { align: 'center' })
    setColor(MUTED);  text(row.D, C.D,  cy + 0.5, { align: 'center' })
    setColor(DANGER); text(row.L, C.L,  cy + 0.5, { align: 'center' })
    setColor(WHITE);  text(row.GF, C.GF, cy + 0.5, { align: 'center' })
    setColor(WHITE);  text(row.GA, C.GA, cy + 0.5, { align: 'center' })
    setColor(gdRgb);  setFont('bold', 8); text(gdStr, C.GD, cy + 0.5, { align: 'center' })

    // Points
    setFont('bold', 9); setColor(accent)
    text(row.Pts, C.Pts, cy + 0.5, { align: 'center' })

    // Form pills (last 5)
    const form = (row.form || []).slice(-5)
    form.forEach((r, fi) => {
      const fc = r === 'W' ? LIME : r === 'L' ? DANGER : MUTED
      rect(C.form + fi * 10, 8, cy - 3.5, 7, fc, 1)
      setFont('bold', 6.5)
      setColor(r === 'W' ? PITCH : WHITE)
      text(r, C.form + fi * 10 + 4, cy + 0.5, { align: 'center' })
    })

    cy += ROW_H
    doc.setLineWidth(0.1)
    doc.setDrawColor(50, 85, 62)
    doc.line(MARGIN, cy - 0.5, MARGIN + COL, cy - 0.5)
  })

  // Legend
  cy += 3
  setFont('normal', 6.5); setColor(MUTED)
  text('Win = 3 pts  ·  Draw = 1 pt  ·  Loss = 0 pts  ·  Sorted: Pts → GD → GF', MARGIN, cy)
  cy += 5

  return cy
}

// ── Leaderboard section ───────────────────────────────────────
function drawLeaderboardSection(doc, h, accent, topScorers, y) {
  const { setFont, setColor, rect, text } = h
  let cy = y
  const maxGoals = topScorers[0]?.goals || 1

  setFont('bold', 9); setColor(accent)
  text('TOP GOAL SCORERS', MARGIN, cy)
  doc.setLineWidth(0.3); doc.setDrawColor(...accent)
  doc.line(MARGIN, cy + 1, MARGIN + COL, cy + 1)
  cy += 7

  // Header
  setFont('bold', 7); setColor(MUTED)
  text('#', MARGIN + 5, cy, { align: 'center' })
  text('PLAYER', MARGIN + 18, cy)
  text('TEAM', MARGIN + 100, cy)
  text('GOALS', W_PAGE - MARGIN, cy, { align: 'right' })
  doc.setLineWidth(0.2)
  doc.line(MARGIN, cy + 1.5, MARGIN + COL, cy + 1.5)
  cy += 6

  topScorers.forEach((s, idx) => {
    const ROW_H    = 10
    const rankRgb  = idx === 0 ? GOLD : idx === 1 ? SILVER : idx === 2 ? BRONZE : MUTED
    const barW     = Math.max(2, (s.goals / maxGoals) * 70)
    const goalRgb  = idx === 0 ? GOLD : accent

    rect(MARGIN, COL, cy - 4.5, ROW_H, PITCHM, 1)

    // Rank
    setFont('bold', idx < 3 ? 10 : 8); setColor(rankRgb)
    text(String(idx + 1), MARGIN + 5, cy + 0.8, { align: 'center' })

    // Player name
    setFont(idx === 0 ? 'bold' : 'normal', 8.5); setColor(WHITE)
    const pName = s.playerName.length > 26 ? s.playerName.slice(0, 25) + '…' : s.playerName
    text(pName, MARGIN + 18, cy + 0.8)

    // Team
    setFont('normal', 7); setColor(MUTED)
    const tName = s.team.length > 18 ? s.team.slice(0, 17) + '…' : s.team
    text(tName, MARGIN + 100, cy + 0.8)

    // Bar
    rect(W_PAGE - MARGIN - 80, barW, cy - 2, 4, [...accent, 60], 1)

    // Goals
    setFont('bold', 11); setColor(goalRgb)
    text(String(s.goals), W_PAGE - MARGIN, cy + 1, { align: 'right' })

    cy += ROW_H
    doc.setLineWidth(0.1)
    doc.setDrawColor(50, 85, 62)
    doc.line(MARGIN, cy - 0.5, MARGIN + COL, cy - 0.5)
  })

  return cy + 4
}

// ═══════════════════════════════════════════════════════════════
//  1.  TEAM PDF  (fixtures + standings + results)
// ═══════════════════════════════════════════════════════════════
export async function generateTeamPDF({ teamName, cls, fixtures, scorers, venues, standings }) {
  const jsPDF  = await loadJsPDF()
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const accent = accentOf(cls)
  const h      = makeHelpers(doc, accent)
  const { setFont, setColor, rect, text, line } = h

  const teamFixtures = fixtures
    .filter(f => f.home_team === teamName || f.away_team === teamName)
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

  const drawPageHeader = makePageHeader(doc, h, accent, `${teamName}  ·  ${clsLabel(cls)}`)
  let y = 0

  const checkPage = (needed = 20) => {
    if (y + needed > 275) { doc.addPage(); y = 16; drawPageHeader() }
  }

  // Cover
  drawCover(doc, h, accent, teamName, `${clsLabel(cls)} Season Report`, cls)
  y = 58

  // Stats row
  if (played.length > 0) {
    const GD = GF - GA
    const stats = [
      ['P',  played.length, WHITE],
      ['W',  W,    LIME],
      ['D',  D,    MUTED],
      ['L',  L,    DANGER],
      ['GF', GF,   WHITE],
      ['GA', GA,   WHITE],
      ['GD', GD,   GD >= 0 ? LIME : DANGER, GD > 0 ? `+${GD}` : GD],
      ['Pts',W*3+D, accent],
    ]
    const boxW = COL / stats.length
    stats.forEach(([lbl, val, rgb, display], i) => {
      const bx = MARGIN + i * boxW
      rect(bx, boxW - 1, y, 22, PITCHL, 2)
      setFont('bold', 14); setColor(rgb)
      text(display !== undefined ? display : val, bx + (boxW-1)/2, y + 12, { align: 'center' })
      setFont('normal', 6.5); setColor(MUTED)
      text(lbl, bx + (boxW-1)/2, y + 18, { align: 'center' })
    })
    y += 28
  }

  // ── LEAGUE STANDING ─────────────────────────────────────────
  if (standings && standings.length > 0) {
    checkPage(standings.length * 9 + 30)
    y = drawStandingsSection(doc, h, accent, standings, y, teamName)
    y += 6
  }

  // ── RESULTS ─────────────────────────────────────────────────
  if (played.length > 0) {
    checkPage(20)
    setFont('bold', 9); setColor(accent)
    text('RESULTS', MARGIN, y)
    doc.setLineWidth(0.3); doc.setDrawColor(...accent)
    doc.line(MARGIN, y + 1, MARGIN + COL, y + 1)
    y += 7

    const C = { rnd: MARGIN+4, date: MARGIN+18, opp: MARGIN+50, score: MARGIN+120, venue: MARGIN+140 }
    setFont('bold', 7); setColor(MUTED)
    text('RND', C.rnd, y); text('DATE', C.date, y); text('OPPONENT', C.opp, y)
    text('SCORE', C.score, y); text('VENUE', C.venue, y)
    doc.setLineWidth(0.2); doc.line(MARGIN, y+1.5, MARGIN+COL, y+1.5)
    y += 6

    played.forEach(f => {
      checkPage(10)
      const isHome  = f.home_team === teamName
      const opp     = isHome ? f.away_team : f.home_team
      const myG     = isHome ? f.home_goals : f.away_goals
      const oppG    = isHome ? f.away_goals : f.home_goals
      const outcome = myG > oppG ? 'W' : myG < oppG ? 'L' : 'D'
      const outRgb  = outcome === 'W' ? LIME : outcome === 'L' ? DANGER : MUTED
      const venue   = venues.find(v => v.id === f.venue_id)

      rect(MARGIN, COL, y-4.5, 9, PITCHM, 1)
      rect(MARGIN, 8, y-3.5, 7, outRgb, 1)
      setFont('bold', 8); setColor(outcome === 'W' ? PITCH : WHITE)
      text(outcome, MARGIN+4, y+0.5, { align: 'center' })

      setFont('normal', 7.5); setColor(MUTED); text(`R${f.round}`, C.rnd+1, y+0.5)
      setFont('normal', 8);   setColor(WHITE);  text(fmtDate(f.match_date), C.date, y+0.5)
      text(opp.length > 22 ? opp.slice(0,21)+'…' : opp, C.opp, y+0.5)
      setFont('bold', 9); setColor(outRgb)
      text(`${myG} – ${oppG}`, C.score+10, y+0.5, { align: 'center' })
      setFont('normal', 7); setColor(MUTED)
      text(venue ? venue.name : '—', C.venue, y+0.5)

      const fScorers = scorers.filter(s => s.fixture_id === f.id && s.team_name === teamName && !s.own_goal && s.player_name)
      if (fScorers.length > 0) {
        y += 9; checkPage(6)
        setFont('normal', 6.5); setColor(MUTED)
        text('   ' + fScorers.map(s => `${s.player_name}${s.goals > 1 ? ` (${s.goals})` : ''}`).join('  ·  '), C.opp, y+0.5)
        y += 6
      } else { y += 9 }

      doc.setLineWidth(0.1); doc.setDrawColor(50,85,62)
      doc.line(MARGIN, y-0.5, MARGIN+COL, y-0.5)
    })
    y += 4
  }

  // ── UPCOMING ─────────────────────────────────────────────────
  if (upcoming.length > 0) {
    checkPage(20)
    setFont('bold', 9); setColor(accent)
    text('UPCOMING FIXTURES', MARGIN, y)
    doc.setLineWidth(0.3); doc.setDrawColor(...accent)
    doc.line(MARGIN, y+1, MARGIN+COL, y+1)
    y += 7

    const C = { rnd: MARGIN+4, date: MARGIN+18, time: MARGIN+56, opp: MARGIN+78, venue: MARGIN+140 }
    setFont('bold', 7); setColor(MUTED)
    text('RND', C.rnd, y); text('DATE', C.date, y); text('TIME', C.time, y)
    text('OPPONENT', C.opp, y); text('VENUE', C.venue, y)
    doc.setLineWidth(0.2); doc.line(MARGIN, y+1.5, MARGIN+COL, y+1.5)
    y += 6

    upcoming.forEach(f => {
      checkPage(10)
      const isHome = f.home_team === teamName
      const opp    = isHome ? f.away_team : f.home_team
      const venue  = venues.find(v => v.id === f.venue_id)
      const haRgb  = isHome ? accent : [80,100,90]

      rect(MARGIN, COL, y-4.5, 9, PITCHM, 1)
      rect(MARGIN, 8, y-3.5, 7, haRgb, 1)
      setFont('bold', 7); setColor(isHome ? (cls === 'first' ? PITCH : WHITE) : WHITE)
      text(isHome ? 'H' : 'A', MARGIN+4, y+0.5, { align: 'center' })

      setFont('normal', 7.5); setColor(MUTED);  text(`R${f.round}`, C.rnd+1, y+0.5)
      setFont('normal', 8);   setColor(WHITE);   text(fmtDate(f.match_date), C.date, y+0.5)
      setColor(f.match_time ? WHITE : MUTED);    text(fmtTime(f.match_time), C.time, y+0.5)
      setColor(WHITE); text(opp.length > 22 ? opp.slice(0,21)+'…' : opp, C.opp, y+0.5)
      setFont('normal', 7); setColor(MUTED); text(venue ? venue.name : '—', C.venue, y+0.5)

      y += 9
      doc.setLineWidth(0.1); doc.setDrawColor(50,85,62)
      doc.line(MARGIN, y-0.5, MARGIN+COL, y-0.5)
    })
  }

  drawFooters(doc, h, accent)
  const safe = teamName.replace(/[^a-z0-9]/gi, '_')
  doc.save(`${safe}_${cls}_report.pdf`)
}

// ═══════════════════════════════════════════════════════════════
//  2.  STANDINGS PDF
// ═══════════════════════════════════════════════════════════════
export async function generateStandingsPDF({ cls, standings }) {
  const jsPDF  = await loadJsPDF()
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const accent = accentOf(cls)
  const h      = makeHelpers(doc, accent)

  drawCover(doc, h, accent, 'League Standings', `${clsLabel(cls)} — Full Table`, cls)
  let y = 58

  if (standings.length === 0) {
    h.setFont('normal', 10); h.setColor(MUTED)
    h.text('No standings data available yet.', MARGIN, y + 10)
  } else {
    y = drawStandingsSection(doc, h, accent, standings, y, null)
  }

  drawFooters(doc, h, accent)
  doc.save(`standings_${cls}_class.pdf`)
}

// ═══════════════════════════════════════════════════════════════
//  3.  LEADERBOARD PDF
// ═══════════════════════════════════════════════════════════════
export async function generateLeaderboardPDF({ cls, topScorers }) {
  const jsPDF  = await loadJsPDF()
  const doc    = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const accent = accentOf(cls)
  const h      = makeHelpers(doc, accent)

  drawCover(doc, h, accent, 'Top Goal Scorers', `${clsLabel(cls)} — Golden Boot`, cls)
  let y = 58

  if (topScorers.length === 0) {
    h.setFont('normal', 10); h.setColor(MUTED)
    h.text('No scorer data available yet.', MARGIN, y + 10)
  } else {
    y = drawLeaderboardSection(doc, h, accent, topScorers, y)
  }

  drawFooters(doc, h, accent)
  doc.save(`leaderboard_${cls}_class.pdf`)
}
