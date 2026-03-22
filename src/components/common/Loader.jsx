// src/components/common/Loader.jsx
import { motion } from 'framer-motion'

// ── PageLoader ───────────────────────────────────────────────────
export const PageLoader = ({ message = 'Loading...' }) => (
    <>
        <style>{`
            @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
            @keyframes pl-spin1   { to{transform:rotate(360deg)} }
            @keyframes pl-spin2   { to{transform:rotate(-360deg)} }
            @keyframes pl-pulse   { 0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(.5)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
            @keyframes pl-ripple  { 0%{transform:scale(.6);opacity:.6} 100%{transform:scale(2.4);opacity:0} }
            @keyframes pl-blink   { 0%,49%{opacity:.35} 50%,100%{opacity:1} }
            @keyframes pl-fall    { 0%{opacity:0;transform:translateY(-8px)} 20%{opacity:1} 80%{opacity:1} 100%{opacity:0;transform:translateY(8px)} }
            @keyframes pl-cursor  { 0%,100%{opacity:1} 50%{opacity:0} }
            @keyframes pl-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
            .pl-ring1  { position:absolute;inset:0;border-radius:50%;border:1.5px solid rgba(226,232,240,.06);border-top:1.5px solid #60a5fa;animation:pl-spin1 1s linear infinite; }
            .pl-ring2  { position:absolute;inset:11px;border-radius:50%;border:1.5px solid rgba(226,232,240,.04);border-top:1.5px solid rgba(129,140,248,.5);animation:pl-spin2 1.4s linear infinite; }
            .pl-ring3  { position:absolute;inset:22px;border-radius:50%;border:1px solid rgba(226,232,240,.03);border-top:1px solid rgba(167,139,250,.4);animation:pl-spin1 .8s linear infinite; }
            .pl-core   { position:absolute;top:50%;left:50%;width:10px;height:10px;background:#60a5fa;border-radius:50%;animation:pl-pulse 1.4s ease-in-out infinite; }
            .pl-rip1   { position:absolute;inset:0;border-radius:50%;border:1px solid rgba(96,165,250,.2);animation:pl-ripple 2s ease-out infinite; }
            .pl-rip2   { animation-delay:.7s; }
            .pl-chip1  { font-size:11px;font-family:'JetBrains Mono',monospace;padding:2px 10px;border-radius:6px;color:#60a5fa;background:rgba(96,165,250,.08);border:1px solid rgba(96,165,250,.15);animation:pl-fall 2.4s ease-in-out infinite; }
            .pl-chip2  { font-size:11px;font-family:'JetBrains Mono',monospace;padding:2px 10px;border-radius:6px;color:rgba(148,163,184,.5);background:rgba(226,232,240,.03);border:1px solid rgba(226,232,240,.07);animation:pl-fall 2.4s ease-in-out infinite .6s; }
            .pl-chip3  { font-size:11px;font-family:'JetBrains Mono',monospace;padding:2px 10px;border-radius:6px;color:rgba(129,140,248,.6);background:rgba(129,140,248,.06);border:1px solid rgba(129,140,248,.12);animation:pl-fall 2.4s ease-in-out infinite 1.2s; }
            .pl-cursor { display:inline-block;width:6px;height:12px;background:rgba(96,165,250,.5);border-radius:1px;animation:pl-cursor .8s ease-in-out infinite; }
            .pl-msg    { font-size:12px;font-family:'JetBrains Mono',monospace;color:rgba(148,163,184,.45);letter-spacing:.08em;animation:pl-blink 1.6s ease-in-out infinite;display:flex;align-items:center;gap:4px; }
        `}</style>

        <div style={{
            minHeight:'100vh', background:'#06080e',
            display:'flex', flexDirection:'column',
            alignItems:'center', justifyContent:'center', gap:24,
            fontFamily:"'Space Grotesk',sans-serif",
        }}>
            {/* Orbit rings */}
            <motion.div
                initial={{ opacity:0, scale:.8 }}
                animate={{ opacity:1, scale:1 }}
                transition={{ duration:.5 }}
                style={{ position:'relative', width:80, height:80 }}
            >
                <div className="pl-rip1"/>
                <div className="pl-rip1 pl-rip2"/>
                <div className="pl-ring1"/>
                <div className="pl-ring2"/>
                <div className="pl-ring3"/>
                <div className="pl-core"/>
            </motion.div>

            {/* Floating code chips */}
            <motion.div
                initial={{ opacity:0, y:8 }}
                animate={{ opacity:1, y:0 }}
                transition={{ delay:.2, duration:.4 }}
                style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:5 }}
            >
                <div className="pl-chip1">initializing()</div>
                <div className="pl-chip2">// please wait...</div>
                <div className="pl-chip3">import AlgoMate</div>
            </motion.div>

            {/* Message */}
            <div className="pl-msg">
                {message}<span className="pl-cursor"/>
            </div>
        </div>
    </>
)

// ── Spinner ──────────────────────────────────────────────────────
export const Spinner = ({ size = 20, color = '#60a5fa' }) => (
    <>
        <style>{`
            @keyframes sp-spin1 { to{transform:rotate(360deg)} }
            @keyframes sp-spin2 { to{transform:rotate(-360deg)} }
            @keyframes sp-pulse { 0%,100%{opacity:.4;transform:translate(-50%,-50%) scale(.4)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1)} }
        `}</style>
        <div style={{ position:'relative', width:size, height:size, flexShrink:0 }}>
            <div style={{ position:'absolute', inset:0, borderRadius:'50%', border:`2px solid rgba(226,232,240,.06)`, borderTop:`2px solid ${color}`, animation:'sp-spin1 .7s linear infinite' }}/>
            <div style={{ position:'absolute', inset:size*.2, borderRadius:'50%', border:`1.5px solid rgba(226,232,240,.04)`, borderTop:`1.5px solid rgba(129,140,248,.5)`, animation:'sp-spin2 1s linear infinite' }}/>
            <div style={{ position:'absolute', top:'50%', left:'50%', width:size*.2, height:size*.2, background:color, borderRadius:'50%', animation:'sp-pulse 1.2s ease-in-out infinite' }}/>
        </div>
    </>
)

// ── SkeletonLine ─────────────────────────────────────────────────
export const SkeletonLine = ({ width = '100%', height = 12, delay = 0, borderRadius = 4 }) => (
    <>
        <style>{`@keyframes sk-wave { 0%{opacity:.04} 50%{opacity:.11} 100%{opacity:.04} }`}</style>
        <div style={{
            width, height, borderRadius,
            background:'rgba(226,232,240,.07)',
            animation:`sk-wave 1.4s ease-in-out ${delay}s infinite`,
        }}/>
    </>
)

// ── SkeletonCard ─────────────────────────────────────────────────
export const SkeletonCard = ({ lines = 3 }) => (
    <div style={{
        padding:16, borderRadius:12,
        background:'rgba(226,232,240,.025)',
        border:'1px solid rgba(226,232,240,.07)',
        display:'flex', flexDirection:'column', gap:10,
    }}>
        {/* Header with avatar */}
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
            <SkeletonLine width={32} height={32} borderRadius={50} delay={0}/>
            <SkeletonLine width="60%" height={13} delay={0.05}/>
        </div>
        {Array(lines - 1).fill(0).map((_,i) => (
            <SkeletonLine key={i} width={i === lines-2 ? '50%' : '100%'} delay={i * .08}/>
        ))}
        {/* Tag skeleton */}
        <SkeletonLine width={60} height={18} borderRadius={20} delay={.2}/>
    </div>
)

// ── ButtonLoader ─────────────────────────────────────────────────
export const ButtonLoader = ({ label = 'Processing...' }) => (
    <>
        <style>{`
            @keyframes bl-spin1 { to{transform:rotate(360deg)} }
            @keyframes bl-spin2 { to{transform:rotate(-360deg)} }
        `}</style>
        <span style={{ display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ position:'relative', width:14, height:14, flexShrink:0, display:'inline-block' }}>
                <span style={{ position:'absolute', inset:0, borderRadius:'50%', border:'1.5px solid rgba(255,255,255,.15)', borderTop:'1.5px solid #fff', animation:'bl-spin1 .7s linear infinite', display:'block' }}/>
                <span style={{ position:'absolute', inset:3, borderRadius:'50%', border:'1px solid transparent', borderTop:'1px solid rgba(129,140,248,.6)', animation:'bl-spin2 1s linear infinite', display:'block' }}/>
            </span>
            {label}
        </span>
    </>
)

// ── TerminalLoader (bonus — replaces old PageLoader for auth pages) ──
export const TerminalLoader = ({ steps = [] }) => {
    const defaultSteps = [
        { cmd:'auth.verify(token)',   done:true  },
        { cmd:"fetch('/api/data')",   done:true  },
        { cmd:'render(Component)',    done:false },
    ]
    const list = steps.length ? steps : defaultSteps

    return (
        <>
            <style>{`
                @keyframes tl-blink  { 0%,49%{opacity:.35} 50%,100%{opacity:1} }
                @keyframes tl-cursor { 0%,100%{opacity:1} 50%{opacity:0} }
            `}</style>
            <div style={{
                padding:'14px 18px', borderRadius:11,
                background:'rgba(226,232,240,.025)',
                border:'1px solid rgba(226,232,240,.08)',
                fontFamily:"'JetBrains Mono',monospace",
                display:'inline-block',
            }}>
                {/* Dots */}
                <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:10 }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#ef4444' }}/>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#fbbf24' }}/>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:'#22c55e' }}/>
                    <span style={{ fontSize:9, color:'rgba(148,163,184,.3)', marginLeft:6, letterSpacing:'.05em' }}>terminal</span>
                </div>
                {/* Lines */}
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                    {list.map((step, i) => (
                        <div key={i} style={{ fontSize:11, display:'flex', alignItems:'center', gap:7 }}>
                            <span style={{ color:'#22c55e' }}>$</span>
                            <span style={{ color:'rgba(226,232,240,.7)' }}>{step.cmd}</span>
                            {step.done
                                ? <span style={{ color:'#22c55e', fontSize:10 }}>✓</span>
                                : <span style={{ color:'#fbbf24', fontSize:10, animation:'tl-blink 1s ease-in-out infinite' }}>...</span>
                            }
                        </div>
                    ))}
                    {/* Cursor line */}
                    <div style={{ fontSize:11, display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ color:'rgba(148,163,184,.3)' }}>$</span>
                        <span style={{ display:'inline-block', width:6, height:11, background:'rgba(148,163,184,.4)', borderRadius:1, animation:'tl-cursor .8s ease-in-out infinite' }}/>
                    </div>
                </div>
            </div>
        </>
    )
}

// ── Default export ───────────────────────────────────────────────
export default PageLoader