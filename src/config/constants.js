export const API_BASE_URL = 'http://localhost:5000'

export const DIFFICULTY = {
    EASY: 'Easy',
    MEDIUM: 'Medium',
    HARD: 'Hard',
}

export const TOPICS = [
    'Arrays',
    'Linked Lists',
    'Stacks',
    'Queues',
    'Trees',
    'Graphs',
    'Dynamic Programming',
]

export const PROGRAMMING_LANGUAGES = [
    { id: 50,  name: 'C (GCC 9.2.0)',              extension: '.c'    },
    { id: 54,  name: 'C++ (GCC 9.2.0)',            extension: '.cpp'  },
    { id: 51,  name: 'C# (Mono 6.6.0)',            extension: '.cs'   },
    { id: 62,  name: 'Java (OpenJDK 13)',           extension: '.java' },
    { id: 71,  name: 'Python (3.8.1)',              extension: '.py'   },
    { id: 63,  name: 'JavaScript (Node.js 12.14.0)',extension: '.js'   },
    { id: 60,  name: 'Go (1.13.5)',                 extension: '.go'   },
    { id: 72,  name: 'Ruby (2.7.0)',                extension: '.rb'   },
]

export const SUBMISSION_STATUS = {
    PENDING: 'Pending',
    IN_QUEUE: 'In Queue',
    PROCESSING: 'Processing',
    ACCEPTED: 'Accepted',
    WRONG_ANSWER: 'Wrong Answer',
    TIME_LIMIT_EXCEEDED: 'Time Limit Exceeded',
    COMPILATION_ERROR: 'Compilation Error',
    RUNTIME_ERROR: 'Runtime Error',
    INTERNAL_ERROR: 'Internal Error',
    EXEC_FORMAT_ERROR: 'Execution Format Error',
}

export const LEADERBOARD_PERIODS = [
    'AllTime',
    'Weekly',
    'Monthly',
]

export const ROLES = {
    STUDENT: 'Student',
    ADMIN: 'Admin',
}

export const POLL_INTERVAL_MS = 2000
export const MAX_POLL_ATTEMPTS = 15