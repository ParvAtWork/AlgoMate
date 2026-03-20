import axiosInstance from './axiosInstance.js'

// GET /api/leaderboard
export const getTopRankers = (count = 10) =>
    axiosInstance.get('/api/leaderboard', { params: { count } })

// GET /api/leaderboard/period/{period}
export const getLeaderboardByPeriod = (period) =>
    axiosInstance.get(`/api/leaderboard/period/${period}`)

// GET /api/leaderboard/me
export const getMyRank = () =>
    axiosInstance.get('/api/leaderboard/me')

// GET /api/leaderboard/user/{userId}
export const getUserRank = (userId) =>
    axiosInstance.get(`/api/leaderboard/user/${userId}`)