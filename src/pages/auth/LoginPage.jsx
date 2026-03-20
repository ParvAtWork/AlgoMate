import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useSelector } from 'react-redux'
import { selectAuthLoading, selectAuthError } from '../../store/slices/authSlice.js'
import { Eye, EyeOff } from 'lucide-react'
import FloatingBackground from '../../components/common/FloatingBackground.jsx'

const LoginPage = () => {
    const { loginWithEmail, loginWithGoogle, loginWithGithub } = useAuth()
    const loading = useSelector(selectAuthLoading)
    const error = useSelector(selectAuthError)

    const [tab, setTab] = useState('email')
    const [identifier, setIdentifier] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [slideDir, setSlideDir] = useState('left')

    const mainRef = useRef(null)
    const passRef = useRef(null)
    const [mainTyping, setMainTyping] = useState(false)
    const [passTyping, setPassTyping] = useState(false)
    const [mainDone, setMainDone] = useState(false)
    const [passDone, setPassDone] = useState(false)
    const isTypingRef = useRef(false)
    const textIndexRef = useRef(0)
    const currentTabRef = useRef('email')
    const intervalsRef = useRef([])
    const timeoutsRef = useRef([])

    const emailTexts = ['parv@algomate.dev', 'user@gmail.com', 'coder@dev.io']
    const userTexts = ['parv_dev', 'algo_master', 'coder_123']

    const clearAll = () => {
        intervalsRef.current.forEach(clearInterval)
        timeoutsRef.current.forEach(clearTimeout)
        intervalsRef.current = []
        timeoutsRef.current = []
    }

    const typeText = (ref, text, speed, onDone) => {
        let i = 0
        if (ref.current) ref.current.value = ''
        const iv = setInterval(() => {
            if (!ref.current) { clearInterval(iv); return }
            ref.current.value = text.slice(0, i++)
            if (i > text.length) { clearInterval(iv); onDone && onDone() }
        }, speed)
        intervalsRef.current.push(iv)
    }

    const runSequence = () => {
        if (isTypingRef.current) return
        isTypingRef.current = true
        const texts = currentTabRef.current === 'email' ? emailTexts : userTexts
        const text = texts[textIndexRef.current % texts.length]
        textIndexRef.current++
        if (mainRef.current) mainRef.current.value = ''
        if (passRef.current) passRef.current.value = ''
        setMainTyping(true)
        setPassTyping(false)
        setMainDone(false)
        setPassDone(false)
        typeText(mainRef, text, currentTabRef.current === 'email' ? 75 : 100, () => {
            setMainTyping(false)
            setMainDone(true)
            const t1 = setTimeout(() => {
                setPassTyping(true)
                typeText(passRef, '••••••••••••', 90, () => {
                    setPassTyping(false)
                    setPassDone(true)
                    isTypingRef.current = false
                    const t2 = setTimeout(runSequence, 2500)
                    timeoutsRef.current.push(t2)
                })
            }, 400)
            timeoutsRef.current.push(t1)
        })
    }

    useEffect(() => {
        const t = setTimeout(runSequence, 800)
        timeoutsRef.current.push(t)
        return () => clearAll()
    }, [])

    const switchTab = (newTab) => {
        if (newTab === tab) return
        clearAll()
        isTypingRef.current = false
        textIndexRef.current = 0
        currentTabRef.current = newTab
        setTab(newTab)
        setSlideDir(newTab === 'email' ? 'right' : 'left')
        setIdentifier('')
        setPassword('')
        setMainTyping(false)
        setPassTyping(false)
        setMainDone(false)
        setPassDone(false)
        if (mainRef.current) mainRef.current.value = ''
        if (passRef.current) passRef.current.value = ''
        const t = setTimeout(runSequence, 300)
        timeoutsRef.current.push(t)
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        await loginWithEmail(identifier, password)
    }

    const inputStyle = (isTyping, isDone) => ({
        width: '100%',
        padding: '11px 14px 11px 40px',
        borderRadius: 9,
        background: isTyping ? 'rgba(96,165,250,.04)' : isDone ? 'rgba(226,232,240,.05)' : 'rgba(226,232,240,.04)',
        border: `1px solid ${isTyping ? 'rgba(96,165,250,.4)' : isDone ? 'rgba(226,232,240,.15)' : 'rgba(226,232,240,.1)'}`,
        boxShadow: isTyping ? '0 0 0 3px rgba(96,165,250,.1)' : 'none',
        color: isTyping ? '#60a5fa' : 'rgba(226,232,240,.8)',
        fontSize: 14,
        fontFamily: "'JetBrains Mono', monospace",
        outline: 'none',
        transition: 'all .3s',
        letterSpacing: '.02em',
    })

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{opacity:.1} 50%{opacity:.2} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-3px);opacity:1} }
        @keyframes slideLeft { from{opacity:0;transform:translateX(12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes slideRight { from{opacity:0;transform:translateX(-12px)} to{opacity:1;transform:translateX(0)} }
        @keyframes bgFloat { 0%{opacity:0;transform:translateY(0)} 8%{opacity:1} 88%{opacity:1} 100%{opacity:0;transform:translateY(-60px)} }
        @keyframes gridFade { 0%,100%{opacity:.025} 50%{opacity:.055} }

        .li-page { min-height:100vh; background:#06080e; display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; position:relative; overflow:hidden; padding:100px 20px 40px; }
        .li-grid { position:absolute; inset:0; background: repeating-linear-gradient(90deg,rgba(226,232,240,.025) 0,transparent 1px,transparent 60px), repeating-linear-gradient(180deg,rgba(226,232,240,.025) 0,transparent 1px,transparent 60px); animation:gridFade 5s ease-in-out infinite; pointer-events:none; }
        .li-glow { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:glowPulse 4s ease-in-out infinite; }
        .li-card { position:relative; z-index:10; width:100%; max-width:420px; background:rgba(6,8,14,.92); border:1px solid rgba(226,232,240,.12); border-radius:18px; padding:36px 32px; backdrop-filter:blur(24px); animation:fadeUp .5s ease-out both; }
        .li-logo-shimmer { background:linear-gradient(90deg,#e2e8f0,#60a5fa,#e2e8f0); background-size:250% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3s linear infinite; }
        .li-toggle-wrap { display:flex; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.08); border-radius:10px; padding:3px; margin-bottom:22px; }
        .li-tab { flex:1; padding:8px 0; border-radius:8px; font-size:13px; font-weight:600; cursor:pointer; border:none; transition:all .25s; font-family:'Space Grotesk',sans-serif; }
        .li-tab.active { background:linear-gradient(135deg,rgba(226,232,240,.12),rgba(96,165,250,.1)); color:#e2e8f0; border:1px solid rgba(226,232,240,.15); box-shadow:0 2px 8px rgba(0,0,0,.3); }
        .li-tab.inactive { background:transparent; color:rgba(148,163,184,.5); }
        .li-tab.inactive:hover { color:rgba(148,163,184,.8); }
        .li-label { font-size:11px; font-weight:600; color:rgba(148,163,184,.6); letter-spacing:.08em; margin-bottom:7px; font-family:'JetBrains Mono',monospace; text-transform:uppercase; }
        .li-iw { position:relative; margin-bottom:8px; }
        .li-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:rgba(148,163,184,.4); pointer-events:none; font-size:14px; }
        .tdots { display:flex; gap:3px; position:absolute; right:12px; top:50%; transform:translateY(-50%); }
        .td { width:4px; height:4px; border-radius:50%; background:#60a5fa; }
        .td:nth-child(1) { animation:dotBounce .8s ease-in-out infinite 0s; }
        .td:nth-child(2) { animation:dotBounce .8s ease-in-out infinite .15s; }
        .td:nth-child(3) { animation:dotBounce .8s ease-in-out infinite .3s; }
        .li-real-input { width:100%; padding:11px 14px 11px 40px; border-radius:9px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:14px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .3s; letter-spacing:.02em; }
        .li-real-input:focus { background:rgba(96,165,250,.04); border-color:rgba(96,165,250,.4); box-shadow:0 0 0 3px rgba(96,165,250,.1); color:#60a5fa; }
        .li-real-input::placeholder { color:rgba(148,163,184,.3); }
        .li-hint { font-size:10.5px; color:rgba(148,163,184,.35); font-family:'JetBrains Mono',monospace; margin-bottom:14px; display:flex; align-items:center; gap:5px; }
        .li-hint-dot { width:4px; height:4px; border-radius:50%; background:rgba(96,165,250,.4); flex-shrink:0; }
        .li-btn-primary { width:100%; padding:12px; border-radius:10px; font-size:14.5px; font-weight:700; color:#0f172a; background:linear-gradient(135deg,#e2e8f0,#60a5fa); border:none; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .25s; margin-bottom:16px; }
        .li-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(96,165,250,.25); filter:brightness(1.05); }
        .li-btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .li-divider { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .li-dl { flex:1; height:1px; background:rgba(226,232,240,.08); }
        .li-dt { font-size:11px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
        .li-btn-oauth { width:100%; padding:10px 14px; border-radius:9px; font-size:13.5px; font-weight:500; color:rgba(226,232,240,.8); background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:9px; }
        .li-btn-oauth:hover { background:rgba(226,232,240,.07); border-color:rgba(226,232,240,.18); transform:translateY(-1px); }
        .li-error { font-size:12px; color:#f87171; background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.2); border-radius:8px; padding:10px 14px; margin-bottom:14px; font-family:'JetBrains Mono',monospace; }
      `}</style>

            <div className="li-page">
                <div className="li-grid" />
                <div className="li-glow" style={{ width:500, height:500, background:'rgba(96,165,250,.07)', top:-150, left:'50%', transform:'translateX(-50%)' }} />
                <div className="li-glow" style={{ width:300, height:300, background:'rgba(139,92,246,.05)', bottom:-80, right:'5%', animationDelay:'2s' }} />

                <FloatingBackground cardWidth={420} />

                <div className="li-card">
                    {/* Logo */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, animation:'fadeUp .5s ease-out both' }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,rgba(226,232,240,.1),rgba(96,165,250,.08))', border:'1px solid rgba(226,232,240,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:'#e2e8f0' }}>&lt;/&gt;</div>
                        <span style={{ fontSize:18, fontWeight:800, letterSpacing:'-.02em' }}>
              <span className="li-logo-shimmer">AlgoMate_</span>
            </span>
                    </div>

                    <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-.025em', color:'#e2e8f0', margin:'0 0 6px', animation:'fadeUp .5s ease-out .1s both' }}>Welcome back 👋</h1>
                    <p style={{ fontSize:13.5, color:'rgba(148,163,184,.6)', margin:'0 0 22px', animation:'fadeUp .5s ease-out .18s both' }}>Sign in to continue your DSA journey</p>

                    {/* Toggle */}
                    <div className="li-toggle-wrap" style={{ animation:'fadeUp .5s ease-out .22s both' }}>
                        <button className={`li-tab ${tab === 'email' ? 'active' : 'inactive'}`} onClick={() => switchTab('email')}>✉ Email</button>
                        <button className={`li-tab ${tab === 'username' ? 'active' : 'inactive'}`} onClick={() => switchTab('username')}>👤 Username</button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="li-error">⚠ {error}</div>}

                        {/* Main Input */}
                        <div key={tab} style={{ animation:`${slideDir === 'left' ? 'slideLeft' : 'slideRight'} .25s ease-out both` }}>
                            <div className="li-label">{tab === 'email' ? 'Email' : 'Username'}</div>
                            <div className="li-iw">
                                <span className="li-ico">{tab === 'email' ? '✉' : '👤'}</span>
                                <input ref={mainRef} readOnly style={{ ...inputStyle(mainTyping, mainDone), display: identifier ? 'none' : 'block' }} />
                                <input className="li-real-input" style={{ display: identifier ? 'block' : 'none' }} type={tab === 'email' ? 'email' : 'text'} placeholder={tab === 'email' ? 'you@example.com' : 'your_username'} value={identifier} onChange={e => setIdentifier(e.target.value)} required />
                                {mainTyping && <div className="tdots"><div className="td" /><div className="td" /><div className="td" /></div>}
                            </div>
                            <div className="li-hint">
                                <div className="li-hint-dot" />
                                <span>{tab === 'email' ? 'Enter your registered email address' : 'Enter your AlgoMate username'}</span>
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ animation:'fadeUp .5s ease-out .35s both' }}>
                            <div className="li-label">Password</div>
                            <div className="li-iw" style={{ marginBottom:8 }}>
                                <span className="li-ico">🔒</span>
                                <input ref={passRef} readOnly style={{ ...inputStyle(passTyping, passDone), display: password ? 'none' : 'block', paddingRight:42 }} />
                                <input className="li-real-input" style={{ display: password ? 'block' : 'none', paddingRight:42 }} type={showPass ? 'text' : 'password'} placeholder="your password" value={password} onChange={e => setPassword(e.target.value)} required />
                                {passTyping && <div className="tdots"><div className="td" /><div className="td" /><div className="td" /></div>}
                                {password && (
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.5)', padding:0, display:'flex' }}>
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        <div style={{ fontSize:11.5, color:'#60a5fa', textAlign:'right', marginBottom:16, cursor:'pointer', fontFamily:"'JetBrains Mono',monospace", animation:'fadeUp .5s ease-out .4s both' }}>
                            Forgot password?
                        </div>

                        <button className="li-btn-primary" type="submit" disabled={loading} style={{ animation:'fadeUp .5s ease-out .45s both' }}>
                            {loading ? 'Signing in...' : 'Sign In →'}
                        </button>
                    </form>

                    <div className="li-divider" style={{ animation:'fadeUp .5s ease-out .5s both' }}>
                        <div className="li-dl" /><span className="li-dt">or continue with</span><div className="li-dl" />
                    </div>

                    <button className="li-btn-oauth" style={{ animation:'fadeUp .5s ease-out .55s both' }} onClick={loginWithGoogle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Continue with Google
                    </button>

                    <button className="li-btn-oauth" style={{ animation:'fadeUp .5s ease-out .6s both' }} onClick={loginWithGithub}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#e2e8f0"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Continue with GitHub
                    </button>

                    <p style={{ textAlign:'center', fontSize:13, color:'rgba(148,163,184,.5)', marginTop:20, animation:'fadeUp .5s ease-out .65s both' }}>
                        Don't have an account?{' '}
                        <Link to="/signup" style={{ color:'#60a5fa', textDecoration:'none', fontWeight:600 }}>Sign up →</Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default LoginPage