import axiosInstance from './axiosInstance.js'

// GET /api/admin/stats
export const getDashboardStats = () =>
    axiosInstance.get('/api/admin/stats')

// GET /api/admin/users
export const getAllUsers = () =>
    axiosInstance.get('/api/admin/users')

// PUT /api/admin/users/{id}/role
export const updateUserRole = (id, role) =>
    axiosInstance.put(`/api/admin/users/${id}/role`, { role })

// PUT /api/admin/users/{id}/premium
export const togglePremium = (id, isPremium) =>
    axiosInstance.put(`/api/admin/users/${id}/premium`, { isPremium })

// DELETE /api/admin/users/{id}
export const deleteUser = (id) =>
    axiosInstance.delete(`/api/admin/users/${id}`)

// POST /api/admin/problems
export const addProblem = (problem) =>
    axiosInstance.post('/api/admin/problems', problem)

// PUT /api/admin/problems/{id}
export const updateProblem = (id, problem) =>
    axiosInstance.put(`/api/admin/problems/${id}`, problem)

// DELETE /api/admin/problems/{id}
export const deleteProblem = (id) =>
    axiosInstance.delete(`/api/admin/problems/${id}`)

// GET /api/admin/submissions
export const getAllSubmissions = () =>
    axiosInstance.get('/api/admin/submissions')

// GET /api/admin/submissions/recent
export const getRecentSubmissions = (count = 10) =>
    axiosInstance.get('/api/admin/submissions/recent', { params: { count } })

// POST /api/admin/leaderboard/recalculate
export const recalculateLeaderboard = (period = 'AllTime') =>
    axiosInstance.post('/api/admin/leaderboard/recalculate', null, {
        params: { period }
    })