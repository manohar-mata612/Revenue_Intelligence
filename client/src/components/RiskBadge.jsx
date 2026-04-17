const styles = {
  critical: { bg: 'rgba(240,82,79,0.15)',  text: '#f0524f', border: 'rgba(240,82,79,0.3)'  },
  high:     { bg: 'rgba(245,158,11,0.15)', text: '#f59e0b', border: 'rgba(245,158,11,0.3)' },
  medium:   { bg: 'rgba(251,191,36,0.12)', text: '#fbbf24', border: 'rgba(251,191,36,0.25)'},
  low:      { bg: 'rgba(34,201,122,0.12)', text: '#22c97a', border: 'rgba(34,201,122,0.25)'},
  default:  { bg: 'rgba(139,144,167,0.1)', text: '#8b90a7', border: 'rgba(139,144,167,0.2)'},
}

export default function RiskBadge({ level }) {
  const s = styles[level] || styles.default
  return (
    <span style={{
      background: s.bg,
      color: s.text,
      border: `1px solid ${s.border}`,
      padding: '3px 10px',
      borderRadius: 999,
      fontSize: 11,
      fontWeight: 600,
      textTransform: 'capitalize',
      letterSpacing: '0.02em',
    }}>
      {level || 'unscored'}
    </span>
  )
}