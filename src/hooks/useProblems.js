import { useSelector, useDispatch } from 'react-redux'
import {
    getAllProblems,
    getProblemById,
    getProblemsByTopic,
    getProblemsByDifficulty,
    getProblemsByFilter,
} from '../api/problemApi.js'
import {
    setProblems,
    setCurrentProblem,
    setLoading,
    setError,
    setFilters,
    clearFilters,
    selectProblems,
    selectCurrentProblem,
    selectProblemLoading,
    selectProblemError,
    selectFilters,
} from '../store/slices/problemSlice.js'

export const useProblems = () => {
    const dispatch = useDispatch()

    const problems = useSelector(selectProblems)
    const currentProblem = useSelector(selectCurrentProblem)
    const loading = useSelector(selectProblemLoading)
    const error = useSelector(selectProblemError)
    const filters = useSelector(selectFilters)

    const fetchAllProblems = async () => {
        try {
            dispatch(setLoading(true))
            const res = await getAllProblems()
            dispatch(setProblems(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const fetchProblemById = async (id) => {
        try {
            dispatch(setLoading(true))
            const res = await getProblemById(id)
            dispatch(setCurrentProblem(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const fetchByTopic = async (topic) => {
        try {
            dispatch(setLoading(true))
            const res = await getProblemsByTopic(topic)
            dispatch(setProblems(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const fetchByDifficulty = async (difficulty) => {
        try {
            dispatch(setLoading(true))
            const res = await getProblemsByDifficulty(difficulty)
            dispatch(setProblems(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const fetchByFilter = async (topic, difficulty) => {
        try {
            dispatch(setLoading(true))
            const res = await getProblemsByFilter(topic, difficulty)
            dispatch(setProblems(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const updateFilters = (newFilters) => {
        dispatch(setFilters(newFilters))
    }

    const resetFilters = () => {
        dispatch(clearFilters())
    }

    return {
        problems,
        currentProblem,
        loading,
        error,
        filters,
        fetchAllProblems,
        fetchProblemById,
        fetchByTopic,
        fetchByDifficulty,
        fetchByFilter,
        updateFilters,
        resetFilters,
    }
}