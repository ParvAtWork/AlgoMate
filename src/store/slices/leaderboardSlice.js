import { createSlice } from '@reduxjs/toolkit'
import { LEADERBOARD_PERIODS } from '../../config/constants.js'

const initialState = {
    leaderboard: [],
    myRank: null,
    period: LEADERBOARD_PERIODS[0],
    totalEntries: 0,
    loading: false,
    error: null,
}

const leaderboardSlice = createSlice({
    name: 'leaderboard',
    initialState,
    reducers: {
        setLeaderboard: (state, action) => {
            state.leaderboard = action.payload.rankings || []
            state.totalEntries = action.payload.totalEntries || 0
            state.loading = false
            state.error = null
        },
        setMyRank: (state, action) => {
            state.myRank = action.payload
        },
        setPeriod: (state, action) => {
            state.period = action.payload
        },
        setLoading: (state, action) => {
            state.loading = action.payload
        },
        setError: (state, action) => {
            state.error = action.payload
            state.loading = false
        },
    },
})

export const {
    setLeaderboard,
    setMyRank,
    setPeriod,
    setLoading,
    setError,
} = leaderboardSlice.actions
export default leaderboardSlice.reducer

// Selectors
export const selectLeaderboard = (state) => state.leaderboard.leaderboard
export const selectMyRank = (state) => state.leaderboard.myRank
export const selectPeriod = (state) => state.leaderboard.period
export const selectLeaderboardLoading = (state) => state.leaderboard.loading
export const selectLeaderboardError = (state) => state.leaderboard.error
export const selectTotalEntries = (state) => state.leaderboard.totalEntries