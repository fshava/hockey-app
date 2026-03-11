export const G = {
  pitch: '#1a3c2a',
  pitchLight: '#2a5c40',
  pitchMid: '#22503a',
  lime: '#7ecb35',
  limeLight: '#a0e060',
  cream: '#f5f0e8',
  sand: '#e8dfc8',
  white: '#ffffff',
  charcoal: '#1c1c1c',
  muted: '#6b7b6e',
  warn: '#e07b2a',
  danger: '#c0392b',
  sky: '#3a8fcc',
}

export const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=Barlow:wght@400;500;600&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${G.pitch}; font-family: 'Barlow', sans-serif; color: ${G.charcoal}; min-height: 100vh; }

  .pitch-bg {
    background-color: ${G.pitch};
    background-image:
      repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px),
      repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(255,255,255,0.03) 39px, rgba(255,255,255,0.03) 40px);
    min-height: 100vh;
  }

  .page { padding: 28px 24px; max-width: 1200px; margin: 0 auto; }

  .section-title {
    font-family: 'Barlow Condensed', sans-serif;
    font-weight: 800; font-size: 1.6rem; color: ${G.white};
    text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px;
  }
  .section-sub {
    color: ${G.lime}; font-size: 0.8rem; font-weight: 600;
    letter-spacing: 0.12em; text-transform: uppercase; margin-bottom: 20px;
  }

  .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
  .grid3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 16px; }

  label {
    display: block; font-size: 0.78rem; font-weight: 600;
    text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; color: ${G.muted};
  }
  input, select {
    width: 100%; padding: 9px 12px; border-radius: 5px;
    border: 1.5px solid ${G.sand}; background: ${G.white};
    font-family: 'Barlow', sans-serif; font-size: 0.95rem; color: ${G.charcoal};
    transition: border-color 0.2s;
  }
  input:focus, select:focus { outline: none; border-color: ${G.lime}; }

  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 5px; border: none; cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif; font-size: 0.9rem;
    font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    transition: all 0.18s;
  }
  .btn-primary { background: ${G.lime}; color: ${G.pitch}; }
  .btn-primary:hover { background: ${G.limeLight}; transform: translateY(-1px); }
  .btn-danger { background: ${G.danger}; color: white; }
  .btn-danger:hover { opacity: 0.85; }
  .btn-ghost { background: rgba(255,255,255,0.1); color: ${G.white}; border: 1px solid rgba(255,255,255,0.2); }
  .btn-ghost:hover { background: rgba(255,255,255,0.18); }
  .btn-sky { background: ${G.sky}; color: white; }
  .btn-sky:hover { opacity: 0.88; }
  .btn-sm { padding: 5px 12px; font-size: 0.78rem; }

  .card {
    background: ${G.cream}; border-radius: 8px; padding: 20px; margin-bottom: 16px;
    box-shadow: 0 4px 16px rgba(0,0,0,0.3); border-top: 4px solid ${G.lime};
  }

  .alert { border-radius: 6px; padding: 10px 14px; font-size: 0.88rem; font-weight: 500; margin-bottom: 12px; }
  .alert-warn { background: rgba(224,123,42,0.15); color: ${G.warn}; border: 1px solid rgba(224,123,42,0.3); }
  .alert-ok { background: rgba(126,203,53,0.12); color: ${G.lime}; border: 1px solid rgba(126,203,53,0.3); }
  .alert-info { background: rgba(58,143,204,0.15); color: ${G.sky}; border: 1px solid rgba(58,143,204,0.3); }
  .alert-danger { background: rgba(192,57,43,0.15); color: ${G.danger}; border: 1px solid rgba(192,57,43,0.3); }

  .stat-box {
    background: ${G.pitchLight}; border-radius: 8px; padding: 16px 20px;
    text-align: center; border-top: 3px solid ${G.lime};
  }
  .stat-num { font-family: 'Barlow Condensed', sans-serif; font-weight: 800; font-size: 2.4rem; color: ${G.lime}; }
  .stat-lbl { font-size: 0.75rem; font-weight: 600; color: rgba(255,255,255,0.55); text-transform: uppercase; letter-spacing: 0.1em; }

  .venue-badge {
    display: inline-block; padding: 3px 9px; border-radius: 12px;
    font-size: 0.74rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase;
    background: ${G.pitchLight}; color: ${G.lime};
  }

  .class-tab {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 6px 16px; border-radius: 20px; cursor: pointer;
    font-family: 'Barlow Condensed', sans-serif; font-weight: 700;
    font-size: 0.9rem; letter-spacing: 0.06em; text-transform: uppercase;
    border: 2px solid transparent; transition: all 0.18s;
  }
  .class-tab.first { border-color: ${G.lime}; color: ${G.lime}; }
  .class-tab.first.sel { background: ${G.lime}; color: ${G.pitch}; }
  .class-tab.second { border-color: ${G.sky}; color: ${G.sky}; }
  .class-tab.second.sel { background: ${G.sky}; color: white; }

  .scroll-table { overflow-x: auto; }
  table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  th {
    background: ${G.pitchLight}; color: ${G.lime}; padding: 8px 12px; text-align: left;
    font-family: 'Barlow Condensed', sans-serif; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase;
  }
  td { padding: 8px 12px; border-bottom: 1px solid ${G.sand}; }
  tr:last-child td { border-bottom: none; }

  /* League table */
  .league-table { width: 100%; border-collapse: collapse; font-size: 0.88rem; }
  .league-table th {
    background: ${G.pitchLight}; padding: 9px 12px; text-align: center;
    font-family: 'Barlow Condensed', sans-serif; font-size: 0.78rem;
    letter-spacing: 0.1em; text-transform: uppercase;
  }
  .league-table th.left { text-align: left; }
  .league-table td { padding: 9px 12px; border-bottom: 1px solid rgba(255,255,255,0.07); text-align: center; color: ${G.white}; }
  .league-table td.left { text-align: left; font-weight: 700; }
  .league-table tr:last-child td { border-bottom: none; }
  .league-table tr:hover td { background: rgba(255,255,255,0.04); }

  .form-pill {
    display: inline-flex; align-items: center; justify-content: center;
    width: 20px; height: 20px; border-radius: 3px; font-size: 0.7rem; font-weight: 800; margin: 0 1px;
  }
  .form-W { background: ${G.lime}; color: ${G.pitch}; }
  .form-D { background: ${G.muted}; color: white; }
  .form-L { background: ${G.danger}; color: white; }

  .spinner {
    width: 32px; height: 32px; border: 3px solid rgba(126,203,53,0.2);
    border-top-color: ${G.lime}; border-radius: 50%;
    animation: spin 0.7s linear infinite; margin: 60px auto;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  .scorer-bar-wrap { display: flex; align-items: center; gap: 8px; }
  .scorer-bar-bg { flex: 1; height: 6px; background: rgba(255,255,255,0.1); border-radius: 3px; overflow: hidden; }
  .scorer-bar-fill { height: 100%; border-radius: 3px; transition: width 0.4s; }

  /* ── Mobile responsive ─────────────────────────────── */
  @media (max-width: 768px) {
    .app-header { padding: 10px 14px; gap: 10px; }
    .app-header h1 { font-size: 1.3rem; }
    .app-header .sub { font-size: 0.68rem; }
    .user-pill { font-size: 0.72rem; padding: 4px 10px; max-width: 140px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .nav-bar { padding: 0 10px; gap: 0; }
    .nav-link { font-size: 0.78rem; padding: 9px 10px; letter-spacing: 0.04em; }
    .nav-label { display: none; }
    .nav-sep { display: none; }

    .page { padding: 16px 12px; }
    .section-title { font-size: 1.3rem; }

    .grid2 { grid-template-columns: 1fr; }
    .grid3 { grid-template-columns: 1fr 1fr; gap: 10px; }

    .stat-num { font-size: 1.8rem; }
    .stat-box { padding: 12px 10px; }

    .class-tab { font-size: 0.78rem; padding: 5px 11px; }

    /* League table – hide less important cols, allow scroll */
    .league-table-wrap { overflow-x: auto; -webkit-overflow-scrolling: touch; border-radius: 8px; }
    .league-table th, .league-table td { padding: 8px 7px; font-size: 0.78rem; }
    .league-table .hide-mobile { display: none; }

    /* Leaderboard */
    .leaderboard-row { grid-template-columns: 36px 1fr 60px !important; }
    .leaderboard-bar { display: none !important; }

    /* Fixture rows */
    .fixture-row-admin { grid-template-columns: 1fr !important; gap: 6px !important; }
    .fixture-row-admin .vs-label { display: none; }

    /* Results page score row */
    .result-score-row { grid-template-columns: 1fr auto !important; }
    .result-score-inner { display: flex; gap: 6px; align-items: center; justify-content: flex-end; }

    /* PDF export bar */
    .pdf-export-bar { flex-direction: column; align-items: flex-start !important; gap: 8px !important; }
    .pdf-export-bar select { width: 100% !important; max-width: 100% !important; }

    .btn { font-size: 0.82rem; padding: 8px 14px; }
    .btn-sm { font-size: 0.74rem; padding: 5px 10px; }

    .card { padding: 14px; }
  }

  @media (max-width: 480px) {
    .grid3 { grid-template-columns: 1fr; }
    .app-header h1 { font-size: 1.1rem; }
    .nav-link { font-size: 0.72rem; padding: 8px 7px; }
    .section-title { font-size: 1.1rem; }
  }
`
