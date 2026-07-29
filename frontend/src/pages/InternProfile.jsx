import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'

export default function InternProfile() {
  const { user } = useAuth()
  const [profile, setProfile] = useState(null)
  const [allInterns, setAllInterns] = useState([])
  const [form, setForm] = useState({ phone: '', college: '', department: '', joining_date: '', internship_duration_months: '', emergency_contact_name: '', emergency_contact_phone: '', blood_group: '', accommodation_type: '' })
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCoordinator = user?.role === 'coordinator'

  useEffect(() => {
    if (isCoordinator) {
      api.get('/interns/').then(({ data }) => setAllInterns(data)).catch(() => {}).finally(() => setLoading(false))
    } else {
      api.get('/interns/me').then(({ data }) => {
        setProfile(data)
        setForm({ phone: data.phone || '', college: data.college || '', department: data.department || '', joining_date: data.joining_date?.split('T')[0] || '', internship_duration_months: data.internship_duration_months || '', emergency_contact_name: data.emergency_contact_name || '', emergency_contact_phone: data.emergency_contact_phone || '', blood_group: data.blood_group || '', accommodation_type: data.accommodation_type || '' })
      }).catch((err) => {
        if (err.response?.status === 404) setEditing(true)
      }).finally(() => setLoading(false))
    }
  }, [isCoordinator])

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    const payload = { ...form, internship_duration_months: form.internship_duration_months ? parseInt(form.internship_duration_months, 10) : null }
    try {
      if (profile) {
        const { data } = await api.put('/interns/me', payload)
        setProfile(data)
        setSuccess('Profile updated successfully')
      } else {
        const { data } = await api.post('/interns/', payload)
        setProfile(data)
        setSuccess('Profile created successfully')
      }
      setEditing(false)
    } catch (err) {
      const detail = err.response?.data?.detail
      setError(typeof detail === 'string' ? detail : Array.isArray(detail) ? detail.map(e => e.msg).join(', ') : 'Failed to save profile')
    }
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  if (isCoordinator) {
    return (
      <div>
        <div className="page-header"><h1>All Interns</h1><p>Overview of all registered interns</p></div>
        <div className="card">
          {allInterns.length === 0 ? <div className="empty-state"><h3>No interns registered yet</h3></div> :
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>College</th><th>Department</th><th>Stage</th><th>Joined</th></tr></thead>
                <tbody>
                  {allInterns.map(i => (
                    <tr key={i.id || i._id}>
                      <td>{i.user?.name || i.name || 'N/A'}</td>
                      <td>{i.user?.email || i.email || 'N/A'}</td>
                      <td>{i.college || '-'}</td>
                      <td>{i.department || '-'}</td>
                      <td><span className="badge badge-info">{i.current_stage || 'N/A'}</span></td>
                      <td>{i.joining_date ? new Date(i.joining_date).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          }
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your intern profile information</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {profile && !editing ? (
        <div className="card">
          <div className="card-header">
            <h3>Profile Details</h3>
            <button className="btn btn-secondary btn-sm" onClick={() => setEditing(true)}>Edit</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div><strong>Name:</strong> {user?.name}</div>
            <div><strong>Email:</strong> {user?.email}</div>
            <div><strong>Phone:</strong> {profile.phone || '-'}</div>
            <div><strong>College:</strong> {profile.college || '-'}</div>
            <div><strong>Department:</strong> {profile.department || '-'}</div>
            <div><strong>Joining Date:</strong> {profile.joining_date ? new Date(profile.joining_date).toLocaleDateString() : '-'}</div>
            <div><strong>Duration:</strong> {profile.internship_duration_months ? `${profile.internship_duration_months} ${profile.internship_duration_months === 1 ? 'month' : 'months'}` : '-'}</div>
            <div><strong>Current Stage:</strong> <span className="badge badge-info">{profile.current_stage}</span></div>
            <div><strong>Blood Group:</strong> {profile.blood_group || '-'}</div>
            <div><strong>Accommodation:</strong> {profile.accommodation_type ? profile.accommodation_type.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase()) : '-'}</div>
            <div><strong>Emergency Contact:</strong> {profile.emergency_contact_name || '-'}</div>
            <div><strong>Emergency Phone:</strong> {profile.emergency_contact_phone || '-'}</div>
          </div>
        </div>
      ) : (
        <div className="card">
          <h3>{profile ? 'Edit Profile' : 'Create Your Profile'}</h3>
          <form onSubmit={submit} style={{ marginTop: 16 }}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Phone</label>
                <input value={form.phone} onChange={update('phone')} placeholder="1234567890" />
              </div>
              <div className="form-group">
                <label>College</label>
                <input value={form.college} onChange={update('college')} placeholder="Your college name" required />
              </div>
              <div className="form-group">
                <label>Department</label>
                <input value={form.department} onChange={update('department')} placeholder="e.g. Computer Science" required />
              </div>
              <div className="form-group">
                <label>Joining Date</label>
                <input type="date" value={form.joining_date} onChange={update('joining_date')} required />
              </div>
              <div className="form-group">
                <label>Duration (months)</label>
                <input type="number" value={form.internship_duration_months} onChange={update('internship_duration_months')} placeholder="e.g. 6" />
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select value={form.blood_group} onChange={update('blood_group')}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div className="form-group">
                <label>Accommodation Type</label>
                <select value={form.accommodation_type} onChange={update('accommodation_type')}>
                  <option value="">Select Accommodation</option>
                  <option value="hostel">Hostel</option>
                  <option value="day_scholar">Day Scholar</option>
                </select>
              </div>
            </div>
            <h4 style={{ marginTop: 16, marginBottom: 8 }}>Emergency Contact</h4>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Contact Name</label>
                <input value={form.emergency_contact_name} onChange={update('emergency_contact_name')} placeholder="Emergency contact name" />
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input value={form.emergency_contact_phone} onChange={update('emergency_contact_phone')} placeholder="Emergency contact phone" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit">{profile ? 'Update Profile' : 'Create Profile'}</button>
              {profile && <button type="button" className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>}
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
