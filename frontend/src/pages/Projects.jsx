import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiPlus, FiBriefcase, FiTarget, FiUserPlus } from 'react-icons/fi'

export default function Projects() {
  const { user } = useAuth()
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', objectives: '', milestones: '', tech_stack: '' })
  const [assignInternId, setAssignInternId] = useState({})
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isGuide = user?.role === 'guide'

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects/')
      setProjects(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchProjects() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/projects/', form)
      setSuccess('Project created')
      setShowForm(false)
      setForm({ title: '', description: '', objectives: '', milestones: '', tech_stack: '' })
      fetchProjects()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create project')
    }
  }

  const handleAssign = async (projectId) => {
    const internId = assignInternId[projectId]
    if (!internId) { setError('Enter intern ID'); return }
    setError(''); setSuccess('')
    try {
      await api.put(`/projects/${projectId}/assign/${internId}`)
      setSuccess('Intern assigned to project')
      fetchProjects()
    } catch (err) {
      setError(err.response?.data?.detail || 'Assignment failed')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Projects</h1>
            <p>{isGuide ? 'Create and manage intern projects' : 'View your assigned project'}</p>
          </div>
          {isGuide && (
            <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
              <FiPlus size={16} /> New Project
            </button>
          )}
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isGuide && (
        <div className="card">
          <h3>Create New Project</h3>
          <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required /></div>
            <div className="grid grid-2">
              <div className="form-group"><label>Objectives</label><textarea value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} placeholder="One per line" /></div>
              <div className="form-group"><label>Milestones</label><textarea value={form.milestones} onChange={(e) => setForm({ ...form, milestones: e.target.value })} placeholder="One per line" /></div>
            </div>
            <div className="form-group"><label>Tech Stack</label><input value={form.tech_stack} onChange={(e) => setForm({ ...form, tech_stack: e.target.value })} placeholder="e.g. Python, FastAPI, React" /></div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit">Create Project</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {projects.length === 0 ? (
        <div className="card"><div className="empty-state"><FiBriefcase size={40} /><h3>No projects yet</h3><p>{isGuide ? 'Create your first project' : 'No project assigned yet'}</p></div></div>
      ) : (
        projects.map(p => (
          <div key={p.id || p._id} className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h3 style={{ fontSize: 18 }}>{p.title}</h3>
                {p.tech_stack && <div style={{ fontSize: 13, color: '#718096', marginTop: 4 }}>{p.tech_stack}</div>}
              </div>
              <span className={`badge badge-${p.status || 'info'}`}>{p.status || 'active'}</span>
            </div>
            <p style={{ marginTop: 12, color: '#4a5568' }}>{p.description}</p>

            {p.objectives && (
              <div style={{ marginTop: 16 }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}><FiTarget size={14} /> Objectives</h4>
                <p style={{ fontSize: 14, color: '#4a5568', whiteSpace: 'pre-line' }}>{p.objectives}</p>
              </div>
            )}

            {p.milestones && (
              <div style={{ marginTop: 12 }}>
                <h4 style={{ fontSize: 14, marginBottom: 8 }}>Milestones</h4>
                <p style={{ fontSize: 14, color: '#4a5568', whiteSpace: 'pre-line' }}>{p.milestones}</p>
              </div>
            )}

            {isGuide && (
              <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #edf2f7', display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  placeholder="Intern user ID"
                  value={assignInternId[p.id || p._id] || ''}
                  onChange={(e) => setAssignInternId({ ...assignInternId, [p.id || p._id]: e.target.value })}
                  style={{ padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, width: 180 }}
                />
                <button className="btn btn-success btn-sm" onClick={() => handleAssign(p.id || p._id)}>
                  <FiUserPlus size={14} /> Assign Intern
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
