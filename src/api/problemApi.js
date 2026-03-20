import axiosInstance from './axiosInstance.js'

// GET /api/problem
export const getAllProblems = () =>
    axiosInstance.get('/api/problem')

// GET /api/problem/{id}
export const getProblemById = (id) =>
    axiosInstance.get(`/api/problem/${id}`)

// GET /api/problem/topic/{topic}
export const getProblemsByTopic = (topic) =>
    axiosInstance.get(`/api/problem/topic/${topic}`)

// GET /api/problem/difficulty/{difficulty}
export const getProblemsByDifficulty = (difficulty) =>
    axiosInstance.get(`/api/problem/difficulty/${difficulty}`)

// GET /api/problem/filter?topic=Arrays&difficulty=Easy
export const getProblemsByFilter = (topic, difficulty) =>
    axiosInstance.get('/api/problem/filter', {
        params: { topic, difficulty }
    })