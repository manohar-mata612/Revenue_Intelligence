import { useEffect, useState } from 'react'
import { getPipelineSummary } from '../lib/api'
import PipelineChart from '../components/PipelineChart'

export default function Dashboard() {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)

  useEffect(() => {
    getPipelineSummary()
      .then(setSummary)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <LoadingSkeleton />
  if (error)   return (
    <div style={{
      background: 'rgba(240,82,79,0.1)',
      border: '1px solid rgba(240,82,79,0.3)',
      borderRadius: 10,
      padding: '14px 18px',
      color: '#f0524f',
      fontSize: 13,
    }}>
      Error: {error}
    </div>
  )

  const stages = Object.entries(summary.by_stage || {}).map(([stage, data]) => ({
    stage,
    count: data.count,
    value: data.value,
  }))

  return (
    <div className="fade-in">
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#f0f2f8',
          letterSpacing: '-0.02em',
          marginBottom: 4,
        }}>
          Pipeline Overview
        </h1>
        <p style={{ fontSize: 13, color: '#8b90a7' }}>
          Live view of your revenue pipeline — powered by AI
        </p>
      </div>

      {/* Metric cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: 16,
        marginBottom: 28,
      }}>
        <MetricCard
          label="Total open deals"
          value={summary.deal_count}
          change="+3 this week"
          color="#4f7cff"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#4f7cff" strokeWidth="2" strokeLinecap="round">
              <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
              <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
            </svg>
          }
        />
        <MetricCard
          label="Total pipeline value"
          value={`$${Number(summary.total_value).toLocaleString()}`}
          change="Weighted forecast"
          color="#22c97a"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#22c97a" strokeWidth="2" strokeLinecap="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
            </svg>
          }
        />
        <MetricCard
          label="Active stages"
          value={stages.length}
          change="In pipeline"
          color="#7c5cfc"
          icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#7c5cfc" strokeWidth="2" strokeLinecap="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
          }
        />
      </div>

      {/* Chart */}
      {stages.length > 0 ? (
        <div style={{
          background: '#1e2130',
          border: '1px solid rgba(255,255,255,0.07)',
          borderRadius: 14,
          padding: 24,
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 20,
          }}>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#f0f2f8' }}>
                Deals by stage
              </h2>
              <p style={{ fontSize: 12, color: '#8b90a7', marginTop: 2 }}>
                Open deal count per pipeline stage
              </p>
            </div>
            <span style={{
              fontSize: 11,
              background: 'rgba(79,124,255,0.15)',
              color: '#4f7cff',
              padding: '4px 10px',
              borderRadius: 999,
              fontWeight: 600,
            }}>
              LIVE
            </span>
          </div>
          <PipelineChart data={stages} />
        </div>
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

function MetricCard({ label, value, change, color, icon }) {
  return (
    <div style={{
      background: '#1e2130',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: '20px 22px',
      transition: 'border-color 0.2s ease, transform 0.2s ease',
      cursor: 'default',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'
      e.currentTarget.style.transform = 'translateY(-2px)'
    }}
    onMouseLeave={e => {
      e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'
      e.currentTarget.style.transform = 'translateY(0)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 14,
      }}>
        <span style={{ fontSize: 12, color: '#8b90a7', fontWeight: 500 }}>{label}</span>
        <div style={{
          width: 34,
          height: 34,
          borderRadius: 8,
          background: `${color}18`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          {icon}
        </div>
      </div>
      <div style={{
        fontSize: 28,
        fontWeight: 700,
        color: '#f0f2f8',
        letterSpacing: '-0.02em',
        marginBottom: 6,
      }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: color, fontWeight: 500 }}>
        {change}
      </div>
    </div>
  )
}

function LoadingSkeleton() {
  const s = { background: '#1e2130', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }
  return (
    <div>
      <div style={{ ...s, height: 24, width: 180, marginBottom: 8 }}/>
      <div style={{ ...s, height: 14, width: 240, marginBottom: 28 }}/>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        {[1,2,3].map(i => <div key={i} style={{ ...s, height: 110 }}/>)}
      </div>
      <div style={{ ...s, height: 340 }}/>
    </div>
  )
}

function EmptyState() {
  return (
    <div style={{
      background: '#1e2130',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: 14,
      padding: 56,
      textAlign: 'center',
    }}>
      <p style={{ fontSize: 15, fontWeight: 600, color: '#f0f2f8', marginBottom: 8 }}>
        No pipeline data yet
      </p>
      <p style={{ fontSize: 13, color: '#8b90a7' }}>
        Sync your CRM to get started.
      </p>
    </div>
  )
}