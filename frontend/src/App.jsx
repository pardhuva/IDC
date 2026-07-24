import { Routes, Route, Link, Navigate } from 'react-router-dom'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'

function RequireAuth({ children }) {
  const token = localStorage.getItem('idc_token')
  return token ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <div className="container">
      <nav style={{ marginBottom: 24 }}>
        <Link to="/">Home</Link> {' | '}
        <Link to="/login">Login</Link> {' | '}
        <Link to="/register">Register</Link> {' | '}
        <Link to="/dashboard">Dashboard</Link>
      </nav>
      <Routes>
        <Route path="/" element={<div className="card"><h1>Intern Digital Companion</h1><p>Guiding every intern from Day One to Successful Completion.</p></div>} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<RequireAuth><Dashboard /></RequireAuth>} />
      </Routes>
    </div>
  )
}
