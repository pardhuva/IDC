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

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    if (!email || !password) { setError('Please fill in all fields'); return }
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.')
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
        <h2>Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your IDC account</p>
        <form onSubmit={submit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" required />
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <button type="submit" style={{ width: '100%', justifyContent: 'center' }} disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register here</Link>
        </div>
      </div>
    </div>
  )
}
