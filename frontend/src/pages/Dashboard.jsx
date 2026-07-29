import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiFileText, FiCheckSquare, FiBook, FiUsers, FiAlertCircle, FiBell, FiArrowRight, FiCalendar, FiClock, FiSearch, FiTrendingUp, FiAward, FiBriefcase } from 'react-icons/fi'
import { Link, useNavigate } from 'react-router-dom'

const STAGES = [
  'registered', 'documents_uploaded', 'verified',
  'guide_assigned', 'project_allocated', 'active',
  'presentation', 'evaluation', 'completed'
]
const STAGE_LABELS = [
  'Registered', 'Docs Uploaded', 'Verified',
  'Guide Assigned', 'Project Allocated', 'Active',
  'Presentation', 'Evaluation', 'Completed'
]

function StageTimeline({ currentStage }) {
  const idx = STAGES.indexOf(currentStage)
  return (
    <div className="stage-timeline">
      {STAGES.map((s, i) => (
        <div key={s} className={`stage-step ${i < idx ? 'completed' : ''} ${i === idx ? 'current' : ''}`}>
          <span className="stage-dot">{i < idx ? '✓' : i + 1}</span>
          <span className="stage-label">{STAGE_LABELS[i]}</span>
        </div>
      ))}
    </div>
  )
}

function DurationTracker({ internProfile }) {
  if (!internProfile?.joining_date || !internProfile?.internship_duration_months) return null

  const joinDate = new Date(internProfile.joining_date)
  const today = new Date()
  const endDate = new Date(joinDate)
  endDate.setMonth(endDate.getMonth() + internProfile.internship_duration_months)

  const totalDays = Math.ceil((endDate - joinDate) / (1000 * 60 * 60 * 24))
  const daysDone = Math.max(0, Math.ceil((today - joinDate) / (1000 * 60 * 60 * 24)))
  const daysLeft = Math.max(0, Math.ceil((endDate - today) / (1000 * 60 * 60 * 24)))
  const progress = Math.min(100, Math.round((daysDone / totalDays) * 100))

  return (
    <div className="card">
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiCalendar size={18} /> Internship Duration
      </h3>
      <div style={{ display: 'flex', justifyContent: 'space-between', margin: '16px 0 8px' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#FF671F' }}>{daysDone}</div>
          <div style={{ fontSize: 12, color: '#718096' }}>Days Done</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: daysLeft <= 7 ? '#e53e3e' : '#38a169' }}>{daysLeft}</div>
          <div style={{ fontSize: 12, color: '#718096' }}>Days Left</div>
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: '#718096' }}>{totalDays}</div>
          <div style={{ fontSize: 12, color: '#718096' }}>Total Days</div>
        </div>
      </div>
      <div style={{ background: '#edf2f7', borderRadius: 8, height: 10, overflow: 'hidden', marginTop: 8 }}>
        <div style={{ width: `${progress}%`, height: '100%', background: progress >= 90 ? '#e53e3e' : '#FF671F', borderRadius: 8, transition: 'width 0.5s' }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#a0aec0', marginTop: 4 }}>
        <span>{joinDate.toLocaleDateString()}</span>
        <span>{progress}% complete</span>
        <span>{endDate.toLocaleDateString()}</span>
      </div>
    </div>
  )
}

function AISearchBar() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [intentResult, setIntentResult] = useState(null)
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const navigate = useNavigate()

  const handleSearch = async (e) => {
    e.preventDefault()
    if (!query.trim()) return
    setSearching(true)
    setShowResults(true)
    try {
      const [searchRes, intentRes] = await Promise.allSettled([
        api.get('/ai/search', { params: { q: query, top_k: 5 } }),
        api.post('/ai/classify-intent', { text: query }),
      ])
      if (searchRes.status === 'fulfilled') setResults(searchRes.value.data.results || [])
      if (intentRes.status === 'fulfilled') setIntentResult(intentRes.value.data)
    } catch { }
    setSearching(false)
  }

  const typeIcons = { office: '🏢', faq: '❓', contact: '👤', announcement: '📢' }
  const typeColors = { office: '#FF671F', faq: '#38a169', contact: '#d69e2e', announcement: '#805ad5' }

  return (
    <div className="card" style={{ borderLeft: '4px solid #805ad5' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <FiSearch size={18} /> AI-Powered Search
      </h3>
      <p style={{ fontSize: 13, color: '#718096', marginBottom: 12 }}>
        Ask anything — "where do I get my ID card", "lunch timings", "WiFi password"
      </p>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: 8 }}>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Ask me anything about campus..."
          style={{ flex: 1 }}
        />
        <button type="submit" disabled={searching} style={{ whiteSpace: 'nowrap' }}>
          {searching ? 'Searching...' : 'Search'}
        </button>
      </form>

      {showResults && (
        <div style={{ marginTop: 16 }}>
          {intentResult && intentResult.confidence > 0.4 && (
            <div style={{ padding: 12, background: '#f0fff4', borderRadius: 8, marginBottom: 12, borderLeft: '3px solid #38a169' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#276749' }}>
                Detected Intent: {intentResult.intent?.replace(/_/g, ' ')} ({Math.round(intentResult.confidence * 100)}%)
              </div>
              {intentResult.action?.message && (
                <div style={{ fontSize: 13, color: '#2f855a', marginTop: 4 }}>{intentResult.action.message}</div>
              )}
              {intentResult.action?.target && (
                <button
                  className="btn btn-sm"
                  style={{ marginTop: 8, background: '#38a169', color: '#fff', border: 'none' }}
                  onClick={() => navigate(intentResult.action.target)}
                >
                  Go to {intentResult.action.target.replace('/', '')}
                </button>
              )}
            </div>
          )}

          {results.length > 0 ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#4a5568', marginBottom: 8 }}>Search Results:</div>
              {results.map((r, i) => (
                <div key={i} style={{ padding: '10px 12px', borderBottom: '1px solid #edf2f7', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 20 }}>{typeIcons[r.type] || '📄'}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{r.title}</span>
                      <span className="badge" style={{ background: typeColors[r.type], color: '#fff', fontSize: 10 }}>{r.type}</span>
                      <span style={{ fontSize: 11, color: '#a0aec0', marginLeft: 'auto' }}>{Math.round(r.score * 100)}% match</span>
                    </div>
                    <div style={{ fontSize: 13, color: '#718096', marginTop: 2 }}>
                      {r.snippet?.length > 150 ? r.snippet.slice(0, 150) + '...' : r.snippet}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : !searching && (
            <div style={{ fontSize: 13, color: '#a0aec0', textAlign: 'center', padding: 16 }}>No results found</div>
          )}
        </div>
      )}
    </div>
  )
}

const GRADE_COLORS = { A: '#38a169', B: '#48bb78', C: '#d69e2e', D: '#e53e3e', F: '#c53030' }

function AIPerformanceCard() {
  const [perf, setPerf] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/ai/performance/me')
      .then(({ data }) => setPerf(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="card"><div className="spinner" style={{ margin: '16px auto' }} /></div>
  if (!perf) return null

  const score = perf.total_score ?? perf.score ?? 0
  const gradeColor = GRADE_COLORS[perf.grade?.[0]] || '#718096'
  const breakdown = perf.breakdown || perf.factors || {}

  return (
    <div className="card" style={{ borderLeft: '4px solid #805ad5' }}>
      <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <FiAward size={18} color="#805ad5" /> AI Performance Score
      </h3>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ position: 'relative', width: 90, height: 90 }}>
          <svg viewBox="0 0 36 36" style={{ width: 90, height: 90, transform: 'rotate(-90deg)' }}>
            <circle cx="18" cy="18" r="15.9" fill="none" stroke="#edf2f7" strokeWidth="3" />
            <circle cx="18" cy="18" r="15.9" fill="none" stroke={gradeColor} strokeWidth="3"
              strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontSize: 22, fontWeight: 800, color: gradeColor }}>{Math.round(score)}</span>
            <span style={{ fontSize: 11, color: '#718096' }}>{perf.grade}</span>
          </div>
        </div>
        <div style={{ flex: 1 }}>
          {Object.entries(breakdown).map(([key, f]) => {
            const fScore = f.weighted_score ?? f.score ?? 0
            const fMax = (f.weight ? f.weight * 100 : f.max) || 30
            return (
              <div key={key} style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#4a5568', marginBottom: 2 }}>
                  <span>{key.replace(/_/g, ' ')}</span>
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
        <div style={{ marginTop: 12, padding: '10px 12px', background: '#faf5ff', borderRadius: 8, fontSize: 13 }}>
          <strong style={{ color: '#805ad5' }}>AI Recommendations:</strong>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: '#4a5568' }}>
            {perf.recommendations.slice(0, 3).map((r, i) => <li key={i}>{r}</li>)}
          </ul>
        </div>
      )}
    </div>
  )
}

function getNextAction(stage) {
  const map = {
    registered: { text: 'Complete your profile and upload documents to proceed', link: '/profile', linkText: 'Go to Profile' },
    documents_uploaded: { text: 'Wait for document verification or contact coordinator', link: '/notifications', linkText: 'Check Notifications' },
    verified: { text: 'Documents verified! Complete your onboarding checklist', link: '/checklist', linkText: 'Start Checklist' },
    guide_assigned: { text: 'A guide has been assigned! Wait for project allocation', link: '/projects', linkText: 'View Project' },
    project_allocated: { text: 'Start working on your project tasks', link: '/tasks', linkText: 'View Tasks' },
    active: { text: 'Keep up the great work! Update your daily diary', link: '/diary', linkText: 'Write Diary' },
    presentation: { text: 'Prepare your final presentation and submit your report', link: '/reports', linkText: 'View Reports' },
    evaluation: { text: 'Your evaluation is in progress. Check for updates', link: '/notifications', linkText: 'Check Status' },
    completed: { text: 'Congratulations! Your internship is complete. Download your certificate', link: '/certificate', linkText: 'View Certificate' },
  }
  return map[stage] || map.registered
}

function InternDashboard({ user }) {
  const [stats, setStats] = useState({ docs: 0, diary: 0 })
  const [notifications, setNotifications] = useState([])
  const [internProfile, setInternProfile] = useState(null)
  const [guideName, setGuideName] = useState(null)
  const [projectTitle, setProjectTitle] = useState(null)

  useEffect(() => {
    Promise.allSettled([
      api.get('/documents/me'),
      api.get('/diary/me'),
      api.get('/notifications/'),
      api.get('/interns/me'),
      api.get('/guide/my-guide'),
      api.get('/projects/'),
    ]).then(([docs, diary, notifs, intern, guide, projects]) => {
      setStats({
        docs: docs.status === 'fulfilled' ? docs.value.data.length : 0,
        diary: diary.status === 'fulfilled' ? diary.value.data.length : 0,
      })
      if (notifs.status === 'fulfilled') setNotifications(notifs.value.data.slice(0, 5))
      if (intern.status === 'fulfilled') setInternProfile(intern.value.data)
      if (guide.status === 'fulfilled') setGuideName(guide.value.data?.name || guide.value.data?.user?.name || null)
      if (projects.status === 'fulfilled') {
        const projList = projects.value.data
        const proj = Array.isArray(projList) && projList.length > 0 ? projList[0] : null
        setProjectTitle(proj?.title || proj?.name || null)
      }
    })
  }, [])

  const stage = internProfile?.current_stage || 'registered'
  const next = getNextAction(stage)

  return (
    <>
      <div className="welcome-card">
        <h1>Welcome, {user.name}!</h1>
        <p>Your onboarding journey at a glance</p>
      </div>

      <div className="card" style={{ borderLeft: '4px solid #3182ce' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiUsers size={20} color="#3182ce" />
            <div>
              <div style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>Guide</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#2d3748' }}>{guideName || 'Not yet assigned'}</div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FiBriefcase size={20} color="#3182ce" />
            <div>
              <div style={{ fontSize: 12, color: '#718096', fontWeight: 600 }}>Project</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#2d3748' }}>{projectTitle || 'Not yet allocated'}</div>
            </div>
          </div>
        </div>
      </div>

      <AISearchBar />

      <div className="card">
        <h3>Your Progress</h3>
        <StageTimeline currentStage={stage} />
      </div>

      <DurationTracker internProfile={internProfile} />

      <div className="card" style={{ background: '#fff5eb', borderLeft: '4px solid #FF671F' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <FiArrowRight size={20} color="#FF671F" />
          <div>
            <strong>What to do next:</strong> {next.text}
            <div style={{ marginTop: 8 }}>
              <Link to={next.link} className="btn btn-primary btn-sm">{next.linkText}</Link>
            </div>
          </div>
        </div>
      </div>

      <AIPerformanceCard />

      <div className="grid grid-3">
        <div className="card stat-card">
          <FiFileText size={24} color="#FF671F" />
          <div className="stat-value">{stats.docs}</div>
          <div className="stat-label">Documents</div>
        </div>
        <div className="card stat-card">
          <FiBook size={24} color="#38a169" />
          <div className="stat-value">{stats.diary}</div>
          <div className="stat-label">Diary Entries</div>
        </div>
        <div className="card stat-card">
          <FiBell size={24} color="#d69e2e" />
          <div className="stat-value">{notifications.filter(n => !n.is_read).length}</div>
          <div className="stat-label">Unread Alerts</div>
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="card">
          <div className="card-header">
            <h3>Recent Notifications</h3>
            <Link to="/notifications" className="btn-ghost">View All</Link>
          </div>
          {notifications.map(n => (
            <div key={n.id} className={`notification-item ${!n.is_read ? 'unread' : ''}`}>
              <span className="notification-dot" />
              <div>
                <div style={{ fontSize: 14 }}>{n.message}</div>
                <div style={{ fontSize: 12, color: '#a0aec0' }}>{new Date(n.created_at).toLocaleDateString()}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}

function GuideDashboard({ user }) {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/guide/my-interns')
      .then(({ data }) => setInterns(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <div className="welcome-card">
        <h1>Welcome, {user.name}!</h1>
        <p>Guide Dashboard - Manage your interns</p>
      </div>

      <div className="grid grid-3">
        <div className="card stat-card">
          <FiUsers size={24} color="#FF671F" />
          <div className="stat-value">{interns.length}</div>
          <div className="stat-label">Assigned Interns</div>
        </div>
        <div className="card stat-card">
          <FiBook size={24} color="#d69e2e" />
          <div className="stat-value">-</div>
          <div className="stat-label">Pending Diary Reviews</div>
        </div>
        <div className="card stat-card">
          <FiFileText size={24} color="#38a169" />
          <div className="stat-value">-</div>
          <div className="stat-label">Pending Reports</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Assigned Interns</h3>
          <Link to="/my-interns" className="btn-ghost">View All</Link>
        </div>
        {loading ? <div className="loading"><div className="spinner" /></div> :
          interns.length === 0 ? <div className="empty-state"><h3>No interns assigned yet</h3></div> :
          <table>
            <thead><tr><th>Name</th><th>Stage</th><th>Email</th></tr></thead>
            <tbody>
              {interns.map(i => (
                <tr key={i.id}>
                  <td>{i.user?.name || i.name || 'N/A'}</td>
                  <td><span className="badge badge-info">{i.current_stage || 'N/A'}</span></td>
                  <td>{i.user?.email || i.email || 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>
    </>
  )
}

function CoordinatorDashboard({ user }) {
  const [interns, setInterns] = useState([])
  const [announcements, setAnnouncements] = useState([])

  useEffect(() => {
    Promise.allSettled([
      api.get('/interns/'),
      api.get('/campus/announcements'),
    ]).then(([i, a]) => {
      if (i.status === 'fulfilled') setInterns(i.value.data)
      if (a.status === 'fulfilled') setAnnouncements(a.value.data.slice(0, 3))
    })
  }, [])

  return (
    <>
      <div className="welcome-card">
        <h1>Welcome, {user.name}!</h1>
        <p>Coordinator Dashboard - Oversee the onboarding program</p>
      </div>

      <div className="grid grid-3">
        <div className="card stat-card">
          <FiUsers size={24} color="#FF671F" />
          <div className="stat-value">{interns.length}</div>
          <div className="stat-label">Total Interns</div>
        </div>
        <div className="card stat-card">
          <FiFileText size={24} color="#d69e2e" />
          <div className="stat-value">{interns.filter(i => i.current_stage === 'documents_uploaded').length}</div>
          <div className="stat-label">Pending Verification</div>
        </div>
        <div className="card stat-card">
          <FiAlertCircle size={24} color="#38a169" />
          <div className="stat-value">{announcements.length}</div>
          <div className="stat-label">Announcements</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Announcements</h3>
          <Link to="/announcements" className="btn-ghost">Manage</Link>
        </div>
        {announcements.length === 0 ? <div className="empty-state"><h3>No announcements yet</h3></div> :
          announcements.map(a => (
            <div key={a.id} style={{ padding: '12px 0', borderBottom: '1px solid #edf2f7' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong>{a.title}</strong>
                <span className={`badge badge-${a.category || 'general'}`}>{a.category || 'general'}</span>
              </div>
              <p style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>{a.content?.slice(0, 100)}</p>
            </div>
          ))
        }
      </div>
    </>
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  if (!user) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      {user.role === 'intern' && <InternDashboard user={user} />}
      {user.role === 'guide' && <GuideDashboard user={user} />}
      {user.role === 'coordinator' && <CoordinatorDashboard user={user} />}
    </div>
  )
}
