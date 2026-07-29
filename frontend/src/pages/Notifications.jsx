import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { FiBell, FiCheckCircle, FiExternalLink } from 'react-icons/fi'

export default function Notifications() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [markingAll, setMarkingAll] = useState(false)

  const fetchNotifications = () => {
    setLoading(true)
    api.get('/notifications/')
      .then(({ data }) => setNotifications(Array.isArray(data) ? data : []))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load notifications'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchNotifications() }, [])

  const markRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications(prev => prev.map(n => (n.id || n._id) === id ? { ...n, is_read: true } : n))
    } catch { /* ignore */ }
  }

  const markAllRead = async () => {
    setMarkingAll(true)
    try {
      await api.put('/notifications/read-all')
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    } catch { /* ignore */ }
    finally { setMarkingAll(false) }
  }

  const unreadCount = notifications.filter(n => !n.is_read).length

  return (
    <div>
      <div className="page-header">
        <h1><FiBell style={{ marginRight: 8 }} />Notifications</h1>
        {unreadCount > 0 && (
          <button className="btn btn-ghost" onClick={markAllRead} disabled={markingAll}>
            <FiCheckCircle size={16} /> {markingAll ? 'Marking...' : `Mark All Read (${unreadCount})`}
          </button>
        )}
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : notifications.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiBell size={40} color="#a0aec0" />
            <h3>No notifications</h3>
            <p>You're all caught up!</p>
          </div>
        </div>
      ) : (
        <div className="card">
          {notifications.map(n => {
            const id = n.id || n._id
            return (
              <div
                key={id}
                onClick={() => !n.is_read && markRead(id)}
                style={{
                  padding: '14px 16px',
                  borderBottom: '1px solid #edf2f7',
                  cursor: n.is_read ? 'default' : 'pointer',
                  background: n.is_read ? 'transparent' : '#ebf8ff',
                  fontWeight: n.is_read ? 'normal' : '600',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14 }}>{n.title || n.message}</div>
                  {n.title && n.message && (
                    <p style={{ fontSize: 13, color: '#718096', marginTop: 4, fontWeight: 'normal' }}>{n.message}</p>
                  )}
                  <div style={{ fontSize: 12, color: '#a0aec0', marginTop: 4, fontWeight: 'normal' }}>
                    {n.created_at ? new Date(n.created_at).toLocaleString() : ''}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                  {n.link && (
                    <a href={n.link} style={{ color: '#FF671F', fontSize: 13 }}>
                      <FiExternalLink size={14} />
                    </a>
                  )}
                  {!n.is_read && (
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF671F', display: 'inline-block' }} />
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
