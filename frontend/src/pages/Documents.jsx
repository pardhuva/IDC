import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiUpload, FiFile, FiCheck, FiX } from 'react-icons/fi'

export default function Documents() {
  const { user } = useAuth()
  const [docs, setDocs] = useState([])
  const [loading, setLoading] = useState(true)
  const [docType, setDocType] = useState('offer_letter')
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const isCoordinator = user?.role === 'coordinator'

  const fetchDocs = async () => {
    try {
      const { data } = await api.get('/documents/me')
      setDocs(data)
    } catch { }
    setLoading(false)
  }

  useEffect(() => { fetchDocs() }, [])

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { setError('Please select a file'); return }
    setError(''); setSuccess(''); setUploading(true)
    try {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('doc_type', docType)
      await api.post('/documents/upload', fd)
      setSuccess('Document uploaded successfully')
      setFile(null)
      fetchDocs()
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleVerify = async (id, newStatus) => {
    try {
      await api.put(`/documents/${id}/verify`, { status: newStatus })
      setSuccess(`Document ${newStatus}`)
      fetchDocs()
    } catch (err) {
      setError(err.response?.data?.detail || 'Verification failed')
    }
  }

  const statusBadge = (s) => {
    const map = { pending: 'badge-pending', verified: 'badge-verified', rejected: 'badge-rejected' }
    return <span className={`badge ${map[s] || 'badge-pending'}`}>{s}</span>
  }

  if (loading) return <div className="loading"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header">
        <h1>Documents</h1>
        <p>{isCoordinator ? 'Review and verify intern documents' : 'Upload and manage your documents'}</p>
      </div>

      {success && <div className="alert alert-success">{success}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {!isCoordinator && (
        <div className="card">
          <h3>Upload Document</h3>
          <form onSubmit={handleUpload} style={{ marginTop: 16 }}>
            <div className="grid grid-2">
              <div className="form-group">
                <label>Document Type</label>
                <select value={docType} onChange={(e) => setDocType(e.target.value)}>
                  <option value="offer_letter">Offer Letter</option>
                  <option value="id_proof">ID Proof</option>
                  <option value="college_letter">College Letter</option>
                  <option value="final_report">Final Report</option>
                  <option value="final_draft">Final Draft</option>
                  <option value="presentation">Presentation</option>
                  <option value="certificate">Certificate</option>
                  <option value="joining_report">Joining Report</option>
                  <option value="nda_secrecy_agreement">NDA / Secrecy Agreement</option>
                  <option value="medical_fitness_certificate">Medical Fitness Certificate</option>
                  <option value="no_dues_clearance">No Dues Clearance</option>
                  <option value="passport_size_photo">Passport Size Photo</option>
                </select>
              </div>
              <div className="form-group">
                <label>File</label>
                <input type="file" onChange={(e) => setFile(e.target.files[0])} />
              </div>
            </div>
            <button type="submit" disabled={uploading}>
              <FiUpload size={16} /> {uploading ? 'Uploading...' : 'Upload'}
            </button>
          </form>
        </div>
      )}

      <div className="card">
        <h3>{isCoordinator ? 'All Documents' : 'My Documents'}</h3>
        {docs.length === 0 ? (
          <div className="empty-state" style={{ padding: 32 }}>
            <FiFile size={40} />
            <h3>No documents yet</h3>
            <p>{isCoordinator ? 'No documents to review' : 'Upload your first document above'}</p>
          </div>
        ) : (
          <div className="table-wrap" style={{ marginTop: 16 }}>
            <table>
              <thead>
                <tr>
                  {isCoordinator && <th>Intern</th>}
                  <th>Type</th>
                  <th>Filename</th>
                  <th>Status</th>
                  <th>Uploaded</th>
                  {isCoordinator && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {docs.map(d => (
                  <tr key={d.id || d._id}>
                    {isCoordinator && <td>{d.intern_name || d.user_id || 'N/A'}</td>}
                    <td style={{ textTransform: 'capitalize' }}>{d.doc_type?.replace('_', ' ')}</td>
                    <td>{d.original_filename || d.filename || '-'}</td>
                    <td>{statusBadge(d.status)}</td>
                    <td>{d.created_at ? new Date(d.created_at).toLocaleDateString() : '-'}</td>
                    {isCoordinator && (
                      <td>
                        {d.status === 'pending' && (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button className="btn btn-success btn-sm" onClick={() => handleVerify(d.id || d._id, 'verified')}>
                              <FiCheck size={14} /> Verify
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleVerify(d.id || d._id, 'rejected')}>
                              <FiX size={14} /> Reject
                            </button>
                          </div>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
