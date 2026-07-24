import { useEffect, useState } from 'react'
import { api } from '../api.js'

export default function Dashboard() {
  const [me, setMe] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/auth/me').then(({ data }) => setMe(data)).catch((err) => {
      setError(err.response?.data?.detail || 'Failed to load profile')
    })
  }, [])

  if (error) return <div className="card error">{error}</div>
  if (!me) return <div className="card">Loading…</div>

  return (
    <div className="card">
      <h2>Welcome, {me.name}</h2>
      <p>Role: <strong>{me.role}</strong></p>
      <p>Email: {me.email}</p>
      <hr />
      <p><em>Onboarding checklist, campus navigator, and AI search will appear here in the next modules.</em></p>
    </div>
  )
}
