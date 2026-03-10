import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { G } from '../lib/theme'

export default function ProtectedRoute({ children }) {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <div className="spinner" />
        <div style={{ color: G.muted, marginTop: 12, fontSize: '0.9rem' }}>Loading...</div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return children
}
