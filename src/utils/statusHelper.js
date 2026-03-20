import { SUBMISSION_STATUS } from '../config/constants.js'

export const getStatusColor = (status) => {
    switch (status) {
        case SUBMISSION_STATUS.ACCEPTED:
            return 'text-green-500'
        case SUBMISSION_STATUS.WRONG_ANSWER:
            return 'text-red-500'
        case SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED:
            return 'text-yellow-500'
        case SUBMISSION_STATUS.COMPILATION_ERROR:
            return 'text-orange-500'
        case SUBMISSION_STATUS.RUNTIME_ERROR:
            return 'text-red-400'
        case SUBMISSION_STATUS.PENDING:
        case SUBMISSION_STATUS.IN_QUEUE:
        case SUBMISSION_STATUS.PROCESSING:
            return 'text-blue-400'
        default:
            return 'text-gray-400'
    }
}

export const getStatusBgColor = (status) => {
    switch (status) {
        case SUBMISSION_STATUS.ACCEPTED:
            return 'bg-green-500/10 text-green-500 border-green-500/20'
        case SUBMISSION_STATUS.WRONG_ANSWER:
            return 'bg-red-500/10 text-red-500 border-red-500/20'
        case SUBMISSION_STATUS.TIME_LIMIT_EXCEEDED:
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        case SUBMISSION_STATUS.COMPILATION_ERROR:
            return 'bg-orange-500/10 text-orange-500 border-orange-500/20'
        case SUBMISSION_STATUS.RUNTIME_ERROR:
            return 'bg-red-400/10 text-red-400 border-red-400/20'
        case SUBMISSION_STATUS.PENDING:
        case SUBMISSION_STATUS.IN_QUEUE:
        case SUBMISSION_STATUS.PROCESSING:
            return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
        default:
            return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
}

export const isTerminalStatus = (status) => {
    return ![
        SUBMISSION_STATUS.PENDING,
        SUBMISSION_STATUS.IN_QUEUE,
        SUBMISSION_STATUS.PROCESSING,
    ].includes(status)
}

export const isSuccessfulStatus = (status) => {
    return status === SUBMISSION_STATUS.ACCEPTED
}