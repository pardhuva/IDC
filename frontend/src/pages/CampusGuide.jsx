import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiSearch, FiMapPin, FiClock, FiPhone, FiPlus, FiX, FiFileText, FiAlertCircle, FiNavigation, FiCornerDownRight } from 'react-icons/fi'

const CATEGORIES = ['All', 'Office', 'Facility', 'Service']

export default function CampusGuide() {
  const { user } = useAuth()
  const [offices, setOffices] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('All')
  const [selected, setSelected] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', building: '', category: 'Office', purpose: '', timings: '', contact_phone: '', contact_email: '', required_documents: '', entry_rules: '', restrictions: '', nearby_locations: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCoordinator = user?.role === 'coordinator'

  const fetchOffices = async () => {
    try {
      const { data } = await api.get('/campus/offices')
      setOffices(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchOffices() }, [])

  const updateForm = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/campus/offices', form)
      setSuccess('Office added successfully')
      setShowForm(false)
      setForm({ name: '', slug: '', building: '', category: 'Office', purpose: '', timings: '', contact_phone: '', contact_email: '', required_documents: '', entry_rules: '', restrictions: '', nearby_locations: '' })
      fetchOffices()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add office')
    }
  }

  const filtered = offices.filter(o => {
    const matchSearch = o.name?.toLowerCase().includes(search.toLowerCase()) || o.building?.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === 'All' || (o.category || '').toLowerCase() === category.toLowerCase()
    return matchSearch && matchCat
  })

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Campus Guide</h1>
        <p>Find offices, facilities, and important locations on campus</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="search-bar">
        <FiSearch size={18} color="#a0aec0" />
        <input placeholder="Search offices, buildings..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c}
          </button>
        ))}
        {isCoordinator && (
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowForm(!showForm)}>
            <FiPlus size={14} /> Add Office
          </button>
        )}
      </div>

      {showForm && isCoordinator && (
        <div className="card">
          <h3>Add New Office/Facility</h3>
          <form onSubmit={handleAdd} style={{ marginTop: 16 }}>
            <div className="grid grid-2">
              <div className="form-group"><label>Name</label><input value={form.name} onChange={updateForm('name')} required placeholder="e.g. HR Office" /></div>
              <div className="form-group"><label>Slug</label><input value={form.slug} onChange={updateForm('slug')} placeholder="unique-slug" required /></div>
              <div className="form-group"><label>Building</label><input value={form.building} onChange={updateForm('building')} placeholder="e.g. Block A" /></div>
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={updateForm('category')}>
                  {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group"><label>Timings</label><input value={form.timings} onChange={updateForm('timings')} placeholder="9 AM - 5 PM" /></div>
              <div className="form-group"><label>Contact Phone</label><input value={form.contact_phone} onChange={updateForm('contact_phone')} placeholder="Phone number" /></div>
              <div className="form-group"><label>Contact Email</label><input value={form.contact_email} onChange={updateForm('contact_email')} placeholder="Email address" /></div>
              <div className="form-group"><label>Required Documents</label><input value={form.required_documents} onChange={updateForm('required_documents')} placeholder="e.g. ID card, appointment letter" /></div>
              <div className="form-group"><label>Entry Rules</label><input value={form.entry_rules} onChange={updateForm('entry_rules')} /></div>
              <div className="form-group"><label>Restrictions</label><input value={form.restrictions} onChange={updateForm('restrictions')} /></div>
            </div>
            <div className="form-group"><label>Purpose</label><textarea value={form.purpose} onChange={updateForm('purpose')} placeholder="Describe the purpose..." /></div>
            <div className="form-group"><label>Nearby Locations</label><input value={form.nearby_locations} onChange={updateForm('nearby_locations')} placeholder="e.g. Cafeteria, Library" /></div>
            <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
              <button type="submit">Add Office</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card"><div className="empty-state"><FiMapPin size={40} /><h3>No offices found</h3><p>Try a different search or category</p></div></div>
      ) : (
        <div className="grid grid-3">
          {filtered.map(o => (
            <div
              key={o.id || o._id || o.slug}
              className="card"
              style={{ cursor: 'pointer', transition: 'box-shadow 0.15s' }}
              onClick={() => setSelected(o)}
              onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
              onMouseLeave={e => e.currentTarget.style.boxShadow = ''}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600 }}>{o.name}</h3>
                <span className={`badge badge-info`} style={{ textTransform: 'capitalize' }}>{o.category || 'general'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#718096' }}>
                <FiMapPin size={14} />
                <span>{o.building || 'Campus'}</span>
              </div>
              {o.timings && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#718096', marginTop: 4 }}>
                  <FiClock size={14} />
                  <span>{o.timings}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {selected && (
        <div className="modal-overlay" onClick={() => setSelected(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 20 }}>{selected.name}</h2>
                <span className="badge badge-info" style={{ marginTop: 4, textTransform: 'capitalize' }}>{selected.category}</span>
              </div>
              <button className="btn-ghost" onClick={() => setSelected(null)} style={{ padding: 4 }}>
                <FiX size={20} />
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {selected.purpose && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#4a5568', marginBottom: 4 }}>Purpose</div>
                  <div style={{ fontSize: 14, color: '#2d3748' }}>{selected.purpose}</div>
                </div>
              )}
              {selected.building && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiMapPin size={16} style={{ color: '#718096' }} />
                  <span style={{ fontSize: 14 }}>{selected.building}</span>
                </div>
              )}
              {selected.timings && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FiClock size={16} style={{ color: '#718096' }} />
                  <span style={{ fontSize: 14 }}>{selected.timings}</span>
                </div>
              )}
              {(selected.required_documents || selected.required_docs) && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
                    <FiFileText size={14} /> Required Documents
                  </div>
                  <div style={{ fontSize: 14, color: '#2d3748' }}>{selected.required_documents || selected.required_docs}</div>
                </div>
              )}
              {selected.entry_rules && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
                    <FiAlertCircle size={14} /> Entry Rules
                  </div>
                  <div style={{ fontSize: 14, color: '#2d3748' }}>{selected.entry_rules}</div>
                </div>
              )}
              {selected.restrictions && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#4a5568', marginBottom: 4 }}>Restrictions</div>
                  <div style={{ fontSize: 14, color: '#2d3748' }}>{selected.restrictions}</div>
                </div>
              )}
              {(selected.contact_phone || selected.contact_email || selected.contact) && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: '#4a5568', marginBottom: 4 }}>
                    <FiPhone size={14} /> Contact
                  </div>
                  {(selected.contact_phone || selected.contact) && <div style={{ fontSize: 14 }}>{selected.contact_phone || selected.contact}</div>}
                  {selected.contact_email && <div style={{ fontSize: 14, color: '#003580' }}>{selected.contact_email}</div>}
                </div>
              )}
              {(selected.nearby_locations || selected.nearby) && (
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, color: '#4a5568', marginBottom: 4 }}>Nearby Locations</div>
                  <div style={{ fontSize: 14, color: '#2d3748' }}>{selected.nearby_locations || selected.nearby}</div>
                  {/* Quick navigation to nearby offices */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
                    {(selected.nearby_locations || selected.nearby || '').split(',').map((loc, i) => {
                      const trimmed = loc.trim()
                      if (!trimmed) return null
                      const target = offices.find(o => o.name.toLowerCase().includes(trimmed.toLowerCase()))
                      return target ? (
                        <button
                          key={i}
                          className="btn btn-sm btn-secondary"
                          style={{ fontSize: 12, padding: '4px 10px', display: 'flex', alignItems: 'center', gap: 4 }}
                          onClick={() => setSelected(target)}
                        >
                          <FiCornerDownRight size={12} /> {target.name}
                        </button>
                      ) : null
                    })}
                  </div>
                </div>
              )}

              {/* Directions Section */}
              <div style={{ marginTop: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 600, fontSize: 13, color: '#4a5568', marginBottom: 8 }}>
                  <FiNavigation size={14} /> Directions
                </div>
                <div style={{ fontSize: 13, color: '#718096', marginBottom: 8 }}>
                  {selected.building && selected.floor
                    ? `Located at ${selected.building}, ${selected.floor}. ${selected.entry_rules ? 'Entry: ' + selected.entry_rules : ''}`
                    : 'Follow campus signage or ask at the Help Desk.'}
                </div>
                {selected.building && (
                  <a
                    href={`https://www.google.com/maps/search/${encodeURIComponent(selected.name + ' ' + (selected.building || ''))}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-sm"
                    style={{ background: '#FF671F', color: '#fff', border: 'none', display: 'inline-flex', alignItems: 'center', gap: 6, textDecoration: 'none' }}
                  >
                    <FiNavigation size={14} /> Open in Google Maps
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
