import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  FiHome, FiUser, FiFileText, FiCheckSquare, FiMap, FiHelpCircle,
  FiBriefcase, FiList, FiBook, FiBarChart2, FiBell, FiUsers,
  FiUserPlus, FiSettings, FiMessageSquare, FiLogOut, FiPhone, FiVolume2, FiMenu, FiX,
  FiCalendar, FiGlobe, FiStar, FiCpu, FiAward, FiSend, FiCoffee
} from 'react-icons/fi'
import { useState } from 'react'

const navConfig = {
  intern: [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/profile', icon: FiUser, label: 'My Profile' },
    { to: '/documents', icon: FiFileText, label: 'Documents' },
    { to: '/checklist', icon: FiCheckSquare, label: 'Checklist' },
    { to: '/campus', icon: FiMap, label: 'Campus Guide' },
    { to: '/faq', icon: FiHelpCircle, label: 'FAQ' },
    { to: '/projects', icon: FiBriefcase, label: 'My Project' },
    { to: '/tasks', icon: FiList, label: 'Tasks' },
    { to: '/diary', icon: FiBook, label: 'Daily Diary' },
    { to: '/reports', icon: FiBarChart2, label: 'Weekly Reports' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
    { to: '/events', icon: FiCalendar, label: 'Events' },
    { to: '/ai-insights', icon: FiCpu, label: 'AI Insights' },
    { to: '/leave', icon: FiCoffee, label: 'Leave Requests' },
    { to: '/messages', icon: FiSend, label: 'Messages' },
    { to: '/certificate', icon: FiAward, label: 'Certificate' },
    { to: '/about', icon: FiGlobe, label: 'About ISRO' },
    { to: '/feedback', icon: FiStar, label: 'Feedback' },
  ],
  guide: [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/my-interns', icon: FiUsers, label: 'My Interns' },
    { to: '/projects', icon: FiBriefcase, label: 'Projects' },
    { to: '/tasks', icon: FiList, label: 'Tasks' },
    { to: '/diary', icon: FiBook, label: 'Diary Review' },
    { to: '/reports', icon: FiBarChart2, label: 'Reports Review' },
    { to: '/leave', icon: FiCoffee, label: 'Leave Approvals' },
    { to: '/messages', icon: FiSend, label: 'Messages' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
    { to: '/events', icon: FiCalendar, label: 'Events' },
    { to: '/about', icon: FiGlobe, label: 'About ISRO' },
  ],
  coordinator: [
    { to: '/dashboard', icon: FiHome, label: 'Dashboard' },
    { to: '/profile', icon: FiUsers, label: 'All Interns' },
    { to: '/guide-assignment', icon: FiUserPlus, label: 'Guide Assignment' },
    { to: '/campus', icon: FiMap, label: 'Campus Management' },
    { to: '/faq', icon: FiHelpCircle, label: 'FAQ Management' },
    { to: '/announcements', icon: FiVolume2, label: 'Announcements' },
    { to: '/documents', icon: FiFileText, label: 'Documents' },
    { to: '/contacts', icon: FiPhone, label: 'Contacts' },
    { to: '/notifications', icon: FiBell, label: 'Notifications' },
    { to: '/events', icon: FiCalendar, label: 'Events' },
    { to: '/about', icon: FiGlobe, label: 'About ISRO' },
    { to: '/feedback', icon: FiStar, label: 'Feedback' },
  ],
}

const roleBadgeColors = {
  intern: '#FF671F',
  guide: '#38a169',
  coordinator: '#d69e2e',
}

function IsroLogo({ size = 36 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Outer circle */}
      <circle cx="60" cy="60" r="56" stroke="#FF671F" strokeWidth="3" fill="none" />
      {/* Inner blue globe */}
      <circle cx="60" cy="62" r="28" fill="#1a5276" />
      <ellipse cx="60" cy="62" rx="28" ry="10" fill="none" stroke="#4FA8E0" strokeWidth="1.2" opacity="0.6" />
      <ellipse cx="60" cy="62" rx="10" ry="28" fill="none" stroke="#4FA8E0" strokeWidth="1.2" opacity="0.6" />
      {/* Rocket / upward arrow */}
      <path d="M60 8 L54 40 L60 36 L66 40 Z" fill="#FF671F" />
      <path d="M56 40 L60 95 L64 40 Z" fill="#FF671F" />
      {/* Rocket flames */}
      <path d="M57 95 L60 105 L63 95" fill="#d69e2e" />
      {/* Satellite orbit arc */}
      <path d="M20 35 Q40 20 60 25 Q80 30 95 50" stroke="#4FA8E0" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Small satellite dot */}
      <circle cx="95" cy="50" r="3" fill="#4FA8E0" />
      {/* ISRO text arc placeholder - two small decorative arcs */}
      <path d="M25 90 Q60 110 95 90" stroke="#FF671F" strokeWidth="2" fill="none" strokeLinecap="round" />
    </svg>
  )
}

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const links = navConfig[user?.role] || navConfig.intern

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="layout">
      <button className="sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'sidebar--open' : ''}`}>
        <div className="sidebar-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <IsroLogo size={44} />
            <div>
              <div className="sidebar-logo">IDC</div>
              <div className="sidebar-title">Intern Digital Companion</div>
            </div>
          </div>
        </div>

        {user && (
          <div className="sidebar-user">
            <div className="sidebar-user-avatar">{user.name?.[0]?.toUpperCase() || '?'}</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">{user.name}</div>
              <span className="role-badge" style={{ background: roleBadgeColors[user.role] || '#718096' }}>
                {user.role}
              </span>
            </div>
          </div>
        )}

        <nav className="sidebar-nav">
          {links.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link--active' : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <button className="sidebar-logout" onClick={handleLogout}>
          <FiLogOut size={18} />
          <span>Logout</span>
        </button>
      </aside>

      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
