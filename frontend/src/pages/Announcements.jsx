import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiPlus, FiVolume2 } from 'react-icons/fi'

export default function Announcements() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'general', target_role: '', expires_at: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCoordinator = user?.role === 'coordinator'

  const fetch = async () => {
    try {
      const { data } = await api.get('/campus/announcements')
      setAnnouncements(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetch() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      const payload = { ...form }
      if (!payload.target_role) delete payload.target_role
      if (!payload.expires_at) delete payload.expires_at
      await api.post('/campus/announcements', payload)
      setSuccess('Announcement created')
      setShowForm(false)
      setForm({ title: '', content: '', category: 'general', target_role: '', expires_at: '' })
      fetch()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create announcement')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Announcements</h1>
            <p>Stay updated with the latest news</p>
          </div>
          {isCoordinator && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <FiPlus size={16} /> New Announcement
            </button>
          )}
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isCoordinator && (
        <div className="card">
          <h3>Create Announcement</h3>
          <form onSubmit={handleAdd} style={{ marginTop: 16 }}>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Content</label><textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required /></div>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  <option value="general">General</option>
                  <option value="orientation">Orientation</option>
                  <option value="workshop">Workshop</option>
                  <option value="holiday">Holiday</option>
                  <option value="notice">Notice</option>
                </select>
              </div>
              <div className="form-group">
                <label>Target Role</label>
                <select value={form.target_role} onChange={(e) => setForm({ ...form, target_role: e.target.value })}>
                  <option value="">All Roles</option>
                  <option value="intern">Intern</option>
                  <option value="coordinator">Coordinator</option>
                </select>
              </div>
              <div className="form-group">
                <label>Expires At</label>
                <input type="date" value={form.expires_at} onChange={(e) => setForm({ ...form, expires_at: e.target.value })} />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit">Publish</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="card"><div className="empty-state"><FiVolume2 size={40} /><h3>No announcements yet</h3></div></div>
      ) : (
        announcements.map(a => (
          <div key={a.id || a._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 18 }}>{a.title}</h3>
                <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 4 }}>
                  {a.created_at ? new Date(a.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : ''}
                </div>
              </div>
              <span className={`badge badge-${a.category || 'general'}`}>{a.category || 'general'}</span>
            </div>
            <p style={{ marginTop: 12, color: '#4a5568', lineHeight: 1.7 }}>{a.content}</p>
            <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#a0aec0', marginTop: 8 }}>
              {a.target_role && <span>For: <span style={{ textTransform: 'capitalize' }}>{a.target_role}s</span></span>}
              {a.expires_at && <span>Expires: {new Date(a.expires_at).toLocaleDateString()}</span>}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
