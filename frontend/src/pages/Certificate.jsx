import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../api.js'
import { FiPrinter, FiArrowLeft } from 'react-icons/fi'

export default function Certificate() {
  const [html, setHtml] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/certificate/me', { responseType: 'text' })
      .then(({ data }) => setHtml(typeof data === 'string' ? data : ''))
      .catch((err) => {
        const msg = err.response?.data?.detail || 'Certificate is not available yet.'
        setError(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const handlePrint = () => {
    const printWindow = window.open('', '_blank')
    printWindow.document.write(html)
    printWindow.document.close()
    printWindow.focus()
    printWindow.print()
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Internship Certificate</h1>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link to="/dashboard" className="btn btn-ghost">
            <FiArrowLeft size={16} /> Back to Dashboard
          </Link>
          {html && (
            <button className="btn btn-primary" onClick={handlePrint}>
              <FiPrinter size={16} /> Print / Save as PDF
            </button>
          )}
        </div>
      </div>

      {error ? (
        <div className="card" style={{ textAlign: 'center', padding: 40 }}>
          <h3 style={{ color: '#e53e3e', marginBottom: 8 }}>Certificate Not Available</h3>
          <p style={{ color: '#718096' }}>{error}</p>
          <Link to="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>
            Return to Dashboard
          </Link>
        </div>
      ) : (
        <div
          className="card"
          style={{ padding: 0, overflow: 'auto' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  )
}
