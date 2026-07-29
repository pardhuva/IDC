import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiCalendar, FiMapPin, FiStar, FiPlus, FiClock } from 'react-icons/fi'

const TYPE_COLORS = {
  launch: '#e53e3e',
  seminar: '#003580',
  workshop: '#38a169',
  visit: '#805ad5',
  celebration: '#d69e2e',
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatTime(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
}

export default function Events() {
  const { user } = useAuth()
  const [events, setEvents] = useState([])
  const [upcoming, setUpcoming] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', event_type: 'seminar', location: '', event_date: '', is_featured: false })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCoordinator = user?.role === 'coordinator'

  const fetchEvents = async () => {
    try {
      const [allRes, upRes] = await Promise.all([
        api.get('/events/'),
        api.get('/events/upcoming'),
      ])
      setEvents(allRes.data)
      setUpcoming(upRes.data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchEvents() }, [])

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/events/', form)
      setSuccess('Event created successfully')
      setShowForm(false)
      setForm({ title: '', description: '', event_type: 'seminar', location: '', event_date: '', is_featured: false })
      fetchEvents()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create event')
    }
  }

  const featured = upcoming.filter(e => e.is_featured)
  const now = new Date()
  const pastEvents = events.filter(e => new Date(e.event_date) < now && !upcoming.some(u => u.id === e.id))

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Events</h1>
            <p>ISRO events, launches, seminars, and workshops</p>
          </div>
          {isCoordinator && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <FiPlus size={16} /> Add Event
            </button>
          )}
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isCoordinator && (
        <div className="card" style={{ marginBottom: 24 }}>
          <h3>Create New Event</h3>
          <form onSubmit={handleAdd} style={{ marginTop: 16 }}>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="grid grid-3">
              <div className="form-group">
                <label>Event Type</label>
                <select value={form.event_type} onChange={e => setForm({ ...form, event_type: e.target.value })}>
                  <option value="launch">Launch</option>
                  <option value="seminar">Seminar</option>
                  <option value="workshop">Workshop</option>
                  <option value="visit">Visit</option>
                  <option value="celebration">Celebration</option>
                </select>
              </div>
              <div className="form-group">
                <label>Location</label>
                <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input type="datetime-local" value={form.event_date} onChange={e => setForm({ ...form, event_date: e.target.value })} required />
              </div>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <input type="checkbox" id="featured" checked={form.is_featured} onChange={e => setForm({ ...form, is_featured: e.target.checked })} />
              <label htmlFor="featured" style={{ margin: 0 }}>Featured Event</label>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Create Event</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Featured Event Hero — show only the first one as hero */}
      {featured.length > 0 && (
        <div style={{ marginBottom: 32 }}>
          <div style={{
            background: 'linear-gradient(135deg, #002147 0%, #003580 50%, #004a99 100%)',
            borderRadius: 16, padding: 32, color: '#fff',
            boxShadow: '0 8px 32px rgba(0,53,128,0.3)', position: 'relative', overflow: 'hidden'
          }}>
            <div style={{ position: 'absolute', top: -30, right: -30, width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
            <div style={{ position: 'absolute', bottom: -50, right: 80, width: 240, height: 240, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
            <div style={{ position: 'absolute', top: 16, right: 16, display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 20, padding: '4px 12px', fontSize: 13 }}>
              <FiStar size={14} /> Featured
            </div>
            <span style={{ background: TYPE_COLORS[featured[0].event_type] || '#718096', padding: '4px 12px', borderRadius: 12, fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 }}>
              {featured[0].event_type}
            </span>
            <h2 style={{ margin: '12px 0 8px', fontSize: 28, fontWeight: 700 }}>{featured[0].title}</h2>
            <p style={{ opacity: 0.9, fontSize: 16, maxWidth: 600, lineHeight: 1.6 }}>{featured[0].description}</p>
            <div style={{ display: 'flex', gap: 24, marginTop: 16, fontSize: 14, opacity: 0.85 }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiCalendar size={14} /> {formatDate(featured[0].event_date)} at {formatTime(featured[0].event_date)}</span>
              {featured[0].location && <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><FiMapPin size={14} /> {featured[0].location}</span>}
            </div>
          </div>
          {/* Other featured events as compact cards */}
          {featured.length > 1 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginTop: 16 }}>
              {featured.slice(1).map(ev => (
                <div key={ev.id} style={{
                  background: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
                  borderRadius: 12, padding: 20, color: '#fff',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.15)', position: 'relative'
                }}>
                  <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', alignItems: 'center', gap: 4, background: 'rgba(255,255,255,0.15)', borderRadius: 16, padding: '2px 10px', fontSize: 11 }}>
                    <FiStar size={10} /> Featured
                  </div>
                  <span style={{ background: TYPE_COLORS[ev.event_type] || '#718096', padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {ev.event_type}
                  </span>
                  <h3 style={{ margin: '8px 0 6px', fontSize: 16, fontWeight: 700 }}>{ev.title}</h3>
                  <p style={{ opacity: 0.85, fontSize: 13, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{ev.description}</p>
                  <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, opacity: 0.75 }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiCalendar size={12} /> {formatDate(ev.event_date)}</span>
                    {ev.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} /> {ev.location}</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Upcoming Events */}
      <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 16 }}>Upcoming Events</h2>
      {upcoming.length === 0 ? (
        <div className="empty-state">
          <FiCalendar size={48} />
          <h3>No upcoming events</h3>
          <p>Check back later for new events</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
          {upcoming.filter(e => !e.is_featured).map(ev => (
            <div key={ev.id} className="card" style={{ borderLeft: `4px solid ${TYPE_COLORS[ev.event_type] || '#718096'}`, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
              <div style={{ background: `${TYPE_COLORS[ev.event_type] || '#718096'}15`, borderRadius: 12, padding: '12px 16px', textAlign: 'center', minWidth: 70 }}>
                <div style={{ fontSize: 24, fontWeight: 700, color: TYPE_COLORS[ev.event_type] || '#718096' }}>{new Date(ev.event_date).getDate()}</div>
                <div style={{ fontSize: 12, color: '#718096', textTransform: 'uppercase' }}>{new Date(ev.event_date).toLocaleDateString('en-IN', { month: 'short' })}</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{ev.title}</h3>
                  <span style={{ background: TYPE_COLORS[ev.event_type] || '#718096', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 600, textTransform: 'uppercase' }}>{ev.event_type}</span>
                </div>
                <p style={{ margin: '4px 0 8px', color: '#4a5568', fontSize: 14, lineHeight: 1.5 }}>{ev.description}</p>
                <div style={{ display: 'flex', gap: 16, fontSize: 13, color: '#718096' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiClock size={12} /> {formatTime(ev.event_date)}</span>
                  {ev.location && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><FiMapPin size={12} /> {ev.location}</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <>
          <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 16 }}>Past Events</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {pastEvents.map(ev => (
              <div key={ev.id} className="card" style={{ opacity: 0.7, borderLeft: `4px solid ${TYPE_COLORS[ev.event_type] || '#718096'}`, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ minWidth: 70, textAlign: 'center' }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: '#718096' }}>{formatDate(ev.event_date)}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#4a5568' }}>{ev.title}</h3>
                    <span style={{ background: '#e2e8f0', color: '#4a5568', padding: '2px 8px', borderRadius: 10, fontSize: 11 }}>{ev.event_type}</span>
                  </div>
                  {ev.location && <p style={{ margin: '4px 0 0', fontSize: 13, color: '#a0aec0' }}><FiMapPin size={11} style={{ marginRight: 4 }} />{ev.location}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
