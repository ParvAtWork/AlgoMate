// src/components/common/Footer.jsx
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import AlgoMateLogo from './AlgoMateLogo.jsx'
import { getAllProblems } from '../../api/problemApi.js'
import { getMySubmissions } from '../../api/submissionApi.js'

const Footer = () => {
    const year = new Date().getFullYear()

    const [stats, setStats] = useState({
        totalProblems: '...',
        easyCount:     '...',
        mediumCount:   '...',
        hardCount:     '...',
        languages:     '8',
    })

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res      = await getAllProblems()
                const problems = res.data || []

                setStats({
                    totalProblems: problems.length,
                    easyCount:     problems.filter(p => p.difficulty === 'Easy').length,
                    mediumCount:   problems.filter(p => p.difficulty === 'Medium').length,
                    hardCount:     problems.filter(p => p.difficulty === 'Hard').length,
                    languages:     '8',
                })
            } catch {
                setStats(s => ({ ...s, totalProblems: '6+' }))
            }
        }
        fetchStats()
    }, [])

    const links = {
        Platform: [
            { label:'Problems',    href:'/problems'    },
            { label:'Leaderboard', href:'/leaderboard' },
            { label:'Submissions', href:'/submissions' },
        ],
        Resources: [
            { label:'DSA Roadmap',        href:'#' },
            { label:'Big-O Cheat Sheet',  href:'#' },
            { label:'Interview Tips',     href:'#' },
        ],
        Project: [
            { label:'GLA University', href:'#' },
            { label:'CSE Department', href:'#' },
            { label:'GitHub',         href:'#' },
        ],
    }

    return (
        <>
            <style>{`
                @keyframes ft-pulse { 0%,100%{opacity:.5} 50%{opacity:1} }
                @keyframes ft-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
                .ft-stat-val { 
                    font-size:18px; font-weight:800; font-family:'JetBrains Mono',monospace;
                    background:linear-gradient(90deg,#60a5fa,#818cf8); background-size:200% auto;
                    -webkit-background-clip:text; -webkit-text-fill-color:transparent;
                    background-clip:text; animation:ft-shimmer 3s linear infinite;
                }
                .ft-stat-val.loading { -webkit-text-fill-color:rgba(148,163,184,.3); animation:ft-pulse 1.2s ease-in-out infinite; }
                .ft-link { font-size:13px; color:rgba(148,163,184,.55); text-decoration:none; transition:all .2s; display:flex; align-items:center; gap:5px; }
                .ft-link:hover { color:#60a5fa; padding-left:4px; }
                .ft-diff { font-size:9.5px; padding:1px 7px; border-radius:8px; font-family:'JetBrains Mono',monospace; font-weight:700; }
            `}</style>

            <footer style={{
                background:'rgba(6,8,14,.98)',
                borderTop:'1px solid rgba(226,232,240,.06)',
                padding:'48px 24px 28px',
                fontFamily:"'Space Grotesk',sans-serif",
            }}>
                <div style={{ maxWidth:1100, margin:'0 auto' }}>

                    {/* Top row */}
                    <div style={{ display:'flex', gap:48, flexWrap:'wrap', marginBottom:40 }}>

                        {/* Brand */}
                        <div style={{ flex:'0 0 240px', minWidth:180 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                                <AlgoMateLogo size={36}/>
                                <div>
                                    <div style={{ fontSize:16, fontWeight:800, color:'#e2e8f0', letterSpacing:'-.02em' }}>
                                        AlgoMate<span style={{ color:'#60a5fa' }}>_</span>
                                    </div>
                                    <div style={{ fontSize:9, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.12em' }}>
                                        DSA PLATFORM
                                    </div>
                                </div>
                            </div>

                            <p style={{ fontSize:12, color:'rgba(148,163,184,.5)', lineHeight:1.7, marginBottom:18 }}>
                                A smart DSA coding & compilation platform built for GLA University CSE students.
                            </p>

                            {/* Real-time stats */}
                            <div style={{ display:'flex', gap:18, flexWrap:'wrap', marginBottom:14 }}>
                                {[
                                    { label:'Problems', value:stats.totalProblems },
                                    { label:'Languages', value:stats.languages    },
                                ].map(s => (
                                    <div key={s.label}>
                                        <div className={`ft-stat-val ${s.value === '...' ? 'loading' : ''}`}>
                                            {s.value}
                                        </div>
                                        <div style={{ fontSize:9, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace", letterSpacing:'.08em', textTransform:'uppercase', marginTop:2 }}>
                                            {s.label}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Difficulty breakdown */}
                            <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
                                <span className="ft-diff" style={{ background:'rgba(34,197,94,.08)', color:'#22c55e', border:'1px solid rgba(34,197,94,.15)' }}>
                                    E:{stats.easyCount}
                                </span>
                                <span className="ft-diff" style={{ background:'rgba(245,158,11,.08)', color:'#f59e0b', border:'1px solid rgba(245,158,11,.15)' }}>
                                    M:{stats.mediumCount}
                                </span>
                                <span className="ft-diff" style={{ background:'rgba(239,68,68,.08)', color:'#ef4444', border:'1px solid rgba(239,68,68,.15)' }}>
                                    H:{stats.hardCount}
                                </span>
                            </div>
                        </div>

                        {/* Links */}
                        <div style={{ display:'flex', gap:40, flex:1, flexWrap:'wrap' }}>
                            {Object.entries(links).map(([section, items]) => (
                                <div key={section}>
                                    <div style={{
                                        fontSize:10, fontWeight:700,
                                        color:'rgba(148,163,184,.4)',
                                        letterSpacing:'.12em', textTransform:'uppercase',
                                        fontFamily:"'JetBrains Mono',monospace",
                                        marginBottom:14,
                                    }}>
                                        {section}
                                    </div>
                                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                                        {items.map(link => (
                                            <motion.a
                                                key={link.label}
                                                href={link.href}
                                                className="ft-link"
                                                whileHover={{ x:4 }}
                                            >
                                                <span style={{ fontSize:10, color:'rgba(96,165,250,.3)' }}>/</span>
                                                {link.label}
                                            </motion.a>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Live indicator */}
                    <div style={{
                        display:'flex', alignItems:'center', gap:8,
                        padding:'10px 16px', borderRadius:10,
                        background:'rgba(34,197,94,.04)',
                        border:'1px solid rgba(34,197,94,.1)',
                        marginBottom:20, width:'fit-content',
                    }}>
                        <div style={{ position:'relative', width:7, height:7 }}>
                            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e', animation:'ft-pulse 1.5s ease-in-out infinite' }}/>
                            <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'#22c55e' }}/>
                        </div>
                        <span style={{ fontSize:11, fontFamily:"'JetBrains Mono',monospace", color:'rgba(34,197,94,.7)', letterSpacing:'.04em' }}>
                            {stats.totalProblems === '...' ? 'Fetching live data...' : `${stats.totalProblems} problems live · Last synced just now`}
                        </span>
                    </div>

                    {/* Divider */}
                    <div style={{ height:1, background:'linear-gradient(90deg,transparent,rgba(226,232,240,.08),transparent)', marginBottom:20 }}/>

                    {/* Bottom row */}
                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:12 }}>
                        <div style={{ fontSize:12, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace" }}>
                            © {year} AlgoMate · GLA University · CSE Dept
                        </div>
                        <div style={{ fontSize:11, color:'rgba(148,163,184,.3)', fontFamily:"'JetBrains Mono',monospace", display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                            <span>Built by</span>
                            <span style={{ color:'rgba(96,165,250,.6)' }}>Parv · Roopendra · Yash</span>
                            <span>for Mr. Ayush Tiwari</span>
                        </div>
                    </div>
                </div>
            </footer>
        </>
    )
}

export default Footer