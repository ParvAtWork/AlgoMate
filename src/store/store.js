import { configureStore } from '@reduxjs/toolkit'
import authReducer from './slices/authSlice.js'
import problemReducer from './slices/problemSlice.js'
import submissionReducer from './slices/submissionSlice.js'
import leaderboardReducer from './slices/leaderboardSlice.js'

export const store = configureStore({
    reducer: {
        auth: authReducer,
        problems: problemReducer,
        submissions: submissionReducer,
        leaderboard: leaderboardReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                // Date objects ignore karo
                ignoredActions: ['submissions/setCurrentSubmission'],
                ignoredPaths: ['submissions.currentSubmission.submittedAt'],
            },
        }),
})