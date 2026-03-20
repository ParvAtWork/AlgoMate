import axiosInstance from './axiosInstance.js'

// POST /api/compiler/submit
export const submitCode = (problemId, code, languageId) =>
    axiosInstance.post('/api/compiler/submit', {
        problemId,
        code,
        languageId,
    })

// GET /api/compiler/result/{token}
export const getResult = (token) =>
    axiosInstance.get(`/api/compiler/result/${token}`)

// GET /api/compiler/languages
export const getSupportedLanguages = () =>
    axiosInstance.get('/api/compiler/languages')