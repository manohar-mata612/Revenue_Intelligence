import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import Dashboard from './pages/Dashboard'
import Deals from './pages/Deals'
import Query from './pages/Query'
import { getPipelineSummary } from './lib/api'

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: <ChartIcon /> },
  { to: '/deals',     label: 'Deals',     icon: <DealsIcon /> },
  { to: '/query',     label: 'AI Query',  icon: <QueryIcon /> },
]

export default function App() {
  const [dealCount, setDealCount] = useState(null)

  useEffect(() => {
    getPipelineSummary()
      .then(d => setDealCount(d.deal_count))
      .catch(() => {})
  }, [])

  return (
    <BrowserRouter>
      <div style={{ display: 'flex', minHeight: '100vh' }}>

        {/* Sidebar */}
        <aside style={{
          width: 220,
          minHeight: '100vh',
          background: '#13161f',
          borderRight: '1px solid rgba(255,255,255,0.06)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 100,
        }}>
          {/* Logo */}
          <div style={{
            padding: '24px 20px 20px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #4f7cff, #7c5cfc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3v18h18" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M7 16l4-4 4 4 4-8" stroke="white" strokeWidth="2.5"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#f0f2f8', lineHeight: 1.2 }}>
                  Revenue
                </div>
                <div style={{ fontSize: 11, color: '#8b90a7', lineHeight: 1.2 }}>
                  Intelligence
                </div>
              </div>
            </div>
          </div>

          {/* Nav links */}
          <nav style={{ padding: '16px 12px', flex: 1 }}>
            <div style={{
              fontSize: 10,
              fontWeight: 600,
              color: '#555b75',
              letterSpacing: '0.08em',
              padding: '0 8px',
              marginBottom: 8,
            }}>
              MAIN MENU
            </div>
            {NAV.map(({ to, label, icon }) => (
              <NavLink key={to} to={to} style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                marginBottom: 2,
                fontSize: 13,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#f0f2f8' : '#8b90a7',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(79,124,255,0.2), rgba(124,92,252,0.15))'
                  : 'transparent',
                borderLeft: isActive ? '2px solid #4f7cff' : '2px solid transparent',
                transition: 'all 0.15s ease',
              })}>
                <span style={{ opacity: 0.85, flexShrink: 0 }}>{icon}</span>
                <span style={{ flex: 1 }}>{label}</span>
                {label === 'Deals' && dealCount !== null && (
                  <span style={{
                    background: 'rgba(79,124,255,0.2)',
                    color: '#4f7cff',
                    fontSize: 10,
                    fontWeight: 700,
                    padding: '1px 6px',
                    borderRadius: 999,
                  }}>
                    {dealCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid rgba(255,255,255,0.06)',
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #4f7cff, #7c5cfc)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
                color: 'white',
                flexShrink: 0,
              }}>
                RI
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#f0f2f8' }}>
                  ReVenture AI
                </div>
                <div style={{ fontSize: 11, color: '#555b75' }}>
                  Sales Intelligence
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <main style={{
          marginLeft: 220,
          flex: 1,
          padding: '32px 36px',
          minHeight: '100vh',
          background: 'var(--bg-primary)',
        }}>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/deals"     element={<Deals />} />
            <Route path="/query"     element={<Query />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

function ChartIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2"/>
      <path d="M8 17V13M12 17V9M16 17V11"/>
    </svg>
  )
}

function DealsIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z"/>
      <path d="M16 3H8a2 2 0 00-2 2v2h12V5a2 2 0 00-2-2z"/>
    </svg>
  )
}

function QueryIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="M21 21l-4.35-4.35M11 8v3M11 14h.01"/>
    </svg>
  )
}