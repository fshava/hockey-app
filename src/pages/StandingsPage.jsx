                <th className="hide-mobile">D</th>
                <th className="hide-mobile">L</th>
                <th className="hide-mobile">GF</th>
                <th className="hide-mobile">GA</th>
                <th>GD</th>
                <th style={{ color: accent }}>Pts</th>
                <th className="hide-mobile">Form</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((row, idx) => {
                const pos = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : G.white
                return (
                  <tr key={row.name} style={{ background: idx === 0 ? 'rgba(255,215,0,0.04)' : undefined }}>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.1rem', color: pos, width: 36 }}>
                      {idx < 3 ? ['🥇','🥈','🥉'][idx] : idx + 1}
                    </td>
                    <td className="left">{row.name}</td>
                    <td style={{ color: G.muted }}>{row.P}</td>
                    <td style={{ color: G.lime }}>{row.W}</td>
                    <td className="hide-mobile" style={{ color: G.muted }}>{row.D}</td>
                    <td className="hide-mobile" style={{ color: G.danger }}>{row.L}</td>
                    <td className="hide-mobile">{row.GF}</td>
                    <td className="hide-mobile">{row.GA}</td>
                    <td style={{ color: row.GD > 0 ? G.lime : row.GD < 0 ? G.danger : G.muted, fontWeight: 700 }}>
                      {row.GD > 0 ? '+' : ''}{row.GD}
                    </td>
                    <td style={{ fontFamily: "'Barlow Condensed'", fontWeight: 800, fontSize: '1.1rem', color: accent }}>{row.Pts}</td>
                    <td className="hide-mobile">
                      <div style={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                        {row.form.slice(-5).length === 0
                          ? <span style={{ color: G.muted, fontSize: '0.72rem' }}>—</span>
                          : row.form.slice(-5).map((r, i) => <span key={i} className={`form-pill form-${r}`}>{r}</span>)}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div style={{ marginTop: 10, fontSize: '0.75rem', color: G.muted, display: 'flex', gap: 16, flexWrap: 'wrap' }}>
        <span>Win = 3 pts</span><span>Draw = 1 pt</span><span>Loss = 0 pts</span><span>Sorted: Pts → GD → GF</span>
      </div>
    </div>
  )
}
