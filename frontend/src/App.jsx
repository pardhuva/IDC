import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth, AuthProvider } from './context/AuthContext.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Dashboard from './pages/Dashboard.jsx'
import InternProfile from './pages/InternProfile.jsx'
import Documents from './pages/Documents.jsx'
import Checklist from './pages/Checklist.jsx'
import CampusGuide from './pages/CampusGuide.jsx'
import FAQ from './pages/FAQ.jsx'
import Announcements from './pages/Announcements.jsx'
import GuideAssignment from './pages/GuideAssignment.jsx'
import MyInterns from './pages/MyInterns.jsx'
import Projects from './pages/Projects.jsx'
import Tasks from './pages/Tasks.jsx'
import Diary from './pages/Diary.jsx'
import WeeklyReports from './pages/WeeklyReports.jsx'
import Notifications from './pages/Notifications.jsx'
import Contacts from './pages/Contacts.jsx'
import Events from './pages/Events.jsx'
import AboutISRO from './pages/AboutISRO.jsx'
import FeedbackForm from './pages/FeedbackForm.jsx'
import AIInsights from './pages/AIInsights.jsx'
import Certificate from './pages/Certificate.jsx'
import LeaveRequests from './pages/LeaveRequests.jsx'
import Messages from './pages/Messages.jsx'

function RequireAuth({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading...</div>
  return token ? children : <Navigate to="/login" replace />
}

function PublicOnly({ children }) {
  const { token, loading } = useAuth()
  if (loading) return <div className="page-loading">Loading...</div>
  return token ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
      <Route path="/register" element={<PublicOnly><Register /></PublicOnly>} />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/profile" element={<InternProfile />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/checklist" element={<Checklist />} />
        <Route path="/campus" element={<CampusGuide />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/announcements" element={<Announcements />} />
        <Route path="/guide-assignment" element={<GuideAssignment />} />
        <Route path="/my-interns" element={<MyInterns />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/diary" element={<Diary />} />
        <Route path="/reports" element={<WeeklyReports />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/contacts" element={<Contacts />} />
        <Route path="/events" element={<Events />} />
        <Route path="/about" element={<AboutISRO />} />
        <Route path="/feedback" element={<FeedbackForm />} />
        <Route path="/ai-insights" element={<AIInsights />} />
        <Route path="/certificate" element={<Certificate />} />
        <Route path="/leave" element={<LeaveRequests />} />
        <Route path="/messages" element={<Messages />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  )
}
