import { useEffect, useState } from 'react'
import { getDeals } from '../lib/api'
import DealTable from '../components/DealTable'

export default function Deals() {
  const [deals, setDeals]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [error, setError]           = useState(null)
  const [riskFilter, setRiskFilter] = useState('')

  useEffect(() => {
    const filters = {}
    if (riskFilter) filters.risk_level = riskFilter
    getDeals(filters)
      .then(data => setDeals(data.deals || []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [riskFilter])

  return (
    <div className="fade-in">
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        marginBottom: 24,
        flexWrap: 'wrap',
        gap: 12,
      }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f2f8', letterSpacing: '-0.02em', marginBottom: 4 }}>
            Deals
          </h1>
          <p style={{ fontSize: 13, color: '#8b90a7' }}>All open deals with AI risk scoring</p>
        </div>

        <select
          value={riskFilter}
          onChange={e => { setLoading(true); setRiskFilter(e.target.value) }}
          style={{
            padding: '8px 14px',
            borderRadius: 8,
            border: '1px solid rgba(255,255,255,0.1)',
            fontSize: 13,
            color: '#f0f2f8',
            background: '#1e2130',
            outline: 'none',
          }}
        >
          <option value="">All risk levels</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
      </div>

      {loading && (
        <div style={{ color: '#8b90a7', fontSize: 13, padding: '40px 0', textAlign: 'center' }}>
          Loading deals...
        </div>
      )}
      {error && (
        <div style={{
          background: 'rgba(240,82,79,0.1)',
          border: '1px solid rgba(240,82,79,0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          color: '#f0524f',
          fontSize: 13,
        }}>
          Error: {error}
        </div>
      )}

      {!loading && !error && deals.length > 0 && (
        <>
          <div style={{
            display: 'flex',
            gap: 8,
            marginBottom: 16,
            flexWrap: 'wrap',
            alignItems: 'center',
          }}>
            {['critical','high','medium','low'].map(level => {
              const count = deals.filter(d =>
                (d.deal_insights?.[0]?.risk_level || d.risk_level) === level
              ).length
              if (count === 0) return null
              const colors = {
                critical: { bg: 'rgba(240,82,79,0.15)',  text: '#f0524f' },
                high:     { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b' },
                medium:   { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24' },
                low:      { bg: 'rgba(34,201,122,0.12)', text: '#22c97a' },
              }
              return (
                <div key={level} style={{
                  background: colors[level].bg,
                  color: colors[level].text,
                  padding: '4px 12px',
                  borderRadius: 999,
                  fontSize: 11,
                  fontWeight: 700,
                  textTransform: 'capitalize',
                  letterSpacing: '0.03em',
                }}>
                  {count} {level}
                </div>
              )
            })}
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#555b75' }}>
              {deals.length} total
            </div>
          </div>
          <DealTable deals={deals} />
        </>
      )}

      {!loading && !error && deals.length === 0 && (
        <div style={{
          background: '#1e2130',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: 56,
          textAlign: 'center',
        }}>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f2f8', marginBottom: 8 }}>
            No deals found
          </p>
          <p style={{ fontSize: 13, color: '#8b90a7' }}>
            Try a different filter.
          </p>
        </div>
      )}
    </div>
  )
}