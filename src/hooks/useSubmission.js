import { useSelector, useDispatch } from 'react-redux'
import {
    getMySubmissions,
    getSubmissionById,
    hasUserSolvedProblem,
} from '../api/submissionApi.js'
import {
    setSubmissions,
    setCurrentSubmission,
    setLoading,
    setError,
    selectSubmissions,
    selectCurrentSubmission,
    selectSubmissionLoading,
    selectSubmissionError,
} from '../store/slices/submissionSlice.js'

export const useSubmission = () => {
    const dispatch = useDispatch()

    const submissions = useSelector(selectSubmissions)
    const currentSubmission = useSelector(selectCurrentSubmission)
    const loading = useSelector(selectSubmissionLoading)
    const error = useSelector(selectSubmissionError)

    const fetchMySubmissions = async () => {
        try {
            dispatch(setLoading(true))
            const res = await getMySubmissions()
            dispatch(setSubmissions(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const fetchSubmissionById = async (id) => {
        try {
            dispatch(setLoading(true))
            const res = await getSubmissionById(id)
            dispatch(setCurrentSubmission(res.data))
        } catch (err) {
            dispatch(setError(err.message))
        }
    }

    const checkSolved = async (problemId) => {
        try {
            const res = await hasUserSolvedProblem(problemId)
            return res.data.solved
        } catch {
            return false
        }
    }

    return {
        submissions,
        currentSubmission,
        loading,
        error,
        fetchMySubmissions,
        fetchSubmissionById,
        checkSolved,
    }
}