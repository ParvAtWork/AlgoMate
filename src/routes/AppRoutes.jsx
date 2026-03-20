import { Routes, Route } from 'react-router-dom'
import HomePage from '../pages/HomePage.jsx'
import LoginPage from '../pages/auth/LoginPage.jsx'
import SignupPage from '../pages/auth/SignupPage.jsx'
import CallbackPage from '../pages/auth/CallbackPage.jsx'
import ProblemsPage from '../pages/problem/ProblemsPage.jsx'
import ProblemDetailPage from '../pages/problem/ProblemDetailPage.jsx'
import SubmissionsPage from '../pages/submission/SubmissionsPage.jsx'
import LeaderboardPage from '../pages/leaderboard/LeaderboardPage.jsx'
import ProfilePage from '../pages/user/ProfilePage.jsx'
import NotFoundPage from '../pages/NotFoundPage.jsx'
import ProtectedRoute from '../components/common/ProtectedRoute.jsx'
import AdminRoutes from './AdminRoutes.jsx'

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/auth/callback" element={<CallbackPage />} />
            <Route path="/problems" element={<ProblemsPage />} />
            <Route path="/problems/:id" element={<ProblemDetailPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />

            {/* Protected */}
            <Route element={<ProtectedRoute />}>
                <Route path="/submissions" element={<SubmissionsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
            </Route>

            {/* Admin */}
            <Route path="/admin/*" element={<AdminRoutes />} />

            {/* 404 */}
            <Route path="*" element={<NotFoundPage />} />
        </Routes>
    )
}

export default AppRoutes