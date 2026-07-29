import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiBook, FiPlus, FiClock, FiCheckCircle, FiMessageSquare, FiActivity } from 'react-icons/fi'

function NewEntryForm({ onCreated }) {
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], activities: '', learning_outcomes: '', challenges: '', hours_worked: '' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.activities.trim()) { setError('Activities field is required'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/diary/', { ...form, hours_worked: Number(form.hours_worked) || 0 })
      setForm({ date: new Date().toISOString().split('T')[0], activities: '', learning_outcomes: '', challenges: '', hours_worked: '' })
      setOpen(false)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create entry')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        <FiPlus size={16} /> New Entry
      </button>
    )
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3>New Diary Entry</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Date</label>
            <input type="date" className="form-control" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Hours Worked</label>
            <input type="number" className="form-control" min="0" max="24" step="0.5" value={form.hours_worked} onChange={e => setForm({ ...form, hours_worked: e.target.value })} placeholder="8" />
          </div>
        </div>
        <div className="form-group">
          <label className="form-label">Activities</label>
          <textarea className="form-control" rows={3} value={form.activities} onChange={e => setForm({ ...form, activities: e.target.value })} placeholder="What did you work on today?" />
        </div>
        <div className="form-group">
          <label className="form-label">Learning Outcomes</label>
          <textarea className="form-control" rows={2} value={form.learning_outcomes} onChange={e => setForm({ ...form, learning_outcomes: e.target.value })} placeholder="What did you learn?" />
        </div>
        <div className="form-group">
          <label className="form-label">Challenges</label>
          <textarea className="form-control" rows={2} value={form.challenges} onChange={e => setForm({ ...form, challenges: e.target.value })} placeholder="Any challenges faced?" />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save Entry'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

const MOOD_EMOJI = { very_positive: '😄', positive: '🙂', neutral: '😐', negative: '😟', very_negative: '😢' }
const MOOD_COLORS = { very_positive: '#38a169', positive: '#48bb78', neutral: '#d69e2e', negative: '#e53e3e', very_negative: '#c53030' }

function SentimentWidget() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ai/sentiment/me')
      .then(({ data }) => setData(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return null
  if (!data?.entries?.length) return null

  const trend = data.trend || {}
  const entries = data.entries || []
  const avgPolarity = entries.reduce((s, e) => s + (e.polarity || 0), 0) / entries.length
  const overallMood = avgPolarity > 0.3 ? 'very_positive' : avgPolarity > 0.1 ? 'positive' : avgPolarity > -0.1 ? 'neutral' : avgPolarity > -0.3 ? 'negative' : 'very_negative'

  return (
    <div className="card" style={{ marginBottom: 16, borderLeft: '4px solid #805ad5' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <FiActivity size={18} color="#805ad5" /> AI Sentiment Analysis
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 12 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 36 }}>{MOOD_EMOJI[overallMood]}</div>
          <div style={{ fontSize: 12, color: MOOD_COLORS[overallMood], fontWeight: 600, textTransform: 'capitalize' }}>{overallMood.replace(/_/g, ' ')}</div>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
            Average Polarity: <strong style={{ color: MOOD_COLORS[overallMood] }}>{avgPolarity.toFixed(2)}</strong>
          </div>
          <div style={{ display: 'flex', gap: 4, height: 24, borderRadius: 6, overflow: 'hidden' }}>
            {entries.slice(-20).map((e, i) => (
              <div key={i} title={`${e.date}: ${e.mood}`} style={{
                flex: 1, background: MOOD_COLORS[e.mood] || '#d69e2e', borderRadius: 3, minWidth: 6,
                opacity: 0.6 + Math.abs(e.polarity || 0) * 0.4
              }} />
            ))}
          </div>
          <div style={{ fontSize: 11, color: '#a0aec0', marginTop: 4 }}>Last {Math.min(entries.length, 20)} entries mood timeline</div>
        </div>
      </div>
      {trend.direction && (
        <div style={{ fontSize: 13, padding: '8px 12px', background: '#faf5ff', borderRadius: 6, color: '#553c9a' }}>
          Trend: <strong>{trend.direction === 'improving' ? '📈 Improving' : trend.direction === 'declining' ? '📉 Declining' : '➡️ Stable'}</strong>
        </div>
      )}
    </div>
  )
}

function InternDiary() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEntries = () => {
    setLoading(true)
    api.get('/diary/me')
      .then(({ data }) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchEntries() }, [])

  return (
    <>
      <SentimentWidget />
      <NewEntryForm onCreated={fetchEntries} />
      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : entries.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiBook size={40} color="#a0aec0" />
            <h3>No diary entries yet</h3>
            <p>Start recording your daily activities.</p>
          </div>
        </div>
      ) : (
        entries.map(entry => (
          <div key={entry.id || entry._id} className="card" style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FiClock size={14} color="#718096" />
                <strong>{new Date(entry.date).toLocaleDateString()}</strong>
                {entry.hours_worked != null && (
                  <span className="badge">{entry.hours_worked}h</span>
                )}
              </div>
              <span className={`badge badge-${entry.is_approved ? 'success' : 'warning'}`}>
                {entry.is_approved ? 'Approved' : 'Pending'}
              </span>
            </div>
            <p style={{ fontSize: 14, marginTop: 8, color: '#4a5568' }}>
              {entry.activities?.length > 150 ? entry.activities.slice(0, 150) + '...' : entry.activities}
            </p>
            {entry.guide_comment && (
              <div style={{ marginTop: 8, padding: '8px 12px', background: '#ebf8ff', borderRadius: 6, fontSize: 13 }}>
                <FiMessageSquare size={12} style={{ marginRight: 4 }} />
                <strong>Guide:</strong> {entry.guide_comment}
              </div>
            )}
          </div>
        ))
      )}
    </>
  )
}

function GuideDiary() {
  const [interns, setInterns] = useState([])
  const [selectedIntern, setSelectedIntern] = useState(null)
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [entriesLoading, setEntriesLoading] = useState(false)
  const [commentForm, setCommentForm] = useState({})
  const [submitting, setSubmitting] = useState({})

  useEffect(() => {
    api.get('/guide/my-interns')
      .then(({ data }) => setInterns(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const fetchEntries = (internId) => {
    setEntriesLoading(true)
    api.get(`/diary/intern/${internId}`)
      .then(({ data }) => setEntries(Array.isArray(data) ? data : []))
      .catch(() => setEntries([]))
      .finally(() => setEntriesLoading(false))
  }

  const handleSelectIntern = (intern) => {
    setSelectedIntern(intern)
    fetchEntries(intern.id || intern._id)
  }

  const handleComment = async (entryId) => {
    const formData = commentForm[entryId]
    if (!formData?.guide_comment?.trim()) return
    setSubmitting(prev => ({ ...prev, [entryId]: true }))
    try {
      await api.put(`/diary/${entryId}/comment`, {
        guide_comment: formData.guide_comment,
        is_approved: formData.is_approved || false,
      })
      setCommentForm(prev => ({ ...prev, [entryId]: undefined }))
      if (selectedIntern) fetchEntries(selectedIntern.id || selectedIntern._id)
    } catch { /* ignore */ }
    finally { setSubmitting(prev => ({ ...prev, [entryId]: false })) }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <>
      <div className="card" style={{ marginBottom: 16 }}>
        <h3>Select Intern</h3>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {interns.length === 0 ? (
            <p style={{ color: '#a0aec0' }}>No interns assigned</p>
          ) : (
            interns.map(intern => (
              <button
                key={intern.id || intern._id}
                className={`btn ${selectedIntern && (selectedIntern.id || selectedIntern._id) === (intern.id || intern._id) ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => handleSelectIntern(intern)}
              >
                {intern.user?.name || intern.name || 'Intern'}
              </button>
            ))
          )}
        </div>
      </div>

      {selectedIntern && (
        entriesLoading ? (
          <div className="loading"><div className="spinner" /></div>
        ) : entries.length === 0 ? (
          <div className="card">
            <div className="empty-state">
              <FiBook size={40} color="#a0aec0" />
              <h3>No diary entries from this intern</h3>
            </div>
          </div>
        ) : (
          entries.map(entry => {
            const eid = entry.id || entry._id
            const cf = commentForm[eid] || {}
            return (
              <div key={eid} className="card" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong>{new Date(entry.date).toLocaleDateString()}</strong>
                    {entry.hours_worked != null && <span className="badge">{entry.hours_worked}h</span>}
                  </div>
                  <span className={`badge badge-${entry.is_approved ? 'success' : 'warning'}`}>
                    {entry.is_approved ? 'Approved' : 'Pending'}
                  </span>
                </div>
                <div style={{ marginTop: 8, fontSize: 14 }}>
                  <p><strong>Activities:</strong> {entry.activities}</p>
                  {entry.learning_outcomes && <p><strong>Learning:</strong> {entry.learning_outcomes}</p>}
                  {entry.challenges && <p><strong>Challenges:</strong> {entry.challenges}</p>}
                </div>
                {entry.guide_comment && (
                  <div style={{ marginTop: 8, padding: '8px 12px', background: '#ebf8ff', borderRadius: 6, fontSize: 13 }}>
                    <FiMessageSquare size={12} style={{ marginRight: 4 }} />
                    <strong>Your comment:</strong> {entry.guide_comment}
                  </div>
                )}
                {!entry.is_approved && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid #edf2f7' }}>
                    <div className="form-group">
                      <textarea
                        className="form-control"
                        rows={2}
                        placeholder="Add your comment..."
                        value={cf.guide_comment || ''}
                        onChange={e => setCommentForm(prev => ({ ...prev, [eid]: { ...cf, guide_comment: e.target.value } }))}
                      />
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14 }}>
                        <input
                          type="checkbox"
                          checked={cf.is_approved || false}
                          onChange={e => setCommentForm(prev => ({ ...prev, [eid]: { ...cf, is_approved: e.target.checked } }))}
                        />
                        Approve Entry
                      </label>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleComment(eid)}
                        disabled={submitting[eid]}
                      >
                        {submitting[eid] ? 'Submitting...' : 'Submit'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })
        )
      )}
    </>
  )
}

export default function Diary() {
  const { user } = useAuth()

  return (
    <div>
      <div className="page-header">
        <h1><FiBook style={{ marginRight: 8 }} />Daily Diary</h1>
      </div>
      {user?.role === 'intern' ? <InternDiary /> : <GuideDiary />}
    </div>
  )
}
