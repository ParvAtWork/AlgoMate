import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { submitCode, getResult } from '../api/compilerApi.js'
import {
    setCurrentSubmission,
    setLoading,
    setPolling,
    setError,
    clearCurrentSubmission,
    selectCurrentSubmission,
    selectSubmissionLoading,
    selectPolling,
} from '../store/slices/submissionSlice.js'
import { isTerminalStatus } from '../utils/statusHelper.js'
import { POLL_INTERVAL_MS, MAX_POLL_ATTEMPTS } from '../config/constants.js'

export const useCompiler = () => {
    const dispatch = useDispatch()
    const [judge0Token, setJudge0Token] = useState(null)

    const currentSubmission = useSelector(selectCurrentSubmission)
    const loading = useSelector(selectSubmissionLoading)
    const polling = useSelector(selectPolling)

    const submit = async (problemId, code, languageId) => {
        try {
            dispatch(setLoading(true))
            dispatch(clearCurrentSubmission())

            const res = await submitCode(problemId, code, languageId)
            const token = res.data.judge0Token
            setJudge0Token(token)

            // Polling shuru karo
            dispatch(setPolling(true))
            await pollResult(token)
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const pollResult = async (token) => {
        let attempts = 0

        const interval = setInterval(async () => {
            attempts++
            try {
                const res = await getResult(token)
                const submission = res.data

                if (isTerminalStatus(submission.status)) {
                    clearInterval(interval)
                    dispatch(setCurrentSubmission(submission))
                    dispatch(setPolling(false))
                }

                if (attempts >= MAX_POLL_ATTEMPTS) {
                    clearInterval(interval)
                    dispatch(setPolling(false))
                    dispatch(setError('Result timeout — please try again'))
                }
            } catch (err) {
                clearInterval(interval)
                dispatch(setError(err.message))
                dispatch(setPolling(false))
            }
        }, POLL_INTERVAL_MS)
    }

    const resetSubmission = () => {
        dispatch(clearCurrentSubmission())
        setJudge0Token(null)
    }

    return {
        currentSubmission,
        loading,
        polling,
        judge0Token,
        submit,
        resetSubmission,
    }
}