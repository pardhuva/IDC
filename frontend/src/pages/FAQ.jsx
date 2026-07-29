import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiSearch, FiChevronDown, FiChevronUp, FiPlus } from 'react-icons/fi'

export default function FAQ() {
  const { user } = useAuth()
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [expanded, setExpanded] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', intent_label: '' })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCoordinator = user?.role === 'coordinator'
  const CATEGORIES = ['all', 'general', 'onboarding', 'technical', 'hr', 'campus', 'project']

  const fetchFaqs = async () => {
    try {
      if (search.length > 2) {
        const { data } = await api.get(`/faq/search?q=${encodeURIComponent(search)}`)
        setFaqs(data)
      } else {
        const { data } = await api.get('/faq/')
        setFaqs(data)
      }
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchFaqs() }, [])

  const handleSearch = () => { setLoading(true); fetchFaqs() }

  const handleAdd = async (e) => {
    e.preventDefault()
    setError(''); setSuccess('')
    try {
      await api.post('/faq/', form)
      setSuccess('FAQ added successfully')
      setShowForm(false)
      setForm({ question: '', answer: '', category: 'general', intent_label: '' })
      fetchFaqs()
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to add FAQ')
    }
  }

  const filtered = faqs.filter(f => {
    const matchCat = category === 'all' || f.category === category
    return matchCat
  })

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Frequently Asked Questions</h1>
        <p>Find answers to common questions</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="search-bar">
        <FiSearch size={18} color="#a0aec0" />
        <input placeholder="Search FAQs..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} />
        <button className="btn btn-primary btn-sm" onClick={handleSearch}>Search</button>
      </div>

      <div className="filter-tabs">
        {CATEGORIES.map(c => (
          <button key={c} className={`filter-tab ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
            {c === 'all' ? 'All' : c.charAt(0).toUpperCase() + c.slice(1)}
          </button>
        ))}
        {isCoordinator && (
          <button className="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={() => setShowForm(!showForm)}>
            <FiPlus size={14} /> Add FAQ
          </button>
        )}
      </div>

      {showForm && isCoordinator && (
        <div className="card">
          <h3>Add New FAQ</h3>
          <form onSubmit={handleAdd} style={{ marginTop: 16 }}>
            <div className="form-group"><label>Question</label><input value={form.question} onChange={(e) => setForm({ ...form, question: e.target.value })} required /></div>
            <div className="form-group"><label>Answer</label><textarea value={form.answer} onChange={(e) => setForm({ ...form, answer: e.target.value })} required /></div>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Category</label>
                <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {CATEGORIES.filter(c => c !== 'all').map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Intent Label</label>
                <input value={form.intent_label} onChange={(e) => setForm({ ...form, intent_label: e.target.value })} placeholder="e.g. ask_leave_policy" />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12 }}>
              <button type="submit">Add FAQ</button>
              <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="card" style={{ padding: 0 }}>
        {filtered.length === 0 ? (
          <div className="empty-state" style={{ padding: 40 }}><h3>No FAQs found</h3><p>Try a different search or category</p></div>
        ) : (
          filtered.map((f, idx) => (
            <div key={f.id || f._id || idx} className="accordion-item" style={{ padding: '0 20px' }}>
              <button className="accordion-trigger" onClick={() => setExpanded(expanded === idx ? null : idx)}>
                <span>{f.question}</span>
                {expanded === idx ? <FiChevronUp /> : <FiChevronDown />}
              </button>
              {expanded === idx && (
                <div className="accordion-body">
                  <p>{f.answer}</p>
                  {f.category && <span className={`badge badge-${f.category}`} style={{ marginTop: 8 }}>{f.category}</span>}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
