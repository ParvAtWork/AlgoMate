import axiosInstance from './axiosInstance.js'

// GET /api/submission/my
export const getMySubmissions = () =>
    axiosInstance.get('/api/submission/my')

// GET /api/submission/{id}
export const getSubmissionById = (id) =>
    axiosInstance.get(`/api/submission/${id}`)

// GET /api/submission/check/{problemId}
export const hasUserSolvedProblem = (problemId) =>
    axiosInstance.get(`/api/submission/check/${problemId}`)