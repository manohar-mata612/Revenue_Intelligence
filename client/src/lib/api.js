export async function queryPipeline(question) {
  const res = await fetch('/api/query', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question }),
  })
  if (!res.ok) throw new Error(`Query failed: ${res.status}`)
  return res.json()
}

export async function getDeals(filters = {}) {
  const params = new URLSearchParams(filters).toString()
  const res = await fetch(`/api/deals?${params}`)
  if (!res.ok) throw new Error(`Deals fetch failed: ${res.status}`)
  return res.json()
}

export async function getPipelineSummary() {
  const res = await fetch('/api/pipeline-summary')
  if (!res.ok) throw new Error(`Summary fetch failed: ${res.status}`)
  return res.json()
}