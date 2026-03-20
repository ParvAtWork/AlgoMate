import axiosInstance from './axiosInstance.js'

// POST /api/auth/register
export const registerUser = (username) =>
    axiosInstance.post('/api/auth/register', { username })

// GET /api/auth/me
export const getMe = () =>
    axiosInstance.get('/api/auth/me')

// GET /api/auth/check
export const checkToken = () =>
    axiosInstance.get('/api/auth/check')