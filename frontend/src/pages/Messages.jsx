import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../context/AuthContext.jsx'
import { api } from '../api.js'
import { FiSend, FiMessageSquare, FiUsers, FiUser, FiChevronLeft } from 'react-icons/fi'

export default function Messages() {
  const { user } = useAuth()
  const [contacts, setContacts] = useState([])
  const [active, setActive] = useState(null)
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const intervalRef = useRef(null)

  useEffect(() => {
    api.get('/messages/contacts').then(r => setContacts(r.data)).catch(() => {})
  }, [])

  const openChat = async (contact) => {
    setActive(contact)
    setLoading(true)
    try {
      const url = contact.type === 'group' ? `/messages/group/${contact.id}` : `/messages/dm/${contact.id}`
      const { data } = await api.get(url)
      setMessages(data)
    } catch { setMessages([]) }
    setLoading(false)
  }

  useEffect(() => {
    if (!active) return
    if (intervalRef.current) clearInterval(intervalRef.current)
    intervalRef.current = setInterval(async () => {
      try {
        const url = active.type === 'group' ? `/messages/group/${active.id}` : `/messages/dm/${active.id}`
        const { data } = await api.get(url)
        setMessages(data)
      } catch { /* empty */ }
    }, 5000)
    return () => clearInterval(intervalRef.current)
  }, [active])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async e => {
    e.preventDefault()
    if (!text.trim() || !active) return
    const payload = active.type === 'group'
      ? { group_id: String(active.id), content: text.trim() }
      : { receiver_id: active.id, content: text.trim() }
    try {
      const { data } = await api.post('/messages/', payload)
      setMessages(prev => [...prev, data])
      setText('')
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to send')
    }
  }

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 80px)', gap: 0 }}>
      {/* Contacts sidebar */}
      <div style={{ width: active ? undefined : '100%', minWidth: 280, maxWidth: 320, borderRight: '1px solid #e2e8f0', background: '#fff', display: 'flex', flexDirection: 'column', ...(active ? {} : { maxWidth: '100%' }) }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', background: 'linear-gradient(135deg, #002147, #003580)' }}>
          <h2 style={{ margin: 0, color: '#fff', fontSize: 18, display: 'flex', alignItems: 'center', gap: 8 }}>
            <FiMessageSquare /> Messages
          </h2>
        </div>
        <div style={{ flex: 1, overflow: 'auto' }}>
          {contacts.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#a0aec0' }}>
              <FiMessageSquare size={32} />
              <p style={{ marginTop: 8 }}>No contacts yet. A guide must be assigned first.</p>
            </div>
          ) : contacts.map(c => (
            <div
              key={`${c.type}-${c.id}`}
              onClick={() => openChat(c)}
              style={{
                padding: '14px 20px',
                cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 12,
                background: active?.id === c.id && active?.type === c.type ? '#ebf4ff' : 'transparent',
                borderBottom: '1px solid #f0f0f0',
                transition: 'background 0.15s',
              }}
              onMouseEnter={e => { if (!(active?.id === c.id && active?.type === c.type)) e.currentTarget.style.background = '#f7fafc' }}
              onMouseLeave={e => { if (!(active?.id === c.id && active?.type === c.type)) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: c.type === 'group' ? '#FF671F' : '#003580',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16, flexShrink: 0
              }}>
                {c.type === 'group' ? <FiUsers size={18} /> : c.name[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, color: '#2d3748', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</div>
                <div style={{ fontSize: 12, color: '#a0aec0', textTransform: 'capitalize' }}>{c.type === 'group' ? 'Group Chat' : c.role}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat area */}
      {active ? (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: '#f7fafc' }}>
          {/* Chat header */}
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #e2e8f0', background: '#fff', display: 'flex', alignItems: 'center', gap: 12 }}>
            <button onClick={() => setActive(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#718096' }}>
              <FiChevronLeft size={20} />
            </button>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: active.type === 'group' ? '#FF671F' : '#003580',
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14
            }}>
              {active.type === 'group' ? <FiUsers size={16} /> : active.name[0].toUpperCase()}
            </div>
            <div>
              <div style={{ fontWeight: 600, color: '#2d3748' }}>{active.name}</div>
              <div style={{ fontSize: 12, color: '#a0aec0' }}>{active.type === 'group' ? 'Group Chat — All interns under this guide' : `Direct Message — ${active.role}`}</div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflow: 'auto', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8 }}>
            {loading ? (
              <p style={{ textAlign: 'center', color: '#a0aec0' }}>Loading messages...</p>
            ) : messages.length === 0 ? (
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0' }}>
                <div style={{ textAlign: 'center' }}>
                  <FiMessageSquare size={40} />
                  <p>No messages yet. Start the conversation!</p>
                </div>
              </div>
            ) : (
              messages.map(m => {
                const isMine = m.sender_id === user?.id
                return (
                  <div key={m.id} style={{ display: 'flex', justifyContent: isMine ? 'flex-end' : 'flex-start' }}>
                    <div style={{
                      maxWidth: '70%',
                      padding: '10px 16px',
                      borderRadius: isMine ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                      background: isMine ? 'linear-gradient(135deg, #003580, #002147)' : '#fff',
                      color: isMine ? '#fff' : '#2d3748',
                      boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
                    }}>
                      {!isMine && active.type === 'group' && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#FF671F', marginBottom: 2 }}>{m.sender_name}</div>
                      )}
                      <div style={{ fontSize: 14, lineHeight: 1.5, wordBreak: 'break-word' }}>{m.content}</div>
                      <div style={{ fontSize: 10, marginTop: 4, opacity: 0.7, textAlign: 'right' }}>
                        {new Date(m.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={send} style={{ padding: '12px 20px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', gap: 8 }}>
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '12px 16px', borderRadius: 24, border: '1px solid #e2e8f0', fontSize: 14, outline: 'none' }}
              autoFocus
            />
            <button type="submit" disabled={!text.trim()} style={{
              width: 44, height: 44, borderRadius: '50%', border: 'none',
              background: text.trim() ? '#FF671F' : '#e2e8f0',
              color: text.trim() ? '#fff' : '#a0aec0',
              cursor: text.trim() ? 'pointer' : 'default',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s'
            }}>
              <FiSend size={18} />
            </button>
          </form>
        </div>
      ) : (
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#a0aec0', background: '#f7fafc' }}>
          <div style={{ textAlign: 'center' }}>
            <FiMessageSquare size={64} style={{ opacity: 0.3 }} />
            <p style={{ fontSize: 18, marginTop: 16 }}>Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}
