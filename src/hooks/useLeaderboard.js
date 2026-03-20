import { useSelector, useDispatch } from 'react-redux'
import {
    getTopRankers,
    getLeaderboardByPeriod,
    getMyRank,
} from '../api/leaderboardApi.js'
import {
    setLeaderboard,
    setMyRank,
    setPeriod,
    setLoading,
    setError,
    selectLeaderboard,
    selectMyRank,
    selectPeriod,
    selectLeaderboardLoading,
    selectLeaderboardError,
    selectTotalEntries,
} from '../store/slices/leaderboardSlice.js'

export const useLeaderboard = () => {
    const dispatch = useDispatch()

    const leaderboard = useSelector(selectLeaderboard)
    const myRank = useSelector(selectMyRank)
    const period = useSelector(selectPeriod)
    const loading = useSelector(selectLeaderboardLoading)
    const error = useSelector(selectLeaderboardError)
    const totalEntries = useSelector(selectTotalEntries)

    const fetchTopRankers = async (count = 10) => {
        try {
            dispatch(setLoading(true))
            const res = await getTopRankers(count)
            dispatch(setLeaderboard(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const fetchByPeriod = async (selectedPeriod) => {
        try {
            dispatch(setLoading(true))
            dispatch(setPeriod(selectedPeriod))
            const res = await getLeaderboardByPeriod(selectedPeriod)
            dispatch(setLeaderboard(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const fetchMyRank = async () => {
        try {
            const res = await getMyRank()
            dispatch(setMyRank(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    return {
        leaderboard,
        myRank,
        period,
        loading,
        error,
        totalEntries,
        fetchTopRankers,
        fetchByPeriod,
        fetchMyRank,
    }
}