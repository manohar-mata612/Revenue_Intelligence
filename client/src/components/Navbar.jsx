import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { getPipelineSummary } from '../lib/api'

const linkStyle = ({ isActive }) => ({
  padding: '7px 16px',
  borderRadius: 8,
  fontWeight: 500,
  fontSize: 13,
  color: isActive ? '#1d4ed8' : '#6b7280',
  background: isActive ? 'rgba(59,130,246,0.1)' : 'transparent',
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  transition: 'all 0.15s ease',
  border: isActive ? '1px solid rgba(59,130,246,0.2)' : '1px solid transparent',
})

export default function Navbar() {
  const [dealCount, setDealCount] = useState(null)

  useEffect(() => {
    getPipelineSummary()
      .then(data => setDealCount(data.deal_count))
      .catch(() => {})
  }, [])

  return (
    <nav style={{
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(229,231,235,0.8)',
      padding: '0 32px',
      display: 'flex',
      alignItems: 'center',
      gap: 4,
      height: 58,
      position: 'sticky',
      top: 0,
      zIndex: 100,
      boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginRight: 28,
      }}>
        <div style={{
          width: 28,
          height: 28,
          borderRadius: 8,
          background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(59,130,246,0.35)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M3 3v18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M7 16l4-4 4 4 4-8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <span style={{ fontWeight: 700, fontSize: 14, color: '#111827', letterSpacing: '-0.01em' }}>
          Revenue Intelligence
        </span>
      </div>

      <NavLink to="/dashboard" style={linkStyle}>Dashboard</NavLink>

      <NavLink to="/deals" style={linkStyle}>
        Deals
        {dealCount !== null && (
          <span style={{
            background: '#dbeafe',
            color: '#1d4ed8',
            fontSize: 10,
            fontWeight: 700,
            padding: '1px 6px',
            borderRadius: 999,
            lineHeight: 1.6,
          }}>
            {dealCount}
          </span>
        )}
      </NavLink>

      <NavLink to="/query" style={linkStyle}>Query</NavLink>
    </nav>
  )
}