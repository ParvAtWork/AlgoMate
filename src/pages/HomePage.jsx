// src/pages/HomePage.jsx

import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../store/slices/authSlice.js'
import Navbar from '../components/common/Navbar.jsx'
import FloatingBackground from '../components/common/FloatingBackground.jsx'

const HomePage = () => {
    const navigate        = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)

    const handleGetStarted = () => {
        if (isAuthenticated) navigate('/problems')
        else navigate('/login')
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');

        @keyframes fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes shimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes floatAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes glowPulse { 0%,100%{opacity:.1} 50%{opacity:.2} }
        @keyframes gridFade  { 0%,100%{opacity:.025} 50%{opacity:.055} }
        @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes lineGrow  { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
        @keyframes dotPulse  { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.4);opacity:1} }
        @keyframes badgeSlide{ from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes orbFloat  { 0%,100%{transform:translate(0,0)} 25%{transform:translate(20px,-15px)} 50%{transform:translate(-10px,20px)} 75%{transform:translate(-20px,-10px)} }
        @keyframes bgFloat   { 0%{opacity:0;transform:translateY(0)} 8%{opacity:1} 88%{opacity:1} 100%{opacity:0;transform:translateY(-60px)} }

        .hp-page {
          min-height: 100vh;
          background: #06080e;
          font-family: 'Space Grotesk', sans-serif;
          position: relative;
          overflow-x: hidden;
        }
        .hp-grid {
          position: fixed; inset: 0;
          background:
            repeating-linear-gradient(90deg, rgba(226,232,240,.025) 0, transparent 1px, transparent 80px),
            repeating-linear-gradient(180deg, rgba(226,232,240,.025) 0, transparent 1px, transparent 80px);
          animation: gridFade 5s ease-in-out infinite;
          pointer-events: none; z-index: 0;
        }
        .hp-orb {
          position: fixed; border-radius: 50%;
          filter: blur(90px); pointer-events: none;
          animation: orbFloat ease-in-out infinite; z-index: 0;
        }
        .hp-hero {
          position: relative; z-index: 2;
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          min-height: calc(100vh - 72px);
          padding: 120px 24px 80px;
          text-align: center;
        }
        .hp-badge {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 16px; border-radius: 20px;
          background: rgba(96,165,250,.08);
          border: 1px solid rgba(96,165,250,.15);
          font-size: 11.5px; font-family: 'JetBrains Mono', monospace;
          color: #60a5fa; letter-spacing: .05em;
          margin-bottom: 32px;
          animation: badgeSlide .6s ease-out .1s both;
          position: relative; z-index: 2;
        }
        .hp-badge-dot {
          width: 5px; height: 5px; border-radius: 50%;
          background: #60a5fa;
          animation: dotPulse 2s ease-in-out infinite;
          box-shadow: 0 0 6px #60a5fa; flex-shrink: 0;
        }
        .hp-title {
          font-size: clamp(36px, 5.5vw, 68px);
          font-weight: 900; letter-spacing: -.04em;
          line-height: 1.05; margin-bottom: 22px;
          animation: fadeUp .7s ease-out .25s both;
          position: relative; z-index: 2;
        }
        .hp-title-white   { color: rgba(226,232,240,.92); }
        .hp-title-shimmer {
          background: linear-gradient(90deg,#60a5fa,#818cf8,#60a5fa,#34d399);
          background-size: 300% auto;
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text; animation: shimmer 4s linear infinite;
        }
        .hp-title-blue {
          background: linear-gradient(135deg,#60a5fa,#e2e8f0);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hp-cursor {
          color: #60a5fa; -webkit-text-fill-color: #60a5fa;
          font-weight: 300; animation: cursorBlink 1.2s ease-in-out infinite;
        }
        .hp-sub {
          font-size: clamp(14px, 1.6vw, 17.5px);
          color: rgba(148,163,184,.65);
          max-width: 540px; line-height: 1.75;
          margin: 0 auto 40px; font-weight: 400;
          animation: fadeUp .7s ease-out .4s both;
          position: relative; z-index: 2;
        }
        .hp-cta {
          display: flex; gap: 14px; justify-content: center;
          flex-wrap: wrap; margin-bottom: 60px;
          animation: fadeUp .7s ease-out .55s both;
          position: relative; z-index: 2;
        }
        .hp-btn-p {
          padding: 13px 30px; border-radius: 11px;
          font-size: 15px; font-weight: 700; color: #0f172a;
          background: linear-gradient(135deg,#e2e8f0,#60a5fa);
          border: none; cursor: pointer;
          font-family: 'Space Grotesk', sans-serif;
          transition: all .25s; letter-spacing: -.01em;
        }
        .hp-btn-p:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(96,165,250,.3); filter: brightness(1.05); }
        .hp-btn-g {
          padding: 13px 30px; border-radius: 11px;
          font-size: 15px; font-weight: 500;
          color: rgba(226,232,240,.8);
          background: rgba(226,232,240,.04);
          border: 1px solid rgba(226,232,240,.12);
          cursor: pointer; font-family: 'Space Grotesk', sans-serif;
          transition: all .25s; letter-spacing: -.01em;
        }
        .hp-btn-g:hover { color: #e2e8f0; background: rgba(226,232,240,.08); border-color: rgba(226,232,240,.22); transform: translateY(-2px); }
        .hp-divider {
          width: 100%; max-width: 520px; height: 1px;
          background: linear-gradient(90deg,transparent,rgba(226,232,240,.12),transparent);
          margin: 0 auto 52px;
          animation: lineGrow 1s ease-out .7s both; transform-origin: center;
          position: relative; z-index: 2;
        }
        .hp-stats {
          display: flex; gap: 16px; justify-content: center;
          flex-wrap: wrap; animation: fadeUp .7s ease-out .75s both;
          position: relative; z-index: 2;
        }
        .hp-stat {
          display: flex; flex-direction: column; align-items: center; gap: 5px;
          padding: 20px 28px; border-radius: 13px;
          background: rgba(226,232,240,.03);
          border: 1px solid rgba(226,232,240,.07);
          transition: all .25s; min-width: 120px;
          animation: floatAnim ease-in-out infinite;
        }
        .hp-stat:hover { background: rgba(226,232,240,.06); border-color: rgba(226,232,240,.14); transform: translateY(-4px); }
        .hp-stat:nth-child(2) { animation-delay: .5s; }
        .hp-stat:nth-child(3) { animation-delay: 1s; }
        .hp-stat:nth-child(4) { animation-delay: 1.5s; }
        .hp-stat-num {
          font-size: 26px; font-weight: 800; letter-spacing: -.03em;
          background: linear-gradient(135deg,#e2e8f0,#60a5fa);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hp-stat-label { font-size: 13px; font-weight: 600; color: rgba(226,232,240,.75); }
        .hp-stat-sub   { font-size: 9.5px; font-family: 'JetBrains Mono', monospace; color: rgba(148,163,184,.35); letter-spacing: .05em; }
        .hp-code-wrap {
          position: relative; z-index: 2;
          max-width: 760px; margin: 0 auto 90px;
          padding: 0 24px;
          animation: fadeUp .7s ease-out .9s both;
        }
        .hp-code-card {
          background: rgba(226,232,240,.02);
          border: 1px solid rgba(226,232,240,.08);
          border-radius: 16px; overflow: hidden;
        }
        .hp-code-header {
          display: flex; align-items: center; gap: 7px;
          padding: 12px 16px;
          background: rgba(226,232,240,.03);
          border-bottom: 1px solid rgba(226,232,240,.07);
        }
        .hp-code-dot   { width: 10px; height: 10px; border-radius: 50%; }
        .hp-code-title { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: rgba(148,163,184,.4); margin-left: 4px; }
        .hp-code-body  { padding: 20px 24px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.85; text-align: left; }
        .c-kw  { color: #818cf8 } .c-fn  { color: #60a5fa }
        .c-num { color: #fb923c } .c-cm  { color: rgba(148,163,184,.4) } .c-var { color: #e2e8f0 }
        .hp-section    { position: relative; z-index: 2; padding: 60px 24px; max-width: 960px; margin: 0 auto; }
        .hp-sec-tag    { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: rgba(96,165,250,.6); letter-spacing: .15em; text-transform: uppercase; margin-bottom: 12px; text-align: center; }
        .hp-sec-title  { font-size: clamp(22px,3vw,38px); font-weight: 800; letter-spacing: -.03em; color: #e2e8f0; text-align: center; margin-bottom: 44px; }
        .hp-sec-title-blue { background: linear-gradient(90deg,#60a5fa,#818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .hp-feat-grid  { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
        .hp-feat-card  {
          padding: 26px; border-radius: 14px;
          background: rgba(226,232,240,.02);
          border: 1px solid rgba(226,232,240,.07);
          transition: all .25s;
        }
        .hp-feat-card:hover { background: rgba(226,232,240,.05); border-color: rgba(226,232,240,.15); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,.3); }
        .hp-feat-icon  { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; margin-bottom: 14px; }
        .hp-feat-title { font-size: 14.5px; font-weight: 700; color: #e2e8f0; margin-bottom: 7px; letter-spacing: -.01em; }
        .hp-feat-desc  { font-size: 12.5px; color: rgba(148,163,184,.55); line-height: 1.65; }
        .hp-topics-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
        .hp-topic {
          display: flex; align-items: center; gap: 7px;
          padding: 8px 18px; border-radius: 20px;
          background: rgba(226,232,240,.03);
          border: 1px solid rgba(226,232,240,.08);
          font-size: 12.5px; font-weight: 500;
          color: rgba(226,232,240,.7);
          cursor: pointer; transition: all .2s;
        }
        .hp-topic:hover { background: rgba(96,165,250,.08); border-color: rgba(96,165,250,.2); color: #60a5fa; transform: translateY(-2px); }
        .hp-topic-dot  { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .hp-footer-cta { position: relative; z-index: 2; text-align: center; padding: 60px 24px 100px; }
        .hp-footer-title { font-size: clamp(22px,3.5vw,42px); font-weight: 900; letter-spacing: -.04em; color: #e2e8f0; margin-bottom: 16px; }
        .hp-footer-sub   { font-size: 15px; color: rgba(148,163,184,.55); margin-bottom: 32px; }

        @media(max-width:700px) { .hp-feat-grid { grid-template-columns: 1fr 1fr; } }
        @media(max-width:480px) { .hp-feat-grid { grid-template-columns: 1fr; } }
      `}</style>

            <div className="hp-page">
                <div className="hp-grid" />
                <div className="hp-orb" style={{ width:600, height:600, background:'rgba(96,165,250,.06)', top:-200, left:'50%', transform:'translateX(-50%)', animationDuration:'10s' }} />
                <div className="hp-orb" style={{ width:400, height:400, background:'rgba(139,92,246,.05)', bottom:'10%', right:-100, animationDuration:'12s', animationDelay:'3s' }} />
                <div className="hp-orb" style={{ width:300, height:300, background:'rgba(52,211,153,.04)', top:'30%', left:-80, animationDuration:'9s', animationDelay:'1.5s' }} />

                <FloatingBackground mode="full" />
                <Navbar />
                <div style={{ height: 72 }} />

                {/* ── HERO ── */}
                <div className="hp-hero">
                    <div className="hp-badge">
                        <span className="hp-badge-dot" />
                        Smart DSA Coding &amp; Compilation Platform
                    </div>

                    <h1 className="hp-title">
                        <span className="hp-title-white">Master </span>
                        <span className="hp-title-shimmer">Algorithms</span>
                        <span className="hp-title-white">,</span>
                        <br />
                        <span className="hp-title-white">Ace Every </span>
                        <span className="hp-title-blue">Interview</span>
                        <span className="hp-cursor">_</span>
                    </h1>

                    <p className="hp-sub">
                        A structured DSA platform with integrated compiler, auto-evaluation engine,
                        and real-time leaderboards — built for serious programmers at GLA University.
                    </p>

                    <div className="hp-cta">
                        <button className="hp-btn-p" onClick={handleGetStarted}>Start Solving →</button>
                        <button className="hp-btn-g" onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
                    </div>

                    <div className="hp-divider" />

                    <div className="hp-stats">
                        {[
                            { num:'250+', label:'Problems',    sub:'Easy · Medium · Hard' },
                            { num:'8',    label:'Languages',   sub:'C++ · Java · Python'  },
                            { num:'10K+', label:'Submissions', sub:'Auto Evaluated'        },
                            { num:'500+', label:'Users',       sub:'Active Learners'       },
                        ].map((s, i) => (
                            <div key={i} className="hp-stat" style={{ animationDuration:'4s' }}>
                                <span className="hp-stat-num">{s.num}</span>
                                <span className="hp-stat-label">{s.label}</span>
                                <span className="hp-stat-sub">{s.sub}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── CODE PREVIEW ── */}
                <div className="hp-code-wrap">
                    <div className="hp-code-card">
                        <div className="hp-code-header">
                            <div className="hp-code-dot" style={{ background:'#ef4444' }} />
                            <div className="hp-code-dot" style={{ background:'#f59e0b' }} />
                            <div className="hp-code-dot" style={{ background:'#22c55e' }} />
                            <span className="hp-code-title">two_sum.cpp — AlgoMate Editor</span>
                            <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
                                <div style={{ padding:'3px 10px', borderRadius:5, background:'rgba(34,197,94,.1)', color:'#22c55e', fontSize:10, fontFamily:"'JetBrains Mono',monospace", border:'1px solid rgba(34,197,94,.2)' }}>✓ Accepted</div>
                                <div style={{ padding:'3px 10px', borderRadius:5, background:'rgba(96,165,250,.08)', color:'#60a5fa', fontSize:10, fontFamily:"'JetBrains Mono',monospace", border:'1px solid rgba(96,165,250,.15)' }}>C++</div>
                            </div>
                        </div>
                        <div className="hp-code-body">
                            <div><span className="c-cm">{'// Two Sum — O(n) solution using hash map'}</span></div>
                            <div><span className="c-kw">class </span><span className="c-fn">Solution </span><span className="c-var">{'{'}</span></div>
                            <div><span className="c-kw">&nbsp;&nbsp;public</span><span className="c-var">:</span></div>
                            <div><span className="c-var">&nbsp;&nbsp;vector&lt;int&gt; </span><span className="c-fn">twoSum</span><span className="c-var">{'(vector<int>& nums, '}</span><span className="c-kw">int </span><span className="c-var">{'target) {'}</span></div>
                            <div><span className="c-var">&nbsp;&nbsp;&nbsp;&nbsp;unordered_map&lt;</span><span className="c-kw">int</span><span className="c-var">, </span><span className="c-kw">int</span><span className="c-var">&gt; mp;</span></div>
                            <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;for </span><span className="c-var">{'(int i = '}</span><span className="c-num">0</span><span className="c-var">{'; i < nums.size(); i++) {'}</span></div>
                            <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;int </span><span className="c-var">comp = target - nums[i];</span></div>
                            <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if </span><span className="c-var">{'(mp.count(comp)) '}</span><span className="c-kw">return </span><span className="c-var">{'{mp[comp], i};'}</span></div>
                            <div><span className="c-var">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mp[nums[i]] = i;</span></div>
                            <div><span className="c-var">&nbsp;&nbsp;&nbsp;&nbsp;{'}'}</span></div>
                            <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;return </span><span className="c-var">{'{}; }'}</span></div>
                            <div><span className="c-var">{'}; '}</span></div>
                        </div>
                    </div>
                </div>

                {/* ── FEATURES ── */}
                <div className="hp-section">
                    <p className="hp-sec-tag">// Why AlgoMate?</p>
                    <h2 className="hp-sec-title">
                        Everything you need to{' '}
                        <span className="hp-sec-title-blue">master DSA</span>
                    </h2>
                    <div className="hp-feat-grid">
                        {[
                            { icon:'⚡', color:'rgba(96,165,250,.1)',   border:'rgba(96,165,250,.15)',  title:'Online Compiler',     desc:'Write, compile & run code in 8 languages directly in browser. Zero setup needed.' },
                            { icon:'✅', color:'rgba(34,197,94,.1)',    border:'rgba(34,197,94,.15)',   title:'Auto Evaluation',     desc:'Instant verdict against test cases. Get Accepted / Wrong Answer in milliseconds.' },
                            { icon:'🏆', color:'rgba(251,191,36,.1)',   border:'rgba(251,191,36,.15)',  title:'Leaderboards',        desc:'Compete globally. Weekly & monthly rankings to track your progress vs others.' },
                            { icon:'📚', color:'rgba(167,139,250,.1)',  border:'rgba(167,139,250,.15)', title:'Structured Learning', desc:'Problems organized by topic & difficulty. Arrays → Graphs → DP in order.' },
                            { icon:'🔥', color:'rgba(249,115,22,.1)',   border:'rgba(249,115,22,.15)',  title:'Daily Challenges',    desc:'New problem every day. Build streaks, earn points, stay consistent.' },
                            { icon:'📊', color:'rgba(52,211,153,.1)',   border:'rgba(52,211,153,.15)',  title:'Progress Tracking',   desc:'Dashboard with stats, accuracy rate, solved count & topic breakdown.' },
                        ].map((f, i) => (
                            <div key={i} className="hp-feat-card">
                                <div className="hp-feat-icon" style={{ background:f.color, border:`1px solid ${f.border}` }}>{f.icon}</div>
                                <div className="hp-feat-title">{f.title}</div>
                                <div className="hp-feat-desc">{f.desc}</div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── TOPICS ── */}
                <div className="hp-section" style={{ paddingTop:0 }}>
                    <p className="hp-sec-tag">// DSA Topics</p>
                    <h2 className="hp-sec-title" style={{ fontSize:'clamp(20px,2.5vw,30px)', marginBottom:28 }}>
                        250+ Problems across{' '}
                        <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                            all topics
                        </span>
                    </h2>
                    <div className="hp-topics-grid">
                        {[
                            { label:'Arrays',              color:'#60a5fa' },
                            { label:'Linked Lists',        color:'#818cf8' },
                            { label:'Trees',               color:'#34d399' },
                            { label:'Graphs',              color:'#fb923c' },
                            { label:'Dynamic Programming', color:'#f472b6' },
                            { label:'Stacks & Queues',     color:'#fbbf24' },
                            { label:'Binary Search',       color:'#60a5fa' },
                            { label:'Sorting',             color:'#818cf8' },
                            { label:'Recursion',           color:'#34d399' },
                            { label:'Backtracking',        color:'#fb923c' },
                            { label:'Heaps',               color:'#f472b6' },
                            { label:'Tries',               color:'#fbbf24' },
                        ].map((t, i) => (
                            <div key={i} className="hp-topic" onClick={handleGetStarted}>
                                <div className="hp-topic-dot" style={{ background:t.color, boxShadow:`0 0 5px ${t.color}` }} />
                                {t.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ── FOOTER CTA ── */}
                <div className="hp-footer-cta">
                    <h2 className="hp-footer-title">
                        Ready to{' '}
                        <span style={{ background:'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
                            level up
                        </span>
                        ?
                    </h2>
                    <p className="hp-footer-sub">
                        Join AlgoMate today and start your DSA mastery journey.
                    </p>
                    <div className="hp-cta">
                        <button className="hp-btn-p" onClick={handleGetStarted}>
                            {isAuthenticated ? 'Go to Problems →' : 'Get Started Free →'}
                        </button>
                        <button className="hp-btn-g" onClick={handleGetStarted}>Browse Problems</button>
                    </div>
                </div>

            </div>
        </>
    )
}

export default HomePage

// Aur buttons ko update karo:
// <button className="hp-btn-p" onClick={handleGetStarted}>Start Solving →</button>
// <button className="hp-btn-g" onClick={handleGetStarted}>View Leaderboard</button>
//
// Footer mein bhi:
// <button className="hp-btn-p" onClick={handleGetStarted}>Get Started Free →</button>
// <button className="hp-btn-g" onClick={handleGetStarted}>Browse Problems</button>

// import { useNavigate } from 'react-router-dom'
// import Navbar from '../components/common/Navbar.jsx'
// import FloatingBackground from '../components/common/FloatingBackground.jsx'
//
// const HomePage = () => {
//     const navigate = useNavigate()
//
//     return (
//         <>
//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap');
//
//         @keyframes fadeUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
//         @keyframes floatAnim { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
//         @keyframes glowPulse { 0%,100%{opacity:.1} 50%{opacity:.2} }
//         @keyframes gridFade { 0%,100%{opacity:.025} 50%{opacity:.055} }
//         @keyframes cursorBlink { 0%,100%{opacity:1} 50%{opacity:0} }
//         @keyframes lineGrow { from{transform:scaleX(0);opacity:0} to{transform:scaleX(1);opacity:1} }
//         @keyframes dotPulse { 0%,100%{transform:scale(1);opacity:.5} 50%{transform:scale(1.4);opacity:1} }
//         @keyframes badgeSlide { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes orbFloat { 0%,100%{transform:translate(0,0)} 25%{transform:translate(20px,-15px)} 50%{transform:translate(-10px,20px)} 75%{transform:translate(-20px,-10px)} }
//         @keyframes bgFloat { 0%{opacity:0;transform:translateY(0)} 8%{opacity:1} 88%{opacity:1} 100%{opacity:0;transform:translateY(-60px)} }
//
//         .hp-page {
//           min-height: 100vh;
//           background: #06080e;
//           font-family: 'Space Grotesk', sans-serif;
//           position: relative;
//           overflow-x: hidden;
//         }
//         .hp-grid {
//           position: fixed; inset: 0;
//           background:
//             repeating-linear-gradient(90deg, rgba(226,232,240,.025) 0, transparent 1px, transparent 80px),
//             repeating-linear-gradient(180deg, rgba(226,232,240,.025) 0, transparent 1px, transparent 80px);
//           animation: gridFade 5s ease-in-out infinite;
//           pointer-events: none; z-index: 0;
//         }
//         .hp-orb {
//           position: fixed; border-radius: 50%;
//           filter: blur(90px); pointer-events: none;
//           animation: orbFloat ease-in-out infinite; z-index: 0;
//         }
//
//         /* ── HERO ── */
//         .hp-hero {
//           position: relative;
//           z-index: 2;
//           display: flex;
//           flex-direction: column;
//           align-items: center;
//           justify-content: center;
//           min-height: calc(100vh - 72px);
//           padding: 120px 24px 80px;
//           text-align: center;
//         }
//         .hp-badge {
//           display: inline-flex; align-items: center; gap: 7px;
//           padding: 6px 16px; border-radius: 20px;
//           background: rgba(96,165,250,.08);
//           border: 1px solid rgba(96,165,250,.15);
//           font-size: 11.5px; font-family: 'JetBrains Mono', monospace;
//           color: #60a5fa; letter-spacing: .05em;
//           margin-bottom: 32px;
//           animation: badgeSlide .6s ease-out .1s both;
//           position: relative; z-index: 2;
//         }
//         .hp-badge-dot {
//           width: 5px; height: 5px; border-radius: 50%;
//           background: #60a5fa;
//           animation: dotPulse 2s ease-in-out infinite;
//           box-shadow: 0 0 6px #60a5fa; flex-shrink: 0;
//         }
//         .hp-title {
//           font-size: clamp(36px, 5.5vw, 68px);
//           font-weight: 900; letter-spacing: -.04em;
//           line-height: 1.05; margin-bottom: 22px;
//           animation: fadeUp .7s ease-out .25s both;
//           position: relative; z-index: 2;
//         }
//         .hp-title-white { color: rgba(226,232,240,.92); }
//         .hp-title-shimmer {
//           background: linear-gradient(90deg,#60a5fa,#818cf8,#60a5fa,#34d399);
//           background-size: 300% auto;
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
//           background-clip: text; animation: shimmer 4s linear infinite;
//         }
//         .hp-title-blue {
//           background: linear-gradient(135deg,#60a5fa,#e2e8f0);
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }
//         .hp-cursor {
//           color: #60a5fa; -webkit-text-fill-color: #60a5fa;
//           font-weight: 300; animation: cursorBlink 1.2s ease-in-out infinite;
//         }
//         .hp-sub {
//           font-size: clamp(14px, 1.6vw, 17.5px);
//           color: rgba(148,163,184,.65);
//           max-width: 540px; line-height: 1.75;
//           margin: 0 auto 40px; font-weight: 400;
//           animation: fadeUp .7s ease-out .4s both;
//           position: relative; z-index: 2;
//         }
//         .hp-cta {
//           display: flex; gap: 14px; justify-content: center;
//           flex-wrap: wrap; margin-bottom: 60px;
//           animation: fadeUp .7s ease-out .55s both;
//           position: relative; z-index: 2;
//         }
//         .hp-btn-p {
//           padding: 13px 30px; border-radius: 11px;
//           font-size: 15px; font-weight: 700; color: #0f172a;
//           background: linear-gradient(135deg,#e2e8f0,#60a5fa);
//           border: none; cursor: pointer;
//           font-family: 'Space Grotesk', sans-serif;
//           transition: all .25s; letter-spacing: -.01em;
//         }
//         .hp-btn-p:hover { transform: translateY(-2px); box-shadow: 0 10px 30px rgba(96,165,250,.3); filter: brightness(1.05); }
//         .hp-btn-g {
//           padding: 13px 30px; border-radius: 11px;
//           font-size: 15px; font-weight: 500;
//           color: rgba(226,232,240,.8);
//           background: rgba(226,232,240,.04);
//           border: 1px solid rgba(226,232,240,.12);
//           cursor: pointer; font-family: 'Space Grotesk', sans-serif;
//           transition: all .25s; letter-spacing: -.01em;
//         }
//         .hp-btn-g:hover { color: #e2e8f0; background: rgba(226,232,240,.08); border-color: rgba(226,232,240,.22); transform: translateY(-2px); }
//
//         .hp-divider {
//           width: 100%; max-width: 520px; height: 1px;
//           background: linear-gradient(90deg,transparent,rgba(226,232,240,.12),transparent);
//           margin: 0 auto 52px;
//           animation: lineGrow 1s ease-out .7s both; transform-origin: center;
//           position: relative; z-index: 2;
//         }
//
//         /* Stats */
//         .hp-stats {
//           display: flex; gap: 16px; justify-content: center;
//           flex-wrap: wrap; animation: fadeUp .7s ease-out .75s both;
//           position: relative; z-index: 2;
//         }
//         .hp-stat {
//           display: flex; flex-direction: column; align-items: center; gap: 5px;
//           padding: 20px 28px; border-radius: 13px;
//           background: rgba(226,232,240,.03);
//           border: 1px solid rgba(226,232,240,.07);
//           transition: all .25s; min-width: 120px;
//           animation: floatAnim ease-in-out infinite;
//         }
//         .hp-stat:hover { background: rgba(226,232,240,.06); border-color: rgba(226,232,240,.14); transform: translateY(-4px); }
//         .hp-stat:nth-child(2) { animation-delay: .5s; }
//         .hp-stat:nth-child(3) { animation-delay: 1s; }
//         .hp-stat:nth-child(4) { animation-delay: 1.5s; }
//         .hp-stat-num {
//           font-size: 26px; font-weight: 800; letter-spacing: -.03em;
//           background: linear-gradient(135deg,#e2e8f0,#60a5fa);
//           -webkit-background-clip: text; -webkit-text-fill-color: transparent;
//           background-clip: text;
//         }
//         .hp-stat-label { font-size: 13px; font-weight: 600; color: rgba(226,232,240,.75); }
//         .hp-stat-sub { font-size: 9.5px; font-family: 'JetBrains Mono', monospace; color: rgba(148,163,184,.35); letter-spacing: .05em; }
//
//         /* Code Preview */
//         .hp-code-wrap {
//           position: relative; z-index: 2;
//           max-width: 760px; margin: 0 auto 90px;
//           padding: 0 24px;
//           animation: fadeUp .7s ease-out .9s both;
//         }
//         .hp-code-card {
//           background: rgba(226,232,240,.02);
//           border: 1px solid rgba(226,232,240,.08);
//           border-radius: 16px; overflow: hidden;
//         }
//         .hp-code-header {
//           display: flex; align-items: center; gap: 7px;
//           padding: 12px 16px;
//           background: rgba(226,232,240,.03);
//           border-bottom: 1px solid rgba(226,232,240,.07);
//         }
//         .hp-code-dot { width: 10px; height: 10px; border-radius: 50%; }
//         .hp-code-title { font-size: 11px; font-family: 'JetBrains Mono', monospace; color: rgba(148,163,184,.4); margin-left: 4px; }
//         .hp-code-body { padding: 20px 24px; font-family: 'JetBrains Mono', monospace; font-size: 12.5px; line-height: 1.85; text-align: left; }
//         .c-kw{color:#818cf8} .c-fn{color:#60a5fa} .c-str{color:#34d399}
//         .c-num{color:#fb923c} .c-cm{color:rgba(148,163,184,.4)} .c-var{color:#e2e8f0}
//
//         /* Features */
//         .hp-section { position: relative; z-index: 2; padding: 60px 24px; max-width: 960px; margin: 0 auto; }
//         .hp-sec-tag { font-size: 10px; font-family: 'JetBrains Mono', monospace; color: rgba(96,165,250,.6); letter-spacing: .15em; text-transform: uppercase; margin-bottom: 12px; text-align: center; }
//         .hp-sec-title { font-size: clamp(22px,3vw,38px); font-weight: 800; letter-spacing: -.03em; color: #e2e8f0; text-align: center; margin-bottom: 44px; }
//         .hp-sec-title-blue { background: linear-gradient(90deg,#60a5fa,#818cf8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
//         .hp-feat-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 18px; }
//         .hp-feat-card {
//           padding: 26px; border-radius: 14px;
//           background: rgba(226,232,240,.02);
//           border: 1px solid rgba(226,232,240,.07);
//           transition: all .25s;
//         }
//         .hp-feat-card:hover { background: rgba(226,232,240,.05); border-color: rgba(226,232,240,.15); transform: translateY(-4px); box-shadow: 0 8px 30px rgba(0,0,0,.3); }
//         .hp-feat-icon { width: 38px; height: 38px; border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 17px; margin-bottom: 14px; }
//         .hp-feat-title { font-size: 14.5px; font-weight: 700; color: #e2e8f0; margin-bottom: 7px; letter-spacing: -.01em; }
//         .hp-feat-desc { font-size: 12.5px; color: rgba(148,163,184,.55); line-height: 1.65; }
//
//         /* Topics */
//         .hp-topics-grid { display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; }
//         .hp-topic {
//           display: flex; align-items: center; gap: 7px;
//           padding: 8px 18px; border-radius: 20px;
//           background: rgba(226,232,240,.03);
//           border: 1px solid rgba(226,232,240,.08);
//           font-size: 12.5px; font-weight: 500;
//           color: rgba(226,232,240,.7);
//           cursor: pointer; transition: all .2s;
//         }
//         .hp-topic:hover { background: rgba(96,165,250,.08); border-color: rgba(96,165,250,.2); color: #60a5fa; transform: translateY(-2px); }
//         .hp-topic-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
//
//         /* Footer CTA */
//         .hp-footer-cta { position: relative; z-index: 2; text-align: center; padding: 60px 24px 100px; }
//         .hp-footer-title { font-size: clamp(22px,3.5vw,42px); font-weight: 900; letter-spacing: -.04em; color: #e2e8f0; margin-bottom: 16px; }
//         .hp-footer-sub { font-size: 15px; color: rgba(148,163,184,.55); margin-bottom: 32px; }
//
//         @media(max-width:700px) { .hp-feat-grid { grid-template-columns: 1fr 1fr; } }
//         @media(max-width:480px) { .hp-feat-grid { grid-template-columns: 1fr; } }
//       `}</style>
//
//             <div className="hp-page">
//
//                 {/* Fixed BG */}
//                 <div className="hp-grid" />
//                 <div className="hp-orb" style={{ width:600,height:600,background:'rgba(96,165,250,.06)',top:-200,left:'50%',transform:'translateX(-50%)',animationDuration:'10s' }} />
//                 <div className="hp-orb" style={{ width:400,height:400,background:'rgba(139,92,246,.05)',bottom:'10%',right:-100,animationDuration:'12s',animationDelay:'3s' }} />
//                 <div className="hp-orb" style={{ width:300,height:300,background:'rgba(52,211,153,.04)',top:'30%',left:-80,animationDuration:'9s',animationDelay:'1.5s' }} />
//
//                 {/* Floating Background — z-index 0, behind everything */}
//                 <FloatingBackground mode="full" />
//
//                 {/* Navbar — z-index 50 (fixed) */}
//                 <Navbar />
//
//                 {/* Navbar spacer */}
//                 <div style={{ height: 72 }} />
//
//                 {/* ── HERO ── */}
//                 <div className="hp-hero">
//
//                     <div className="hp-badge">
//                         <span className="hp-badge-dot" />
//                         Smart DSA Coding &amp; Compilation Platform
//                     </div>
//
//                     <h1 className="hp-title">
//                         <span className="hp-title-white">Master </span>
//                         <span className="hp-title-shimmer">Algorithms</span>
//                         <span className="hp-title-white">,</span>
//                         <br />
//                         <span className="hp-title-white">Ace Every </span>
//                         <span className="hp-title-blue">Interview</span>
//                         <span className="hp-cursor">_</span>
//                     </h1>
//
//                     <p className="hp-sub">
//                         A structured DSA platform with integrated compiler, auto-evaluation engine,
//                         and real-time leaderboards — built for serious programmers at GLA University.
//                     </p>
//
//                     <div className="hp-cta">
//                         <button className="hp-btn-p" onClick={() => navigate('/problems')}>Start Solving →</button>
//                         <button className="hp-btn-g" onClick={() => navigate('/leaderboard')}>View Leaderboard</button>
//                     </div>
//
//                     <div className="hp-divider" />
//
//                     <div className="hp-stats">
//                         {[
//                             { num:'250+', label:'Problems',    sub:'Easy · Medium · Hard' },
//                             { num:'8',    label:'Languages',   sub:'C++ · Java · Python' },
//                             { num:'10K+', label:'Submissions', sub:'Auto Evaluated' },
//                             { num:'500+', label:'Users',       sub:'Active Learners' },
//                         ].map((s,i) => (
//                             <div key={i} className="hp-stat" style={{ animationDuration:'4s' }}>
//                                 <span className="hp-stat-num">{s.num}</span>
//                                 <span className="hp-stat-label">{s.label}</span>
//                                 <span className="hp-stat-sub">{s.sub}</span>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//
//                 {/* ── CODE PREVIEW ── */}
//                 <div className="hp-code-wrap">
//                     <div className="hp-code-card">
//                         <div className="hp-code-header">
//                             <div className="hp-code-dot" style={{ background:'#ef4444' }} />
//                             <div className="hp-code-dot" style={{ background:'#f59e0b' }} />
//                             <div className="hp-code-dot" style={{ background:'#22c55e' }} />
//                             <span className="hp-code-title">two_sum.cpp — AlgoMate Editor</span>
//                             <div style={{ marginLeft:'auto', display:'flex', gap:8 }}>
//                                 <div style={{ padding:'3px 10px',borderRadius:5,background:'rgba(34,197,94,.1)',color:'#22c55e',fontSize:10,fontFamily:"'JetBrains Mono',monospace",border:'1px solid rgba(34,197,94,.2)' }}>✓ Accepted</div>
//                                 <div style={{ padding:'3px 10px',borderRadius:5,background:'rgba(96,165,250,.08)',color:'#60a5fa',fontSize:10,fontFamily:"'JetBrains Mono',monospace",border:'1px solid rgba(96,165,250,.15)' }}>C++</div>
//                             </div>
//                         </div>
//                         <div className="hp-code-body">
//                             <div><span className="c-cm">{'// Two Sum — O(n) solution using hash map'}</span></div>
//                             <div><span className="c-kw">class </span><span className="c-fn">Solution </span><span className="c-var">{'{'}</span></div>
//                             <div><span className="c-kw">&nbsp;&nbsp;public</span><span className="c-var">:</span></div>
//                             <div><span className="c-var">&nbsp;&nbsp;vector&lt;int&gt; </span><span className="c-fn">twoSum</span><span className="c-var">{'(vector<int>& nums, '}</span><span className="c-kw">int </span><span className="c-var">{'target) {'}</span></div>
//                             <div><span className="c-var">&nbsp;&nbsp;&nbsp;&nbsp;unordered_map&lt;</span><span className="c-kw">int</span><span className="c-var">, </span><span className="c-kw">int</span><span className="c-var">&gt; mp;</span></div>
//                             <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;for </span><span className="c-var">{'(int i = '}</span><span className="c-num">0</span><span className="c-var">{'; i < nums.size(); i++) {'}</span></div>
//                             <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;int </span><span className="c-var">comp = target - nums[i];</span></div>
//                             <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;if </span><span className="c-var">{'(mp.count(comp)) '}</span><span className="c-kw">return </span><span className="c-var">{'{mp[comp], i};'}</span></div>
//                             <div><span className="c-var">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;mp[nums[i]] = i;</span></div>
//                             <div><span className="c-var">&nbsp;&nbsp;&nbsp;&nbsp;{'}'}</span></div>
//                             <div><span className="c-kw">&nbsp;&nbsp;&nbsp;&nbsp;return </span><span className="c-var">{'{}; }'}</span></div>
//                             <div><span className="c-var">{'}; '}</span></div>
//                         </div>
//                     </div>
//                 </div>
//
//                 {/* ── FEATURES ── */}
//                 <div className="hp-section">
//                     <p className="hp-sec-tag">// Why AlgoMate?</p>
//                     <h2 className="hp-sec-title">
//                         Everything you need to{' '}
//                         <span className="hp-sec-title-blue">master DSA</span>
//                     </h2>
//                     <div className="hp-feat-grid">
//                         {[
//                             { icon:'⚡', color:'rgba(96,165,250,.1)',  border:'rgba(96,165,250,.15)', title:'Online Compiler',     desc:'Write, compile & run code in 8 languages directly in browser. Zero setup needed.' },
//                             { icon:'✅', color:'rgba(34,197,94,.1)',   border:'rgba(34,197,94,.15)',  title:'Auto Evaluation',    desc:'Instant verdict against test cases. Get Accepted / Wrong Answer in milliseconds.' },
//                             { icon:'🏆', color:'rgba(251,191,36,.1)',  border:'rgba(251,191,36,.15)', title:'Leaderboards',       desc:'Compete globally. Weekly & monthly rankings to track your progress vs others.' },
//                             { icon:'📚', color:'rgba(167,139,250,.1)', border:'rgba(167,139,250,.15)',title:'Structured Learning', desc:'Problems organized by topic & difficulty. Arrays → Graphs → DP in order.' },
//                             { icon:'🔥', color:'rgba(249,115,22,.1)',  border:'rgba(249,115,22,.15)', title:'Daily Challenges',   desc:'New problem every day. Build streaks, earn points, stay consistent.' },
//                             { icon:'📊', color:'rgba(52,211,153,.1)',  border:'rgba(52,211,153,.15)', title:'Progress Tracking',  desc:'Dashboard with stats, accuracy rate, solved count & topic breakdown.' },
//                         ].map((f,i) => (
//                             <div key={i} className="hp-feat-card">
//                                 <div className="hp-feat-icon" style={{ background:f.color, border:`1px solid ${f.border}` }}>{f.icon}</div>
//                                 <div className="hp-feat-title">{f.title}</div>
//                                 <div className="hp-feat-desc">{f.desc}</div>
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//
//                 {/* ── TOPICS ── */}
//                 <div className="hp-section" style={{ paddingTop:0 }}>
//                     <p className="hp-sec-tag">// DSA Topics</p>
//                     <h2 className="hp-sec-title" style={{ fontSize:'clamp(20px,2.5vw,30px)', marginBottom:28 }}>
//                         250+ Problems across{' '}
//                         <span style={{ background:'linear-gradient(90deg,#34d399,#60a5fa)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
//               all topics
//             </span>
//                     </h2>
//                     <div className="hp-topics-grid">
//                         {[
//                             { label:'Arrays',              color:'#60a5fa' },
//                             { label:'Linked Lists',        color:'#818cf8' },
//                             { label:'Trees',               color:'#34d399' },
//                             { label:'Graphs',              color:'#fb923c' },
//                             { label:'Dynamic Programming', color:'#f472b6' },
//                             { label:'Stacks & Queues',     color:'#fbbf24' },
//                             { label:'Binary Search',       color:'#60a5fa' },
//                             { label:'Sorting',             color:'#818cf8' },
//                             { label:'Recursion',           color:'#34d399' },
//                             { label:'Backtracking',        color:'#fb923c' },
//                             { label:'Heaps',               color:'#f472b6' },
//                             { label:'Tries',               color:'#fbbf24' },
//                         ].map((t,i) => (
//                             <div key={i} className="hp-topic" onClick={() => navigate('/problems')}>
//                                 <div className="hp-topic-dot" style={{ background:t.color, boxShadow:`0 0 5px ${t.color}` }} />
//                                 {t.label}
//                             </div>
//                         ))}
//                     </div>
//                 </div>
//
//                 {/* ── FOOTER CTA ── */}
//                 <div className="hp-footer-cta">
//                     <h2 className="hp-footer-title">
//                         Ready to{' '}
//                         <span style={{ background:'linear-gradient(90deg,#60a5fa,#818cf8)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>
//               level up
//             </span>
//                         ?
//                     </h2>
//                     <p className="hp-footer-sub">
//                         Join AlgoMate today and start your DSA mastery journey.
//                     </p>
//                     <div className="hp-cta">
//                         <button className="hp-btn-p" onClick={() => navigate('/signup')}>Get Started Free →</button>
//                         <button className="hp-btn-g" onClick={() => navigate('/problems')}>Browse Problems</button>
//                     </div>
//                 </div>
//
//             </div>
//         </>
//     )
// }
//
// export default HomePage