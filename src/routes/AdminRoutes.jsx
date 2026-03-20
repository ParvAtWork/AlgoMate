import { Navigate, Outlet } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated, selectIsAdmin } from '../store/slices/authSlice.js'

const AdminRoutes = () => {
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const isAdmin = useSelector(selectIsAdmin)

    if (!isAuthenticated) return <Navigate to="/login" replace />
    if (!isAdmin) return <Navigate to="/" replace />

    return <Outlet />
}

export default AdminRoutes