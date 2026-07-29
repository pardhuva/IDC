import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiGlobe, FiStar, FiBookOpen, FiAward, FiTarget, FiPlus, FiChevronDown, FiChevronUp } from 'react-icons/fi'

const STATUS_COLORS = { completed: '#38a169', ongoing: '#003580', upcoming: '#d69e2e' }

const ACHIEVEMENTS = [
  { title: 'Chandrayaan-3', desc: 'India\'s successful lunar landing mission, making India the 4th country to land on the Moon and 1st to land near the south pole.', status: 'completed', year: 'Aug 2023', color: '#003580' },
  { title: 'Mars Orbiter Mission', desc: 'India\'s first interplanetary mission and the first to succeed on its maiden attempt. Operated for 8 years beyond its 6-month design life.', status: 'completed', year: '2014', color: '#e53e3e' },
  { title: 'Gaganyaan', desc: 'India\'s first human spaceflight program, aiming to send Indian astronauts to space aboard an indigenous spacecraft.', status: 'upcoming', year: 'Upcoming', color: '#805ad5' },
  { title: 'PSLV', desc: 'The workhorse of ISRO with 50+ successful launches. Known for its reliability and versatility in deploying satellites.', status: 'completed', year: '50+ Launches', color: '#38a169' },
  { title: 'Aditya-L1', desc: 'India\'s first space-based solar observatory, positioned at the L1 Lagrange point to study the Sun\'s corona and solar wind.', status: 'completed', year: '2023', color: '#d69e2e' },
  { title: 'NavIC', desc: 'India\'s regional navigation satellite system providing accurate position information over India and surrounding regions.', status: 'ongoing', year: 'Operational', color: '#003580' },
]

const STATS = [
  { num: '100+', label: 'Missions' },
  { num: '50+', label: 'Satellites' },
  { num: '3', label: 'Launch Vehicles' },
  { num: '1969', label: 'Established' },
]

export default function AboutISRO() {
  const { user } = useAuth()
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', content: '', category: 'general' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCoordinator = user?.role === 'coordinator'

  useEffect(() => {
    api.get('/articles/').then(r => setArticles(r.data)).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleAddArticle = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/articles/', form)
      setSuccess('Article added successfully')
      setShowForm(false)
      setForm({ title: '', content: '', category: 'general' })
      const { data } = await api.get('/articles/')
      setArticles(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add article')
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: 'linear-gradient(135deg, #1a365d 0%, #2c5282 40%, #2b6cb0 70%, #003580 100%)',
        borderRadius: 16, padding: '48px 40px', color: '#fff', marginBottom: 32,
        boxShadow: '0 12px 40px rgba(26,54,93,0.3)', position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -60, right: 100, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.03)' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <FiGlobe size={32} />
            <span style={{ fontSize: 14, textTransform: 'uppercase', letterSpacing: 2, opacity: 0.8 }}>Indian Space Research Organisation</span>
          </div>
          <h1 style={{ fontSize: 36, fontWeight: 800, margin: '0 0 12px' }}>About ISRO</h1>
          <p style={{ fontSize: 18, opacity: 0.9, maxWidth: 600, lineHeight: 1.6 }}>
            Exploring the Universe for the benefit of humanity — pioneering space technology and advancing scientific knowledge since 1969.
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        {STATS.map(s => (
          <div key={s.label} className="card" style={{ textAlign: 'center', padding: '24px 16px' }}>
            <div style={{ fontSize: 36, fontWeight: 800, color: '#003580', lineHeight: 1 }}>{s.num}</div>
            <div style={{ fontSize: 14, color: '#718096', marginTop: 8, fontWeight: 500 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Key Achievements */}
      <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2d3748', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiAward size={22} color="#d69e2e" /> Key Achievements
      </h2>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, marginBottom: 40 }}>
        {ACHIEVEMENTS.map(a => (
          <div key={a.title} className="card" style={{ borderTop: `4px solid ${a.color}`, padding: 24, position: 'relative' }}>
            <span style={{
              position: 'absolute', top: 16, right: 16,
              background: `${STATUS_COLORS[a.status]}15`, color: STATUS_COLORS[a.status],
              padding: '3px 10px', borderRadius: 10, fontSize: 11, fontWeight: 600, textTransform: 'uppercase'
            }}>
              {a.status}
            </span>
            <h3 style={{ margin: '0 0 4px', fontSize: 18, fontWeight: 700, color: '#2d3748' }}>{a.title}</h3>
            <div style={{ fontSize: 12, color: '#718096', marginBottom: 10, fontWeight: 500 }}>{a.year}</div>
            <p style={{ margin: 0, fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>{a.desc}</p>
          </div>
        ))}
      </div>

      {/* Our Vision */}
      <div style={{
        background: 'linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%)',
        borderRadius: 16, padding: 32, marginBottom: 40,
        borderLeft: '4px solid #003580'
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 700, color: '#2d3748', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiTarget size={20} color="#003580" /> Our Vision
        </h2>
        <p style={{ fontSize: 16, color: '#4a5568', lineHeight: 1.8, margin: 0 }}>
          "Harness space technology for national development while pursuing space science research and planetary exploration."
          ISRO envisions using space technology for the development of society and the nation, while advancing scientific knowledge through space research.
          From launching affordable satellites to ambitious interplanetary missions, ISRO continues to push boundaries with innovation and excellence.
        </p>
      </div>

      {/* Articles Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2 style={{ fontSize: 22, fontWeight: 700, color: '#2d3748', display: 'flex', alignItems: 'center', gap: 8, margin: 0 }}>
          <FiBookOpen size={20} color="#003580" /> Articles & Resources
        </h2>
        {isCoordinator && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            <FiPlus size={14} /> Add Article
          </button>
        )}
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isCoordinator && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3>Add New Article</h3>
          <form onSubmit={handleAddArticle} style={{ marginTop: 16 }}>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Content</label><textarea value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} required rows={4} /></div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option value="general">General</option>
                <option value="mission">Mission</option>
                <option value="technology">Technology</option>
                <option value="research">Research</option>
                <option value="history">History</option>
              </select>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit" className="btn btn-primary">Publish Article</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : articles.length === 0 ? (
        <div className="empty-state">
          <FiBookOpen size={48} />
          <h3>No articles yet</h3>
          <p>Articles and resources will appear here</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {articles.map((a, i) => (
            <div key={a.id || i} className="card" style={{ padding: 20 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#2d3748' }}>{a.title}</h3>
                    {a.category && (
                      <span className="badge badge-info" style={{ fontSize: 11 }}>{a.category}</span>
                    )}
                  </div>
                  <p style={{ margin: 0, fontSize: 14, color: '#4a5568', lineHeight: 1.6 }}>
                    {expanded === (a.id || i) ? a.content : (a.content?.slice(0, 200) + (a.content?.length > 200 ? '...' : ''))}
                  </p>
                </div>
                {a.content?.length > 200 && (
                  <button
                    onClick={() => setExpanded(expanded === (a.id || i) ? null : (a.id || i))}
                    style={{ background: 'none', border: 'none', color: '#003580', cursor: 'pointer', fontSize: 13, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, marginLeft: 12 }}
                  >
                    {expanded === (a.id || i) ? <><FiChevronUp size={14} /> Less</> : <><FiChevronDown size={14} /> Read more</>}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
