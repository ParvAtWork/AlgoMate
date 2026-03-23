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
    const loading           = useSelector(selectSubmissionLoading)
    const polling           = useSelector(selectPolling)

    const submit = async (problemId, code, languageId) => {
        try {
            dispatch(setLoading(true))
            dispatch(clearCurrentSubmission())

            const res = await submitCode(problemId, code, languageId)

            // ── Judge0 token ya submission id dono handle karo ──
            const token      = res.data?.judge0Token
            const submission = res.data

            // Agar submission already terminal hai (unlikely but safe)
            if (submission && isTerminalStatus(submission.status)) {
                dispatch(setCurrentSubmission(submission))
                dispatch(setPolling(false))
                return
            }

            if (!token) {
                dispatch(setError('No judge token received'))
                return
            }

            setJudge0Token(token)
            dispatch(setPolling(true))
            await pollResult(token)

        } catch (err) {
            const msg = err?.response?.data?.message || err?.response?.data || err.message || 'Submission failed'
            dispatch(setError(String(msg)))
            dispatch(setPolling(false))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const pollResult = (token) => {
        return new Promise((resolve) => {
            let attempts = 0

            const interval = setInterval(async () => {
                attempts++
                try {
                    const res        = await getResult(token)
                    const submission = res.data

                    // Har poll mein current submission update karo
                    // taaki doosre user ko bhi live status mile
                    dispatch(setCurrentSubmission(submission))

                    if (isTerminalStatus(submission.status)) {
                        clearInterval(interval)
                        dispatch(setPolling(false))
                        resolve(submission)
                        return
                    }

                    if (attempts >= MAX_POLL_ATTEMPTS) {
                        clearInterval(interval)
                        dispatch(setPolling(false))
                        dispatch(setError('Result timeout — please try again'))
                        resolve(null)
                    }

                } catch (err) {
                    clearInterval(interval)
                    dispatch(setPolling(false))
                    dispatch(setError(err?.response?.data?.message || err.message || 'Polling failed'))
                    resolve(null)
                }
            }, POLL_INTERVAL_MS)
        })
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


// import { useState } from 'react'
// import { useDispatch, useSelector } from 'react-redux'
// import { submitCode, getResult } from '../api/compilerApi.js'
// import {
//     setCurrentSubmission,
//     setLoading,
//     setPolling,
//     setError,
//     clearCurrentSubmission,
//     selectCurrentSubmission,
//     selectSubmissionLoading,
//     selectPolling,
// } from '../store/slices/submissionSlice.js'
// import { isTerminalStatus } from '../utils/statusHelper.js'
// import { POLL_INTERVAL_MS, MAX_POLL_ATTEMPTS } from '../config/constants.js'
//
// export const useCompiler = () => {
//     const dispatch = useDispatch()
//     const [judge0Token, setJudge0Token] = useState(null)
//
//     const currentSubmission = useSelector(selectCurrentSubmission)
//     const loading = useSelector(selectSubmissionLoading)
//     const polling = useSelector(selectPolling)
//
//     const submit = async (problemId, code, languageId) => {
//         try {
//             dispatch(setLoading(true))
//             dispatch(clearCurrentSubmission())
//
//             const res = await submitCode(problemId, code, languageId)
//             const token = res.data.judge0Token
//             setJudge0Token(token)
//
//             // Polling shuru karo
//             dispatch(setPolling(true))
//             await pollResult(token)
//         } catch (err) {
//             dispatch(setError(err.message))
//         } finally {
//             dispatch(setLoading(false))
//         }
//     }
//
//     const pollResult = async (token) => {
//         let attempts = 0
//
//         const interval = setInterval(async () => {
//             attempts++
//             try {
//                 const res = await getResult(token)
//                 const submission = res.data
//
//                 if (isTerminalStatus(submission.status)) {
//                     clearInterval(interval)
//                     dispatch(setCurrentSubmission(submission))
//                     dispatch(setPolling(false))
//                 }
//
//                 if (attempts >= MAX_POLL_ATTEMPTS) {
//                     clearInterval(interval)
//                     dispatch(setPolling(false))
//                     dispatch(setError('Result timeout — please try again'))
//                 }
//             } catch (err) {
//                 clearInterval(interval)
//                 dispatch(setError(err.message))
//                 dispatch(setPolling(false))
//             }
//         }, POLL_INTERVAL_MS)
//     }
//
//     const resetSubmission = () => {
//         dispatch(clearCurrentSubmission())
//         setJudge0Token(null)
//     }
//
//     return {
//         currentSubmission,
//         loading,
//         polling,
//         judge0Token,
//         submit,
//         resetSubmission,
//     }
// }