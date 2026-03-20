import axiosInstance from './axiosInstance.js'

// GET /api/user/me
export const getMyProfile = () =>
    axiosInstance.get('/api/user/me')

// GET /api/user/{id}
export const getUserById = (id) =>
    axiosInstance.get(`/api/user/${id}`)

// POST /api/user/register
export const registerUserProfile = (userData) =>
    axiosInstance.post('/api/user/register', userData)

// PUT /api/user/me
export const updateMyProfile = (userData) =>
    axiosInstance.put('/api/user/me', userData)

// GET /api/user/top/{count}
export const getTopUsers = (count = 10) =>
    axiosInstance.get(`/api/user/top/${count}`)