import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectAuthLoading } from '../../store/slices/authSlice.js'

const ProtectedRoute = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const loading = useSelector(selectAuthLoading)

    if (loading) {
        return (
            <div style={{
                minHeight: '100vh',
                background: '#06080e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <div style={{
                    width: 40, height: 40,
                    border: '2px solid rgba(226,232,240,.1)',
                    borderTop: '2px solid #60a5fa',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        )
    }

    return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />
}

export default ProtectedRoute