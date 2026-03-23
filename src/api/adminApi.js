import axiosInstance from './axiosInstance.js'

// ── Dashboard ────────────────────────────────────────────────────
export const getDashboardStats      = ()           => axiosInstance.get('/api/admin/stats')
export const getRecentSubmissions   = (count = 8)  => axiosInstance.get(`/api/admin/submissions/recent?count=${count}`)

// GET /api/admin/users/{id}/submissions
export const getUserSubmissions = (id) =>
    axiosInstance.get(`/api/admin/users/${id}/submissions`)

// GET /api/admin/submissions/all
export const getAllSubmissionsAdmin = () =>
    axiosInstance.get('/api/admin/submissions')

// ── Users ────────────────────────────────────────────────────────
export const getAllUsers             = ()           => axiosInstance.get('/api/admin/users')
export const updateUserRole         = (id, role)   => axiosInstance.put(`/api/admin/users/${id}/role`, { role })
export const togglePremium          = (id, isPremium) => axiosInstance.put(`/api/admin/users/${id}/premium`, { isPremium })
export const deleteUser             = (id)         => axiosInstance.delete(`/api/admin/users/${id}`)

// ── Problems ─────────────────────────────────────────────────────
export const addProblem             = (data)       => axiosInstance.post('/api/admin/problems', data)
export const updateProblem          = (id, data)   => axiosInstance.put(`/api/admin/problems/${id}`, data)
export const deleteProblem          = (id)         => axiosInstance.delete(`/api/admin/problems/${id}`)
export const getAdminProblemById    = (id)         => axiosInstance.get(`/api/admin/problems/${id}`)

// ── Test Cases ───────────────────────────────────────────────────
export const getTestCases           = (problemId)  => axiosInstance.get(`/api/admin/problems/${problemId}/testcases`)
export const addTestCase            = (problemId, data) => axiosInstance.post(`/api/admin/problems/${problemId}/testcases`, data)
export const updateTestCase         = (id, data)   => axiosInstance.put(`/api/admin/testcases/${id}`, data)
export const deleteTestCase         = (id)         => axiosInstance.delete(`/api/admin/testcases/${id}`)
export const deleteAllTestCases     = (problemId)  => axiosInstance.delete(`/api/admin/problems/${problemId}/testcases`)

// ── Leaderboard ──────────────────────────────────────────────────
export const recalculateLeaderboard = (period = 'AllTime') => axiosInstance.post(`/api/admin/leaderboard/recalculate?period=${period}`)