import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell
} from 'recharts'

const STAGE_LABELS = {
  appointmentscheduled:  'Appointment',
  contractsent:          'Contract Sent',
  qualifiedtobuy:        'Qualified',
  presentationscheduled: 'Presentation',
  decisionmakerboughtin: 'Decision Maker',
  closedwon:             'Closed Won',
  closedlost:            'Closed Lost',
}

const COLORS = ['#4f7cff','#7c5cfc','#22c97a','#f59e0b','#f0524f','#06b6d4','#ec4899']

function formatStage(stage) {
  if (!stage) return 'Unknown'
  return STAGE_LABELS[stage.toLowerCase().replace(/\s/g, '')]
    || stage.charAt(0).toUpperCase() + stage.slice(1)
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{
      background: '#252840',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 8,
      padding: '10px 14px',
      fontSize: 12,
    }}>
      <p style={{ color: '#8b90a7', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#f0f2f8', fontWeight: 600 }}>
        {payload[0].value} deals
      </p>
    </div>
  )
}

export default function PipelineChart({ data }) {
  const formatted = data.map(d => ({
    ...d,
    stage: formatStage(d.stage)
  }))

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false}/>
        <XAxis
          dataKey="stage"
          tick={{ fontSize: 11, fill: '#555b75' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#555b75' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }}/>
        <Bar dataKey="count" radius={[6, 6, 0, 0]}>
          {formatted.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]}/>
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}