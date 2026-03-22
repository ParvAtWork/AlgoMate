// src/pages/NotFoundPage.jsx
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

const NotFoundPage = () => {
    const navigate = useNavigate()

    const floatingCode = [
        { text: 'undefined', color: '#f87171', x: -280, y: -120, delay: 0,    dur: 6 },
        { text: 'null',      color: '#60a5fa', x:  260, y: -80,  delay: 0.5,  dur: 7 },
        { text: '404',       color: '#818cf8', x: -240, y:  60,  delay: 1,    dur: 5 },
        { text: 'NaN',       color: '#34d399', x:  220, y:  90,  delay: 1.5,  dur: 8 },
        { text: 'error ✕',  color: '#fbbf24', x: -180, y:  160, delay: 0.8,  dur: 6 },
        { text: '{}',        color: '#a78bfa', x:  200, y:  170, delay: 0.3,  dur: 7 },
        { text: 'return;',   color: '#22d3ee', x: -300, y: -30,  delay: 1.2,  dur: 9 },
        { text: '???',       color: '#f472b6', x:  280, y: -160, delay: 0.6,  dur: 6 },
    ]

    return (
        <>
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');
                @keyframes nf-grid   { 0%,100%{opacity:.02} 50%{opacity:.05} }
                @keyframes nf-glow   { 0%,100%{opacity:.07} 50%{opacity:.15} }
                @keyframes nf-float  { 0%,100%{transform:translateY(0px)} 50%{transform:translateY(-12px)} }
                @keyframes nf-shake  { 0%,100%{transform:rotate(0deg)} 20%{transform:rotate(-4deg)} 40%{transform:rotate(4deg)} 60%{transform:rotate(-3deg)} 80%{transform:rotate(3deg)} }
                @keyframes nf-blink  { 0%,90%,100%{opacity:1} 95%{opacity:0} }
                @keyframes nf-type   { 0%{width:0} 100%{width:100%} }
                @keyframes nf-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
                @keyframes nf-spark  { 0%{opacity:0;transform:scale(0) translateY(0)} 50%{opacity:1;transform:scale(1) translateY(-20px)} 100%{opacity:0;transform:scale(0) translateY(-40px)} }
                @keyframes nf-scan   { 0%{top:0} 100%{top:100%} }
                .nf-page  { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; display:flex; align-items:center; justify-content:center; position:relative; overflow:hidden; }
                .nf-grid  { position:fixed; inset:0; background:repeating-linear-gradient(90deg,rgba(226,232,240,.02) 0,transparent 1px,transparent 80px),repeating-linear-gradient(180deg,rgba(226,232,240,.02) 0,transparent 1px,transparent 80px); animation:nf-grid 5s ease-in-out infinite; pointer-events:none; }
                .nf-glow  { position:fixed; border-radius:50%; filter:blur(120px); pointer-events:none; animation:nf-glow 5s ease-in-out infinite; }
                .nf-float { animation:nf-float 4s ease-in-out infinite; }
                .nf-shake { animation:nf-shake 2.5s ease-in-out infinite; }
                .nf-home-btn { background:linear-gradient(135deg,#60a5fa,#818cf8); border:none; color:#fff; font-size:14px; font-weight:700; padding:12px 28px; border-radius:11px; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; position:relative; overflow:hidden; }
                .nf-home-btn:hover { transform:translateY(-3px); box-shadow:0 8px 24px rgba(96,165,250,.35); }
                .nf-home-btn:active { transform:translateY(0); }
                .nf-back-btn { background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); color:rgba(148,163,184,.7); font-size:14px; font-weight:600; padding:12px 24px; border-radius:11px; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; }
                .nf-back-btn:hover { background:rgba(226,232,240,.09); color:#e2e8f0; transform:translateY(-2px); }
            `}</style>

            <div className="nf-page">
                <div className="nf-grid" />
                <div className="nf-glow" style={{ width:600, height:500, background:'rgba(96,165,250,.05)', top:-150, left:'15%' }} />
                <div className="nf-glow" style={{ width:400, height:400, background:'rgba(239,68,68,.04)', bottom:'5%', right:'8%', animationDelay:'2s' }} />
                <div className="nf-glow" style={{ width:350, height:350, background:'rgba(129,140,248,.04)', top:'30%', right:'15%', animationDelay:'3.5s' }} />

                {/* Floating code snippets */}
                {floatingCode.map((item, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity:0, scale:0 }}
                        animate={{ opacity:[0,.7,.7,.4,.7], y:[0,-15,0,-10,0], scale:1 }}
                        transition={{ delay:item.delay, duration:item.dur, repeat:Infinity, ease:'easeInOut' }}
                        style={{
                            position:'absolute',
                            left:`calc(50% + ${item.x}px)`,
                            top:`calc(50% + ${item.y}px)`,
                            fontSize:12,
                            fontFamily:"'JetBrains Mono',monospace",
                            fontWeight:600,
                            color:item.color,
                            background:`${item.color}12`,
                            border:`1px solid ${item.color}25`,
                            padding:'3px 9px',
                            borderRadius:6,
                            pointerEvents:'none',
                            zIndex:0,
                            whiteSpace:'nowrap',
                        }}
                    >
                        {item.text}
                    </motion.div>
                ))}

                <motion.div
                    initial={{ opacity:0, y:30 }}
                    animate={{ opacity:1, y:0 }}
                    transition={{ duration:.6, ease:'easeOut' }}
                    style={{ textAlign:'center', position:'relative', zIndex:1, padding:'0 24px', maxWidth:600 }}
                >
                    {/* Developer Illustration */}
                    <motion.div
                        className="nf-float"
                        style={{ marginBottom:24, display:'inline-block', position:'relative' }}
                    >
                        <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg">
                            {/* Desk */}
                            <rect x="10" y="120" width="160" height="8" rx="4" fill="rgba(226,232,240,.08)" stroke="rgba(226,232,240,.12)" strokeWidth="1"/>
                            {/* Desk legs */}
                            <rect x="25" y="128" width="6" height="24" rx="3" fill="rgba(226,232,240,.06)"/>
                            <rect x="149" y="128" width="6" height="24" rx="3" fill="rgba(226,232,240,.06)"/>

                            {/* Laptop base */}
                            <rect x="45" y="95" width="90" height="26" rx="5" fill="rgba(30,41,59,.9)" stroke="rgba(96,165,250,.3)" strokeWidth="1.5"/>
                            {/* Laptop screen */}
                            <rect x="48" y="55" width="84" height="42" rx="5" fill="rgba(15,23,42,.95)" stroke="rgba(96,165,250,.35)" strokeWidth="1.5"/>
                            {/* Screen glow */}
                            <rect x="52" y="59" width="76" height="34" rx="3" fill="rgba(6,8,14,.9)"/>
                            {/* Screen content - error */}
                            <text x="62" y="74" fontFamily="monospace" fontSize="7" fill="#f87171">ERROR: 404</text>
                            <text x="62" y="84" fontFamily="monospace" fontSize="6" fill="rgba(148,163,184,.5)">page not found</text>
                            {/* Screen scanline */}
                            <rect x="52" y="59" width="76" height="2" rx="1" fill="rgba(96,165,250,.08)">
                                <animate attributeName="y" from="59" to="90" dur="2s" repeatCount="indefinite"/>
                                <animate attributeName="opacity" values="0;0.3;0" dur="2s" repeatCount="indefinite"/>
                            </rect>
                            {/* Laptop hinge */}
                            <rect x="45" y="95" width="90" height="3" rx="1.5" fill="rgba(96,165,250,.15)"/>
                            {/* Trackpad */}
                            <rect x="78" y="102" width="24" height="14" rx="3" fill="rgba(226,232,240,.06)" stroke="rgba(226,232,240,.1)" strokeWidth="1"/>

                            {/* Chair */}
                            <rect x="72" y="130" width="36" height="4" rx="2" fill="rgba(226,232,240,.07)" stroke="rgba(226,232,240,.1)" strokeWidth="1"/>
                            <rect x="88" y="134" width="4" height="16" rx="2" fill="rgba(226,232,240,.06)"/>

                            {/* Developer body */}
                            <ellipse cx="90" cy="118" rx="18" ry="8" fill="rgba(51,65,85,.8)" stroke="rgba(96,165,250,.2)" strokeWidth="1"/>
                            {/* Arms */}
                            <path d="M75 115 Q65 118 62 108" stroke="rgba(226,232,240,.3)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                            <path d="M105 115 Q115 118 118 108" stroke="rgba(226,232,240,.3)" strokeWidth="5" strokeLinecap="round" fill="none"/>
                            {/* Hands on keyboard */}
                            <ellipse cx="62" cy="107" rx="5" ry="4" fill="rgba(226,232,240,.25)"/>
                            <ellipse cx="118" cy="107" rx="5" ry="4" fill="rgba(226,232,240,.25)"/>

                            {/* Head - with shake animation */}
                            <g className="nf-shake" style={{ transformOrigin:'90px 88px' }}>
                                {/* Neck */}
                                <rect x="86" y="103" width="8" height="10" rx="3" fill="rgba(226,232,240,.25)"/>
                                {/* Head */}
                                <ellipse cx="90" cy="90" rx="20" ry="18" fill="rgba(30,41,59,.95)" stroke="rgba(96,165,250,.3)" strokeWidth="1.5"/>
                                {/* Hair */}
                                <path d="M70 87 Q72 70 90 68 Q108 70 110 87" fill="rgba(51,65,85,.9)" stroke="rgba(96,165,250,.2)" strokeWidth="1"/>
                                {/* Eyes - blinking */}
                                <ellipse cx="84" cy="89" rx="3" ry="3" fill="rgba(226,232,240,.9)">
                                    <animate attributeName="ry" values="3;3;3;0.5;3" dur="3s" repeatCount="indefinite"/>
                                </ellipse>
                                <ellipse cx="96" cy="89" rx="3" ry="3" fill="rgba(226,232,240,.9)">
                                    <animate attributeName="ry" values="3;3;3;0.5;3" dur="3s" repeatCount="indefinite"/>
                                </ellipse>
                                {/* Pupils */}
                                <circle cx="84" cy="90" r="1.5" fill="#06080e"/>
                                <circle cx="96" cy="90" r="1.5" fill="#06080e"/>
                                {/* Confused eyebrows */}
                                <path d="M80 84 Q84 81 88 83" stroke="rgba(226,232,240,.7)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                <path d="M92 83 Q96 81 100 84" stroke="rgba(226,232,240,.7)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                {/* Mouth - confused */}
                                <path d="M84 97 Q87 94 90 96 Q93 98 96 97" stroke="rgba(226,232,240,.5)" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
                                {/* Question mark above head */}
                                <text x="103" y="76" fontFamily="monospace" fontSize="10" fill="#fbbf24" fontWeight="bold">?</text>
                            </g>
                        </svg>

                        {/* Spark effects around laptop */}
                        {[
                            { cx:42,  cy:75, color:'#60a5fa', delay:'0s'  },
                            { cx:138, cy:70, color:'#f87171', delay:'0.8s' },
                            { cx:55,  cy:58, color:'#34d399', delay:'1.6s' },
                            { cx:125, cy:60, color:'#fbbf24', delay:'2.4s' },
                        ].map((spark, i) => (
                            <motion.div
                                key={i}
                                animate={{ opacity:[0,1,0], y:[0,-16,0], scale:[0,1,0] }}
                                transition={{ delay:parseFloat(spark.delay), duration:1.5, repeat:Infinity, ease:'easeOut' }}
                                style={{
                                    position:'absolute',
                                    left:spark.cx,
                                    top:spark.cy,
                                    width:6,
                                    height:6,
                                    borderRadius:'50%',
                                    background:spark.color,
                                    boxShadow:`0 0 8px ${spark.color}`,
                                    pointerEvents:'none',
                                }}
                            />
                        ))}
                    </motion.div>

                    {/* 404 Text */}
                    <motion.div
                        initial={{ scale:.8, opacity:0 }}
                        animate={{ scale:1, opacity:1 }}
                        transition={{ delay:.2, duration:.5, ease:'easeOut' }}
                        style={{
                            fontSize:100,
                            fontWeight:800,
                            fontFamily:"'JetBrains Mono',monospace",
                            lineHeight:1,
                            letterSpacing:'-.04em',
                            background:'linear-gradient(135deg,#60a5fa 0%,#818cf8 40%,#a78bfa 100%)',
                            WebkitBackgroundClip:'text',
                            WebkitTextFillColor:'transparent',
                            backgroundClip:'text',
                            marginBottom:8,
                            filter:'drop-shadow(0 0 30px rgba(96,165,250,.3))',
                        }}
                    >
                        404
                    </motion.div>

                    {/* Code comment */}
                    <motion.div
                        initial={{ opacity:0 }}
                        animate={{ opacity:1 }}
                        transition={{ delay:.4 }}
                        style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.35)', marginBottom:14, letterSpacing:'.06em' }}
                    >
                        // Oops! page_not_found.exe has stopped working
                    </motion.div>

                    {/* Heading */}
                    <motion.div
                        initial={{ opacity:0, y:10 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ delay:.45, duration:.4 }}
                        style={{ fontSize:26, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.03em', marginBottom:10 }}
                    >
                        Oops!{' '}
                        <span style={{ background:'linear-gradient(90deg,#f87171,#fb923c)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                            Code Not Found
                        </span>
                    </motion.div>

                    {/* Subtext */}
                    <motion.div
                        initial={{ opacity:0, y:8 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ delay:.55, duration:.4 }}
                        style={{ fontSize:14, color:'rgba(148,163,184,.55)', marginBottom:32, maxWidth:380, margin:'0 auto 32px', lineHeight:1.7 }}
                    >
                        This page seems to have moved or never existed.
                        <br/>
                        <span style={{ fontFamily:"'JetBrains Mono',monospace", fontSize:12, color:'rgba(148,163,184,.35)' }}>
                            Try debugging your URL or head back home.
                        </span>
                    </motion.div>

                    {/* Buttons */}
                    <motion.div
                        initial={{ opacity:0, y:10 }}
                        animate={{ opacity:1, y:0 }}
                        transition={{ delay:.65 }}
                        style={{ display:'flex', gap:12, justifyContent:'center', flexWrap:'wrap' }}
                    >
                        <button className="nf-home-btn" onClick={() => navigate('/')}>
                            🏠 Go Back Home
                        </button>
                        <button className="nf-back-btn" onClick={() => navigate('/problems')}>
                            {'<>'} Browse Problems
                        </button>
                        <button className="nf-back-btn" onClick={() => navigate(-1)}>
                            ← Go Back
                        </button>
                    </motion.div>

                    {/* Terminal style bottom */}
                    <motion.div
                        initial={{ opacity:0 }}
                        animate={{ opacity:1 }}
                        transition={{ delay:.8 }}
                        style={{ marginTop:40, padding:'14px 20px', borderRadius:10, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.07)', display:'inline-block', textAlign:'left' }}
                    >
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444' }}/>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24' }}/>
                            <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }}/>
                            <span style={{ fontSize:10, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", marginLeft:6 }}>terminal</span>
                        </div>
                        <div style={{ fontSize:12, fontFamily:"'JetBrains Mono',monospace" }}>
                            <span style={{ color:'#22c55e' }}>user@algomate</span>
                            <span style={{ color:'rgba(148,163,184,.4)' }}>:</span>
                            <span style={{ color:'#60a5fa' }}>~</span>
                            <span style={{ color:'rgba(148,163,184,.4)' }}>$ </span>
                            <span style={{ color:'#e2e8f0' }}>curl </span>
                            <span style={{ color:'#f87171' }}>this_page</span>
                        </div>
                        <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'#f87171', marginTop:4 }}>
                            Error: 404 Not Found — "This page does not exist"
                        </div>
                        <div style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.35)', marginTop:2, display:'flex', alignItems:'center', gap:4 }}>
                            <span>$</span>
                            <motion.span
                                animate={{ opacity:[1,0] }}
                                transition={{ duration:.6, repeat:Infinity }}
                                style={{ display:'inline-block', width:6, height:12, background:'rgba(148,163,184,.4)', borderRadius:1 }}
                            />
                        </div>
                    </motion.div>
                </motion.div>
            </div>
        </>
    )
}

export default NotFoundPage