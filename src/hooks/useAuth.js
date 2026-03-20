import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../config/supabaseClient.js'
import { setUser, clearUser, setLoading, setError } from '../store/slices/authSlice.js'
import { registerUser, getMe } from '../api/authApi.js'
import { saveToken, removeToken } from '../utils/tokenHelper.js'
import {
    selectUser,
    selectIsAuthenticated,
    selectAuthLoading,
    selectAuthError,
    selectIsAdmin,
} from '../store/slices/authSlice.js'

export const useAuth = () => {
    const dispatch = useDispatch()
    const navigate = useNavigate()

    const user = useSelector(selectUser)
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const loading = useSelector(selectAuthLoading)
    const error = useSelector(selectAuthError)
    const isAdmin = useSelector(selectIsAdmin)

    // Supabase se login — Google/GitHub OAuth
    const loginWithGoogle = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: `${window.location.origin}/callback` },
        })
    }

    const loginWithGithub = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: { redirectTo: `${window.location.origin}/callback` },
        })
    }

    // Email/Password login
    const loginWithEmail = async (email, password) => {
        try {
            dispatch(setLoading(true))
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
            })
            if (error) throw error

            const token = data.session.access_token
            saveToken(token)

            const res = await getMe()
            dispatch(setUser(res.data))
            navigate('/')
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    // Email/Password signup
    const signupWithEmail = async (email, password, username) => {
        try {
            dispatch(setLoading(true))
            const { data, error } = await supabase.auth.signUp({ email, password })
            if (error) throw error

            const token = data.session?.access_token
            if (token) {
                saveToken(token)
                await registerUser(username)
                const res = await getMe()
                dispatch(setUser(res.data))
                navigate('/')
            }
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    // Logout
    const logout = async () => {
        await supabase.auth.signOut()
        removeToken()
        dispatch(clearUser())
        navigate('/login')
    }

    // Session initialize karo — app load pe
    const initializeAuth = async () => {
        try {
            dispatch(setLoading(true))
            const { data: { session } } = await supabase.auth.getSession()

            if (session) {
                saveToken(session.access_token)
                const res = await getMe()
                dispatch(setUser(res.data))
            } else {
                dispatch(clearUser())
            }
        } catch (err) {
            dispatch(clearUser())
        } finally {
            dispatch(setLoading(false))
        }
    }

    return {
        user,
        isAuthenticated,
        loading,
        error,
        isAdmin,
        loginWithGoogle,
        loginWithGithub,
        loginWithEmail,
        signupWithEmail,
        logout,
        initializeAuth,
    }
}