import { DIFFICULTY } from '../config/constants.js'

export const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
        case DIFFICULTY.EASY:
            return 'text-green-500'
        case DIFFICULTY.MEDIUM:
            return 'text-yellow-500'
        case DIFFICULTY.HARD:
            return 'text-red-500'
        default:
            return 'text-gray-400'
    }
}

export const getDifficultyBgColor = (difficulty) => {
    switch (difficulty) {
        case DIFFICULTY.EASY:
            return 'bg-green-500/10 text-green-500 border-green-500/20'
        case DIFFICULTY.MEDIUM:
            return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
        case DIFFICULTY.HARD:
            return 'bg-red-500/10 text-red-500 border-red-500/20'
        default:
            return 'bg-gray-500/10 text-gray-400 border-gray-500/20'
    }
}

export const getDifficultyScore = (difficulty) => {
    switch (difficulty) {
        case DIFFICULTY.EASY:   return 100
        case DIFFICULTY.MEDIUM: return 200
        case DIFFICULTY.HARD:   return 300
        default:                return 0
    }
}