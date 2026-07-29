import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiFileText, FiPlus, FiSend, FiMessageSquare, FiCpu } from 'react-icons/fi'

function AISummaryPanel({ reports }) {
  const [summary, setSummary] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleSummarize = async () => {
    setLoading(true)
    try {
      const { data } = await api.get('/ai/weekly-summary/me')
      setSummary(data)
    } catch { setSummary({ error: 'Failed to generate summary' }) }
    finally { setLoading(false) }
  }

  return (
    <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #805ad5' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <FiCpu size={18} color="#805ad5" /> AI Report Summary
        </h3>
        <button className="btn btn-sm" onClick={handleSummarize} disabled={loading}
          style={{ background: '#805ad5', color: '#fff', border: 'none' }}>
          {loading ? 'Analyzing...' : summary ? 'Refresh' : 'Generate Summary'}
        </button>
      </div>
      {summary && !summary.error && (
        <div style={{ marginTop: 12 }}>
          {summary.data?.overall_summary && (
            <div style={{ padding: '10px 12px', background: '#faf5ff', borderRadius: 8, fontSize: 13, color: '#4a5568', marginBottom: 8 }}>
              <strong style={{ color: '#805ad5' }}>Overall:</strong> {summary.data.overall_summary}
            </div>
          )}
          {summary.data?.keywords?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {summary.data.keywords.map((kw, i) => (
                <span key={i} style={{ background: '#e9d8fd', color: '#553c9a', padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 500 }}>{kw}</span>
              ))}
            </div>
          )}
          {summary.data?.report_summaries?.length > 0 && (
            <div style={{ marginTop: 8 }}>
              {summary.data.report_summaries.map((rs, i) => (
                <div key={i} style={{ padding: '6px 0', borderBottom: '1px solid #edf2f7', fontSize: 13, color: '#4a5568' }}>
                  <strong>{rs.period}:</strong> {rs.summary}
                </div>
              ))}
            </div>
          )}
          {summary.message && !summary.data?.overall_summary && (
            <p style={{ fontSize: 13, color: '#a0aec0', marginTop: 8 }}>{summary.message}</p>
          )}
        </div>
      )}
      {summary?.error && <p style={{ fontSize: 13, color: '#e53e3e', marginTop: 8 }}>{summary.error}</p>}
    </div>
  )
}

function InternReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)
  const [autoGenerating, setAutoGenerating] = useState(false)
  const [submitting, setSubmitting] = useState({})
  const [genForm, setGenForm] = useState({ week_start: '', week_end: '' })
  const [autoGenForm, setAutoGenForm] = useState({ week_start: '', week_end: '' })
  const [showGenForm, setShowGenForm] = useState(false)
  const [showAutoGenForm, setShowAutoGenForm] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchReports = () => {
    setLoading(true)
    api.get('/reports/me')
      .then(({ data }) => setReports(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReports() }, [])

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!genForm.week_start || !genForm.week_end) { setError('Both dates are required'); return }
    setGenerating(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/reports/generate', genForm)
      setSuccess('Report generated successfully!')
      setShowGenForm(false)
      setGenForm({ week_start: '', week_end: '' })
      fetchReports()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate report')
    } finally {
      setGenerating(false)
    }
  }

  const handleAutoGenerate = async (e) => {
    e.preventDefault()
    if (!autoGenForm.week_start || !autoGenForm.week_end) { setError('Both dates are required'); return }
    setAutoGenerating(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/reports/auto-generate', autoGenForm)
      setSuccess('AI-generated report created successfully from diary entries!')
      setShowAutoGenForm(false)
      setAutoGenForm({ week_start: '', week_end: '' })
      fetchReports()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to auto-generate report')
    } finally {
      setAutoGenerating(false)
    }
  }

  const handleSubmit = async (reportId) => {
    setSubmitting(prev => ({ ...prev, [reportId]: true }))
    try {
      await api.put(`/reports/${reportId}/submit`)
      fetchReports()
    } catch { /* ignore */ }
    finally { setSubmitting(prev => ({ ...prev, [reportId]: false })) }
  }

  const statusBadge = (status) => {
    const map = { draft: 'warning', submitted: 'info', reviewed: 'success' }
    return map[status] || 'info'
  }

  return (
    <>
      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {!showGenForm && !showAutoGenForm && (
          <>
            <button className="btn btn-primary" onClick={() => { setShowGenForm(true); setShowAutoGenForm(false) }}>
              <FiPlus size={16} /> Generate Report
            </button>
            <button className="btn" onClick={() => { setShowAutoGenForm(true); setShowGenForm(false) }}
              style={{ background: '#805ad5', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', gap: 6 }}>
              <FiCpu size={16} /> Auto-Generate from Diary
            </button>
          </>
        )}
      </div>

      {showGenForm && (
        <div className="card" style={{ marginBottom: 16 }}>
          <h3>Generate Weekly Report</h3>
          <form onSubmit={handleGenerate}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Week Start</label>
                <input type="date" className="form-control" value={genForm.week_start} onChange={e => setGenForm({ ...genForm, week_start: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Week End</label>
                <input type="date" className="form-control" value={genForm.week_end} onChange={e => setGenForm({ ...genForm, week_end: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn btn-primary" disabled={generating}>{generating ? 'Generating...' : 'Generate'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowGenForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {showAutoGenForm && (
        <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #805ad5' }}>
          <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiCpu size={18} color="#805ad5" /> Auto-Generate from Diary Entries
          </h3>
          <p style={{ fontSize: 13, color: '#718096', marginBottom: 12 }}>
            Uses AI to summarize your diary activities, learnings, and challenges into a weekly report.
          </p>
          <form onSubmit={handleAutoGenerate}>
            <div style={{ display: 'flex', gap: 12 }}>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Week Start</label>
                <input type="date" className="form-control" value={autoGenForm.week_start} onChange={e => setAutoGenForm({ ...autoGenForm, week_start: e.target.value })} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">Week End</label>
                <input type="date" className="form-control" value={autoGenForm.week_end} onChange={e => setAutoGenForm({ ...autoGenForm, week_end: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="submit" className="btn" disabled={autoGenerating}
                style={{ background: '#805ad5', color: '#fff', border: 'none' }}>
                {autoGenerating ? 'AI Generating...' : 'Auto-Generate'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAutoGenForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {reports.length > 0 && <AISummaryPanel reports={reports} />}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : reports.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiFileText size={40} color="#a0aec0" />
            <h3>No reports yet</h3>
            <p>Generate your first weekly report.</p>
          </div>
        </div>
      ) : (
        reports.map(r => (
          <div key={r.id || r._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <strong>
                  {r.week_start ? new Date(r.week_start).toLocaleDateString() : '?'} - {r.week_end ? new Date(r.week_end).toLocaleDateString() : '?'}
                </strong>
              </div>
              <span className={`badge badge-${statusBadge(r.status)}`}>{r.status || 'draft'}</span>
            </div>
            {r.summary && (
              <p style={{ fontSize: 14, color: '#4a5568', marginTop: 8 }}>
                {r.summary.length > 200 ? r.summary.slice(0, 200) + '...' : r.summary}
              </p>
            )}
            {r.guide_feedback && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#ebf8ff', borderRadius: 6, fontSize: 13 }}>
                <FiMessageSquare size={12} style={{ marginRight: 4 }} />
                <strong>Guide Feedback:</strong> {r.guide_feedback}
              </div>
            )}
            {r.status === 'draft' && (
              <button
                className="btn btn-primary btn-sm"
                style={{ marginTop: 8 }}
                onClick={() => handleSubmit(r.id || r._id)}
                disabled={submitting[r.id || r._id]}
              >
                <FiSend size={12} /> {submitting[r.id || r._id] ? 'Submitting...' : 'Submit'}
              </button>
            )}
          </div>
        ))
      )}
    </>
  )
}

function GuideReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)
  const [feedbackForm, setFeedbackForm] = useState({})
  const [submitting, setSubmitting] = useState({})

  const fetchReports = () => {
    setLoading(true)
    api.get('/reports/')
      .then(({ data }) => setReports(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchReports() }, [])

  const handleFeedback = async (reportId) => {
    const feedback = feedbackForm[reportId]
    if (!feedback?.trim()) return
    setSubmitting(prev => ({ ...prev, [reportId]: true }))
    try {
      await api.put(`/reports/${reportId}/feedback`, { guide_feedback: feedback })
      setFeedbackForm(prev => ({ ...prev, [reportId]: '' }))
      fetchReports()
    } catch { /* ignore */ }
    finally { setSubmitting(prev => ({ ...prev, [reportId]: false })) }
  }

  const statusBadge = (status) => {
    const map = { draft: 'warning', submitted: 'info', reviewed: 'success' }
    return map[status] || 'info'
  }

  return (
    <>
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : reports.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiFileText size={40} color="#a0aec0" />
            <h3>No submitted reports</h3>
          </div>
        </div>
      ) : (
        reports.map(r => {
          const rid = r.id || r._id
          return (
            <div key={rid} className="card" style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{r.intern?.name || r.intern_name || 'Intern'}</strong>
                  <span style={{ color: '#718096', fontSize: 13, marginLeft: 8 }}>
                    {r.week_start ? new Date(r.week_start).toLocaleDateString() : '?'} - {r.week_end ? new Date(r.week_end).toLocaleDateString() : '?'}
                  </span>
                </div>
                <span className={`badge badge-${statusBadge(r.status)}`}>{r.status || 'submitted'}</span>
              </div>
              {r.summary && (
                <p style={{ fontSize: 14, color: '#4a5568', marginTop: 8 }}>{r.summary}</p>
              )}
              {r.guide_feedback && (
                <div style={{ marginTop: 8, padding: '8px 12px', background: '#ebf8ff', borderRadius: 6, fontSize: 13 }}>
                  <strong>Your feedback:</strong> {r.guide_feedback}
                </div>
              )}
              {r.status === 'submitted' && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #edf2f7' }}>
                  <div className="form-group">
                    <textarea
                      className="form-control"
                      rows={2}
                      placeholder="Write your feedback..."
                      value={feedbackForm[rid] || ''}
                      onChange={e => setFeedbackForm(prev => ({ ...prev, [rid]: e.target.value }))}
                    />
                  </div>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleFeedback(rid)}
                    disabled={submitting[rid]}
                  >
                    {submitting[rid] ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              )}
            </div>
          )
        })
      )}
    </>
  )
}

export default function WeeklyReports() {
  const { user } = useAuth()

  return (
    <div>
      <div className="page-header">
        <h1><FiFileText style={{ marginRight: 8 }} />Weekly Reports</h1>
      </div>
      {user?.role === 'intern' ? <InternReports /> : <GuideReports />}
    </div>
  )
}
