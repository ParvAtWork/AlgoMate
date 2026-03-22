// src/pages/auth/CallbackPage.jsx
import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabaseClient.js'
import { useDispatch } from 'react-redux'
import { setUser, setLoading, clearUser } from '../../store/slices/authSlice.js'
import { getMe, registerUser } from '../../api/authApi.js'
import { saveToken } from '../../utils/tokenHelper.js'

const CallbackPage = () => {
    const navigate = useNavigate()
    const dispatch = useDispatch()

    useEffect(() => {
        const handleCallback = async () => {
            try {
                dispatch(setLoading(true))
                const { data: { session }, error } = await supabase.auth.getSession()
                if (error || !session) { navigate('/login'); return }

                saveToken(session.access_token)

                try {
                    const res = await getMe()
                    dispatch(setUser(res.data))
                } catch {
                    // New OAuth user — register karo
                    const username = session.user.email?.split('@')[0] || 'user'
                    await registerUser(username)
                    const res = await getMe()
                    dispatch(setUser(res.data))
                }
                navigate('/problems')
            } catch {
                dispatch(clearUser())
                navigate('/login')
            } finally {
                dispatch(setLoading(false))
            }
        }
        handleCallback()
    }, [])

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
                @keyframes cb-spin { to{transform:rotate(360deg)} }
                @keyframes cb-pulse { 0%,100%{opacity:.4} 50%{opacity:1} }
                @keyframes cb-fade { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
                @keyframes cb-grid { 0%,100%{opacity:.025} 50%{opacity:.055} }
                .cb-page { min-height:100vh; background:#06080e; display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; position:relative; overflow:hidden; }
                .cb-grid { position:absolute; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.025) 0,transparent 1px,transparent 60px),repeating-linear-gradient(180deg,rgba(226,232,240,.025) 0,transparent 1px,transparent 60px); animation:cb-grid 5s ease-in-out infinite; pointer-events:none; }
            `}</style>
            <div className="cb-page">
                <div className="cb-grid" />
                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:20, animation:'cb-fade .5s ease-out both', position:'relative', zIndex:1 }}>
                    <div style={{ position:'relative', width:56, height:56 }}>
                        <div style={{ width:56, height:56, border:'2px solid rgba(226,232,240,.08)', borderTop:'2px solid #60a5fa', borderRadius:'50%', animation:'cb-spin .8s linear infinite' }} />
                        <div style={{ position:'absolute', inset:8, border:'2px solid rgba(226,232,240,.05)', borderTop:'2px solid rgba(129,140,248,.6)', borderRadius:'50%', animation:'cb-spin 1.2s linear infinite reverse' }} />
                    </div>
                    <div style={{ textAlign:'center' }}>
                        <div style={{ fontSize:16, fontWeight:700, color:'#e2e8f0', marginBottom:6 }}>
                            Signing you in...
                        </div>
                        <div style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.45)', animation:'cb-pulse 1.5s ease-in-out infinite' }}>
                            Setting up your account
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default CallbackPage