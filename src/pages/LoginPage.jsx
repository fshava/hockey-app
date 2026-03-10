import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'

export default function LoginPage() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault(); setError(''); setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) { setError(error.message); return }
    navigate('/admin')
  }

  return (
    <div className="pitch-bg login-wrap">
      <div className="login-card">
        <div style={{ fontSize:'2rem', marginBottom:8 }}>🏑</div>
        <h2>Admin Login</h2>
        <p className="sub">Hockey Fixtures Manager — restricted access</p>
        {error && <div className="alert alert-err" style={{ marginBottom:16 }}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="login-field">
            <label>Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="admin@example.com" required />
          </div>
          <div className="login-field" style={{ marginBottom:24 }}>
            <label>Password</label>
            <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary" type="submit" disabled={loading} style={{ width:'100%', justifyContent:'center', fontSize:'1rem', padding:'11px' }}>
            {loading ? <><span className="spinner" />  Signing in…</> : 'Sign In'}
          </button>
        </form>
        <div style={{ marginTop:20, textAlign:'center' }}>
          <a href="/" style={{ color:'var(--muted)', fontSize:'0.82rem', textDecoration:'none' }}>← Back to public view</a>
        </div>
      </div>
    </div>
  )
}
