import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiPlus, FiClock, FiCalendar } from 'react-icons/fi'

const STATUSES = ['pending', 'in_progress', 'completed']
const STATUS_LABELS = { pending: 'Pending', in_progress: 'In Progress', completed: 'Completed' }

export default function Tasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ title: '', description: '', project_id: '', due_date: '', priority: 'medium' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isGuide = user?.role === 'guide'

  useEffect(() => {
    api.get('/projects/').then(({ data }) => {
      setProjects(data)
      if (data.length > 0) {
        setSelectedProject(data[0].id || data[0]._id)
        setForm(f => ({ ...f, project_id: data[0].id || data[0]._id }))
      }
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (selectedProject) {
      setLoading(true)
      api.get(`/tasks/project/${selectedProject}`)
        .then(({ data }) => setTasks(data))
        .catch(() => setTasks([]))
        .finally(() => setLoading(false))
    }
  }, [selectedProject])

  const handleCreate = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/tasks/', { ...form, project_id: selectedProject })
      setSuccess('Task created')
      setShowForm(false)
      setForm({ title: '', description: '', project_id: selectedProject, due_date: '', priority: 'medium' })
      const { data } = await api.get(`/tasks/project/${selectedProject}`)
      setTasks(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create task')
    }
  }

  const updateStatus = async (taskId, status) => {
    setError(''); setSuccess('')
    try {
      await api.put(`/tasks/${taskId}`, { status })
      setSuccess('Task updated')
      const { data } = await api.get(`/tasks/project/${selectedProject}`)
      setTasks(data)
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to update task')
    }
  }

  const grouped = {
    pending: tasks.filter(t => t.status === 'pending'),
    in_progress: tasks.filter(t => t.status === 'in_progress'),
    completed: tasks.filter(t => t.status === 'completed'),
  }

  return (
    <div>
      <div className="page-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Tasks</h1>
            <p>Track project tasks and progress</p>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {projects.length > 0 && (
              <select
                value={selectedProject}
                onChange={(e) => setSelectedProject(e.target.value)}
                style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
              >
                {projects.map(p => (
                  <option key={p.id || p._id} value={p.id || p._id}>{p.title}</option>
                ))}
              </select>
            )}
            {isGuide && (
              <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
                <FiPlus size={16} /> Add Task
              </button>
            )}
          </div>
        </div>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {showForm && isGuide && (
        <div className="card">
          <h3>Create New Task</h3>
          <form onSubmit={handleCreate} style={{ marginTop: 16 }}>
            <div className="form-group"><label>Title</label><input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required /></div>
            <div className="form-group"><label>Description</label><textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit">Create Task</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="loading"><div className="spinner" /></div> : (
        projects.length === 0 ? (
          <div className="card"><div className="empty-state"><h3>No projects found</h3><p>Tasks are organized by project</p></div></div>
        ) : (
          <div className="kanban">
            {STATUSES.map(status => (
              <div key={status} className="kanban-col">
                <div className="kanban-col-title">
                  {STATUS_LABELS[status]}
                  <span className="kanban-col-count">{grouped[status].length}</span>
                </div>
                {grouped[status].length === 0 ? (
                  <div style={{ textAlign: 'center', padding: 24, color: '#a0aec0', fontSize: 13 }}>No tasks</div>
                ) : (
                  grouped[status].map(t => (
                    <div key={t.id || t._id} className="kanban-card">
                      <h4>{t.title}</h4>
                      {t.description && <p>{t.description}</p>}
                      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        {t.priority && <span className={`badge badge-${t.priority}`}>{t.priority}</span>}
                        {t.due_date && (
                          <span style={{ fontSize: 11, color: '#718096', display: 'flex', alignItems: 'center', gap: 4 }}>
                            <FiCalendar size={10} /> {new Date(t.due_date).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      {status !== 'completed' && (
                        <div style={{ marginTop: 10 }}>
                          {status === 'pending' && (
                            <button className="btn btn-sm btn-primary" onClick={() => updateStatus(t.id || t._id, 'in_progress')}>
                              Start
                            </button>
                          )}
                          {status === 'in_progress' && (
                            <button className="btn btn-sm btn-success" onClick={() => updateStatus(t.id || t._id, 'completed')}>
                              Complete
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )
      )}
    </div>
  )
}
