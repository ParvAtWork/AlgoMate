import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { selectIsAuthenticated } from '../../store/slices/authSlice.js'
import { useProblems } from '../../hooks/useProblems.js'
import Navbar from '../../components/common/Navbar.jsx'

const TOPICS = [
    'All', 'Arrays', 'Linked Lists', 'Trees', 'Graphs',
    'DP', 'Stacks', 'Binary Search', 'Sorting',
    'Recursion', 'Backtracking', 'Heaps', 'Tries'
]

const MOCK_PROBLEMS = [
    { id:1,  title:'Two Sum',                       topic:'Arrays',      difficulty:'Easy',   accuracy:78, status:'solved',    tag:'Popular' },
    { id:2,  title:'Valid Parentheses',              topic:'Stack',       difficulty:'Easy',   accuracy:65, status:'solved',    tag:'' },
    { id:3,  title:'Merge Two Sorted Lists',         topic:'Linked List', difficulty:'Easy',   accuracy:70, status:'solved',    tag:'' },
    { id:4,  title:'Maximum Subarray',               topic:'Arrays',      difficulty:'Medium', accuracy:52, status:'attempted', tag:'Classic' },
    { id:5,  title:'Longest Palindromic Substring',  topic:'DP',          difficulty:'Medium', accuracy:43, status:'none',      tag:'Daily 🔥' },
    { id:6,  title:'Binary Search',                  topic:'Search',      difficulty:'Easy',   accuracy:81, status:'solved',    tag:'' },
    { id:7,  title:'Merge Sort',                     topic:'Sorting',     difficulty:'Medium', accuracy:61, status:'none',      tag:'' },
    { id:8,  title:'Graph BFS Traversal',            topic:'Graphs',      difficulty:'Medium', accuracy:49, status:'attempted', tag:'' },
    { id:9,  title:'Coin Change',                    topic:'DP',          difficulty:'Medium', accuracy:44, status:'none',      tag:'' },
    { id:10, title:'Word Break Problem',             topic:'DP',          difficulty:'Hard',   accuracy:31, status:'none',      tag:'' },
    { id:11, title:'N-Queens Problem',               topic:'Backtrack',   difficulty:'Hard',   accuracy:28, status:'none',      tag:'Hard 💀' },
    { id:12, title:'Trapping Rain Water',            topic:'Arrays',      difficulty:'Hard',   accuracy:38, status:'none',      tag:'' },
    { id:13, title:'Longest Common Subsequence',     topic:'DP',          difficulty:'Hard',   accuracy:35, status:'none',      tag:'' },
    { id:14, title:'Reverse Linked List',            topic:'Linked List', difficulty:'Easy',   accuracy:85, status:'solved',    tag:'' },
    { id:15, title:'Climbing Stairs',                topic:'DP',          difficulty:'Easy',   accuracy:79, status:'solved',    tag:'Classic' },
    { id:16, title:'House Robber',                   topic:'DP',          difficulty:'Medium', accuracy:55, status:'none',      tag:'' },
    { id:17, title:'Number of Islands',              topic:'Graphs',      difficulty:'Medium', accuracy:48, status:'attempted', tag:'Popular' },
    { id:18, title:'Course Schedule',                topic:'Graphs',      difficulty:'Medium', accuracy:41, status:'none',      tag:'' },
    { id:19, title:'Serialize Binary Tree',          topic:'Trees',       difficulty:'Hard',   accuracy:25, status:'none',      tag:'' },
    { id:20, title:'Median of Two Sorted Arrays',    topic:'Search',      difficulty:'Hard',   accuracy:22, status:'none',      tag:'Hard 💀' },
]

const ProblemsPage = () => {
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const isAuthenticated = useSelector(selectIsAuthenticated)

    const {
        problems,
        loading,
        error,
        fetchAllProblems,
    } = useProblems()

    const [search, setSearch] = useState(searchParams.get('search') || '')
    const [difficulty, setDifficulty] = useState('All')
    const [topicFilter, setTopicFilter] = useState('All')
    const [status, setStatus] = useState('All')
    const [activeTopic, setActiveTopic] = useState('All')
    const [page, setPage] = useState(1)
    const [bookmarked, setBookmarked] = useState(false)

    const PER_PAGE = 12

    useEffect(() => {
        fetchAllProblems()
    }, [])

    useEffect(() => {
        if (search) setSearchParams({ search })
        else setSearchParams({})
        setPage(1)
    }, [search])

    // Use real API data if available, else mock
    const sourceData = problems && problems.length > 0 ? problems : MOCK_PROBLEMS

    const displayProblems = sourceData.filter(p => {
        const matchSearch = !search ||
            p.title.toLowerCase().includes(search.toLowerCase()) ||
            p.topic.toLowerCase().includes(search.toLowerCase())
        const matchDiff = difficulty === 'All' || p.difficulty === difficulty
        const matchTopic = activeTopic === 'All' ||
            p.topic.toLowerCase().includes(activeTopic.toLowerCase())
        const matchStatus = status === 'All' ||
            (status === 'Solved' && p.status === 'solved') ||
            (status === 'Attempted' && p.status === 'attempted') ||
            (status === 'Not Started' && p.status === 'none')
        return matchSearch && matchDiff && matchTopic && matchStatus
    })

    const totalPages = Math.ceil(displayProblems.length / PER_PAGE)
    const paginated = displayProblems.slice((page - 1) * PER_PAGE, page * PER_PAGE)

    const solvedCount = sourceData.filter(p => p.status === 'solved').length
    const easyCount = sourceData.filter(p => p.difficulty === 'Easy').length
    const medCount = sourceData.filter(p => p.difficulty === 'Medium').length
    const hardCount = sourceData.filter(p => p.difficulty === 'Hard').length

    const diffClass = (d) => d === 'Easy' ? 'pp-diff-e' : d === 'Medium' ? 'pp-diff-m' : 'pp-diff-h'
    const accClass = (a) => a >= 60 ? 'pp-acc-hi' : a >= 40 ? 'pp-acc-mid' : 'pp-acc-lo'
    const tagClass = (tag) => {
        if (!tag) return ''
        if (tag.includes('Popular')) return 'pp-tag-popular'
        if (tag.includes('Classic')) return 'pp-tag-classic'
        if (tag.includes('Daily')) return 'pp-tag-daily'
        if (tag.includes('Hard')) return 'pp-tag-hard'
        return 'pp-tag-popular'
    }

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        @keyframes pp-fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pp-gridFade { 0%,100%{opacity:.02} 50%{opacity:.05} }
        @keyframes pp-flamePulse { 0%,100%{filter:drop-shadow(0 0 3px rgba(249,115,22,.5))} 50%{filter:drop-shadow(0 0 7px rgba(249,115,22,.9))} }
        @keyframes pp-glowPulse { 0%,100%{opacity:.08} 50%{opacity:.15} }
        @keyframes pp-rowIn { from{opacity:0;transform:translateX(-6px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pp-skeleton { 0%{background-position:200% center} 100%{background-position:-200% center} }

        .pp-page { min-height:100vh; background:#06080e; font-family:'Space Grotesk',sans-serif; }
        .pp-grid {
          position:fixed; inset:0;
          background:
            repeating-linear-gradient(90deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px),
            repeating-linear-gradient(180deg,rgba(226,232,240,.018) 0,transparent 1px,transparent 80px);
          animation:pp-gridFade 5s ease-in-out infinite;
          pointer-events:none; z-index:0;
        }
        .pp-glow {
          position:fixed; border-radius:50%; filter:blur(100px);
          pointer-events:none; z-index:0;
          animation:pp-glowPulse 5s ease-in-out infinite;
        }
        .pp-inner { max-width:1200px; margin:0 auto; padding:28px 28px 60px; position:relative; z-index:1; }

        /* Top Row */
        .pp-top { display:flex; align-items:flex-end; justify-content:space-between; margin-bottom:20px; animation:pp-fadeUp .5s ease-out both; flex-wrap:wrap; gap:12px; }
        .pp-tag-label { font-size:9.5px; font-family:'JetBrains Mono',monospace; color:rgba(96,165,250,.5); letter-spacing:.18em; text-transform:uppercase; margin-bottom:6px; }
        .pp-h1 { font-size:26px; font-weight:800; letter-spacing:-.03em; color:#e2e8f0; }
        .pp-h1-accent { background:linear-gradient(90deg,#60a5fa,#818cf8); -webkit-background-clip:text; -webkit-text-fill-color:transparent; background-clip:text; }
        .pp-sub { font-size:13px; color:rgba(148,163,184,.5); margin-top:4px; }
        .pp-solved-wrap { display:flex; flex-direction:column; align-items:flex-end; gap:5px; }
        .pp-solved-text { font-size:12px; font-family:'JetBrains Mono',monospace; color:rgba(148,163,184,.5); }
        .pp-bar-wrap { width:180px; height:5px; background:rgba(226,232,240,.07); border-radius:4px; overflow:hidden; }
        .pp-bar { height:100%; background:linear-gradient(90deg,#60a5fa,#818cf8); border-radius:4px; transition:width .8s ease; }
        .pp-counts { display:flex; gap:8px; }
        .pp-sc { font-size:11px; font-family:'JetBrains Mono',monospace; font-weight:600; padding:3px 9px; border-radius:10px; }

        /* Daily */
        .pp-daily { display:flex; align-items:center; justify-content:space-between; padding:13px 18px; border-radius:12px; background:linear-gradient(135deg,rgba(249,115,22,.07),rgba(251,191,36,.04)); border:1px solid rgba(249,115,22,.16); margin-bottom:18px; cursor:pointer; transition:all .2s; animation:pp-fadeUp .5s ease-out .08s both; flex-wrap:wrap; gap:10px; }
        .pp-daily:hover { background:linear-gradient(135deg,rgba(249,115,22,.12),rgba(251,191,36,.07)); border-color:rgba(249,115,22,.26); transform:translateY(-1px); }
        .pp-daily-l { display:flex; align-items:center; gap:13px; }
        .pp-flame { font-size:20px; animation:pp-flamePulse 1.5s ease-in-out infinite; }
        .pp-daily-title { font-size:13.5px; font-weight:700; color:#fb923c; margin-bottom:2px; }
        .pp-daily-sub { font-size:11.5px; color:rgba(148,163,184,.5); font-family:'JetBrains Mono',monospace; }
        .pp-daily-r { display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
        .pp-streak-badge { font-size:11px; padding:3px 10px; border-radius:10px; background:rgba(249,115,22,.1); border:1px solid rgba(249,115,22,.2); color:#fb923c; font-family:'JetBrains Mono',monospace; font-weight:600; }
        .pp-daily-btn { padding:7px 16px; border-radius:8px; background:rgba(249,115,22,.15); border:1px solid rgba(249,115,22,.25); color:#fb923c; font-size:12.5px; font-weight:700; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s; white-space:nowrap; }
        .pp-daily-btn:hover { background:rgba(249,115,22,.25); }

        /* Filters */
        .pp-filters { display:flex; gap:8px; margin-bottom:14px; flex-wrap:wrap; align-items:center; animation:pp-fadeUp .5s ease-out .12s both; }
        .pp-search { display:flex; align-items:center; gap:8px; padding:8px 14px; border-radius:9px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); flex:1; min-width:220px; transition:all .2s; }
        .pp-search:focus-within { border-color:rgba(96,165,250,.3); background:rgba(96,165,250,.03); }
        .pp-search input { background:none; border:none; outline:none; color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; width:100%; }
        .pp-search input::placeholder { color:rgba(148,163,184,.3); }
        .pp-sel { padding:8px 12px; border-radius:9px; background:rgba(226,232,240,.04); border:1px solid rgba(226,232,240,.1); color:rgba(226,232,240,.7); font-size:12.5px; font-family:'Space Grotesk',sans-serif; cursor:pointer; outline:none; transition:all .2s; }
        .pp-sel:hover { border-color:rgba(226,232,240,.2); background:rgba(226,232,240,.07); }
        .pp-fbtn { padding:8px 14px; border-radius:9px; font-size:12.5px; font-weight:500; cursor:pointer; transition:all .2s; border:1px solid rgba(226,232,240,.1); background:rgba(226,232,240,.03); color:rgba(148,163,184,.6); font-family:'Space Grotesk',sans-serif; white-space:nowrap; }
        .pp-fbtn:hover { color:#e2e8f0; background:rgba(226,232,240,.07); }
        .pp-fbtn.on { background:rgba(96,165,250,.1); border-color:rgba(96,165,250,.25); color:#60a5fa; }

        /* Topics */
        .pp-topics { display:flex; gap:7px; margin-bottom:18px; flex-wrap:wrap; animation:pp-fadeUp .5s ease-out .16s both; }
        .pp-tc { padding:5px 13px; border-radius:16px; font-size:11.5px; font-weight:500; border:1px solid rgba(226,232,240,.07); background:rgba(226,232,240,.02); color:rgba(148,163,184,.55); cursor:pointer; transition:all .2s; }
        .pp-tc:hover { border-color:rgba(96,165,250,.2); background:rgba(96,165,250,.05); color:#60a5fa; }
        .pp-tc.on { border-color:rgba(96,165,250,.3); background:rgba(96,165,250,.1); color:#60a5fa; }

        /* Table */
        .pp-tbl { border:1px solid rgba(226,232,240,.07); border-radius:12px; overflow:hidden; animation:pp-fadeUp .5s ease-out .2s both; }
        .pp-thead { display:grid; grid-template-columns:52px 1fr 110px 110px 85px 100px; padding:10px 16px; background:rgba(226,232,240,.03); border-bottom:1px solid rgba(226,232,240,.07); font-size:10.5px; font-weight:700; color:rgba(148,163,184,.45); letter-spacing:.07em; text-transform:uppercase; font-family:'JetBrains Mono',monospace; }
        .pp-row { display:grid; grid-template-columns:52px 1fr 110px 110px 85px 100px; padding:13px 16px; border-bottom:1px solid rgba(226,232,240,.05); transition:all .2s; cursor:pointer; align-items:center; animation:pp-rowIn .4s ease-out both; }
        .pp-row:last-child { border-bottom:none; }
        .pp-row:hover { background:rgba(226,232,240,.03); }
        .pp-row.solved-row { border-left:2px solid rgba(34,197,94,.2); }
        .pp-row.solved-row:hover { background:rgba(34,197,94,.02); }

        .pp-num { font-size:12px; color:rgba(148,163,184,.35); font-family:'JetBrains Mono',monospace; }
        .pp-title-wrap { display:flex; align-items:center; gap:8px; min-width:0; }
        .pp-title-text { font-size:13.5px; font-weight:600; color:#e2e8f0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; transition:color .2s; }
        .pp-row:hover .pp-title-text { color:#60a5fa; }
        .pp-tag-badge { font-size:9.5px; padding:2px 7px; border-radius:8px; font-family:'JetBrains Mono',monospace; white-space:nowrap; flex-shrink:0; }
        .pp-tag-popular { background:rgba(96,165,250,.1); color:#60a5fa; border:1px solid rgba(96,165,250,.2); }
        .pp-tag-classic { background:rgba(167,139,250,.1); color:#a78bfa; border:1px solid rgba(167,139,250,.2); }
        .pp-tag-daily { background:rgba(249,115,22,.1); color:#fb923c; border:1px solid rgba(249,115,22,.2); }
        .pp-tag-hard { background:rgba(239,68,68,.1); color:#f87171; border:1px solid rgba(239,68,68,.2); }

        .pp-topic-text { font-size:11.5px; color:rgba(148,163,184,.45); font-family:'JetBrains Mono',monospace; }
        .pp-diff-e { color:#22c55e; font-size:11.5px; font-weight:700; padding:3px 10px; border-radius:10px; background:rgba(34,197,94,.07); border:1px solid rgba(34,197,94,.13); font-family:'JetBrains Mono',monospace; display:inline-block; }
        .pp-diff-m { color:#f59e0b; font-size:11.5px; font-weight:700; padding:3px 10px; border-radius:10px; background:rgba(245,158,11,.07); border:1px solid rgba(245,158,11,.13); font-family:'JetBrains Mono',monospace; display:inline-block; }
        .pp-diff-h { color:#ef4444; font-size:11.5px; font-weight:700; padding:3px 10px; border-radius:10px; background:rgba(239,68,68,.07); border:1px solid rgba(239,68,68,.13); font-family:'JetBrains Mono',monospace; display:inline-block; }
        .pp-acc-hi { color:#22c55e; font-size:12px; font-weight:700; font-family:'JetBrains Mono',monospace; }
        .pp-acc-mid { color:#f59e0b; font-size:12px; font-weight:700; font-family:'JetBrains Mono',monospace; }
        .pp-acc-lo { color:#ef4444; font-size:12px; font-weight:700; font-family:'JetBrains Mono',monospace; }
        .pp-st-solved { display:flex; align-items:center; gap:5px; color:#22c55e; font-size:12px; font-weight:600; font-family:'JetBrains Mono',monospace; }
        .pp-st-attempted { display:flex; align-items:center; gap:5px; color:#f59e0b; font-size:12px; font-weight:600; font-family:'JetBrains Mono',monospace; }
        .pp-st-none { color:rgba(148,163,184,.25); font-size:12px; font-family:'JetBrains Mono',monospace; }

        /* Empty */
        .pp-empty { padding:60px 20px; text-align:center; }
        .pp-empty-icon { font-size:36px; margin-bottom:12px; }
        .pp-empty-text { font-size:15px; font-weight:600; color:rgba(226,232,240,.6); margin-bottom:6px; }
        .pp-empty-sub { font-size:13px; color:rgba(148,163,184,.4); }

        /* Skeleton */
        .pp-skeleton { height:52px; border-radius:0; background:linear-gradient(90deg,rgba(226,232,240,.04) 25%,rgba(226,232,240,.08) 50%,rgba(226,232,240,.04) 75%); background-size:200% auto; animation:pp-skeleton 1.5s linear infinite; border-bottom:1px solid rgba(226,232,240,.05); }

        /* Pagination */
        .pp-pag { display:flex; align-items:center; justify-content:space-between; margin-top:18px; animation:pp-fadeUp .5s ease-out .4s both; flex-wrap:wrap; gap:10px; }
        .pp-pag-info { font-size:11.5px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
        .pp-pag-btns { display:flex; gap:5px; }
        .pp-pag-btn { min-width:34px; height:34px; border-radius:8px; display:flex; align-items:center; justify-content:center; font-size:13px; font-weight:600; cursor:pointer; transition:all .2s; border:1px solid rgba(226,232,240,.08); background:rgba(226,232,240,.02); color:rgba(148,163,184,.55); padding:0 10px; font-family:'Space Grotesk',sans-serif; }
        .pp-pag-btn:hover { background:rgba(226,232,240,.07); color:#e2e8f0; border-color:rgba(226,232,240,.15); }
        .pp-pag-btn.on { background:rgba(96,165,250,.12); border-color:rgba(96,165,250,.25); color:#60a5fa; }
        .pp-pag-btn.disabled { opacity:.3; cursor:not-allowed; pointer-events:none; }

        /* Error */
        .pp-error { padding:20px; text-align:center; color:#f87171; font-size:13px; font-family:'JetBrains Mono',monospace; background:rgba(248,113,113,.06); border-radius:8px; border:1px solid rgba(248,113,113,.15); margin-bottom:16px; }

        @media(max-width:768px) {
          .pp-thead { grid-template-columns:40px 1fr 80px 80px; }
          .pp-row { grid-template-columns:40px 1fr 80px 80px; }
          .pp-row > *:nth-child(3) { display:none; }
          .pp-row > *:nth-child(5) { display:none; }
          .pp-thead > *:nth-child(3) { display:none; }
          .pp-thead > *:nth-child(5) { display:none; }
        }
      `}</style>

            <div className="pp-page">
                <div className="pp-grid" />
                <div className="pp-glow" style={{ width:500, height:400, background:'rgba(96,165,250,.05)', top:-100, left:'20%' }} />
                <div className="pp-glow" style={{ width:350, height:350, background:'rgba(139,92,246,.04)', bottom:'5%', right:'5%', animationDelay:'2.5s' }} />

                <Navbar />
                <div style={{ height: 72 }} />

                <div className="pp-inner">

                    {/* ── TOP ROW ── */}
                    <div className="pp-top">
                        <div>
                            <div className="pp-tag-label">// Practice</div>
                            <div className="pp-h1">
                                Problems <span className="pp-h1-accent">
                  {sourceData.length > 0 ? `${sourceData.length}+` : '250+'}
                </span>
                            </div>
                            <div className="pp-sub">Solve DSA problems, track progress & improve every day.</div>
                        </div>
                        <div className="pp-solved-wrap">
                            <div className="pp-counts">
                <span className="pp-sc" style={{ background:'rgba(34,197,94,.07)', border:'1px solid rgba(34,197,94,.14)', color:'#22c55e' }}>
                  Easy {easyCount}
                </span>
                                <span className="pp-sc" style={{ background:'rgba(245,158,11,.07)', border:'1px solid rgba(245,158,11,.14)', color:'#f59e0b' }}>
                  Med {medCount}
                </span>
                                <span className="pp-sc" style={{ background:'rgba(239,68,68,.07)', border:'1px solid rgba(239,68,68,.14)', color:'#ef4444' }}>
                  Hard {hardCount}
                </span>
                            </div>
                            <div className="pp-solved-text">{solvedCount} / {sourceData.length} solved</div>
                            <div className="pp-bar-wrap">
                                <div className="pp-bar" style={{ width: `${sourceData.length > 0 ? (solvedCount / sourceData.length) * 100 : 0}%` }} />
                            </div>
                        </div>
                    </div>

                    {/* ── DAILY CHALLENGE ── */}
                    <div className="pp-daily" onClick={() => navigate('/problems/daily-challenge')}>
                        <div className="pp-daily-l">
                            <span className="pp-flame">🔥</span>
                            <div>
                                <div className="pp-daily-title">Daily Challenge — Day 7</div>
                                <div className="pp-daily-sub">
                                    Longest Palindromic Substring &nbsp;·&nbsp; Medium &nbsp;·&nbsp; +150 pts &nbsp;·&nbsp; ⏱ Ends in 8h 24m
                                </div>
                            </div>
                        </div>
                        <div className="pp-daily-r">
                            <span className="pp-streak-badge">🔥 7 day streak</span>
                            <button className="pp-daily-btn">Solve Now →</button>
                        </div>
                    </div>

                    {/* ── ERROR ── */}
                    {error && (
                        <div className="pp-error">⚠ {error} — showing mock data</div>
                    )}

                    {/* ── FILTERS ── */}
                    <div className="pp-filters">
                        <div className="pp-search">
                            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(148,163,184,.4)" strokeWidth="2.5">
                                <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                            </svg>
                            <input
                                placeholder="Search by title, topic..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1) }}
                            />
                            {search && (
                                <span
                                    style={{ cursor:'pointer', color:'rgba(148,163,184,.5)', fontSize:12, flexShrink:0 }}
                                    onClick={() => { setSearch(''); setPage(1) }}
                                >✕</span>
                            )}
                        </div>
                        <select
                            className="pp-sel"
                            value={difficulty}
                            onChange={e => { setDifficulty(e.target.value); setPage(1) }}
                        >
                            <option value="All">All Difficulty</option>
                            <option value="Easy">Easy</option>
                            <option value="Medium">Medium</option>
                            <option value="Hard">Hard</option>
                        </select>
                        <select
                            className="pp-sel"
                            value={topicFilter}
                            onChange={e => { setTopicFilter(e.target.value); setActiveTopic(e.target.value); setPage(1) }}
                        >
                            <option value="All">All Topics</option>
                            {TOPICS.slice(1).map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <select
                            className="pp-sel"
                            value={status}
                            onChange={e => { setStatus(e.target.value); setPage(1) }}
                        >
                            <option value="All">All Status</option>
                            <option value="Solved">Solved</option>
                            <option value="Attempted">Attempted</option>
                            <option value="Not Started">Not Started</option>
                        </select>
                        <button
                            className={`pp-fbtn ${!bookmarked ? 'on' : ''}`}
                            onClick={() => { setBookmarked(false); setPage(1) }}
                        >All</button>
                        <button
                            className={`pp-fbtn ${bookmarked ? 'on' : ''}`}
                            onClick={() => { setBookmarked(true); setPage(1) }}
                        >⭐ Bookmarked</button>
                    </div>

                    {/* ── TOPIC CHIPS ── */}
                    <div className="pp-topics">
                        {TOPICS.map(t => (
                            <div
                                key={t}
                                className={`pp-tc ${activeTopic === t ? 'on' : ''}`}
                                onClick={() => { setActiveTopic(t); setTopicFilter('All'); setPage(1) }}
                            >
                                {t}
                            </div>
                        ))}
                    </div>

                    {/* ── TABLE ── */}
                    <div className="pp-tbl">
                        <div className="pp-thead">
                            <div>#</div>
                            <div>Title</div>
                            <div>Topic</div>
                            <div>Difficulty</div>
                            <div>Accuracy</div>
                            <div>Status</div>
                        </div>

                        {loading ? (
                            Array(8).fill(0).map((_, i) => (
                                <div key={i} className="pp-skeleton" style={{ animationDelay:`${i * 0.1}s` }} />
                            ))
                        ) : paginated.length === 0 ? (
                            <div className="pp-empty">
                                <div className="pp-empty-icon">🔍</div>
                                <div className="pp-empty-text">No problems found</div>
                                <div className="pp-empty-sub">Try adjusting your search or filters</div>
                            </div>
                        ) : (
                            paginated.map((p, i) => (
                                <div
                                    key={p.id}
                                    className={`pp-row ${p.status === 'solved' ? 'solved-row' : ''}`}
                                    style={{ animationDelay:`${0.22 + i * 0.04}s` }}
                                    onClick={() => navigate(`/problems/${p.id}`)}
                                >
                                    <div className="pp-num">{p.id}</div>
                                    <div className="pp-title-wrap">
                                        <span className="pp-title-text">{p.title}</span>
                                        {p.tag && (
                                            <span className={`pp-tag-badge ${tagClass(p.tag)}`}>{p.tag}</span>
                                        )}
                                    </div>
                                    <div className="pp-topic-text">{p.topic}</div>
                                    <div><span className={diffClass(p.difficulty)}>{p.difficulty}</span></div>
                                    <div className={accClass(p.accuracy)}>{p.accuracy}%</div>
                                    <div>
                                        {p.status === 'solved' ? (
                                            <span className="pp-st-solved">✓ Solved</span>
                                        ) : p.status === 'attempted' ? (
                                            <span className="pp-st-attempted">~ Attempted</span>
                                        ) : (
                                            <span className="pp-st-none">— —</span>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* ── PAGINATION ── */}
                    {!loading && paginated.length > 0 && (
                        <div className="pp-pag">
                            <div className="pp-pag-info">
                                Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, displayProblems.length)} of {displayProblems.length} problems
                            </div>
                            <div className="pp-pag-btns">
                                <div
                                    className={`pp-pag-btn ${page === 1 ? 'disabled' : ''}`}
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                >‹ Prev</div>

                                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                                    const pageNum = totalPages <= 5
                                        ? i + 1
                                        : page <= 3
                                            ? i + 1
                                            : page >= totalPages - 2
                                                ? totalPages - 4 + i
                                                : page - 2 + i
                                    return (
                                        <div
                                            key={pageNum}
                                            className={`pp-pag-btn ${page === pageNum ? 'on' : ''}`}
                                            onClick={() => setPage(pageNum)}
                                        >{pageNum}</div>
                                    )
                                })}

                                {totalPages > 5 && (
                                    <>
                                        <div className="pp-pag-btn">···</div>
                                        <div
                                            className={`pp-pag-btn ${page === totalPages ? 'on' : ''}`}
                                            onClick={() => setPage(totalPages)}
                                        >{totalPages}</div>
                                    </>
                                )}

                                <div
                                    className={`pp-pag-btn ${page === totalPages ? 'disabled' : ''}`}
                                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                >Next ›</div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </>
    )
}

export default ProblemsPage