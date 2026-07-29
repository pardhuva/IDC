import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiCalendar, FiCheck, FiX, FiClock, FiSend } from 'react-icons/fi'

const typeColors = { casual: '#3182ce', sick: '#e53e3e', emergency: '#d69e2e', holiday: '#38a169' }
const statusColors = { pending: '#d69e2e', approved: '#38a169', rejected: '#e53e3e' }
const statusIcons = { pending: FiClock, approved: FiCheck, rejected: FiX }

export default function LeaveRequests() {
  const { user } = useAuth()
  const isIntern = user?.role === 'intern'
  const [requests, setRequests] = useState([])
  const [form, setForm] = useState({ leave_type: 'casual', from_date: '', to_date: '', reason: '' })
  const [showForm, setShowForm] = useState(false)
  const [reviewComment, setReviewComment] = useState('')
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const url = isIntern ? '/leave/me' : '/leave/pending'
      const { data } = await api.get(url)
      setRequests(data)
    } catch { /* empty */ }
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const submit = async e => {
    e.preventDefault()
    try {
      await api.post('/leave/', form)
      setForm({ leave_type: 'casual', from_date: '', to_date: '', reason: '' })
      setShowForm(false)
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error submitting request')
    }
  }

  const review = async (id, status) => {
    try {
      await api.put(`/leave/${id}/review`, { status, reviewer_comment: reviewComment || null })
      setReviewComment('')
      load()
    } catch (err) {
      alert(err.response?.data?.detail || 'Error')
    }
  }

  const days = (from, to) => {
    const d1 = new Date(from), d2 = new Date(to)
    return Math.ceil((d2 - d1) / (1000 * 60 * 60 * 24)) + 1
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ margin: 0, color: '#002147' }}>
            <FiCalendar style={{ marginRight: 8, verticalAlign: -3 }} />
            {isIntern ? 'Leave Requests' : 'Leave Approvals'}
          </h1>
          <p style={{ margin: '4px 0 0', color: '#718096' }}>
            {isIntern ? 'Apply for leave and track your requests' : 'Review and manage intern leave requests'}
          </p>
        </div>
        {isIntern && (
          <button onClick={() => setShowForm(!showForm)} className="btn btn-primary" style={{ background: '#FF671F', border: 'none', color: '#fff', padding: '10px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiSend size={16} /> Apply for Leave
          </button>
        )}
      </div>

      {showForm && (
        <form onSubmit={submit} style={{ background: '#fff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(0,0,0,0.08)', marginBottom: 24, border: '2px solid #FF671F' }}>
          <h3 style={{ margin: '0 0 16px', color: '#002147' }}>New Leave Request</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 4, color: '#4a5568' }}>Leave Type</label>
              <select value={form.leave_type} onChange={e => setForm({ ...form, leave_type: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }}>
                <option value="casual">Casual Leave</option>
                <option value="sick">Sick Leave</option>
                <option value="emergency">Emergency Leave</option>
                <option value="holiday">Holiday / Festival</option>
              </select>
            </div>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 4, color: '#4a5568' }}>From Date</label>
              <input type="date" required value={form.from_date} onChange={e => setForm({ ...form, from_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
            </div>
            <div>
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 4, color: '#4a5568' }}>To Date</label>
              <input type="date" required value={form.to_date} onChange={e => setForm({ ...form, to_date: e.target.value })} style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
            </div>
          </div>
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontWeight: 600, display: 'block', marginBottom: 4, color: '#4a5568' }}>Reason</label>
            <textarea required rows={3} value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Explain why you need leave..." style={{ width: '100%', padding: '10px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14, resize: 'vertical' }} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" style={{ background: '#38a169', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Submit Request</button>
            <button type="button" onClick={() => setShowForm(false)} style={{ background: '#e2e8f0', color: '#4a5568', border: 'none', padding: '10px 24px', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p style={{ textAlign: 'center', color: '#718096' }}>Loading...</p>
      ) : requests.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 48, color: '#a0aec0' }}>
          <FiCalendar size={48} />
          <p style={{ marginTop: 12, fontSize: 16 }}>{isIntern ? 'No leave requests yet. Click "Apply for Leave" to get started.' : 'No pending leave requests.'}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {requests.map(r => {
            const SIcon = statusIcons[r.status] || FiClock
            return (
              <div key={r.id} style={{ background: '#fff', borderRadius: 12, padding: 20, boxShadow: '0 2px 8px rgba(0,0,0,0.06)', borderLeft: `4px solid ${statusColors[r.status]}` }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    {!isIntern && r.intern_name && <div style={{ fontWeight: 700, fontSize: 16, color: '#002147', marginBottom: 4 }}>{r.intern_name}</div>}
                    <span style={{ background: typeColors[r.leave_type] || '#718096', color: '#fff', padding: '3px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, textTransform: 'capitalize' }}>{r.leave_type} Leave</span>
                  </div>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: statusColors[r.status], fontWeight: 700, textTransform: 'capitalize' }}>
                    <SIcon size={16} /> {r.status}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12, fontSize: 14, color: '#4a5568' }}>
                  <div><strong>From:</strong> {new Date(r.from_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div><strong>To:</strong> {new Date(r.to_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                  <div><strong>Days:</strong> {days(r.from_date, r.to_date)}</div>
                </div>
                <div style={{ fontSize: 14, color: '#2d3748', background: '#f7fafc', padding: '10px 14px', borderRadius: 8, marginBottom: r.reviewer_comment ? 8 : 0 }}>
                  <strong>Reason:</strong> {r.reason}
                </div>
                {r.reviewer_comment && (
                  <div style={{ fontSize: 14, color: '#2d3748', background: '#fffaf0', padding: '10px 14px', borderRadius: 8, marginTop: 8 }}>
                    <strong>Reviewer Comment:</strong> {r.reviewer_comment}
                  </div>
                )}
                {!isIntern && r.status === 'pending' && (
                  <div style={{ marginTop: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input value={reviewComment} onChange={e => setReviewComment(e.target.value)} placeholder="Comment (optional)" style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: '1px solid #e2e8f0', fontSize: 14 }} />
                    <button onClick={() => review(r.id, 'approved')} style={{ background: '#38a169', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiCheck size={16} /> Approve
                    </button>
                    <button onClick={() => review(r.id, 'rejected')} style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '8px 20px', borderRadius: 8, cursor: 'pointer', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                      <FiX size={16} /> Reject
                    </button>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
