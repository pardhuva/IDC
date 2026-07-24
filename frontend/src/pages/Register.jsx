import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api.js'

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'intern' })
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const update = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await api.post('/auth/register', form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="card">
      <h2>Register</h2>
      <form onSubmit={submit}>
        <label>Name</label>
        <input value={form.name} onChange={update('name')} required />
        <label>Email</label>
        <input type="email" value={form.email} onChange={update('email')} required />
        <label>Password</label>
        <input type="password" value={form.password} onChange={update('password')} required />
        <label>Role</label>
        <select value={form.role} onChange={update('role')}>
          <option value="intern">Intern</option>
          <option value="guide">Guide</option>
          <option value="coordinator">Coordinator</option>
        </select>
        <div style={{ marginTop: 16 }}><button type="submit">Create account</button></div>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  )
}
