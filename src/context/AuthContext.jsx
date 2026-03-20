import { createContext, useContext, useEffect, useState } from 'react'
import { useDispatch } from 'react-redux'
import { supabase } from '../config/supabaseClient.js'
import { setUser, clearUser, setLoading } from '../store/slices/authSlice.js'
import { getMe } from '../api/authApi.js'
import { saveToken, removeToken } from '../utils/tokenHelper.js'

const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
    const dispatch = useDispatch()
    const [initialized, setInitialized] = useState(false)

    useEffect(() => {
        const initAuth = async () => {
            try {
                dispatch(setLoading(true))
                if (!supabase) {
                    dispatch(clearUser())
                    setInitialized(true)
                    return
                }
                const { data: { session } } = await supabase.auth.getSession()
                if (session) {
                    saveToken(session.access_token)
                    try {
                        const res = await getMe()
                        dispatch(setUser(res.data))
                    } catch {
                        dispatch(clearUser())
                    }
                } else {
                    dispatch(clearUser())
                }
            } catch {
                dispatch(clearUser())
            } finally {
                dispatch(setLoading(false))
                setInitialized(true)
            }
        }

        initAuth()

        if (!supabase) return

        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                if (event === 'SIGNED_IN' && session) {
                    saveToken(session.access_token)
                    try {
                        const res = await getMe()
                        dispatch(setUser(res.data))
                    } catch {
                        dispatch(clearUser())
                    }
                }
                if (event === 'SIGNED_OUT') {
                    removeToken()
                    dispatch(clearUser())
                }
                if (event === 'TOKEN_REFRESHED' && session) {
                    saveToken(session.access_token)
                }
            }
        )

        return () => subscription.unsubscribe()
    }, [dispatch])

    return (
        <AuthContext.Provider value={{ initialized }}>
            {children}
        </AuthContext.Provider>
    )
}

export const useAuthContext = () => useContext(AuthContext)