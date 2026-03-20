import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth.js'
import { useSelector } from 'react-redux'
import { selectAuthLoading, selectAuthError } from '../../store/slices/authSlice.js'
import { Eye, EyeOff } from 'lucide-react'
import FloatingBackground from '../../components/common/FloatingBackground.jsx'

const SignupPage = () => {
    const { signupWithEmail, loginWithGoogle, loginWithGithub } = useAuth()
    const loading = useSelector(selectAuthLoading)
    const error = useSelector(selectAuthError)

    const [username, setUsername] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPass, setShowPass] = useState(false)
    const [agreed, setAgreed] = useState(false)
    const [strength, setStrength] = useState(0)

    const userRef = useRef(null)
    const emailRef = useRef(null)
    const passRef = useRef(null)

    const [userTyping, setUserTyping] = useState(false)
    const [emailTyping, setEmailTyping] = useState(false)
    const [passTyping, setPassTyping] = useState(false)
    const [userDone, setUserDone] = useState(false)
    const [emailDone, setEmailDone] = useState(false)
    const [passDone, setPassDone] = useState(false)

    useEffect(() => {
        let timeouts = []
        let intervals = []

        const typeText = (ref, text, speed, onDone) => {
            let i = 0
            if (ref.current) ref.current.value = ''
            const iv = setInterval(() => {
                if (!ref.current) { clearInterval(iv); return }
                ref.current.value = text.slice(0, i++)
                if (i > text.length) { clearInterval(iv); onDone && onDone() }
            }, speed)
            intervals.push(iv)
        }

        const t1 = setTimeout(() => {
            setUserTyping(true)
            typeText(userRef, 'parv_dev', 100, () => {
                setUserTyping(false)
                setUserDone(true)
                const t2 = setTimeout(() => {
                    setEmailTyping(true)
                    typeText(emailRef, 'parv@gmail.com', 75, () => {
                        setEmailTyping(false)
                        setEmailDone(true)
                        const t3 = setTimeout(() => {
                            setPassTyping(true)
                            typeText(passRef, '••••••••••••', 90, () => {
                                setPassTyping(false)
                                setPassDone(true)
                                setTimeout(() => setStrength(1), 200)
                                setTimeout(() => setStrength(2), 400)
                                setTimeout(() => setStrength(3), 600)
                                setTimeout(() => setStrength(4), 800)
                            })
                        }, 400)
                        timeouts.push(t3)
                    })
                }, 400)
                timeouts.push(t2)
            })
        }, 800)
        timeouts.push(t1)

        return () => {
            timeouts.forEach(clearTimeout)
            intervals.forEach(clearInterval)
        }
    }, [])

    const getStrengthColor = (index) => {
        if (index > strength) return 'rgba(226,232,240,.08)'
        if (strength === 1) return '#ef4444'
        if (strength === 2) return '#f59e0b'
        if (strength === 3) return '#84cc16'
        return '#22c55e'
    }

    const getStrengthLabel = () => {
        if (strength === 0) return null
        if (strength === 1) return { text: 'Weak', color: '#ef4444' }
        if (strength === 2) return { text: 'Fair', color: '#f59e0b' }
        if (strength === 3) return { text: 'Good', color: '#84cc16' }
        return { text: 'Strong', color: '#22c55e' }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!agreed) return
        await signupWithEmail(email, password, username)
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

    const strengthLabel = getStrengthLabel()

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes glowPulse { 0%,100%{opacity:.1} 50%{opacity:.2} }
        @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes dotBounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-3px);opacity:1} }
        @keyframes bgFloat { 0%{opacity:0;transform:translateY(0)} 8%{opacity:1} 88%{opacity:1} 100%{opacity:0;transform:translateY(-60px)} }
        @keyframes gridFade { 0%,100%{opacity:.025} 50%{opacity:.055} }
        @keyframes checkDraw { from{stroke-dashoffset:20} to{stroke-dashoffset:0} }

        .su-page { min-height:100vh; background:#06080e; display:flex; align-items:center; justify-content:center; font-family:'Space Grotesk',sans-serif; position:relative; overflow:hidden; padding:100px 20px 40px; }
        .su-grid { position:absolute; inset:0; background: repeating-linear-gradient(90deg,rgba(226,232,240,.025) 0,transparent 1px,transparent 60px), repeating-linear-gradient(180deg,rgba(226,232,240,.025) 0,transparent 1px,transparent 60px); animation:gridFade 5s ease-in-out infinite; pointer-events:none; }
        .su-glow { position:absolute; border-radius:50%; filter:blur(80px); pointer-events:none; animation:glowPulse 4s ease-in-out infinite; }
        .su-card { position:relative; z-index:10; width:100%; max-width:420px; background:rgba(6,8,14,.92); border:1px solid rgba(226,232,240,.12); border-radius:18px; padding:36px 32px; backdrop-filter:blur(24px); animation:fadeUp .5s ease-out both; }
        .su-logo-shimmer { background:linear-gradient(90deg,#e2e8f0,#60a5fa,#e2e8f0); background-size:250% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3s linear infinite; }
        .su-label { font-size:11px; font-weight:600; color:rgba(148,163,184,.6); letter-spacing:.08em; margin-bottom:7px; font-family:'JetBrains Mono',monospace; text-transform:uppercase; }
        .su-iw { position:relative; margin-bottom:16px; }
        .su-ico { position:absolute; left:13px; top:50%; transform:translateY(-50%); color:rgba(148,163,184,.4); pointer-events:none; font-size:14px; }
        .tdots { display:flex; gap:3px; position:absolute; right:12px; top:50%; transform:translateY(-50%); }
        .td { width:4px; height:4px; border-radius:50%; background:#60a5fa; }
        .td:nth-child(1) { animation:dotBounce .8s ease-in-out infinite 0s; }
        .td:nth-child(2) { animation:dotBounce .8s ease-in-out infinite .15s; }
        .td:nth-child(3) { animation:dotBounce .8s ease-in-out infinite .3s; }
        .su-real-input { width:100%; padding:11px 14px 11px 40px; border-radius:9px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); color:#e2e8f0; font-size:14px; font-family:'JetBrains Mono',monospace; outline:none; transition:all .3s; letter-spacing:.02em; }
        .su-real-input:focus { background:rgba(96,165,250,.04); border-color:rgba(96,165,250,.4); box-shadow:0 0 0 3px rgba(96,165,250,.1); color:#60a5fa; }
        .su-real-input::placeholder { color:rgba(148,163,184,.3); }
        .su-logo-shimmer { background:linear-gradient(90deg,#e2e8f0,#60a5fa,#e2e8f0); background-size:250% auto; -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; animation:shimmer 3s linear infinite; }
        .su-btn-primary { width:100%; padding:12px; border-radius:10px; font-size:14.5px; font-weight:700; color:#0f172a; background:linear-gradient(135deg,#e2e8f0,#60a5fa); border:none; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .25s; margin-bottom:16px; }
        .su-btn-primary:hover { transform:translateY(-2px); box-shadow:0 8px 24px rgba(96,165,250,.25); filter:brightness(1.05); }
        .su-btn-primary:disabled { opacity:.5; cursor:not-allowed; transform:none; }
        .su-divider { display:flex; align-items:center; gap:10px; margin-bottom:12px; }
        .su-dl { flex:1; height:1px; background:rgba(226,232,240,.08); }
        .su-dt { font-size:11px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
        .su-btn-oauth { width:100%; padding:10px 14px; border-radius:9px; font-size:13.5px; font-weight:500; color:rgba(226,232,240,.8); background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; margin-bottom:8px; display:flex; align-items:center; justify-content:center; gap:9px; }
        .su-btn-oauth:hover { background:rgba(226,232,240,.07); border-color:rgba(226,232,240,.18); transform:translateY(-1px); }
        .check-row { display:flex; align-items:flex-start; gap:10px; font-size:12.5px; color:rgba(148,163,184,.6); margin-bottom:16px; cursor:pointer; }
        .check-box { width:18px; height:18px; border-radius:5px; border:1.5px solid rgba(226,232,240,.15); background:rgba(226,232,240,.04); flex-shrink:0; margin-top:1px; display:flex; align-items:center; justify-content:center; transition:all .2s; }
        .check-box.checked { border-color:rgba(34,197,94,.5); background:rgba(34,197,94,.08); }
        .strength-row { display:flex; gap:4px; margin-bottom:5px; }
        .strength-seg { flex:1; height:3px; border-radius:2px; transition:all .4s ease; }
        .su-error { font-size:12px; color:#f87171; background:rgba(248,113,113,.08); border:1px solid rgba(248,113,113,.2); border-radius:8px; padding:10px 14px; margin-bottom:14px; font-family:'JetBrains Mono',monospace; }
      `}</style>

            <div className="su-page">
                <div className="su-grid" />
                <div className="su-glow" style={{ width:500, height:500, background:'rgba(96,165,250,.07)', top:-120, left:'50%', transform:'translateX(-50%)' }} />
                <div className="su-glow" style={{ width:280, height:280, background:'rgba(226,232,240,.04)', bottom:0, right:'8%', animationDelay:'2s' }} />

                <FloatingBackground cardWidth={420} />

                <div className="su-card">
                    {/* Logo */}
                    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:28, animation:'fadeUp .5s ease-out both' }}>
                        <div style={{ width:40, height:40, borderRadius:10, background:'linear-gradient(135deg,rgba(226,232,240,.1),rgba(96,165,250,.08))', border:'1px solid rgba(226,232,240,.15)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:"'JetBrains Mono',monospace", fontSize:12, fontWeight:700, color:'#e2e8f0' }}>&lt;/&gt;</div>
                        <span style={{ fontSize:18, fontWeight:800, letterSpacing:'-.02em' }}>
              <span className="su-logo-shimmer">AlgoMate_</span>
            </span>
                    </div>

                    <h1 style={{ fontSize:24, fontWeight:800, letterSpacing:'-.025em', color:'#e2e8f0', margin:'0 0 6px', animation:'fadeUp .5s ease-out .1s both' }}>Create account 🚀</h1>
                    <p style={{ fontSize:13.5, color:'rgba(148,163,184,.6)', margin:'0 0 26px', animation:'fadeUp .5s ease-out .2s both' }}>Join thousands of DSA learners today</p>

                    <form onSubmit={handleSubmit}>
                        {error && <div className="su-error">⚠ {error}</div>}

                        {/* Username */}
                        <div style={{ animation:'fadeUp .5s ease-out .25s both' }}>
                            <div className="su-label">Username</div>
                            <div className="su-iw">
                                <span className="su-ico">👤</span>
                                <input ref={userRef} readOnly style={{ ...inputStyle(userTyping, userDone), display: username ? 'none' : 'block' }} />
                                <input className="su-real-input" style={{ display: username ? 'block' : 'none' }} type="text" placeholder="your_username" value={username} onChange={e => setUsername(e.target.value)} required />
                                {userTyping && <div className="tdots"><div className="td" /><div className="td" /><div className="td" /></div>}
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ animation:'fadeUp .5s ease-out .3s both' }}>
                            <div className="su-label">Email</div>
                            <div className="su-iw">
                                <span className="su-ico">✉</span>
                                <input ref={emailRef} readOnly style={{ ...inputStyle(emailTyping, emailDone), display: email ? 'none' : 'block' }} />
                                <input className="su-real-input" style={{ display: email ? 'block' : 'none' }} type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                                {emailTyping && <div className="tdots"><div className="td" /><div className="td" /><div className="td" /></div>}
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ animation:'fadeUp .5s ease-out .35s both' }}>
                            <div className="su-label">Password</div>
                            <div className="su-iw" style={{ marginBottom:8 }}>
                                <span className="su-ico">🔒</span>
                                <input ref={passRef} readOnly style={{ ...inputStyle(passTyping, passDone), display: password ? 'none' : 'block' }} />
                                <input className="su-real-input" style={{ display: password ? 'block' : 'none', paddingRight:42 }} type={showPass ? 'text' : 'password'} placeholder="min. 8 characters" value={password} onChange={e => { setPassword(e.target.value); const l = e.target.value.length; setStrength(l===0?0:l<4?1:l<8?2:l<12?3:4) }} required />
                                {passTyping && <div className="tdots"><div className="td" /><div className="td" /><div className="td" /></div>}
                                {password && (
                                    <button type="button" onClick={() => setShowPass(!showPass)} style={{ position:'absolute', right:12, top:'50%', transform:'translateY(-50%)', background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.5)', padding:0, display:'flex' }}>
                                        {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Strength */}
                        <div style={{ marginTop:-8, marginBottom:16 }}>
                            <div className="strength-row">
                                {[1,2,3,4].map(i => (
                                    <div key={i} className="strength-seg" style={{ background:getStrengthColor(i), boxShadow: i<=strength&&strength>0 ? `0 0 6px ${getStrengthColor(i)}80` : 'none' }} />
                                ))}
                            </div>
                            {strengthLabel && (
                                <div style={{ display:'flex', justifyContent:'flex-end' }}>
                                    <span style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:strengthLabel.color, fontWeight:600, letterSpacing:'.05em' }}>{strengthLabel.text}</span>
                                </div>
                            )}
                        </div>

                        {/* Terms */}
                        <div className="check-row" onClick={() => setAgreed(!agreed)} style={{ animation:'fadeUp .5s ease-out .4s both' }}>
                            <div className={`check-box ${agreed ? 'checked' : ''}`}>
                                {agreed && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path d="M1 4L3.5 6.5L9 1" stroke="#22c55e" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" strokeDasharray="20" style={{ animation:'checkDraw .3s ease-out both' }} />
                                    </svg>
                                )}
                            </div>
                            <span>I agree to the <span style={{ color:'#60a5fa' }}>Terms of Service</span> and <span style={{ color:'#60a5fa' }}>Privacy Policy</span></span>
                        </div>

                        <button className="su-btn-primary" type="submit" disabled={loading||!agreed} style={{ animation:'fadeUp .5s ease-out .45s both' }}>
                            {loading ? 'Creating account...' : 'Create Account →'}
                        </button>
                    </form>

                    <div className="su-divider" style={{ animation:'fadeUp .5s ease-out .5s both' }}>
                        <div className="su-dl" /><span className="su-dt">or sign up with</span><div className="su-dl" />
                    </div>

                    <button className="su-btn-oauth" style={{ animation:'fadeUp .5s ease-out .55s both' }} onClick={loginWithGoogle}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                        Continue with Google
                    </button>

                    <button className="su-btn-oauth" style={{ animation:'fadeUp .5s ease-out .6s both' }} onClick={loginWithGithub}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="#e2e8f0"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                        Continue with GitHub
                    </button>

                    <p style={{ textAlign:'center', fontSize:13, color:'rgba(148,163,184,.5)', marginTop:20, animation:'fadeUp .5s ease-out .65s both' }}>
                        Already have an account?{' '}
                        <Link to="/login" style={{ color:'#60a5fa', textDecoration:'none', fontWeight:600 }}>Sign in →</Link>
                    </p>
                </div>
            </div>
        </>
    )
}

export default SignupPage