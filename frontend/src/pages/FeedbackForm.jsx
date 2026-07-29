import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiStar, FiThumbsUp, FiMessageSquare, FiSend, FiCheck, FiUsers, FiAward } from 'react-icons/fi'

function StarRating({ value, onChange, readOnly }) {
  const [hover, setHover] = useState(0)
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <FiStar
          key={s}
          size={28}
          style={{
            cursor: readOnly ? 'default' : 'pointer',
            fill: s <= (hover || value) ? '#d69e2e' : 'none',
            color: s <= (hover || value) ? '#d69e2e' : '#cbd5e0',
            transition: 'all 0.15s'
          }}
          onClick={() => !readOnly && onChange(s)}
          onMouseEnter={() => !readOnly && setHover(s)}
          onMouseLeave={() => !readOnly && setHover(0)}
        />
      ))}
      {value > 0 && <span style={{ marginLeft: 8, fontSize: 14, color: '#718096', alignSelf: 'center' }}>{value}/5</span>}
    </div>
  )
}

function ReadOnlyFeedback({ fb }) {
  return (
    <div className="card" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <FiCheck size={20} color="#38a169" />
        <h3 style={{ margin: 0, color: '#38a169' }}>Feedback Submitted</h3>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginBottom: 4, display: 'block' }}>Rating</label>
          <StarRating value={fb.rating} readOnly />
        </div>
        <div>
          <label style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginBottom: 4, display: 'block' }}>Experience</label>
          <p style={{ margin: 0, color: '#2d3748', lineHeight: 1.6 }}>{fb.experience_feedback}</p>
        </div>
        {fb.best_part && (
          <div>
            <label style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginBottom: 4, display: 'block' }}>Best Part</label>
            <p style={{ margin: 0, color: '#2d3748' }}>{fb.best_part}</p>
          </div>
        )}
        {fb.worst_part && (
          <div>
            <label style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginBottom: 4, display: 'block' }}>Worst Part</label>
            <p style={{ margin: 0, color: '#2d3748' }}>{fb.worst_part}</p>
          </div>
        )}
        {fb.suggestions && (
          <div>
            <label style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginBottom: 4, display: 'block' }}>Suggestions</label>
            <p style={{ margin: 0, color: '#2d3748' }}>{fb.suggestions}</p>
          </div>
        )}
        <div>
          <label style={{ fontSize: 13, color: '#718096', fontWeight: 600, marginBottom: 4, display: 'block' }}>Would Recommend</label>
          <span style={{ color: fb.would_recommend ? '#38a169' : '#e53e3e', fontWeight: 600 }}>
            {fb.would_recommend ? 'Yes' : 'No'}
          </span>
        </div>
      </div>
    </div>
  )
}

function SeniorInternTips() {
  const [tips, setTips] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/feedback/tips')
      .then(({ data }) => setTips(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading || !tips || tips.total === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{
        background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
        borderRadius: 16, padding: 28, color: '#fff', marginBottom: 16,
        boxShadow: '0 4px 16px rgba(0,0,0,0.15)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -20, right: -20, width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <FiUsers size={22} />
          <h2 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Senior Intern Tips</h2>
        </div>
        <p style={{ opacity: 0.85, fontSize: 14, margin: 0 }}>
          Advice and experiences shared by previous interns — {tips.total} responses, avg rating {tips.avg_rating}/5
        </p>
        {tips.keywords?.length > 0 && (
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 12 }}>
            {tips.keywords.slice(0, 8).map((kw, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.15)', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 500 }}>{kw}</span>
            ))}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {tips.tips.map((tip, i) => (
          <div key={i} className="card" style={{ padding: 20, borderLeft: `4px solid ${tip.rating >= 4 ? '#38a169' : tip.rating >= 3 ? '#d69e2e' : '#e53e3e'}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiUsers size={14} color="#718096" />
                </div>
                <span style={{ fontSize: 14, fontWeight: 600, color: '#2d3748' }}>Previous Intern</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {[1, 2, 3, 4, 5].map(s => (
                  <FiStar key={s} size={14} style={{ fill: s <= tip.rating ? '#d69e2e' : 'none', color: s <= tip.rating ? '#d69e2e' : '#cbd5e0' }} />
                ))}
                {tip.would_recommend && <FiThumbsUp size={14} color="#38a169" style={{ marginLeft: 6 }} />}
              </div>
            </div>
            {tip.experience_summary && (
              <p style={{ margin: '0 0 8px', fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>{tip.experience_summary}</p>
            )}
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {tip.best_part && (
                <div style={{ background: '#f0fff4', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
                  <FiAward size={12} color="#38a169" style={{ marginRight: 4 }} />
                  <strong style={{ color: '#38a169' }}>Best:</strong>
                  <span style={{ color: '#2d3748', marginLeft: 4 }}>{tip.best_part}</span>
                </div>
              )}
              {tip.suggestions && (
                <div style={{ background: '#ebf8ff', borderRadius: 8, padding: '6px 12px', fontSize: 13 }}>
                  <FiMessageSquare size={12} color="#003580" style={{ marginRight: 4 }} />
                  <strong style={{ color: '#003580' }}>Tip:</strong>
                  <span style={{ color: '#2d3748', marginLeft: 4 }}>{tip.suggestions}</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default function FeedbackForm() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [myFeedback, setMyFeedback] = useState(null)
  const [allFeedback, setAllFeedback] = useState([])
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({ rating: 0, experience_feedback: '', best_part: '', worst_part: '', suggestions: '', would_recommend: true })
  const [error, setError] = useState('')

  const isCoordinator = user?.role === 'coordinator'

  useEffect(() => {
    const load = async () => {
      try {
        if (isCoordinator) {
          const { data } = await api.get('/feedback/')
          setAllFeedback(data)
        } else {
          const { data } = await api.get('/feedback/me')
          setMyFeedback(data)
        }
      } catch { }
      setLoading(false)
    }
    load()
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    if (form.rating === 0) { setError('Please select a rating'); return }
    try {
      const { data } = await api.post('/feedback/', form)
      setMyFeedback(data)
      setSubmitted(true)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to submit feedback')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  // Coordinator view: show all feedback
  if (isCoordinator) {
    return (
      <div>
        <div className="page-header">
          <h1>Intern Feedback</h1>
          <p>View all feedback from interns</p>
        </div>
        {allFeedback.length === 0 ? (
          <div className="empty-state">
            <FiMessageSquare size={48} />
            <h3>No feedback yet</h3>
            <p>Feedback from interns will appear here</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {allFeedback.map((fb, i) => (
              <div key={fb.id || i} className="card" style={{ padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#FF671F', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600, fontSize: 14 }}>
                      {(fb.intern_name || fb.user_name || '?')[0]?.toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: '#2d3748', fontSize: 14 }}>{fb.intern_name || fb.user_name || 'Intern'}</div>
                      {fb.created_at && <div style={{ fontSize: 12, color: '#a0aec0' }}>{new Date(fb.created_at).toLocaleDateString()}</div>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <StarRating value={fb.rating} readOnly />
                    {fb.would_recommend && <FiThumbsUp size={16} color="#38a169" style={{ marginLeft: 8 }} />}
                  </div>
                </div>
                <p style={{ margin: '0 0 8px', color: '#4a5568', fontSize: 14, lineHeight: 1.6 }}>{fb.experience_feedback}</p>
                <div className="grid grid-2" style={{ gap: 12 }}>
                  {fb.best_part && (
                    <div style={{ background: '#f0fff4', borderRadius: 8, padding: '8px 12px' }}>
                      <span style={{ fontSize: 12, color: '#38a169', fontWeight: 600 }}>Best:</span>
                      <span style={{ fontSize: 13, color: '#2d3748', marginLeft: 6 }}>{fb.best_part}</span>
                    </div>
                  )}
                  {fb.worst_part && (
                    <div style={{ background: '#fff5f5', borderRadius: 8, padding: '8px 12px' }}>
                      <span style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600 }}>Worst:</span>
                      <span style={{ fontSize: 13, color: '#2d3748', marginLeft: 6 }}>{fb.worst_part}</span>
                    </div>
                  )}
                </div>
                {fb.suggestions && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#718096', fontStyle: 'italic' }}>Suggestion: {fb.suggestions}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // Already submitted
  if (myFeedback) {
    return (
      <div>
        <div className="page-header">
          <h1>Your Feedback</h1>
          <p>Thank you for sharing your experience</p>
        </div>
        {submitted && (
          <div className="alert alert-success" style={{ marginBottom: 20 }}>
            Thank you for your feedback! Your response has been recorded.
          </div>
        )}
        <ReadOnlyFeedback fb={myFeedback} />
        <div style={{ marginTop: 24 }}>
          <SeniorInternTips />
        </div>
      </div>
    )
  }

  // Feedback form
  return (
    <div>
      <div className="page-header">
        <h1>Internship Feedback</h1>
        <p>Share your experience and help us improve</p>
      </div>

      <SeniorInternTips />

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Section 1: Rating */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiStar size={18} color="#d69e2e" /> Rate Your Experience
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#718096' }}>How would you rate your overall internship experience?</p>
          <StarRating value={form.rating} onChange={v => setForm({ ...form, rating: v })} />
        </div>

        {/* Section 2: Experience */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 4px', fontSize: 16, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiMessageSquare size={18} color="#FF671F" /> Your Experience
          </h3>
          <p style={{ margin: '0 0 12px', fontSize: 13, color: '#718096' }}>Tell us about your internship experience in detail</p>
          <div className="form-group" style={{ margin: 0 }}>
            <textarea
              value={form.experience_feedback}
              onChange={e => setForm({ ...form, experience_feedback: e.target.value })}
              required rows={4}
              placeholder="Describe your overall experience during the internship..."
            />
          </div>
        </div>

        {/* Section 3: Best & Worst */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#2d3748' }}>Best & Worst Parts</h3>
          <div className="grid grid-2">
            <div className="form-group">
              <label>Best Part</label>
              <input value={form.best_part} onChange={e => setForm({ ...form, best_part: e.target.value })} placeholder="What did you enjoy the most?" />
            </div>
            <div className="form-group">
              <label>Worst Part</label>
              <input value={form.worst_part} onChange={e => setForm({ ...form, worst_part: e.target.value })} placeholder="What could be improved?" />
            </div>
          </div>
        </div>

        {/* Section 4: Suggestions */}
        <div className="card" style={{ padding: 24, marginBottom: 16 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#2d3748' }}>Suggestions</h3>
          <div className="form-group" style={{ margin: 0 }}>
            <textarea
              value={form.suggestions}
              onChange={e => setForm({ ...form, suggestions: e.target.value })}
              rows={3}
              placeholder="Any suggestions for future interns or the program?"
            />
          </div>
        </div>

        {/* Section 5: Recommend */}
        <div className="card" style={{ padding: 24, marginBottom: 24 }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiThumbsUp size={18} color="#38a169" /> Would You Recommend?
          </h3>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 14, color: '#4a5568' }}>
            <div
              onClick={() => setForm({ ...form, would_recommend: !form.would_recommend })}
              style={{
                width: 48, height: 26, borderRadius: 13, position: 'relative', cursor: 'pointer',
                background: form.would_recommend ? '#38a169' : '#cbd5e0', transition: 'background 0.2s'
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: '50%', background: '#fff', position: 'absolute', top: 2,
                left: form.would_recommend ? 24 : 2, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }} />
            </div>
            {form.would_recommend ? 'Yes, I would recommend this internship' : 'No, I would not recommend'}
          </label>
        </div>

        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px', fontSize: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiSend size={18} /> Submit Feedback
        </button>
      </form>
    </div>
  )
}
