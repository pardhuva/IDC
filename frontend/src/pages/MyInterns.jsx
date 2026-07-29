import { useEffect, useState } from 'react'
import { api } from '../api.js'
import { FiUser } from 'react-icons/fi'

export default function MyInterns() {
  const [interns, setInterns] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    api.get('/guide/my-interns')
      .then(({ data }) => setInterns(data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>My Interns</h1>
        <p>View and manage your assigned interns</p>
      </div>

      {interns.length === 0 ? (
        <div className="card"><div className="empty-state"><FiUser size={40} /><h3>No interns assigned yet</h3><p>Interns will appear here once assigned by the coordinator</p></div></div>
      ) : (
        <div className="grid grid-2">
          {interns.map(i => (
            <div key={i.id || i._id} className="card" style={{ cursor: 'pointer' }} onClick={() => setSelected(selected === (i.id || i._id) ? null : (i.id || i._id))}>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#FF671F', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 18, flexShrink: 0 }}>
                  {(i.user?.name || i.name || '?')[0].toUpperCase()}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: 16, marginBottom: 2 }}>{i.user?.name || i.name || 'N/A'}</h3>
                  <div style={{ fontSize: 13, color: '#718096' }}>{i.user?.email || i.email || ''}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <span className="badge badge-info">{i.current_stage || 'N/A'}</span>
                    {i.college && <span style={{ fontSize: 12, color: '#a0aec0' }}>{i.college}</span>}
                  </div>
                </div>
              </div>

              {selected === (i.id || i._id) && (
                <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #edf2f7' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, fontSize: 14 }}>
                    <div><strong>Department:</strong> {i.department || '-'}</div>
                    <div><strong>Phone:</strong> {i.phone || '-'}</div>
                    <div><strong>Duration:</strong> {i.duration || '-'}</div>
                    <div><strong>Joined:</strong> {i.joining_date ? new Date(i.joining_date).toLocaleDateString() : '-'}</div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
