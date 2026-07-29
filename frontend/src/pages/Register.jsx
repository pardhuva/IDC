import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

function IsroLogoBig() {
  return (
    <svg width={64} height={64} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="60" cy="60" r="56" stroke="#FF671F" strokeWidth="3" fill="none" />
      <circle cx="60" cy="62" r="28" fill="#1a5276" />
      <ellipse cx="60" cy="62" rx="28" ry="10" fill="none" stroke="#4FA8E0" strokeWidth="1.2" opacity="0.6" />
      <ellipse cx="60" cy="62" rx="10" ry="28" fill="none" stroke="#4FA8E0" strokeWidth="1.2" opacity="0.6" />
      <path d="M60 8 L54 40 L60 36 L66 40 Z" fill="#FF671F" />
      <path d="M56 40 L60 95 L64 40 Z" fill="#FF671F" />
      <path d="M57 95 L60 105 L63 95" fill="#d69e2e" />
      <path d="M20 35 Q40 20 60 25 Q80 30 95 50" stroke="#4FA8E0" strokeWidth="2" fill="none" strokeLinecap="round" />
      <circle cx="95" cy="50" r="3" fill="#4FA8E0" />
      <path d="M25 90 Q60 110 95 90" stroke="#FF671F" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'intern' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { register } = useAuth()
  const navigate = useNavigate()

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!form.name || !form.email || !form.password) { setError('All fields are required'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await register(form.name, form.email, form.password, form.role)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="card auth-card">
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <IsroLogoBig />
          <div style={{ fontSize: 12, color: '#718096', marginTop: 4, letterSpacing: 1, textTransform: 'uppercase' }}>Intern Digital Companion</div>
        </div>
        <h2>Create Account</h2>
        <p className="auth-subtitle">Join the Intern Digital Companion</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Full Name</label>
            <input value={form.name} onChange={update('name')} placeholder="John Doe" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={update('password')} placeholder="Min 6 characters" required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={form.role} onChange={update('role')}>
              <option value="intern">Intern</option>
              <option value="guide">Guide</option>
              <option value="coordinator">Coordinator</option>
            </select>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  )
}
