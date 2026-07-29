import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiCpu, FiAward, FiActivity, FiTrendingUp, FiFileText } from 'react-icons/fi'

const MOOD_EMOJI = { very_positive: '😄', positive: '🙂', neutral: '😐', negative: '😟', very_negative: '😢' }
const MOOD_COLORS = { very_positive: '#38a169', positive: '#48bb78', neutral: '#d69e2e', negative: '#e53e3e', very_negative: '#c53030' }
const GRADE_COLORS = { A: '#38a169', B: '#48bb78', C: '#d69e2e', D: '#e53e3e', F: '#c53030' }

export default function AIInsights() {
  const { user } = useAuth()
  const [perf, setPerf] = useState(null)
  const [sentiment, setSentiment] = useState(null)
  const [prediction, setPrediction] = useState(null)
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(true)
  const [summarizing, setSummarizing] = useState(false)

  const isIntern = user?.role === 'intern'

  useEffect(() => {
    Promise.allSettled([
      api.get('/ai/performance/me'),
      api.get('/ai/sentiment/me'),
      api.get('/ai/predict/me'),
    ]).then(([p, s, pred]) => {
      if (p.status === 'fulfilled') setPerf(p.value.data)
      if (s.status === 'fulfilled') setSentiment(s.value.data)
      if (pred.status === 'fulfilled') setPrediction(pred.value.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleSummarize = async () => {
    setSummarizing(true)
    try {
      const { data } = await api.get('/ai/weekly-summary/me')
      setSummary(data)
    } catch { setSummary({ error: 'Failed to generate summary' }) }
    finally { setSummarizing(false) }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  const perfScore = perf?.total_score ?? perf?.score ?? 0
  const gradeColor = GRADE_COLORS[perf?.grade?.[0]] || '#718096'
  const breakdown = perf?.breakdown || perf?.factors || {}
  const entries = sentiment?.entries || []
  const avgPolarity = entries.length ? entries.reduce((s, e) => s + (e.polarity || 0), 0) / entries.length : 0
  const overallMood = avgPolarity > 0.3 ? 'very_positive' : avgPolarity > 0.1 ? 'positive' : avgPolarity > -0.1 ? 'neutral' : avgPolarity > -0.3 ? 'negative' : 'very_negative'

  return (
    <div>
      <div className="page-header">
        <h1><FiCpu style={{ marginRight: 8 }} />AI Insights</h1>
        <p>Machine learning-powered analysis of your internship progress</p>
      </div>

      <div style={{
        background: 'linear-gradient(135deg, #44337a 0%, #553c9a 50%, #6b46c1 100%)',
        borderRadius: 16, padding: 32, color: '#fff', marginBottom: 24,
        boxShadow: '0 8px 32px rgba(85,60,154,0.3)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
          <FiCpu size={24} />
          <span style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 }}>Powered by ML</span>
        </div>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700 }}>Your AI Dashboard</h2>
        <p style={{ opacity: 0.85, fontSize: 14 }}>
          Sentiment analysis (TextBlob NLP), TF-IDF summarization, and weighted performance scoring
        </p>
      </div>

      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 20, marginBottom: 24 }}>
        {/* Performance Score */}
        <div className="card" style={{ borderTop: '4px solid #805ad5' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiAward size={18} color="#805ad5" /> Performance Score
          </h3>
          {perf ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '16px 0' }}>
                <div style={{ position: 'relative', width: 100, height: 100 }}>
                  <svg viewBox="0 0 36 36" style={{ width: 100, height: 100, transform: 'rotate(-90deg)' }}>
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#edf2f7" strokeWidth="3" />
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke={gradeColor} strokeWidth="3"
                      strokeDasharray={`${perfScore} ${100 - perfScore}`} strokeLinecap="round" />
                  </svg>
                  <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: 26, fontWeight: 800, color: gradeColor }}>{Math.round(perfScore)}</span>
                    <span style={{ fontSize: 12, color: '#718096' }}>{perf.grade}</span>
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  {Object.entries(breakdown).map(([key, f]) => {
                    const fScore = f.weighted_score ?? f.score ?? 0
                    const fMax = (f.weight ? f.weight * 100 : f.max) || 30
                    return (
                      <div key={key} style={{ marginBottom: 6 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4a5568', marginBottom: 2 }}>
                          <span style={{ textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                          <span>{Math.round(fScore)}/{Math.round(fMax)}</span>
                        </div>
                        <div style={{ background: '#edf2f7', borderRadius: 4, height: 6, overflow: 'hidden' }}>
                          <div style={{ width: `${fMax ? (fScore / fMax) * 100 : 0}%`, height: '100%', background: gradeColor, borderRadius: 4 }} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
              {perf.recommendations?.length > 0 && (
                <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: 8, fontSize: 13 }}>
                  <strong style={{ color: '#805ad5' }}>Recommendations:</strong>
                  <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: '#4a5568' }}>
                    {perf.recommendations.map((r, i) => <li key={i}>{r}</li>)}
                  </ul>
                </div>
              )}
            </>
          ) : <p style={{ color: '#a0aec0', fontSize: 13 }}>No performance data available yet.</p>}
        </div>

        {/* Sentiment Analysis */}
        <div className="card" style={{ borderTop: '4px solid #38a169' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiActivity size={18} color="#38a169" /> Sentiment Analysis
          </h3>
          {entries.length > 0 ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20, margin: '16px 0' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 48 }}>{MOOD_EMOJI[overallMood]}</div>
                  <div style={{ fontSize: 13, color: MOOD_COLORS[overallMood], fontWeight: 600, textTransform: 'capitalize', marginTop: 4 }}>
                    {overallMood.replace(/_/g, ' ')}
                  </div>
                  <div style={{ fontSize: 11, color: '#a0aec0' }}>Avg: {avgPolarity.toFixed(2)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 8 }}>Mood Timeline</div>
                  <div style={{ display: 'flex', gap: 3, height: 32, alignItems: 'end' }}>
                    {entries.slice(-25).map((e, i) => (
                      <div key={i} title={`${e.date}: ${e.mood} (${(e.polarity || 0).toFixed(2)})`} style={{
                        flex: 1, minWidth: 4, borderRadius: '3px 3px 0 0',
                        height: `${Math.max(15, (0.5 + (e.polarity || 0)) * 100)}%`,
                        background: MOOD_COLORS[e.mood] || '#d69e2e',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>{entries.length} diary entries analyzed</div>
                </div>
              </div>
              {sentiment?.trend?.direction && (
                <div style={{ padding: '8px 12px', background: '#f0fff4', borderRadius: 6, fontSize: 13, color: '#276749' }}>
                  Trend: <strong>{sentiment.trend.direction === 'improving' ? '📈 Improving' : sentiment.trend.direction === 'declining' ? '📉 Declining' : '➡️ Stable'}</strong>
                </div>
              )}
            </>
          ) : <p style={{ color: '#a0aec0', fontSize: 13 }}>Write diary entries to see sentiment analysis.</p>}
        </div>
      </div>

      {/* Workload Predictor */}
      {prediction && (
        <div className="card" style={{ borderLeft: `4px solid ${prediction.status === 'On Track' ? '#38a169' : prediction.status === 'At Risk' ? '#d69e2e' : '#e53e3e'}`, marginBottom: 24 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiTrendingUp size={18} color={prediction.status === 'On Track' ? '#38a169' : prediction.status === 'At Risk' ? '#d69e2e' : '#e53e3e'} /> Workload Predictor (ML)
          </h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, margin: '16px 0' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 42, fontWeight: 800, color: prediction.status === 'On Track' ? '#38a169' : prediction.status === 'At Risk' ? '#d69e2e' : '#e53e3e' }}>
                {Math.round(prediction.probability)}%
              </div>
              <div style={{ fontSize: 13, fontWeight: 600, color: prediction.status === 'On Track' ? '#38a169' : prediction.status === 'At Risk' ? '#d69e2e' : '#e53e3e' }}>
                {prediction.status}
              </div>
              <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 2 }}>Completion Probability</div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 8 }}>Feature Weights (Logistic Regression)</div>
              {prediction.features && Object.entries(prediction.features).map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 12, color: '#718096', width: 160, textTransform: 'capitalize' }}>{key.replace(/_/g, ' ')}</span>
                  <div style={{ flex: 1, background: '#edf2f7', borderRadius: 4, height: 8, overflow: 'hidden' }}>
                    <div style={{ width: `${Math.min(100, val * 100)}%`, height: '100%', background: val > 0.6 ? '#38a169' : val > 0.3 ? '#d69e2e' : '#e53e3e', borderRadius: 4 }} />
                  </div>
                  <span style={{ fontSize: 11, color: '#a0aec0', width: 40, textAlign: 'right' }}>{(val * 100).toFixed(0)}%</span>
                </div>
              ))}
            </div>
          </div>
          {prediction.risk_factors?.length > 0 && (
            <div style={{ padding: '10px 12px', background: '#fff5f5', borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
              <strong style={{ color: '#e53e3e' }}>Risk Factors:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: '#4a5568' }}>
                {prediction.risk_factors.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}
          {prediction.suggestions?.length > 0 && (
            <div style={{ padding: '10px 12px', background: '#f0fff4', borderRadius: 8, fontSize: 13 }}>
              <strong style={{ color: '#38a169' }}>Suggestions:</strong>
              <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: '#4a5568' }}>
                {prediction.suggestions.map((s, i) => <li key={i}>{s}</li>)}
              </ul>
            </div>
          )}
          {prediction.predicted_end_date && (
            <div style={{ fontSize: 12, color: '#718096', marginTop: 8 }}>
              Predicted completion: <strong>{new Date(prediction.predicted_end_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</strong>
            </div>
          )}
        </div>
      )}

      {/* AI Summary */}
      <div className="card" style={{ borderLeft: '4px solid #FF671F' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
            <FiFileText size={18} color="#FF671F" /> AI Report Summarizer
          </h3>
          <button className="btn btn-primary btn-sm" onClick={handleSummarize} disabled={summarizing}>
            {summarizing ? 'Analyzing...' : summary ? 'Refresh' : 'Summarize Reports'}
          </button>
        </div>
        <p style={{ fontSize: 13, color: '#718096', marginBottom: 8 }}>
          Uses TF-IDF extractive summarization to distill your weekly reports into key highlights and keywords.
        </p>
        {summary && !summary.error && (
          <div>
            {summary.data?.overall_summary && (
              <div style={{ padding: '10px 12px', background: '#fff5eb', borderRadius: 8, fontSize: 14, color: '#4a5568', marginBottom: 8 }}>
                {summary.data.overall_summary}
              </div>
            )}
            {summary.data?.keywords?.length > 0 && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {summary.data.keywords.map((kw, i) => (
                  <span key={i} style={{ background: '#fff5eb', color: '#c05621', padding: '3px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{kw}</span>
                ))}
              </div>
            )}
            {summary.message && !summary.data?.overall_summary && (
              <p style={{ fontSize: 13, color: '#a0aec0' }}>{summary.message}</p>
            )}
          </div>
        )}
        {summary?.error && <p style={{ fontSize: 13, color: '#e53e3e' }}>{summary.error}</p>}
      </div>
    </div>
  )
}
