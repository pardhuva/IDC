import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { FiCheck, FiCircle } from 'react-icons/fi'

const STEP_LABELS = [
  'Complete Profile', 'Upload Documents', 'Get Documents Verified',
  'Meet Your Guide', 'Campus Orientation', 'IT Setup & Access',
  'Project Briefing', 'Start Working'
]

export default function Checklist() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchChecklist = async () => {
    try {
      const { data } = await api.get('/checklist/')
      setItems(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchChecklist() }, [])

  const initChecklist = async () => {
    setError(''); setSuccess('')
    try {
      await api.post('/checklist/init')
      setSuccess('Checklist initialized!')
      fetchChecklist()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to initialize checklist')
    }
  }

  const markComplete = async (id) => {
    if (!window.confirm('Mark this step as completed?')) return
    setError(''); setSuccess('')
    try {
      await api.put(`/checklist/${id}/complete`)
      setSuccess('Step completed!')
      fetchChecklist()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to mark as complete')
    }
  }

  const completed = items.filter(i => i.is_completed).length
  const total = items.length
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Onboarding Checklist</h1>
        <p>Track your onboarding progress step by step</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {items.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <h3>No checklist found</h3>
            <p>Initialize your onboarding checklist to get started</p>
            <button onClick={initChecklist} style={{ marginTop: 16 }}>Initialize Checklist</button>
          </div>
        </div>
      ) : (
        <>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <h3>Progress</h3>
              <span style={{ fontSize: 24, fontWeight: 700, color: '#FF671F' }}>{pct}%</span>
            </div>
            <div className="progress-bar">
              <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
            </div>
            <div className="progress-text">{completed} of {total} steps completed</div>
          </div>

          <div className="card" style={{ padding: 0 }}>
            {items.map((item, idx) => (
              <div
                key={item.id || item._id || idx}
                className={`checklist-item ${item.is_completed ? 'done' : ''}`}
                onClick={() => !item.is_completed && markComplete(item.id || item._id)}
              >
                <div className="checklist-check">
                  {item.is_completed ? <FiCheck size={14} /> : <FiCircle size={14} />}
                </div>
                <div>
                  <div className="checklist-text" style={{ fontWeight: 500 }}>
                    {item.title || STEP_LABELS[idx] || `Step ${idx + 1}`}
                  </div>
                  {item.description && <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>{item.description}</div>}
                </div>
                {!item.is_completed && (
                  <span className="badge badge-pending" style={{ marginLeft: 'auto' }}>Pending</span>
                )}
                {item.is_completed && (
                  <span className="badge badge-completed" style={{ marginLeft: 'auto' }}>Done</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
