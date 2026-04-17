import { useState } from 'react'
import { queryPipeline } from '../lib/api'
import DealTable from '../components/DealTable'

const EXAMPLES = [
  "Which deals haven't been touched in 7 days?",
  "Show me all critical risk deals",
  "Which deals are worth more than $10,000?",
  "Show me deals closing this month",
  "What deals are in the proposal stage?",
]

export default function Query() {
  const [question, setQuestion] = useState('')
  const [result, setResult]     = useState(null)
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState(null)

  async function handleQuery() {
    if (!question.trim()) return
    setLoading(true); setError(null); setResult(null)
    try {
      setResult(await queryPipeline(question))
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fade-in">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#f0f2f8', letterSpacing: '-0.02em', marginBottom: 4 }}>
          AI Query
        </h1>
        <p style={{ fontSize: 13, color: '#8b90a7' }}>
          Ask anything about your pipeline in plain English
        </p>
      </div>

      {/* Input card */}
      <div style={{
        background: '#1e2130',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: 14,
        padding: 24,
        marginBottom: 20,
      }}>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          <input
            value={question}
            onChange={e => setQuestion(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuery()}
            placeholder="Which deals haven't been touched in 7 days?"
            style={{
              flex: 1,
              padding: '11px 16px',
              borderRadius: 10,
              border: '1.5px solid rgba(255,255,255,0.1)',
              fontSize: 14,
              color: '#f0f2f8',
              background: '#13161f',
              outline: 'none',
              transition: 'border-color 0.15s',
            }}
            onFocus={e => e.target.style.borderColor = '#4f7cff'}
            onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'}
          />
          <button
            onClick={handleQuery}
            disabled={loading || !question.trim()}
            style={{
              padding: '11px 24px',
              borderRadius: 10,
              border: 'none',
              background: loading || !question.trim()
                ? 'rgba(79,124,255,0.3)'
                : 'linear-gradient(135deg, #4f7cff, #7c5cfc)',
              color: '#ffffff',
              fontWeight: 600,
              fontSize: 14,
              transition: 'all 0.15s ease',
              boxShadow: loading || !question.trim()
                ? 'none'
                : '0 4px 14px rgba(79,124,255,0.3)',
            }}
          >
            {loading ? 'Thinking...' : 'Ask AI'}
          </button>
        </div>

        <div>
          <p style={{ fontSize: 10, color: '#555b75', marginBottom: 8, fontWeight: 600, letterSpacing: '0.07em' }}>
            TRY AN EXAMPLE
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
            {EXAMPLES.map(q => (
              <button
                key={q}
                onClick={() => { setQuestion(q); setResult(null); setError(null) }}
                style={{
                  padding: '5px 12px',
                  borderRadius: 999,
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.04)',
                  fontSize: 12,
                  color: '#8b90a7',
                  transition: 'all 0.15s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(79,124,255,0.15)'
                  e.currentTarget.style.borderColor = 'rgba(79,124,255,0.4)'
                  e.currentTarget.style.color = '#4f7cff'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
                  e.currentTarget.style.color = '#8b90a7'
                }}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{
          background: 'rgba(240,82,79,0.1)',
          border: '1px solid rgba(240,82,79,0.3)',
          borderRadius: 10,
          padding: '12px 16px',
          color: '#f0524f',
          fontSize: 13,
          marginBottom: 16,
        }}>
          {error}
        </div>
      )}

      {result && (
        <div className="fade-in">
          {/* AI answer */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(79,124,255,0.12), rgba(124,92,252,0.1))',
            border: '1px solid rgba(79,124,255,0.25)',
            borderRadius: 14,
            padding: '18px 22px',
            marginBottom: 20,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <div style={{
                width: 24, height: 24, borderRadius: 6,
                background: 'linear-gradient(135deg, #4f7cff, #7c5cfc)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"
                    stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#4f7cff' }}>
                AI Answer — powered by NVIDIA NIM
              </span>
            </div>
            <p style={{ fontSize: 14, color: '#c8cde0', lineHeight: 1.75, whiteSpace: 'pre-wrap' }}>
              {result.answer}
            </p>
          </div>

          {/* Filters */}
          {Object.keys(result.filters_used || {}).length > 0 && (
            <div style={{ marginBottom: 14, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: 10, color: '#555b75', fontWeight: 600, letterSpacing: '0.07em' }}>
                FILTERS APPLIED:
              </span>
              {Object.entries(result.filters_used).map(([k, v]) => (
                <span key={k} style={{
                  padding: '2px 10px',
                  background: 'rgba(255,255,255,0.05)',
                  borderRadius: 999,
                  fontSize: 11,
                  color: '#8b90a7',
                  fontFamily: 'monospace',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {k}: {String(v)}
                </span>
              ))}
            </div>
          )}

          {result.deals.length > 0 ? (
            <div>
              <p style={{ fontSize: 12, color: '#555b75', marginBottom: 12 }}>
                {result.deals.length} deal{result.deals.length !== 1 ? 's' : ''} matched
              </p>
              <DealTable deals={result.deals} />
            </div>
          ) : (
            <div style={{
              background: '#1e2130',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: 32,
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: '#8b90a7' }}>No deals matched your query.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}