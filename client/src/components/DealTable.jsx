import RiskBadge from './RiskBadge'

export default function DealTable({ deals }) {
  return (
    <div style={{
      background: '#1e2130',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      overflow: 'hidden',
    }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            {['Deal','Stage','Owner','Amount','Days stale','Close date','Risk'].map(h => (
              <th key={h} style={{
                padding: '12px 16px',
                textAlign: 'left',
                fontSize: 10,
                fontWeight: 600,
                color: '#555b75',
                letterSpacing: '0.07em',
                textTransform: 'uppercase',
                background: '#181b28',
                whiteSpace: 'nowrap',
              }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {deals.map((deal, i) => (
            <tr
              key={deal.id || i}
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.03)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <td style={{ padding: '13px 16px' }}>
                <div style={{ fontWeight: 600, color: '#f0f2f8', fontSize: 13 }}>{deal.name}</div>
                {deal.company && (
                  <div style={{ fontSize: 11, color: '#555b75', marginTop: 2 }}>{deal.company}</div>
                )}
              </td>
              <td style={{ padding: '13px 16px' }}>
                <span style={{
                  background: 'rgba(255,255,255,0.07)',
                  color: '#8b90a7',
                  padding: '3px 8px',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                }}>
                  {deal.stage || '—'}
                </span>
              </td>
              <td style={{ padding: '13px 16px', color: '#8b90a7', fontSize: 13 }}>
                {deal.owner_name || '—'}
              </td>
              <td style={{ padding: '13px 16px', fontWeight: 700, color: '#22c97a', fontSize: 13 }}>
                {deal.amount ? `$${Number(deal.amount).toLocaleString()}` : '—'}
              </td>
              <td style={{ padding: '13px 16px' }}>
                <DaysStale days={deal.days_stale} />
              </td>
              <td style={{ padding: '13px 16px', color: '#8b90a7', fontSize: 12 }}>
                {deal.close_date || '—'}
              </td>
              <td style={{ padding: '13px 16px' }}>
                <RiskBadge level={deal.deal_insights?.[0]?.risk_level || deal.risk_level} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DaysStale({ days }) {
  if (days === null || days === undefined) return <span style={{ color: '#555b75' }}>—</span>
  const color  = days >= 14 ? '#f0524f' : days >= 7 ? '#f59e0b' : '#22c97a'
  const bg     = days >= 14 ? 'rgba(240,82,79,0.12)'  : days >= 7 ? 'rgba(245,158,11,0.12)'  : 'rgba(34,201,122,0.12)'
  const border = days >= 14 ? 'rgba(240,82,79,0.3)'   : days >= 7 ? 'rgba(245,158,11,0.3)'   : 'rgba(34,201,122,0.3)'
  return (
    <span style={{
      color, background: bg, border: `1px solid ${border}`,
      padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 700,
    }}>
      {days}d
    </span>
  )
}