import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiPhone, FiMail, FiPlus, FiUsers, FiUser } from 'react-icons/fi'

const CATEGORY_COLORS = {
  coordinator: '#003580',
  hr: '#805ad5',
  helpdesk: '#d69e2e',
  it_support: '#38a169',
  security: '#e53e3e',
}

const CATEGORY_LABELS = {
  coordinator: 'Coordinator',
  hr: 'HR',
  helpdesk: 'Helpdesk',
  it_support: 'IT Support',
  security: 'Security',
}

function AddContactForm({ onCreated }) {
  const [form, setForm] = useState({ name: '', designation: '', department: '', phone: '', email: '', category: 'helpdesk' })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [open, setOpen] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.email.trim()) { setError('Name and email are required'); return }
    setLoading(true)
    setError('')
    try {
      await api.post('/campus/contacts', form)
      setForm({ name: '', designation: '', department: '', phone: '', email: '', category: 'helpdesk' })
      setOpen(false)
      onCreated()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add contact')
    } finally {
      setLoading(false)
    }
  }

  if (!open) {
    return (
      <button className="btn btn-primary" onClick={() => setOpen(true)} style={{ marginBottom: 16 }}>
        <FiPlus size={16} /> Add Contact
      </button>
    )
  }

  return (
    <div className="card" style={{ marginBottom: 16 }}>
      <h3>Add Contact</h3>
      {error && <div className="alert alert-error">{error}</div>}
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Name</label>
            <input className="form-control" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Full name" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Category</label>
            <select className="form-control" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
              {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Designation</label>
            <input className="form-control" value={form.designation} onChange={e => setForm({ ...form, designation: e.target.value })} placeholder="e.g. Senior Manager" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Department</label>
            <input className="form-control" value={form.department} onChange={e => setForm({ ...form, department: e.target.value })} placeholder="e.g. Human Resources" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Phone</label>
            <input className="form-control" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Email</label>
            <input className="form-control" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="email@company.com" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Adding...' : 'Add Contact'}</button>
          <button type="button" className="btn btn-ghost" onClick={() => setOpen(false)}>Cancel</button>
        </div>
      </form>
    </div>
  )
}

export default function Contacts() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const fetchContacts = () => {
    setLoading(true)
    api.get('/campus/contacts')
      .then(({ data }) => setContacts(Array.isArray(data) ? data : []))
      .catch(err => setError(err.response?.data?.detail || 'Failed to load contacts'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchContacts() }, [])

  const isCoordinator = user?.role === 'coordinator'

  const grouped = contacts.reduce((acc, c) => {
    const cat = c.category || 'helpdesk'
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(c)
    return acc
  }, {})

  return (
    <div>
      <div className="page-header">
        <h1><FiUsers style={{ marginRight: 8 }} />Campus Contacts</h1>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {isCoordinator && <AddContactForm onCreated={fetchContacts} />}

      {loading ? (
        <div className="loading"><div className="spinner" /></div>
      ) : contacts.length === 0 ? (
        <div className="card">
          <div className="empty-state">
            <FiUsers size={40} color="#a0aec0" />
            <h3>No contacts available</h3>
          </div>
        </div>
      ) : (
        Object.entries(grouped).map(([category, items]) => (
          <div key={category} style={{ marginBottom: 24 }}>
            <h3 style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 12,
              color: CATEGORY_COLORS[category] || '#4a5568',
            }}>
              <span style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                background: CATEGORY_COLORS[category] || '#a0aec0',
                display: 'inline-block',
              }} />
              {CATEGORY_LABELS[category] || category}
            </h3>
            <div className="grid grid-3">
              {items.map(contact => (
                <div key={contact.id || contact._id} className="card">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: CATEGORY_COLORS[category] || '#a0aec0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      fontSize: 16,
                      fontWeight: 600,
                    }}>
                      {(contact.name || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <strong style={{ fontSize: 14 }}>{contact.name}</strong>
                      {contact.designation && (
                        <div style={{ fontSize: 12, color: '#718096' }}>{contact.designation}</div>
                      )}
                    </div>
                  </div>
                  {contact.department && (
                    <div style={{ fontSize: 13, color: '#4a5568', marginBottom: 8 }}>
                      <FiUser size={12} style={{ marginRight: 4 }} />{contact.department}
                    </div>
                  )}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                    {contact.phone && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiPhone size={12} color="#718096" />
                        <a href={`tel:${contact.phone}`} style={{ color: '#003580' }}>{contact.phone}</a>
                      </div>
                    )}
                    {contact.email && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <FiMail size={12} color="#718096" />
                        <a href={`mailto:${contact.email}`} style={{ color: '#003580' }}>{contact.email}</a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  )
}
