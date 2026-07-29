import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { FiUserPlus } from 'react-icons/fi'

export default function GuideAssignment() {
  const [interns, setInterns] = useState([])
  const [assignments, setAssignments] = useState([])
  const [selectedGuide, setSelectedGuide] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const fetchData = async () => {
    try {
      const { data } = await api.get('/interns/')
      setInterns(data.filter(i => !i.guide_id))
      setAssignments(data.filter(i => i.guide_id))
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchData() }, [])

  const handleAssign = async (internId) => {
    const guideId = selectedGuide[internId]
    if (!guideId) { setError('Please enter a guide ID'); return }
    setError(''); setSuccess('')
    try {
      await api.post('/guide/assign', { intern_id: internId, guide_id: guideId })
      setSuccess('Guide assigned successfully')
      fetchData()
    } catch (err) {
      setError(err.response?.data?.detail || 'Assignment failed')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Guide Assignment</h1>
        <p>Assign guides to interns for mentoring</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h3>Unassigned Interns</h3>
        {interns.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}><h3>All interns have been assigned</h3></div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead><tr><th>Name</th><th>College</th><th>Stage</th><th>Guide ID</th><th>Action</th></tr></thead>
              <tbody>
                {interns.map(i => (
                  <tr key={i.id || i._id}>
                    <td>{i.user?.name || i.name || 'N/A'}</td>
                    <td>{i.college || '-'}</td>
                    <td><span className="badge badge-info">{i.current_stage}</span></td>
                    <td>
                      <input
                        placeholder="Enter guide user ID"
                        value={selectedGuide[i.id || i._id] || ''}
                        onChange={(e) => setSelectedGuide({ ...selectedGuide, [i.id || i._id]: e.target.value })}
                        style={{ width: 180, padding: '6px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13 }}
                      />
                    </td>
                    <td>
                      <button className="btn btn-primary btn-sm" onClick={() => handleAssign(i.id || i._id)}>
                        <FiUserPlus size={14} /> Assign
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card">
        <h3>Current Assignments</h3>
        {assignments.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}><h3>No assignments yet</h3></div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead><tr><th>Intern</th><th>College</th><th>Stage</th><th>Guide ID</th></tr></thead>
              <tbody>
                {assignments.map(i => (
                  <tr key={i.id || i._id}>
                    <td>{i.user?.name || i.name || 'N/A'}</td>
                    <td>{i.college || '-'}</td>
                    <td><span className="badge badge-info">{i.current_stage}</span></td>
                    <td>{i.guide_id}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
