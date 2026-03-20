import axios from 'axios'
import { API_BASE_URL } from '../config/constants.js'

const axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
})

// Request interceptor — har request mein JWT token attach karo
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('supabase_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

// Response interceptor — 401 pe logout karo
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('supabase_token')
            window.location.href = '/login'
        }
        return Promise.reject(error)
    }
)

export default axiosInstance