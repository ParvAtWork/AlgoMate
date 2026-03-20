import { createSlice } from '@reduxjs/toolkit'

const initialState = {
    submissions: [],
    currentSubmission: null,
    loading: false,
    polling: false,
    error: null,
}

const submissionSlice = createSlice({
    name: 'submissions',
    initialState,
    reducers: {
        setSubmissions: (state, action) => {
            state.submissions = action.payload
            state.loading = false
            state.error = null
        },
        setCurrentSubmission: (state, action) => {
            state.currentSubmission = action.payload
            state.loading = false
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setPolling: (state, action) => {
            state.polling = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loading = false
            state.polling = false
        },
        clearCurrentSubmission: (state) => {
            state.currentSubmission = null
            state.polling = false
            state.error = null
        },
    },
})

export const {
    setSubmissions,
    setCurrentSubmission,
    setLoading,
    setPolling,
    setError,
    clearCurrentSubmission,
} = submissionSlice.actions
export default submissionSlice.reducer

// Selectors
export const selectSubmissions = (state) => state.submissions.submissions
export const selectCurrentSubmission = (state) => state.submissions.currentSubmission
export const selectSubmissionLoading = (state) => state.submissions.loading
export const selectPolling = (state) => state.submissions.polling
export const selectSubmissionError = (state) => state.submissions.error