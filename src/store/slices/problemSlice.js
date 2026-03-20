import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    problems: [],
    currentProblem: null,
    loading: false,
    error: null,
    filters: {
        difficulty: null,
        topic: null,
        search: '',
    },
}

const problemSlice = createSlice({
    name: 'problems',
    initialState,
    reducers: {
        setProblems: (state, action) => {
            state.problems = action.payload
            state.loading = false
            state.error = null
        },
        setCurrentProblem: (state, action) => {
            state.currentProblem = action.payload
            state.loading = false
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
        setFilters: (state, action) => {
            state.filters = { ...state.filters, ...action.payload }
        },
        clearFilters: (state) => {
            state.filters = { difficulty: null, topic: null, search: '' }
        },
    },
})

export const {
    setProblems,
    setCurrentProblem,
    setLoading,
    setError,
    setFilters,
    clearFilters,
} = problemSlice.actions
export default problemSlice.reducer

// Selectors
export const selectProblems = (state) => state.problems.problems
export const selectCurrentProblem = (state) => state.problems.currentProblem
export const selectProblemLoading = (state) => state.problems.loading
export const selectProblemError = (state) => state.problems.error
export const selectFilters = (state) => state.problems.filters