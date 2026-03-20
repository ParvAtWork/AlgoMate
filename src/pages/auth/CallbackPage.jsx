import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../config/supabaseClient.js'
import { saveToken } from '../../utils/tokenHelper.js'
import { registerUser } from '../../api/authApi.js'

const CallbackPage = () => {
    const navigate = useNavigate()

    useEffect(() => {
        const handleCallback = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (session) {
                saveToken(session.access_token)
                try {
                    await registerUser('')
                } catch {}
                navigate('/')
            } else {
                navigate('/login')
            }
        }
        handleCallback()
    }, [navigate])

    return (
        <div className="min-h-screen bg-[#0f1117] flex items-center justify-center">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
    )
}

export default CallbackPage