const TOKEN_KEY = 'supabase_token'

export const saveToken = (token) => {
    localStorage.setItem(TOKEN_KEY, token)
}

export const getToken = () => {
    return localStorage.getItem(TOKEN_KEY)
}

export const removeToken = () => {
    localStorage.removeItem(TOKEN_KEY)
}

export const hasToken = () => {
    return !!localStorage.getItem(TOKEN_KEY)
}