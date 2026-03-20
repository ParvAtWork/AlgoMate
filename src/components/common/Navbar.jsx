// src/components/common/Navbar.jsx

import { useState, useEffect, useRef } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Trophy, LayoutDashboard, User, LogOut,
    ChevronDown, FileText, Bell, Sun, Moon,
    Flame, X as XIcon, Search
} from 'lucide-react'
import { selectIsAuthenticated, selectUser, selectIsAdmin } from '../../store/slices/authSlice.js'
import { useAuth } from '../../hooks/useAuth.js'
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx'
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger
} from '../ui/dropdown-menu.jsx'
import AlgoMateLogo from './AlgoMateLogo.jsx'

const SEARCH_PROBLEMS = [
    { title: 'Two Sum',                       difficulty: 'Easy',   topic: 'Arrays'      },
    { title: 'Two Pointers Technique',        difficulty: 'Easy',   topic: 'Arrays'      },
    { title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'DP'          },
    { title: 'Binary Search',                 difficulty: 'Easy',   topic: 'Search'      },
    { title: 'Merge Sort',                    difficulty: 'Medium', topic: 'Sorting'     },
    { title: 'Graph BFS Traversal',           difficulty: 'Medium', topic: 'Graphs'      },
    { title: 'Longest Common Subsequence',    difficulty: 'Hard',   topic: 'DP'          },
    { title: 'Valid Parentheses',             difficulty: 'Easy',   topic: 'Stack'       },
    { title: 'Coin Change',                   difficulty: 'Medium', topic: 'DP'          },
    { title: 'Word Break Problem',            difficulty: 'Hard',   topic: 'DP'          },
    { title: 'Reverse Linked List',           difficulty: 'Easy',   topic: 'Linked List' },
    { title: 'Maximum Subarray',              difficulty: 'Medium', topic: 'Arrays'      },
]
const RECENT_SEARCHES = ['Two Sum', 'Binary Search', 'DP Problems']
const POPULAR_TOPICS  = ['Arrays', 'Dynamic Programming', 'Graphs', 'Sorting']

const Navbar = () => {
    const [scrolled,      setScrolled]      = useState(false)
    const [mobileOpen,    setMobileOpen]    = useState(false)
    const [searchOpen,    setSearchOpen]    = useState(false)
    const [searchQuery,   setSearchQuery]   = useState('')
    const [searchResults, setSearchResults] = useState([])
    const [isDark,        setIsDark]        = useState(true)
    const [notifOpen,     setNotifOpen]     = useState(false)
    const [streak]                          = useState(7)

    const location        = useLocation()
    const navigate        = useNavigate()
    const isAuthenticated = useSelector(selectIsAuthenticated)
    const user            = useSelector(selectUser)
    const isAdmin         = useSelector(selectIsAdmin)
    const { logout }      = useAuth()

    const searchRef       = useRef(null)
    const searchInputRef  = useRef(null)
    const mobileSearchRef = useRef(null)

    // ── scroll ──────────────────────────────────────────────────
    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20)
        window.addEventListener('scroll', onScroll)
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    // ── close on route change ────────────────────────────────────
    useEffect(() => {
        setMobileOpen(false)
        setSearchOpen(false)
        setSearchQuery('')
        setNotifOpen(false)
    }, [location])

    // ── keyboard shortcuts ───────────────────────────────────────
    useEffect(() => {
        const onKey = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault()
                setSearchOpen(true)
                setTimeout(() => searchInputRef.current?.focus(), 50)
            }
            if (e.key === 'Escape') {
                setSearchOpen(false)
                setSearchQuery('')
                setNotifOpen(false)
            }
        }
        window.addEventListener('keydown', onKey)
        return () => window.removeEventListener('keydown', onKey)
    }, [])

    // ── click outside search ─────────────────────────────────────
    useEffect(() => {
        const onClickOut = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setSearchOpen(false)
                setSearchQuery('')
            }
        }
        if (searchOpen) document.addEventListener('mousedown', onClickOut)
        return () => document.removeEventListener('mousedown', onClickOut)
    }, [searchOpen])

    // ── live search filter ───────────────────────────────────────
    useEffect(() => {
        if (!searchQuery.trim()) { setSearchResults([]); return }
        setSearchResults(
            SEARCH_PROBLEMS.filter(p =>
                p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                p.topic.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
    }, [searchQuery])

    // ── nav links ────────────────────────────────────────────────
    const navLinks = [
        { label: 'Problems',    href: '/problems',    icon: FileText       },
        { label: 'Leaderboard', href: '/leaderboard', icon: Trophy         },
        ...(isAuthenticated
            ? [{ label: 'Submissions', href: '/submissions', icon: LayoutDashboard }]
            : []),
    ]

    const isActive  = (href) => location.pathname === href || location.pathname.startsWith(href + '/')
    const diffColor = (d)    => d === 'Easy' ? '#22c55e' : d === 'Medium' ? '#f59e0b' : '#ef4444'

    const notifications = [
        { id:1, text:'New daily challenge available!',   time:'2m ago', unread:true,  icon:'🔥' },
        { id:2, text:'You solved "Two Sum" — +100 pts',  time:'1h ago', unread:true,  icon:'✅' },
        { id:3, text:'Weekly contest starts in 2 hours', time:'3h ago', unread:false, icon:'🏆' },
    ]
    const unreadCount = notifications.filter(n => n.unread).length

    return (
        <>
            <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

        @keyframes nbShimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
        @keyframes nbCursor    { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes nbUnderline { 0%,100%{transform:scaleX(.5);opacity:.35} 50%{transform:scaleX(1);opacity:1} }
        @keyframes nbFlame     { 0%,100%{filter:drop-shadow(0 0 4px rgba(249,115,22,.6))} 50%{filter:drop-shadow(0 0 8px rgba(249,115,22,.9))} }
        @keyframes nbNotifDot  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
        @keyframes nbDotBounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-3px);opacity:1} }
        @keyframes nbSlideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes nbBadge     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
        @keyframes nbGrid      { 0%,100%{opacity:.4} 50%{opacity:.8} }

        .nb-wrap::before {
          content:''; position:absolute; inset:0; pointer-events:none;
          background:
            repeating-linear-gradient(90deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px),
            repeating-linear-gradient(180deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px);
          animation:nbGrid 4s ease-in-out infinite;
        }
        .nb-wrap::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
          background:linear-gradient(90deg,transparent,rgba(226,232,240,.3),rgba(96,165,250,.4),transparent);
        }
        .nb-link {
          display:flex; align-items:center; gap:7px;
          padding:8px 18px; border-radius:9px; font-size:14.5px; font-weight:600;
          color:rgba(148,163,184,.7); text-decoration:none; transition:all .2s;
          border:1px solid transparent;
          font-family:'Space Grotesk',sans-serif; letter-spacing:-.01em; white-space:nowrap;
        }
        .nb-link:hover     { color:#e2e8f0; background:rgba(226,232,240,.06); }
        .nb-link.nb-active { color:#e2e8f0; background:rgba(226,232,240,.07); border-color:rgba(226,232,240,.16); }
        .nb-icon-btn {
          position:relative; display:flex; align-items:center; justify-content:center;
          width:38px; height:38px; border-radius:9px; background:transparent;
          border:1px solid rgba(226,232,240,.09); color:rgba(148,163,184,.7);
          cursor:pointer; transition:all .2s; flex-shrink:0;
        }
        .nb-icon-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.18); }
        .nb-streak {
          display:flex; align-items:center; gap:5px; padding:6px 13px; border-radius:20px;
          background:rgba(249,115,22,.09); border:1px solid rgba(249,115,22,.2);
          font-size:13px; font-weight:700; color:#fb923c;
          cursor:pointer; transition:all .2s; white-space:nowrap;
          font-family:'Space Grotesk',sans-serif;
        }
        .nb-streak:hover { background:rgba(249,115,22,.15); border-color:rgba(249,115,22,.3); transform:translateY(-1px); }
        .nb-flame   { animation:nbFlame 1.5s ease-in-out infinite; }
        .nb-shimmer {
          background:linear-gradient(90deg,#e2e8f0,#60a5fa,#e2e8f0); background-size:250% auto;
          -webkit-background-clip:text; -webkit-text-fill-color:transparent;
          background-clip:text; animation:nbShimmer 3s linear infinite;
        }
        .nb-cursor { color:#e2e8f0; -webkit-text-fill-color:#e2e8f0; font-weight:300; animation:nbCursor 1s ease-in-out infinite; }
        .nb-uline  { width:84px; height:1.5px; background:linear-gradient(90deg,#e2e8f0,#60a5fa); border-radius:2px; transform-origin:left; animation:nbUnderline 2s ease-in-out infinite; }
        .nb-beta   { font-size:8px; padding:1px 6px; border-radius:3px; background:rgba(226,232,240,.08); color:#94a3b8; border:1px solid rgba(226,232,240,.15); font-family:'JetBrains Mono',monospace; letter-spacing:.05em; animation:nbBadge 2s ease-in-out infinite; }
        .nb-notif-dot { position:absolute; top:6px; right:6px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:1.5px solid #06080e; animation:nbNotifDot 2s ease-in-out infinite; }
        .nb-dot { width:4px; height:4px; border-radius:50%; background:#60a5fa; }
        .nb-dot:nth-child(1) { animation:nbDotBounce .8s ease-in-out infinite 0s; }
        .nb-dot:nth-child(2) { animation:nbDotBounce .8s ease-in-out infinite .15s; }
        .nb-dot:nth-child(3) { animation:nbDotBounce .8s ease-in-out infinite .3s; }
        .nb-search-box {
          display:flex; align-items:center; gap:8px; padding:7px 14px; border-radius:9px;
          background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.12);
          cursor:pointer; transition:all .2s; width:190px;
        }
        .nb-search-box:hover { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
        .nb-search-ph  { font-size:12.5px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; flex:1; }
        .nb-kbd        { font-size:9px; padding:1px 5px; border-radius:4px; background:rgba(226,232,240,.06); border:1px solid rgba(226,232,240,.12); color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
        .nb-search-exp { position:absolute; top:0; right:0; width:340px; z-index:50; animation:nbSlideDown .15s ease-out both; }
        .nb-search-row {
          display:flex; align-items:center; gap:8px; padding:7px 12px;
          border-radius:9px 9px 0 0; background:rgba(6,8,14,.98);
          border:1px solid rgba(96,165,250,.3); box-shadow:0 0 0 3px rgba(96,165,250,.08);
        }
        .nb-search-inp { flex:1; background:none; border:none; outline:none; color:#e2e8f0; font-size:13.5px; font-family:'JetBrains Mono',monospace; }
        .nb-search-inp::placeholder { color:rgba(148,163,184,.35); }
        .nb-search-dd  { background:#0d1117; border:1px solid rgba(226,232,240,.08); border-top:none; border-radius:0 0 10px 10px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,.5); max-height:320px; overflow-y:auto; }
        .nb-search-item { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; cursor:pointer; transition:background .15s; border-bottom:1px solid rgba(226,232,240,.05); }
        .nb-search-item:last-child { border-bottom:none; }
        .nb-search-item:hover { background:rgba(226,232,240,.04); }
        .nb-search-sec { padding:8px 14px 4px; font-size:9px; color:rgba(148,163,184,.3); font-family:'JetBrains Mono',monospace; letter-spacing:.1em; }
        .nb-topic-chip { font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(96,165,250,.08); color:#60a5fa; border:1px solid rgba(96,165,250,.15); font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all .2s; }
        .nb-topic-chip:hover { background:rgba(96,165,250,.15); }
        .nb-search-empty { padding:16px; text-align:center; font-size:12px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
        .nb-ghost-btn {
          padding:7px 16px; border-radius:8px; font-size:13.5px; font-weight:500;
          color:rgba(148,163,184,.7); background:transparent;
          border:1px solid rgba(226,232,240,.12); cursor:pointer;
          font-family:'Space Grotesk',sans-serif; transition:all .2s;
        }
        .nb-ghost-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.05); border-color:rgba(226,232,240,.2); }
        .nb-primary-btn {
          padding:7px 18px; border-radius:8px; font-size:13.5px; font-weight:700;
          color:#0f172a; background:linear-gradient(135deg,#e2e8f0,#60a5fa);
          border:none; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s;
        }
        .nb-primary-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(96,165,250,.25); }
        .nb-notif-dd {
          position:absolute; top:calc(100% + 10px); right:0; width:310px;
          background:#0d1117; border:1px solid rgba(226,232,240,.1);
          border-radius:12px; overflow:hidden; z-index:100; box-shadow:0 8px 30px rgba(0,0,0,.6);
        }
        .nb-notif-item { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; cursor:pointer; transition:background .15s; border-bottom:1px solid rgba(226,232,240,.05); }
        .nb-notif-item:last-child { border-bottom:none; }
        .nb-notif-item:hover { background:rgba(226,232,240,.04); }
        .nb-notif-item.nb-unread { background:rgba(96,165,250,.03); }
        .nb-ham {
          display:flex; flex-direction:column; justify-content:center; align-items:center; gap:5px;
          width:40px; height:40px; border-radius:9px; background:rgba(226,232,240,.04);
          border:1px solid rgba(226,232,240,.1); cursor:pointer; transition:all .25s; flex-shrink:0; padding:0;
        }
        .nb-ham:hover   { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
        .nb-ham.nb-open { background:rgba(96,165,250,.08); border-color:rgba(96,165,250,.25); }
        .nb-ham-line    { width:16px; height:1.5px; background:rgba(226,232,240,.7); border-radius:2px; transition:all .3s; display:block; }
        .nb-ham.nb-open .nb-ham-line:nth-child(1) { transform:rotate(45deg) translate(4.5px,4.5px); background:#60a5fa; }
        .nb-ham.nb-open .nb-ham-line:nth-child(2) { opacity:0; transform:translateX(-6px); }
        .nb-ham.nb-open .nb-ham-line:nth-child(3) { transform:rotate(-45deg) translate(4.5px,-4.5px); background:#60a5fa; }
        .nb-mob { background:rgba(6,8,14,.98); border-top:1px solid rgba(226,232,240,.06); padding:16px 20px 22px; display:flex; flex-direction:column; gap:5px; }
        .nb-mob-search { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:9px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); margin-bottom:10px; }
        .nb-mob-inp { flex:1; background:none; border:none; outline:none; color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; }
        .nb-mob-inp::placeholder { color:rgba(148,163,184,.35); }
        .nb-mob-link { display:flex; align-items:center; gap:9px; padding:11px 14px; border-radius:9px; font-size:14px; font-weight:600; color:rgba(148,163,184,.7); text-decoration:none; transition:all .2s; border:1px solid transparent; font-family:'Space Grotesk',sans-serif; }
        .nb-mob-link:hover     { color:#e2e8f0; background:rgba(226,232,240,.05); }
        .nb-mob-link.nb-active { color:#e2e8f0; background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.12); }
        .nb-mob-div    { height:1px; background:rgba(226,232,240,.06); margin:8px 0; }
        .nb-mob-streak { display:flex; align-items:center; gap:8px; padding:11px 14px; border-radius:9px; background:rgba(249,115,22,.06); border:1px solid rgba(249,115,22,.12); cursor:pointer; transition:all .2s; }
        .nb-mob-streak:hover { background:rgba(249,115,22,.1); }
      `}</style>

            <motion.nav
                className="nb-wrap"
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0,    opacity: 1 }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                style={{
                    position:       'fixed', top:0, left:0, right:0, zIndex:50,
                    background:     scrolled ? 'rgba(6,8,14,.97)' : 'rgba(6,8,14,.85)',
                    backdropFilter: 'blur(24px)',
                    borderBottom:   scrolled ? '1px solid rgba(226,232,240,.07)' : 'none',
                    boxShadow:      scrolled ? '0 4px 40px rgba(0,0,0,.5)'       : 'none',
                    transition:     'all .3s',
                }}
            >
                <div style={{ maxWidth:1380, margin:'0 auto', padding:'0 24px' }}>
                    <div style={{ display:'flex', alignItems:'center', height:72, gap:0 }}>

                        {/* ── HAMBURGER ── */}
                        <button
                            className={`nb-ham ${mobileOpen ? 'nb-open' : ''}`}
                            onClick={() => setMobileOpen(!mobileOpen)}
                            style={{ marginRight:14 }}
                            aria-label="Toggle menu"
                        >
                            <span className="nb-ham-line" />
                            <span className="nb-ham-line" />
                            <span className="nb-ham-line" />
                        </button>

                        {/* ── LOGO ── */}
                        <Link
                            to="/"
                            style={{ display:'flex', alignItems:'center', gap:14, textDecoration:'none', flexShrink:0, marginRight:28 }}
                        >
                            <AlgoMateLogo size={46} />
                            <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                                <div style={{ fontSize:21, fontWeight:800, letterSpacing:'-.03em', lineHeight:1 }}>
                                    <span className="nb-shimmer">AlgoMate</span>
                                    <span className="nb-cursor">_</span>
                                </div>
                                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                                    <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.38)', letterSpacing:'.12em' }}>
                                        v1.0 · DSA Platform
                                    </span>
                                    <span className="nb-beta">BETA</span>
                                </div>
                                <div className="nb-uline" />
                            </div>
                        </Link>

                        {/* ── DESKTOP NAV LINKS ── */}
                        <div style={{ display:'flex', alignItems:'center', gap:3 }}>
                            {navLinks.map(({ label, href, icon: Icon }) => (
                                <Link
                                    key={href}
                                    to={href}
                                    className={`nb-link ${isActive(href) ? 'nb-active' : ''}`}
                                >
                                    <Icon size={15} style={{ opacity: isActive(href) ? 1 : .5 }} />
                                    {label}
                                </Link>
                            ))}
                        </div>

                        <div style={{ flex:1 }} />

                        {/* ── RIGHT SIDE ── */}
                        <div style={{ display:'flex', alignItems:'center', gap:9 }}>

                            {/* ── AUTHENTICATED ONLY ── */}
                            {isAuthenticated && (
                                <>
                                    {/* Streak */}
                                    <div
                                        className="nb-streak"
                                        onClick={() => navigate('/problems/daily-challenge')}
                                        title="Today's daily challenge"
                                    >
                                        <Flame size={15} className="nb-flame" />
                                        <span>{streak} day streak</span>
                                    </div>

                                    <div style={{ width:1, height:22, background:'rgba(226,232,240,.08)' }} />

                                    {/* Search */}
                                    <div style={{ position:'relative' }} ref={searchRef}>
                                        {!searchOpen ? (
                                            <div
                                                className="nb-search-box"
                                                onClick={() => {
                                                    setSearchOpen(true)
                                                    setTimeout(() => searchInputRef.current?.focus(), 50)
                                                }}
                                            >
                                                <Search size={13} style={{ color:'rgba(148,163,184,.5)', flexShrink:0 }} />
                                                <span className="nb-search-ph">Search problems...</span>
                                                <span className="nb-kbd">Ctrl K</span>
                                            </div>
                                        ) : (
                                            <div className="nb-search-exp">
                                                <div className="nb-search-row">
                                                    <Search size={14} style={{ color:'#60a5fa', flexShrink:0 }} />
                                                    <input
                                                        ref={searchInputRef}
                                                        className="nb-search-inp"
                                                        placeholder="Search problems, topics..."
                                                        value={searchQuery}
                                                        onChange={e => setSearchQuery(e.target.value)}
                                                        onKeyDown={e => {
                                                            if (e.key === 'Enter' && searchQuery) {
                                                                navigate(`/problems?search=${searchQuery}`)
                                                                setSearchOpen(false)
                                                                setSearchQuery('')
                                                            }
                                                        }}
                                                    />
                                                    {searchQuery && (
                                                        <div style={{ display:'flex', gap:3 }}>
                                                            <div className="nb-dot" />
                                                            <div className="nb-dot" />
                                                            <div className="nb-dot" />
                                                        </div>
                                                    )}
                                                    <span
                                                        style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", cursor:'pointer' }}
                                                        onClick={() => { setSearchOpen(false); setSearchQuery('') }}
                                                    >Esc</span>
                                                </div>
                                                <div className="nb-search-dd">
                                                    {!searchQuery.trim() ? (
                                                        <>
                                                            <div className="nb-search-sec">RECENT SEARCHES</div>
                                                            {RECENT_SEARCHES.map((t, i) => (
                                                                <div key={i} className="nb-search-item" onClick={() => setSearchQuery(t)}>
                                                                    <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                                        <Search size={12} style={{ color:'rgba(148,163,184,.3)' }} />
                                                                        <span style={{ fontSize:13, color:'rgba(226,232,240,.6)' }}>{t}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                            <div className="nb-search-sec" style={{ borderTop:'1px solid rgba(226,232,240,.05)', marginTop:4 }}>
                                                                POPULAR TOPICS
                                                            </div>
                                                            <div style={{ padding:'8px 14px', display:'flex', flexWrap:'wrap', gap:6 }}>
                                                                {POPULAR_TOPICS.map((t, i) => (
                                                                    <span key={i} className="nb-topic-chip" onClick={() => setSearchQuery(t)}>#{t}</span>
                                                                ))}
                                                            </div>
                                                        </>
                                                    ) : searchResults.length > 0 ? (
                                                        searchResults.map((p, i) => (
                                                            <div
                                                                key={i}
                                                                className="nb-search-item"
                                                                onClick={() => {
                                                                    navigate('/problems')
                                                                    setSearchOpen(false)
                                                                    setSearchQuery('')
                                                                }}
                                                            >
                                                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                                    <FileText size={13} style={{ color:'rgba(148,163,184,.4)' }} />
                                                                    <span style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{p.title}</span>
                                                                </div>
                                                                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                                    <span style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>{p.topic}</span>
                                                                    <span style={{ fontSize:10, fontWeight:700, color:diffColor(p.difficulty), fontFamily:"'JetBrains Mono',monospace" }}>
                                                                        {p.difficulty}
                                                                    </span>
                                                                </div>
                                                            </div>
                                                        ))
                                                    ) : (
                                                        <div className="nb-search-empty">No results for "{searchQuery}"</div>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Theme Toggle */}
                                    <button className="nb-icon-btn" onClick={() => setIsDark(!isDark)} title="Toggle theme">
                                        <AnimatePresence mode="wait">
                                            {isDark ? (
                                                <motion.div key="moon" initial={{ rotate:-30, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:30, opacity:0 }} transition={{ duration:.18 }}>
                                                    <Moon size={16} />
                                                </motion.div>
                                            ) : (
                                                <motion.div key="sun" initial={{ rotate:30, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-30, opacity:0 }} transition={{ duration:.18 }}>
                                                    <Sun size={16} style={{ color:'#fbbf24' }} />
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </button>

                                    {/* Notifications */}
                                    <div style={{ position:'relative' }}>
                                        <button
                                            className="nb-icon-btn"
                                            onClick={() => setNotifOpen(!notifOpen)}
                                            title="Notifications"
                                        >
                                            <Bell size={16} />
                                            {unreadCount > 0 && <span className="nb-notif-dot" />}
                                        </button>
                                        <AnimatePresence>
                                            {notifOpen && (
                                                <motion.div
                                                    initial={{ opacity:0, y:-8, scale:.97 }}
                                                    animate={{ opacity:1, y:0,  scale:1   }}
                                                    exit={{   opacity:0, y:-8, scale:.97 }}
                                                    transition={{ duration:.15 }}
                                                    className="nb-notif-dd"
                                                >
                                                    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 15px 11px', borderBottom:'1px solid rgba(226,232,240,.07)' }}>
                                                        <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>Notifications</span>
                                                        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                                                            {unreadCount > 0 && (
                                                                <span style={{ fontSize:10, padding:'1px 7px', borderRadius:10, background:'rgba(96,165,250,.12)', color:'#60a5fa', border:'1px solid rgba(96,165,250,.2)', fontFamily:"'JetBrains Mono',monospace" }}>
                                                                    {unreadCount} new
                                                                </span>
                                                            )}
                                                            <button onClick={() => setNotifOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.5)', padding:0, display:'flex' }}>
                                                                <XIcon size={14} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                    {notifications.map(n => (
                                                        <div key={n.id} className={`nb-notif-item ${n.unread ? 'nb-unread' : ''}`}>
                                                            <span style={{ fontSize:17, lineHeight:1, marginTop:1 }}>{n.icon}</span>
                                                            <div style={{ flex:1 }}>
                                                                <p style={{ fontSize:12.5, color:n.unread ? '#e2e8f0' : 'rgba(148,163,184,.65)', margin:0, lineHeight:1.45 }}>{n.text}</p>
                                                                <p style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.35)', margin:'3px 0 0' }}>{n.time}</p>
                                                            </div>
                                                            {n.unread && <div style={{ width:6, height:6, borderRadius:'50%', background:'#60a5fa', flexShrink:0, marginTop:5 }} />}
                                                        </div>
                                                    ))}
                                                    <div style={{ padding:'10px 15px', borderTop:'1px solid rgba(226,232,240,.07)', textAlign:'center' }}>
                                                        <span style={{ fontSize:11, color:'#60a5fa', cursor:'pointer', fontFamily:"'JetBrains Mono',monospace" }}>
                                                            View all notifications →
                                                        </span>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    <div style={{ width:1, height:22, background:'rgba(226,232,240,.08)' }} />
                                </>
                            )}

                            {/* ── AUTH SECTION ── */}
                            {isAuthenticated ? (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button style={{
                                            display:'flex', alignItems:'center', gap:9,
                                            padding:'6px 12px', borderRadius:10,
                                            background:'rgba(226,232,240,.04)',
                                            border:'1px solid rgba(226,232,240,.09)',
                                            cursor:'pointer', transition:'all .2s',
                                        }}>
                                            <Avatar style={{ width:30, height:30, border:'1px solid rgba(226,232,240,.12)' }}>
                                                <AvatarImage src={user?.avatarUrl} />
                                                <AvatarFallback style={{ background:'rgba(226,232,240,.08)', color:'#e2e8f0', fontSize:12, fontWeight:700 }}>
                                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div style={{ textAlign:'left' }}>
                                                <p style={{ color:'#e2e8f0', fontSize:13, fontWeight:600, margin:0, lineHeight:1 }}>{user?.username}</p>
                                                <p style={{ color:'rgba(148,163,184,.5)', fontSize:10, margin:'2px 0 0', fontFamily:"'JetBrains Mono',monospace" }}>
                                                    ⭐ {user?.rating || 0} pts
                                                </p>
                                            </div>
                                            <ChevronDown size={12} style={{ color:'rgba(148,163,184,.45)' }} />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" style={{ width:190, background:'#0d1117', border:'1px solid rgba(226,232,240,.09)', color:'#e2e8f0', borderRadius:10 }}>
                                        <DropdownMenuItem onClick={() => navigate('/profile')} style={{ cursor:'pointer', gap:8, color:'rgba(203,213,225,.8)', fontSize:13 }}>
                                            <User size={13} /> Profile
                                        </DropdownMenuItem>
                                        {isAdmin && (
                                            <DropdownMenuItem onClick={() => navigate('/admin')} style={{ cursor:'pointer', gap:8, color:'rgba(203,213,225,.8)', fontSize:13 }}>
                                                <LayoutDashboard size={13} /> Admin Panel
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator style={{ background:'rgba(226,232,240,.07)' }} />
                                        <DropdownMenuItem onClick={logout} style={{ cursor:'pointer', gap:8, color:'#f87171', fontSize:13 }}>
                                            <LogOut size={13} /> Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            ) : (
                                <div style={{ display:'flex', alignItems:'center', gap:9 }}>
                                    <button className="nb-ghost-btn"   onClick={() => navigate('/login')}>Login</button>
                                    <button className="nb-primary-btn" onClick={() => navigate('/signup')}>Sign Up →</button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── MOBILE MENU ── */}
                <AnimatePresence>
                    {mobileOpen && (
                        <motion.div
                            initial={{ opacity:0, height:0 }}
                            animate={{ opacity:1, height:'auto' }}
                            exit={{   opacity:0, height:0 }}
                            transition={{ duration:.2 }}
                            className="nb-mob"
                        >
                            {isAuthenticated && (
                                <div className="nb-mob-search">
                                    <Search size={14} style={{ color:'rgba(148,163,184,.5)', flexShrink:0 }} />
                                    <input
                                        ref={mobileSearchRef}
                                        className="nb-mob-inp"
                                        placeholder="Search problems..."
                                        onKeyDown={e => {
                                            if (e.key === 'Enter' && e.target.value) {
                                                navigate(`/problems?search=${e.target.value}`)
                                                setMobileOpen(false)
                                            }
                                        }}
                                    />
                                </div>
                            )}

                            {navLinks.map(({ label, href, icon: Icon }) => (
                                <Link
                                    key={href}
                                    to={href}
                                    className={`nb-mob-link ${isActive(href) ? 'nb-active' : ''}`}
                                >
                                    <Icon size={15} style={{ opacity: isActive(href) ? 1 : .5 }} />
                                    {label}
                                </Link>
                            ))}

                            {isAuthenticated && (
                                <div
                                    className="nb-mob-streak"
                                    onClick={() => { navigate('/problems/daily-challenge'); setMobileOpen(false) }}
                                >
                                    <Flame size={15} style={{ color:'#fb923c' }} />
                                    <span style={{ fontSize:13, fontWeight:600, color:'#fb923c' }}>
                                        {streak} day streak — Solve today's challenge →
                                    </span>
                                </div>
                            )}

                            <div className="nb-mob-div" />

                            {isAuthenticated ? (
                                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    <button
                                        onClick={() => { navigate('/profile'); setMobileOpen(false) }}
                                        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', color:'#e2e8f0', background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', borderRadius:9, cursor:'pointer', fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}
                                    >
                                        <User size={13} /> Profile
                                    </button>
                                    <button
                                        onClick={logout}
                                        style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', color:'#f87171', background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.15)', borderRadius:9, cursor:'pointer', fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}
                                    >
                                        <LogOut size={13} /> Logout
                                    </button>
                                </div>
                            ) : (
                                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                                    <button
                                        className="nb-ghost-btn"
                                        style={{ width:'100%', textAlign:'center', padding:'11px' }}
                                        onClick={() => { navigate('/login'); setMobileOpen(false) }}
                                    >Login</button>
                                    <button
                                        className="nb-primary-btn"
                                        style={{ width:'100%', textAlign:'center', padding:'11px' }}
                                        onClick={() => { navigate('/signup'); setMobileOpen(false) }}
                                    >Sign Up →</button>
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.nav>
        </>
    )
}

export default Navbar

// // src/components/common/Navbar.jsx
//
// import { useState, useEffect, useRef } from 'react'
// import { Link, useLocation, useNavigate } from 'react-router-dom'
// import { useSelector } from 'react-redux'
// import { motion, AnimatePresence } from 'framer-motion'
// import {
//     Trophy, LayoutDashboard, User, LogOut,
//     ChevronDown, FileText, Bell, Sun, Moon,
//     Flame, X as XIcon, Search
// } from 'lucide-react'
// import { selectIsAuthenticated, selectUser, selectIsAdmin } from '../../store/slices/authSlice.js'
// import { useAuth } from '../../hooks/useAuth.js'
// import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx'
// import {
//     DropdownMenu, DropdownMenuContent, DropdownMenuItem,
//     DropdownMenuSeparator, DropdownMenuTrigger
// } from '../ui/dropdown-menu.jsx'
// import AlgoMateLogo from './AlgoMateLogo.jsx'
//
// const SEARCH_PROBLEMS = [
//     { title: 'Two Sum',                       difficulty: 'Easy',   topic: 'Arrays'      },
//     { title: 'Two Pointers Technique',        difficulty: 'Easy',   topic: 'Arrays'      },
//     { title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'DP'          },
//     { title: 'Binary Search',                 difficulty: 'Easy',   topic: 'Search'      },
//     { title: 'Merge Sort',                    difficulty: 'Medium', topic: 'Sorting'     },
//     { title: 'Graph BFS Traversal',           difficulty: 'Medium', topic: 'Graphs'      },
//     { title: 'Longest Common Subsequence',    difficulty: 'Hard',   topic: 'DP'          },
//     { title: 'Valid Parentheses',             difficulty: 'Easy',   topic: 'Stack'       },
//     { title: 'Coin Change',                   difficulty: 'Medium', topic: 'DP'          },
//     { title: 'Word Break Problem',            difficulty: 'Hard',   topic: 'DP'          },
//     { title: 'Reverse Linked List',           difficulty: 'Easy',   topic: 'Linked List' },
//     { title: 'Maximum Subarray',              difficulty: 'Medium', topic: 'Arrays'      },
// ]
// const RECENT_SEARCHES = ['Two Sum', 'Binary Search', 'DP Problems']
// const POPULAR_TOPICS  = ['Arrays', 'Dynamic Programming', 'Graphs', 'Sorting']
//
// const Navbar = () => {
//     const [scrolled,      setScrolled]      = useState(false)
//     const [mobileOpen,    setMobileOpen]    = useState(false)
//     const [searchOpen,    setSearchOpen]    = useState(false)
//     const [searchQuery,   setSearchQuery]   = useState('')
//     const [searchResults, setSearchResults] = useState([])
//     const [isDark,        setIsDark]        = useState(true)
//     const [notifOpen,     setNotifOpen]     = useState(false)
//     const [streak]                          = useState(7)
//
//     const location        = useLocation()
//     const navigate        = useNavigate()
//     const isAuthenticated = useSelector(selectIsAuthenticated)
//     const user            = useSelector(selectUser)
//     const isAdmin         = useSelector(selectIsAdmin)
//     const { logout }      = useAuth()
//
//     const searchRef       = useRef(null)
//     const searchInputRef  = useRef(null)
//     const mobileSearchRef = useRef(null)
//
//     // ── scroll ──────────────────────────────────────────────────
//     useEffect(() => {
//         const onScroll = () => setScrolled(window.scrollY > 20)
//         window.addEventListener('scroll', onScroll)
//         return () => window.removeEventListener('scroll', onScroll)
//     }, [])
//
//     // ── close on route change ────────────────────────────────────
//     useEffect(() => {
//         setMobileOpen(false)
//         setSearchOpen(false)
//         setSearchQuery('')
//         setNotifOpen(false)
//     }, [location])
//
//     // ── keyboard shortcuts ───────────────────────────────────────
//     useEffect(() => {
//         const onKey = (e) => {
//             if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
//                 e.preventDefault()
//                 setSearchOpen(true)
//                 setTimeout(() => searchInputRef.current?.focus(), 50)
//             }
//             if (e.key === 'Escape') {
//                 setSearchOpen(false)
//                 setSearchQuery('')
//                 setNotifOpen(false)
//             }
//         }
//         window.addEventListener('keydown', onKey)
//         return () => window.removeEventListener('keydown', onKey)
//     }, [])
//
//     // ── click outside search ─────────────────────────────────────
//     useEffect(() => {
//         const onClickOut = (e) => {
//             if (searchRef.current && !searchRef.current.contains(e.target)) {
//                 setSearchOpen(false)
//                 setSearchQuery('')
//             }
//         }
//         if (searchOpen) document.addEventListener('mousedown', onClickOut)
//         return () => document.removeEventListener('mousedown', onClickOut)
//     }, [searchOpen])
//
//     // ── live search filter ───────────────────────────────────────
//     useEffect(() => {
//         if (!searchQuery.trim()) { setSearchResults([]); return }
//         setSearchResults(
//             SEARCH_PROBLEMS.filter(p =>
//                 p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
//                 p.topic.toLowerCase().includes(searchQuery.toLowerCase())
//             )
//         )
//     }, [searchQuery])
//
//     // ── nav links ────────────────────────────────────────────────
//     const navLinks = [
//         { label: 'Problems',    href: '/problems',    icon: FileText       },
//         { label: 'Leaderboard', href: '/leaderboard', icon: Trophy         },
//         ...(isAuthenticated
//             ? [{ label: 'Submissions', href: '/submissions', icon: LayoutDashboard }]
//             : []),
//     ]
//
//     const isActive  = (href) => location.pathname === href || location.pathname.startsWith(href + '/')
//     const diffColor = (d)    => d === 'Easy' ? '#22c55e' : d === 'Medium' ? '#f59e0b' : '#ef4444'
//
//     const notifications = [
//         { id:1, text:'New daily challenge available!',   time:'2m ago', unread:true,  icon:'🔥' },
//         { id:2, text:'You solved "Two Sum" — +100 pts',  time:'1h ago', unread:true,  icon:'✅' },
//         { id:3, text:'Weekly contest starts in 2 hours', time:'3h ago', unread:false, icon:'🏆' },
//     ]
//     const unreadCount = notifications.filter(n => n.unread).length
//
//     return (
//         <>
//             <style>{`
//         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
//
//         @keyframes nbShimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
//         @keyframes nbCursor    { 0%,100%{opacity:1} 50%{opacity:0} }
//         @keyframes nbUnderline { 0%,100%{transform:scaleX(.5);opacity:.35} 50%{transform:scaleX(1);opacity:1} }
//         @keyframes nbFlame     { 0%,100%{filter:drop-shadow(0 0 4px rgba(249,115,22,.6))} 50%{filter:drop-shadow(0 0 8px rgba(249,115,22,.9))} }
//         @keyframes nbNotifDot  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
//         @keyframes nbDotBounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-3px);opacity:1} }
//         @keyframes nbSlideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
//         @keyframes nbBadge     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
//         @keyframes nbGrid      { 0%,100%{opacity:.4} 50%{opacity:.8} }
//
//         .nb-wrap::before {
//           content:''; position:absolute; inset:0; pointer-events:none;
//           background:
//             repeating-linear-gradient(90deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px),
//             repeating-linear-gradient(180deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px);
//           animation:nbGrid 4s ease-in-out infinite;
//         }
//         .nb-wrap::after {
//           content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
//           background:linear-gradient(90deg,transparent,rgba(226,232,240,.3),rgba(96,165,250,.4),transparent);
//         }
//         .nb-link {
//           display:flex; align-items:center; gap:7px;
//           padding:8px 18px; border-radius:9px; font-size:14.5px; font-weight:600;
//           color:rgba(148,163,184,.7); text-decoration:none; transition:all .2s;
//           border:1px solid transparent;
//           font-family:'Space Grotesk',sans-serif; letter-spacing:-.01em; white-space:nowrap;
//         }
//         .nb-link:hover     { color:#e2e8f0; background:rgba(226,232,240,.06); }
//         .nb-link.nb-active { color:#e2e8f0; background:rgba(226,232,240,.07); border-color:rgba(226,232,240,.16); }
//         .nb-icon-btn {
//           position:relative; display:flex; align-items:center; justify-content:center;
//           width:38px; height:38px; border-radius:9px; background:transparent;
//           border:1px solid rgba(226,232,240,.09); color:rgba(148,163,184,.7);
//           cursor:pointer; transition:all .2s; flex-shrink:0;
//         }
//         .nb-icon-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.18); }
//         .nb-streak {
//           display:flex; align-items:center; gap:5px; padding:6px 13px; border-radius:20px;
//           background:rgba(249,115,22,.09); border:1px solid rgba(249,115,22,.2);
//           font-size:13px; font-weight:700; color:#fb923c;
//           cursor:pointer; transition:all .2s; white-space:nowrap;
//           font-family:'Space Grotesk',sans-serif;
//         }
//         .nb-streak:hover { background:rgba(249,115,22,.15); border-color:rgba(249,115,22,.3); transform:translateY(-1px); }
//         .nb-flame   { animation:nbFlame 1.5s ease-in-out infinite; }
//         .nb-shimmer {
//           background:linear-gradient(90deg,#e2e8f0,#60a5fa,#e2e8f0); background-size:250% auto;
//           -webkit-background-clip:text; -webkit-text-fill-color:transparent;
//           background-clip:text; animation:nbShimmer 3s linear infinite;
//         }
//         .nb-cursor { color:#e2e8f0; -webkit-text-fill-color:#e2e8f0; font-weight:300; animation:nbCursor 1s ease-in-out infinite; }
//         .nb-uline  { width:84px; height:1.5px; background:linear-gradient(90deg,#e2e8f0,#60a5fa); border-radius:2px; transform-origin:left; animation:nbUnderline 2s ease-in-out infinite; }
//         .nb-beta   { font-size:8px; padding:1px 6px; border-radius:3px; background:rgba(226,232,240,.08); color:#94a3b8; border:1px solid rgba(226,232,240,.15); font-family:'JetBrains Mono',monospace; letter-spacing:.05em; animation:nbBadge 2s ease-in-out infinite; }
//         .nb-notif-dot { position:absolute; top:6px; right:6px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:1.5px solid #06080e; animation:nbNotifDot 2s ease-in-out infinite; }
//         .nb-dot { width:4px; height:4px; border-radius:50%; background:#60a5fa; }
//         .nb-dot:nth-child(1) { animation:nbDotBounce .8s ease-in-out infinite 0s; }
//         .nb-dot:nth-child(2) { animation:nbDotBounce .8s ease-in-out infinite .15s; }
//         .nb-dot:nth-child(3) { animation:nbDotBounce .8s ease-in-out infinite .3s; }
//         .nb-search-box {
//           display:flex; align-items:center; gap:8px; padding:7px 14px; border-radius:9px;
//           background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.12);
//           cursor:pointer; transition:all .2s; width:190px;
//         }
//         .nb-search-box:hover { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
//         .nb-search-ph  { font-size:12.5px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; flex:1; }
//         .nb-kbd        { font-size:9px; padding:1px 5px; border-radius:4px; background:rgba(226,232,240,.06); border:1px solid rgba(226,232,240,.12); color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
//         .nb-search-exp { position:absolute; top:0; right:0; width:340px; z-index:50; animation:nbSlideDown .15s ease-out both; }
//         .nb-search-row {
//           display:flex; align-items:center; gap:8px; padding:7px 12px;
//           border-radius:9px 9px 0 0; background:rgba(6,8,14,.98);
//           border:1px solid rgba(96,165,250,.3); box-shadow:0 0 0 3px rgba(96,165,250,.08);
//         }
//         .nb-search-inp { flex:1; background:none; border:none; outline:none; color:#e2e8f0; font-size:13.5px; font-family:'JetBrains Mono',monospace; }
//         .nb-search-inp::placeholder { color:rgba(148,163,184,.35); }
//         .nb-search-dd  { background:#0d1117; border:1px solid rgba(226,232,240,.08); border-top:none; border-radius:0 0 10px 10px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,.5); max-height:320px; overflow-y:auto; }
//         .nb-search-item { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; cursor:pointer; transition:background .15s; border-bottom:1px solid rgba(226,232,240,.05); }
//         .nb-search-item:last-child { border-bottom:none; }
//         .nb-search-item:hover { background:rgba(226,232,240,.04); }
//         .nb-search-sec { padding:8px 14px 4px; font-size:9px; color:rgba(148,163,184,.3); font-family:'JetBrains Mono',monospace; letter-spacing:.1em; }
//         .nb-topic-chip { font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(96,165,250,.08); color:#60a5fa; border:1px solid rgba(96,165,250,.15); font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all .2s; }
//         .nb-topic-chip:hover { background:rgba(96,165,250,.15); }
//         .nb-search-empty { padding:16px; text-align:center; font-size:12px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
//         .nb-ghost-btn {
//           padding:7px 16px; border-radius:8px; font-size:13.5px; font-weight:500;
//           color:rgba(148,163,184,.7); background:transparent;
//           border:1px solid rgba(226,232,240,.12); cursor:pointer;
//           font-family:'Space Grotesk',sans-serif; transition:all .2s;
//         }
//         .nb-ghost-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.05); border-color:rgba(226,232,240,.2); }
//         .nb-primary-btn {
//           padding:7px 18px; border-radius:8px; font-size:13.5px; font-weight:700;
//           color:#0f172a; background:linear-gradient(135deg,#e2e8f0,#60a5fa);
//           border:none; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s;
//         }
//         .nb-primary-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(96,165,250,.25); }
//         .nb-notif-dd {
//           position:absolute; top:calc(100% + 10px); right:0; width:310px;
//           background:#0d1117; border:1px solid rgba(226,232,240,.1);
//           border-radius:12px; overflow:hidden; z-index:100; box-shadow:0 8px 30px rgba(0,0,0,.6);
//         }
//         .nb-notif-item { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; cursor:pointer; transition:background .15s; border-bottom:1px solid rgba(226,232,240,.05); }
//         .nb-notif-item:last-child { border-bottom:none; }
//         .nb-notif-item:hover { background:rgba(226,232,240,.04); }
//         .nb-notif-item.nb-unread { background:rgba(96,165,250,.03); }
//         .nb-ham {
//           display:flex; flex-direction:column; justify-content:center; align-items:center; gap:5px;
//           width:40px; height:40px; border-radius:9px; background:rgba(226,232,240,.04);
//           border:1px solid rgba(226,232,240,.1); cursor:pointer; transition:all .25s; flex-shrink:0; padding:0;
//         }
//         .nb-ham:hover   { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
//         .nb-ham.nb-open { background:rgba(96,165,250,.08); border-color:rgba(96,165,250,.25); }
//         .nb-ham-line    { width:16px; height:1.5px; background:rgba(226,232,240,.7); border-radius:2px; transition:all .3s; display:block; }
//         .nb-ham.nb-open .nb-ham-line:nth-child(1) { transform:rotate(45deg) translate(4.5px,4.5px); background:#60a5fa; }
//         .nb-ham.nb-open .nb-ham-line:nth-child(2) { opacity:0; transform:translateX(-6px); }
//         .nb-ham.nb-open .nb-ham-line:nth-child(3) { transform:rotate(-45deg) translate(4.5px,-4.5px); background:#60a5fa; }
//         .nb-mob { background:rgba(6,8,14,.98); border-top:1px solid rgba(226,232,240,.06); padding:16px 20px 22px; display:flex; flex-direction:column; gap:5px; }
//         .nb-mob-search { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:9px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); margin-bottom:10px; }
//         .nb-mob-inp { flex:1; background:none; border:none; outline:none; color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; }
//         .nb-mob-inp::placeholder { color:rgba(148,163,184,.35); }
//         .nb-mob-link { display:flex; a
// // import { useState, useEffect, useRef } from 'react'
// // import { Link, useLocation, useNavigate } from 'react-router-dom'
// // import { useSelector } from 'react-redux'
// // import { motion, AnimatePresence } from 'framer-motion'
// // import {
// //     Trophy, LayoutDashboard, User, LogOut,
// //     ChevronDown, FileText, Bell, Sun, Moon,
// //     Flame, X as XIcon, Search
// // } from 'lucide-react'
// // import { selectIsAuthenticated, selectUser, selectIsAdmin } from '../../store/slices/authSlice.js'
// // import { useAuth } from '../../hooks/useAuth.js'
// // import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx'
// // import {
// //     DropdownMenu, DropdownMenuContent, DropdownMenuItem,
// //     DropdownMenuSeparator, DropdownMenuTrigger
// // } from '../ui/dropdown-menu.jsx'
// //
// // // ── Inline SVG Logo (favicon wala) ──────────────────────────────
// // const AlgoMateIcon = ({ size = 40 }) => (
// //     <svg width={size} height={size} viewBox="0 0 52 52" fill="none" xmlns="http://www.w3.org/2000/svg">
// //         <defs>
// //             <linearGradient id="nbIcyLg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
// //                 <stop offset="0%" stopColor="#e2e8f0"/>
// //                 <stop offset="100%" stopColor="#60a5fa"/>
// //             </linearGradient>
// //         </defs>
// //         <rect width="52" height="52" rx="12" fill="rgba(226,232,240,0.06)" stroke="url(#nbIcyLg)" strokeWidth="1"/>
// //         <path d="M26 10 L38 16 L38 30 C38 38 26 44 26 44 C26 44 14 38 14 30 L14 16 Z"
// //               fill="url(#nbIcyLg)" opacity="0.15"/>
// //         <path d="M26 10 L38 16 L38 30 C38 38 26 44 26 44 C26 44 14 38 14 30 L14 16 Z"
// //               fill="none" stroke="url(#nbIcyLg)" strokeWidth="1.5"/>
// //         <text x="26" y="31" textAnchor="middle" fontFamily="monospace"
// //               fontSize="10" fontWeight="700" fill="#e2e8f0">&lt;/&gt;</text>
// //     </svg>
// // )
// //
// // const SEARCH_PROBLEMS = [
// //     { title: 'Two Sum',                    difficulty: 'Easy',   topic: 'Arrays'      },
// //     { title: 'Two Pointers Technique',     difficulty: 'Easy',   topic: 'Arrays'      },
// //     { title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'DP'       },
// //     { title: 'Binary Search',             difficulty: 'Easy',   topic: 'Search'      },
// //     { title: 'Merge Sort',                 difficulty: 'Medium', topic: 'Sorting'     },
// //     { title: 'Graph BFS Traversal',        difficulty: 'Medium', topic: 'Graphs'      },
// //     { title: 'Longest Common Subsequence', difficulty: 'Hard',   topic: 'DP'          },
// //     { title: 'Valid Parentheses',          difficulty: 'Easy',   topic: 'Stack'       },
// //     { title: 'Coin Change',               difficulty: 'Medium', topic: 'DP'          },
// //     { title: 'Word Break Problem',         difficulty: 'Hard',   topic: 'DP'          },
// //     { title: 'Reverse Linked List',        difficulty: 'Easy',   topic: 'Linked List' },
// //     { title: 'Maximum Subarray',           difficulty: 'Medium', topic: 'Arrays'      },
// // ]
// // const RECENT_SEARCHES  = ['Two Sum', 'Binary Search', 'DP Problems']
// // const POPULAR_TOPICS   = ['Arrays', 'Dynamic Programming', 'Graphs', 'Sorting']
// //
// // const Navbar = () => {
// //     const [scrolled,     setScrolled]     = useState(false)
// //     const [mobileOpen,   setMobileOpen]   = useState(false)
// //     const [searchOpen,   setSearchOpen]   = useState(false)
// //     const [searchQuery,  setSearchQuery]  = useState('')
// //     const [searchResults,setSearchResults]= useState([])
// //     const [isDark,       setIsDark]       = useState(true)
// //     const [notifOpen,    setNotifOpen]    = useState(false)
// //     const [streak]                        = useState(7)
// //
// //     const location        = useLocation()
// //     const navigate        = useNavigate()
// //     const isAuthenticated = useSelector(selectIsAuthenticated)
// //     const user            = useSelector(selectUser)
// //     const isAdmin         = useSelector(selectIsAdmin)
// //     const { logout }      = useAuth()
// //
// //     const searchRef      = useRef(null)
// //     const searchInputRef = useRef(null)
// //     const mobileSearchRef= useRef(null)
// //
// //     // ── scroll ──────────────────────────────────────────────────
// //     useEffect(() => {
// //         const onScroll = () => setScrolled(window.scrollY > 20)
// //         window.addEventListener('scroll', onScroll)
// //         return () => window.removeEventListener('scroll', onScroll)
// //     }, [])
// //
// //     // ── close on route change ────────────────────────────────────
// //     useEffect(() => {
// //         setMobileOpen(false); setSearchOpen(false)
// //         setSearchQuery('');   setNotifOpen(false)
// //     }, [location])
// //
// //     // ── keyboard shortcuts ───────────────────────────────────────
// //     useEffect(() => {
// //         const onKey = (e) => {
// //             if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
// //                 e.preventDefault()
// //                 setSearchOpen(true)
// //                 setTimeout(() => searchInputRef.current?.focus(), 50)
// //             }
// //             if (e.key === 'Escape') {
// //                 setSearchOpen(false); setSearchQuery(''); setNotifOpen(false)
// //             }
// //         }
// //         window.addEventListener('keydown', onKey)
// //         return () => window.removeEventListener('keydown', onKey)
// //     }, [])
// //
// //     // ── click outside search ─────────────────────────────────────
// //     useEffect(() => {
// //         const onClickOut = (e) => {
// //             if (searchRef.current && !searchRef.current.contains(e.target)) {
// //                 setSearchOpen(false); setSearchQuery('')
// //             }
// //         }
// //         if (searchOpen) document.addEventListener('mousedown', onClickOut)
// //         return () => document.removeEventListener('mousedown', onClickOut)
// //     }, [searchOpen])
// //
// //     // ── live search filter ───────────────────────────────────────
// //     useEffect(() => {
// //         if (!searchQuery.trim()) { setSearchResults([]); return }
// //         setSearchResults(
// //             SEARCH_PROBLEMS.filter(p =>
// //                 p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //                 p.topic.toLowerCase().includes(searchQuery.toLowerCase())
// //             )
// //         )
// //     }, [searchQuery])
// //
// //     // ── nav links (auth-aware) ───────────────────────────────────
// //     const navLinks = [
// //         { label: 'Problems',    href: '/problems',    icon: FileText      },
// //         { label: 'Leaderboard', href: '/leaderboard', icon: Trophy        },
// //         ...(isAuthenticated
// //             ? [{ label: 'Submissions', href: '/submissions', icon: LayoutDashboard }]
// //             : []),
// //     ]
// //
// //     const isActive  = (href) => location.pathname === href || location.pathname.startsWith(href + '/')
// //     const diffColor = (d)    => d === 'Easy' ? '#22c55e' : d === 'Medium' ? '#f59e0b' : '#ef4444'
// //
// //     const notifications = [
// //         { id:1, text:'New daily challenge available!',        time:'2m ago',  unread:true,  icon:'🔥' },
// //         { id:2, text:'You solved "Two Sum" — +100 pts',       time:'1h ago',  unread:true,  icon:'✅' },
// //         { id:3, text:'Weekly contest starts in 2 hours',      time:'3h ago',  unread:false, icon:'🏆' },
// //     ]
// //     const unreadCount = notifications.filter(n => n.unread).length
// //
// //     // ── JSX ──────────────────────────────────────────────────────
// //     return (
// //         <>
// //             <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
// //
// //         @keyframes nbShimmer   { 0%{background-position:200% center} 100%{background-position:-200% center} }
// //         @keyframes nbCursor    { 0%,100%{opacity:1} 50%{opacity:0} }
// //         @keyframes nbUnderline { 0%,100%{transform:scaleX(.5);opacity:.35} 50%{transform:scaleX(1);opacity:1} }
// //         @keyframes nbFlame     { 0%,100%{filter:drop-shadow(0 0 4px rgba(249,115,22,.6))} 50%{filter:drop-shadow(0 0 8px rgba(249,115,22,.9))} }
// //         @keyframes nbNotifDot  { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
// //         @keyframes nbDotBounce { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-3px);opacity:1} }
// //         @keyframes nbSlideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
// //         @keyframes nbBadge     { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
// //         @keyframes nbGrid      { 0%,100%{opacity:.4} 50%{opacity:.8} }
// //
// //         .nb-wrap::before {
// //           content:''; position:absolute; inset:0; pointer-events:none;
// //           background:
// //             repeating-linear-gradient(90deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px),
// //             repeating-linear-gradient(180deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px);
// //           animation:nbGrid 4s ease-in-out infinite;
// //         }
// //         .nb-wrap::after {
// //           content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
// //           background:linear-gradient(90deg,transparent,rgba(226,232,240,.3),rgba(96,165,250,.4),transparent);
// //         }
// //         .nb-link {
// //           display:flex; align-items:center; gap:7px;
// //           padding:8px 18px; border-radius:9px; font-size:14.5px; font-weight:600;
// //           color:rgba(148,163,184,.7); text-decoration:none; transition:all .2s;
// //           border:1px solid transparent;
// //           font-family:'Space Grotesk',sans-serif; letter-spacing:-.01em; white-space:nowrap;
// //         }
// //         .nb-link:hover          { color:#e2e8f0; background:rgba(226,232,240,.06); }
// //         .nb-link.nb-active      { color:#e2e8f0; background:rgba(226,232,240,.07); border-color:rgba(226,232,240,.16); }
// //         .nb-icon-btn {
// //           position:relative; display:flex; align-items:center; justify-content:center;
// //           width:38px; height:38px; border-radius:9px; background:transparent;
// //           border:1px solid rgba(226,232,240,.09); color:rgba(148,163,184,.7);
// //           cursor:pointer; transition:all .2s; flex-shrink:0;
// //         }
// //         .nb-icon-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.18); }
// //         .nb-streak {
// //           display:flex; align-items:center; gap:5px; padding:6px 13px; border-radius:20px;
// //           background:rgba(249,115,22,.09); border:1px solid rgba(249,115,22,.2);
// //           font-size:13px; font-weight:700; color:#fb923c;
// //           cursor:pointer; transition:all .2s; white-space:nowrap;
// //           font-family:'Space Grotesk',sans-serif;
// //         }
// //         .nb-streak:hover { background:rgba(249,115,22,.15); border-color:rgba(249,115,22,.3); transform:translateY(-1px); }
// //         .nb-flame   { animation:nbFlame 1.5s ease-in-out infinite; }
// //         .nb-shimmer {
// //           background:linear-gradient(90deg,#e2e8f0,#60a5fa,#e2e8f0); background-size:250% auto;
// //           -webkit-background-clip:text; -webkit-text-fill-color:transparent;
// //           background-clip:text; animation:nbShimmer 3s linear infinite;
// //         }
// //         .nb-cursor  { color:#e2e8f0; -webkit-text-fill-color:#e2e8f0; font-weight:300; animation:nbCursor 1s ease-in-out infinite; }
// //         .nb-uline   { width:84px; height:1.5px; background:linear-gradient(90deg,#e2e8f0,#60a5fa); border-radius:2px; transform-origin:left; animation:nbUnderline 2s ease-in-out infinite; }
// //         .nb-beta    { font-size:8px; padding:1px 6px; border-radius:3px; background:rgba(226,232,240,.08); color:#94a3b8; border:1px solid rgba(226,232,240,.15); font-family:'JetBrains Mono',monospace; letter-spacing:.05em; animation:nbBadge 2s ease-in-out infinite; }
// //         .nb-notif-dot { position:absolute; top:6px; right:6px; width:7px; height:7px; background:#ef4444; border-radius:50%; border:1.5px solid #06080e; animation:nbNotifDot 2s ease-in-out infinite; }
// //         .nb-dot { width:4px; height:4px; border-radius:50%; background:#60a5fa; }
// //         .nb-dot:nth-child(1) { animation:nbDotBounce .8s ease-in-out infinite 0s; }
// //         .nb-dot:nth-child(2) { animation:nbDotBounce .8s ease-in-out infinite .15s; }
// //         .nb-dot:nth-child(3) { animation:nbDotBounce .8s ease-in-out infinite .3s; }
// //         .nb-search-box {
// //           display:flex; align-items:center; gap:8px; padding:7px 14px; border-radius:9px;
// //           background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.12);
// //           cursor:pointer; transition:all .2s; width:190px;
// //         }
// //         .nb-search-box:hover { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
// //         .nb-search-ph  { font-size:12.5px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; flex:1; }
// //         .nb-kbd        { font-size:9px; padding:1px 5px; border-radius:4px; background:rgba(226,232,240,.06); border:1px solid rgba(226,232,240,.12); color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
// //         .nb-search-exp { position:absolute; top:0; right:0; width:340px; z-index:50; animation:nbSlideDown .15s ease-out both; }
// //         .nb-search-row {
// //           display:flex; align-items:center; gap:8px; padding:7px 12px;
// //           border-radius:9px 9px 0 0; background:rgba(6,8,14,.98);
// //           border:1px solid rgba(96,165,250,.3); box-shadow:0 0 0 3px rgba(96,165,250,.08);
// //         }
// //         .nb-search-inp { flex:1; background:none; border:none; outline:none; color:#e2e8f0; font-size:13.5px; font-family:'JetBrains Mono',monospace; }
// //         .nb-search-inp::placeholder { color:rgba(148,163,184,.35); }
// //         .nb-search-dd  { background:#0d1117; border:1px solid rgba(226,232,240,.08); border-top:none; border-radius:0 0 10px 10px; overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,.5); max-height:320px; overflow-y:auto; }
// //         .nb-search-item { display:flex; align-items:center; justify-content:space-between; padding:10px 14px; cursor:pointer; transition:background .15s; border-bottom:1px solid rgba(226,232,240,.05); }
// //         .nb-search-item:last-child { border-bottom:none; }
// //         .nb-search-item:hover { background:rgba(226,232,240,.04); }
// //         .nb-search-sec { padding:8px 14px 4px; font-size:9px; color:rgba(148,163,184,.3); font-family:'JetBrains Mono',monospace; letter-spacing:.1em; }
// //         .nb-topic-chip { font-size:11px; padding:2px 8px; border-radius:12px; background:rgba(96,165,250,.08); color:#60a5fa; border:1px solid rgba(96,165,250,.15); font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all .2s; }
// //         .nb-topic-chip:hover { background:rgba(96,165,250,.15); }
// //         .nb-search-empty { padding:16px; text-align:center; font-size:12px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
// //         .nb-ghost-btn {
// //           padding:7px 16px; border-radius:8px; font-size:13.5px; font-weight:500;
// //           color:rgba(148,163,184,.7); background:transparent;
// //           border:1px solid rgba(226,232,240,.12); cursor:pointer;
// //           font-family:'Space Grotesk',sans-serif; transition:all .2s;
// //         }
// //         .nb-ghost-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.05); border-color:rgba(226,232,240,.2); }
// //         .nb-primary-btn {
// //           padding:7px 18px; border-radius:8px; font-size:13.5px; font-weight:700;
// //           color:#0f172a; background:linear-gradient(135deg,#e2e8f0,#60a5fa);
// //           border:none; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s;
// //         }
// //         .nb-primary-btn:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(96,165,250,.25); }
// //         .nb-notif-dd {
// //           position:absolute; top:calc(100% + 10px); right:0; width:310px;
// //           background:#0d1117; border:1px solid rgba(226,232,240,.1);
// //           border-radius:12px; overflow:hidden; z-index:100; box-shadow:0 8px 30px rgba(0,0,0,.6);
// //         }
// //         .nb-notif-item { display:flex; align-items:flex-start; gap:10px; padding:12px 14px; cursor:pointer; transition:background .15s; border-bottom:1px solid rgba(226,232,240,.05); }
// //         .nb-notif-item:last-child { border-bottom:none; }
// //         .nb-notif-item:hover { background:rgba(226,232,240,.04); }
// //         .nb-notif-item.nb-unread { background:rgba(96,165,250,.03); }
// //         .nb-ham {
// //           display:flex; flex-direction:column; justify-content:center; align-items:center; gap:5px;
// //           width:40px; height:40px; border-radius:9px; background:rgba(226,232,240,.04);
// //           border:1px solid rgba(226,232,240,.1); cursor:pointer; transition:all .25s; flex-shrink:0; padding:0;
// //         }
// //         .nb-ham:hover     { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
// //         .nb-ham.nb-open   { background:rgba(96,165,250,.08); border-color:rgba(96,165,250,.25); }
// //         .nb-ham-line      { width:16px; height:1.5px; background:rgba(226,232,240,.7); border-radius:2px; transition:all .3s; display:block; }
// //         .nb-ham.nb-open .nb-ham-line:nth-child(1) { transform:rotate(45deg) translate(4.5px,4.5px); background:#60a5fa; }
// //         .nb-ham.nb-open .nb-ham-line:nth-child(2) { opacity:0; transform:translateX(-6px); }
// //         .nb-ham.nb-open .nb-ham-line:nth-child(3) { transform:rotate(-45deg) translate(4.5px,-4.5px); background:#60a5fa; }
// //         .nb-mob { background:rgba(6,8,14,.98); border-top:1px solid rgba(226,232,240,.06); padding:16px 20px 22px; display:flex; flex-direction:column; gap:5px; }
// //         .nb-mob-search { display:flex; align-items:center; gap:8px; padding:10px 14px; border-radius:9px; background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.1); margin-bottom:10px; }
// //         .nb-mob-inp { flex:1; background:none; border:none; outline:none; color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace; }
// //         .nb-mob-inp::placeholder { color:rgba(148,163,184,.35); }
// //         .nb-mob-link { display:flex; align-items:center; gap:9px; padding:11px 14px; border-radius:9px; font-size:14px; font-weight:600; color:rgba(148,163,184,.7); text-decoration:none; transition:all .2s; border:1px solid transparent; font-family:'Space Grotesk',sans-serif; }
// //         .nb-mob-link:hover    { color:#e2e8f0; background:rgba(226,232,240,.05); }
// //         .nb-mob-link.nb-active{ color:#e2e8f0; background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.12); }
// //         .nb-mob-div    { height:1px; background:rgba(226,232,240,.06); margin:8px 0; }
// //         .nb-mob-streak { display:flex; align-items:center; gap:8px; padding:11px 14px; border-radius:9px; background:rgba(249,115,22,.06); border:1px solid rgba(249,115,22,.12); cursor:pointer; transition:all .2s; }
// //         .nb-mob-streak:hover { background:rgba(249,115,22,.1); }
// //       `}</style>
// //
// //             <motion.nav
// //                 className="nb-wrap"
// //                 initial={{ y: -100, opacity: 0 }}
// //                 animate={{ y: 0,    opacity: 1 }}
// //                 transition={{ duration: 0.5, ease: 'easeOut' }}
// //                 style={{
// //                     position:       'fixed', top:0, left:0, right:0, zIndex:50,
// //                     background:     scrolled ? 'rgba(6,8,14,.97)' : 'rgba(6,8,14,.85)',
// //                     backdropFilter: 'blur(24px)',
// //                     borderBottom:   scrolled ? '1px solid rgba(226,232,240,.07)' : 'none',
// //                     boxShadow:      scrolled ? '0 4px 40px rgba(0,0,0,.5)'       : 'none',
// //                     transition:     'all .3s',
// //                 }}
// //             >
// //                 <div style={{ maxWidth:1380, margin:'0 auto', padding:'0 24px' }}>
// //                     <div style={{ display:'flex', alignItems:'center', height:72, gap:0 }}>
// //
// //                         {/* ── HAMBURGER (mobile only) ── */}
// //                         <button
// //                             className={`nb-ham ${mobileOpen ? 'nb-open' : ''}`}
// //                             onClick={() => setMobileOpen(!mobileOpen)}
// //                             style={{ marginRight:14, display:'none' }}
// //                             aria-label="Toggle menu"
// //                         >
// //                             <span className="nb-ham-line" />
// //                             <span className="nb-ham-line" />
// //                             <span className="nb-ham-line" />
// //                         </button>
// //
// //                         {/* ── LOGO ── */}
// //                         <Link
// //                             to="/"
// //                             style={{ display:'flex', alignItems:'center', gap:12, textDecoration:'none', flexShrink:0, marginRight:28 }}
// //                         >
// //                             <AlgoMateIcon size={40} />
// //                             <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
// //                                 <div style={{ fontSize:21, fontWeight:800, letterSpacing:'-.03em', lineHeight:1 }}>
// //                                     <span className="nb-shimmer">AlgoMate</span>
// //                                     <span className="nb-cursor">_</span>
// //                                 </div>
// //                                 <div style={{ display:'flex', alignItems:'center', gap:7 }}>
// //                                     <span style={{ fontSize:9, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.38)', letterSpacing:'.12em' }}>
// //                                         v1.0 · DSA Platform
// //                                     </span>
// //                                     <span className="nb-beta">BETA</span>
// //                                 </div>
// //                                 <div className="nb-uline" />
// //                             </div>
// //                         </Link>
// //
// //                         {/* ── DESKTOP NAV LINKS ── */}
// //                         <div style={{ display:'flex', alignItems:'center', gap:3 }}>
// //                             {navLinks.map(({ label, href, icon: Icon }) => (
// //                                 <Link
// //                                     key={href}
// //                                     to={href}
// //                                     className={`nb-link ${isActive(href) ? 'nb-active' : ''}`}
// //                                 >
// //                                     <Icon size={15} style={{ opacity: isActive(href) ? 1 : .5 }} />
// //                                     {label}
// //                                 </Link>
// //                             ))}
// //                         </div>
// //
// //                         <div style={{ flex:1 }} />
// //
// //                         {/* ── RIGHT SIDE ── */}
// //                         <div style={{ display:'flex', alignItems:'center', gap:9 }}>
// //
// //                             {/* ── AUTHENTICATED-ONLY SECTION ── */}
// //                             {isAuthenticated && (
// //                                 <>
// //                                     {/* Streak */}
// //                                     <div
// //                                         className="nb-streak"
// //                                         onClick={() => navigate('/problems/daily-challenge')}
// //                                         title="Today's daily challenge"
// //                                     >
// //                                         <Flame size={15} className="nb-flame" />
// //                                         <span>{streak} day streak</span>
// //                                     </div>
// //
// //                                     <div style={{ width:1, height:22, background:'rgba(226,232,240,.08)' }} />
// //
// //                                     {/* Search */}
// //                                     <div style={{ position:'relative' }} ref={searchRef}>
// //                                         {!searchOpen ? (
// //                                             <div
// //                                                 className="nb-search-box"
// //                                                 onClick={() => {
// //                                                     setSearchOpen(true)
// //                                                     setTimeout(() => searchInputRef.current?.focus(), 50)
// //                                                 }}
// //                                             >
// //                                                 <Search size={13} style={{ color:'rgba(148,163,184,.5)', flexShrink:0 }} />
// //                                                 <span className="nb-search-ph">Search problems...</span>
// //                                                 <span className="nb-kbd">Ctrl K</span>
// //                                             </div>
// //                                         ) : (
// //                                             <div className="nb-search-exp">
// //                                                 <div className="nb-search-row">
// //                                                     <Search size={14} style={{ color:'#60a5fa', flexShrink:0 }} />
// //                                                     <input
// //                                                         ref={searchInputRef}
// //                                                         className="nb-search-inp"
// //                                                         placeholder="Search problems, topics..."
// //                                                         value={searchQuery}
// //                                                         onChange={e => setSearchQuery(e.target.value)}
// //                                                         onKeyDown={e => {
// //                                                             if (e.key === 'Enter' && searchQuery) {
// //                                                                 navigate(`/problems?search=${searchQuery}`)
// //                                                                 setSearchOpen(false); setSearchQuery('')
// //                                                             }
// //                                                         }}
// //                                                     />
// //                                                     {searchQuery && (
// //                                                         <div style={{ display:'flex', gap:3 }}>
// //                                                             <div className="nb-dot" /><div className="nb-dot" /><div className="nb-dot" />
// //                                                         </div>
// //                                                     )}
// //                                                     <span
// //                                                         style={{ fontSize:10, color:'rgba(148,163,184,.35)', fontFamily:"'JetBrains Mono',monospace", cursor:'pointer' }}
// //                                                         onClick={() => { setSearchOpen(false); setSearchQuery('') }}
// //                                                     >Esc</span>
// //                                                 </div>
// //                                                 <div className="nb-search-dd">
// //                                                     {!searchQuery.trim() ? (
// //                                                         <>
// //                                                             <div className="nb-search-sec">RECENT SEARCHES</div>
// //                                                             {RECENT_SEARCHES.map((t, i) => (
// //                                                                 <div key={i} className="nb-search-item" onClick={() => setSearchQuery(t)}>
// //                                                                     <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                                                                         <Search size={12} style={{ color:'rgba(148,163,184,.3)' }} />
// //                                                                         <span style={{ fontSize:13, color:'rgba(226,232,240,.6)' }}>{t}</span>
// //                                                                     </div>
// //                                                                 </div>
// //                                                             ))}
// //                                                             <div className="nb-search-sec" style={{ borderTop:'1px solid rgba(226,232,240,.05)', marginTop:4 }}>
// //                                                                 POPULAR TOPICS
// //                                                             </div>
// //                                                             <div style={{ padding:'8px 14px', display:'flex', flexWrap:'wrap', gap:6 }}>
// //                                                                 {POPULAR_TOPICS.map((t, i) => (
// //                                                                     <span key={i} className="nb-topic-chip" onClick={() => setSearchQuery(t)}>#{t}</span>
// //                                                                 ))}
// //                                                             </div>
// //                                                         </>
// //                                                     ) : searchResults.length > 0 ? (
// //                                                         searchResults.map((p, i) => (
// //                                                             <div
// //                                                                 key={i}
// //                                                                 className="nb-search-item"
// //                                                                 onClick={() => {
// //                                                                     navigate('/problems')
// //                                                                     setSearchOpen(false); setSearchQuery('')
// //                                                                 }}
// //                                                             >
// //                                                                 <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                                                                     <FileText size={13} style={{ color:'rgba(148,163,184,.4)' }} />
// //                                                                     <span style={{ fontSize:13, color:'#e2e8f0', fontWeight:500 }}>{p.title}</span>
// //                                                                 </div>
// //                                                                 <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                                                                     <span style={{ fontSize:10, color:'rgba(148,163,184,.4)', fontFamily:"'JetBrains Mono',monospace" }}>{p.topic}</span>
// //                                                                     <span style={{ fontSize:10, fontWeight:700, color:diffColor(p.difficulty), fontFamily:"'JetBrains Mono',monospace" }}>
// //                                                                         {p.difficulty}
// //                                                                     </span>
// //                                                                 </div>
// //                                                             </div>
// //                                                         ))
// //                                                     ) : (
// //                                                         <div className="nb-search-empty">No results for "{searchQuery}"</div>
// //                                                     )}
// //                                                 </div>
// //                                             </div>
// //                                         )}
// //                                     </div>
// //
// //                                     {/* Theme Toggle */}
// //                                     <button className="nb-icon-btn" onClick={() => setIsDark(!isDark)} title="Toggle theme">
// //                                         <AnimatePresence mode="wait">
// //                                             {isDark ? (
// //                                                 <motion.div key="moon" initial={{ rotate:-30, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:30, opacity:0 }} transition={{ duration:.18 }}>
// //                                                     <Moon size={16} />
// //                                                 </motion.div>
// //                                             ) : (
// //                                                 <motion.div key="sun" initial={{ rotate:30, opacity:0 }} animate={{ rotate:0, opacity:1 }} exit={{ rotate:-30, opacity:0 }} transition={{ duration:.18 }}>
// //                                                     <Sun size={16} style={{ color:'#fbbf24' }} />
// //                                                 </motion.div>
// //                                             )}
// //                                         </AnimatePresence>
// //                                     </button>
// //
// //                                     {/* Notifications */}
// //                                     <div style={{ position:'relative' }}>
// //                                         <button className="nb-icon-btn" onClick={() => setNotifOpen(!notifOpen)} title="Notifications">
// //                                             <Bell size={16} />
// //                                             {unreadCount > 0 && <span className="nb-notif-dot" />}
// //                                         </button>
// //                                         <AnimatePresence>
// //                                             {notifOpen && (
// //                                                 <motion.div
// //                                                     initial={{ opacity:0, y:-8, scale:.97 }}
// //                                                     animate={{ opacity:1, y:0,  scale:1   }}
// //                                                     exit={{   opacity:0, y:-8, scale:.97 }}
// //                                                     transition={{ duration:.15 }}
// //                                                     className="nb-notif-dd"
// //                                                 >
// //                                                     <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 15px 11px', borderBottom:'1px solid rgba(226,232,240,.07)' }}>
// //                                                         <span style={{ fontSize:13, fontWeight:700, color:'#e2e8f0' }}>Notifications</span>
// //                                                         <div style={{ display:'flex', alignItems:'center', gap:8 }}>
// //                                                             {unreadCount > 0 && (
// //                                                                 <span style={{ fontSize:10, padding:'1px 7px', borderRadius:10, background:'rgba(96,165,250,.12)', color:'#60a5fa', border:'1px solid rgba(96,165,250,.2)', fontFamily:"'JetBrains Mono',monospace" }}>
// //                                                                     {unreadCount} new
// //                                                                 </span>
// //                                                             )}
// //                                                             <button onClick={() => setNotifOpen(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(148,163,184,.5)', padding:0, display:'flex' }}>
// //                                                                 <XIcon size={14} />
// //                                                             </button>
// //                                                         </div>
// //                                                     </div>
// //                                                     {notifications.map(n => (
// //                                                         <div key={n.id} className={`nb-notif-item ${n.unread ? 'nb-unread' : ''}`}>
// //                                                             <span style={{ fontSize:17, lineHeight:1, marginTop:1 }}>{n.icon}</span>
// //                                                             <div style={{ flex:1 }}>
// //                                                                 <p style={{ fontSize:12.5, color:n.unread ? '#e2e8f0' : 'rgba(148,163,184,.65)', margin:0, lineHeight:1.45 }}>{n.text}</p>
// //                                                                 <p style={{ fontSize:10, fontFamily:"'JetBrains Mono',monospace", color:'rgba(148,163,184,.35)', margin:'3px 0 0' }}>{n.time}</p>
// //                                                             </div>
// //                                                             {n.unread && <div style={{ width:6, height:6, borderRadius:'50%', background:'#60a5fa', flexShrink:0, marginTop:5 }} />}
// //                                                         </div>
// //                                                     ))}
// //                                                     <div style={{ padding:'10px 15px', borderTop:'1px solid rgba(226,232,240,.07)', textAlign:'center' }}>
// //                                                         <span style={{ fontSize:11, color:'#60a5fa', cursor:'pointer', fontFamily:"'JetBrains Mono',monospace" }}>
// //                                                             View all notifications →
// //                                                         </span>
// //                                                     </div>
// //                                                 </motion.div>
// //                                             )}
// //                                         </AnimatePresence>
// //                                     </div>
// //
// //                                     <div style={{ width:1, height:22, background:'rgba(226,232,240,.08)' }} />
// //                                 </>
// //                             )}
// //
// //                             {/* ── AUTH SECTION ── */}
// //                             {isAuthenticated ? (
// //                                 <DropdownMenu>
// //                                     <DropdownMenuTrigger asChild>
// //                                         <button style={{
// //                                             display:'flex', alignItems:'center', gap:9,
// //                                             padding:'6px 12px', borderRadius:10,
// //                                             background:'rgba(226,232,240,.04)',
// //                                             border:'1px solid rgba(226,232,240,.09)',
// //                                             cursor:'pointer', transition:'all .2s',
// //                                         }}>
// //                                             <Avatar style={{ width:30, height:30, border:'1px solid rgba(226,232,240,.12)' }}>
// //                                                 <AvatarImage src={user?.avatarUrl} />
// //                                                 <AvatarFallback style={{ background:'rgba(226,232,240,.08)', color:'#e2e8f0', fontSize:12, fontWeight:700 }}>
// //                                                     {user?.username?.[0]?.toUpperCase() || 'U'}
// //                                                 </AvatarFallback>
// //                                             </Avatar>
// //                                             <div style={{ textAlign:'left' }}>
// //                                                 <p style={{ color:'#e2e8f0', fontSize:13, fontWeight:600, margin:0, lineHeight:1 }}>{user?.username}</p>
// //                                                 <p style={{ color:'rgba(148,163,184,.5)', fontSize:10, margin:'2px 0 0', fontFamily:"'JetBrains Mono',monospace" }}>
// //                                                     ⭐ {user?.rating || 0} pts
// //                                                 </p>
// //                                             </div>
// //                                             <ChevronDown size={12} style={{ color:'rgba(148,163,184,.45)' }} />
// //                                         </button>
// //                                     </DropdownMenuTrigger>
// //                                     <DropdownMenuContent align="end" style={{ width:190, background:'#0d1117', border:'1px solid rgba(226,232,240,.09)', color:'#e2e8f0', borderRadius:10 }}>
// //                                         <DropdownMenuItem onClick={() => navigate('/profile')} style={{ cursor:'pointer', gap:8, color:'rgba(203,213,225,.8)', fontSize:13 }}>
// //                                             <User size={13} /> Profile
// //                                         </DropdownMenuItem>
// //                                         {isAdmin && (
// //                                             <DropdownMenuItem onClick={() => navigate('/admin')} style={{ cursor:'pointer', gap:8, color:'rgba(203,213,225,.8)', fontSize:13 }}>
// //                                                 <LayoutDashboard size={13} /> Admin Panel
// //                                             </DropdownMenuItem>
// //                                         )}
// //                                         <DropdownMenuSeparator style={{ background:'rgba(226,232,240,.07)' }} />
// //                                         <DropdownMenuItem onClick={logout} style={{ cursor:'pointer', gap:8, color:'#f87171', fontSize:13 }}>
// //                                             <LogOut size={13} /> Logout
// //                                         </DropdownMenuItem>
// //                                     </DropdownMenuContent>
// //                                 </DropdownMenu>
// //                             ) : (
// //                                 /* ── UNAUTHENTICATED: only Login + Sign Up ── */
// //                                 <div style={{ display:'flex', alignItems:'center', gap:9 }}>
// //                                     <button className="nb-ghost-btn"   onClick={() => navigate('/login')}>Login</button>
// //                                     <button className="nb-primary-btn" onClick={() => navigate('/signup')}>Sign Up →</button>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>
// //                 </div>
// //
// //                 {/* ── MOBILE MENU ── */}
// //                 <AnimatePresence>
// //                     {mobileOpen && (
// //                         <motion.div
// //                             initial={{ opacity:0, height:0 }}
// //                             animate={{ opacity:1, height:'auto' }}
// //                             exit={{   opacity:0, height:0 }}
// //                             transition={{ duration:.2 }}
// //                             className="nb-mob"
// //                         >
// //                             {isAuthenticated && (
// //                                 <div className="nb-mob-search">
// //                                     <Search size={14} style={{ color:'rgba(148,163,184,.5)', flexShrink:0 }} />
// //                                     <input
// //                                         ref={mobileSearchRef}
// //                                         className="nb-mob-inp"
// //                                         placeholder="Search problems..."
// //                                         onKeyDown={e => {
// //                                             if (e.key === 'Enter' && e.target.value) {
// //                                                 navigate(`/problems?search=${e.target.value}`)
// //                                                 setMobileOpen(false)
// //                                             }
// //                                         }}
// //                                     />
// //                                 </div>
// //                             )}
// //
// //                             {navLinks.map(({ label, href, icon: Icon }) => (
// //                                 <Link key={href} to={href} className={`nb-mob-link ${isActive(href) ? 'nb-active' : ''}`}>
// //                                     <Icon size={15} style={{ opacity: isActive(href) ? 1 : .5 }} />
// //                                     {label}
// //                                 </Link>
// //                             ))}
// //
// //                             {isAuthenticated && (
// //                                 <div className="nb-mob-streak" onClick={() => { navigate('/problems/daily-challenge'); setMobileOpen(false) }}>
// //                                     <Flame size={15} style={{ color:'#fb923c' }} />
// //                                     <span style={{ fontSize:13, fontWeight:600, color:'#fb923c' }}>
// //                                         {streak} day streak — Solve today's challenge →
// //                                     </span>
// //                                 </div>
// //                             )}
// //
// //                             <div className="nb-mob-div" />
// //
// //                             {isAuthenticated ? (
// //                                 <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
// //                                     <button onClick={() => { navigate('/profile'); setMobileOpen(false) }}
// //                                             style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', color:'#e2e8f0', background:'rgba(226,232,240,.04)', border:'1px solid rgba(226,232,240,.1)', borderRadius:9, cursor:'pointer', fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}>
// //                                         <User size={13} /> Profile
// //                                     </button>
// //                                     <button onClick={logout}
// //                                             style={{ display:'flex', alignItems:'center', gap:8, padding:'10px 14px', color:'#f87171', background:'rgba(248,113,113,.08)', border:'1px solid rgba(248,113,113,.15)', borderRadius:9, cursor:'pointer', fontSize:13, fontFamily:"'Space Grotesk',sans-serif" }}>
// //                                         <LogOut size={13} /> Logout
// //                                     </button>
// //                                 </div>
// //                             ) : (
// //                                 <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
// //                                     <button className="nb-ghost-btn"   style={{ width:'100%', textAlign:'center', padding:'11px' }} onClick={() => { navigate('/login');  setMobileOpen(false) }}>Login</button>
// //                                     <button className="nb-primary-btn" style={{ width:'100%', textAlign:'center', padding:'11px' }} onClick={() => { navigate('/signup'); setMobileOpen(false) }}>Sign Up →</button>
// //                                 </div>
// //                             )}
// //                         </motion.div>
// //                     )}
// //                 </AnimatePresence>
// //             </motion.nav>
// //         </>
// //     )
// // }
// //
// // export default Navbar
//
// // import { useState, useEffect, useRef } from 'react'
// // import { Link, useLocation, useNavigate } from 'react-router-dom'
// // import { useSelector } from 'react-redux'
// // import { motion, AnimatePresence } from 'framer-motion'
// // import {
// //     Trophy, LayoutDashboard, User, LogOut,
// //     ChevronDown, FileText, Bell, Sun, Moon,
// //     Flame, X as XIcon, Search
// // } from 'lucide-react'
// // import { selectIsAuthenticated, selectUser, selectIsAdmin } from '../../store/slices/authSlice.js'
// // import { useAuth } from '../../hooks/useAuth.js'
// // import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar.jsx'
// // import {
// //     DropdownMenu, DropdownMenuContent, DropdownMenuItem,
// //     DropdownMenuSeparator, DropdownMenuTrigger
// // } from '../ui/dropdown-menu.jsx'
// // import AlgoMateLogo from './AlgoMateLogo.jsx'
// //
// // const SEARCH_PROBLEMS = [
// //     { title: 'Two Sum', difficulty: 'Easy', topic: 'Arrays' },
// //     { title: 'Two Pointers Technique', difficulty: 'Easy', topic: 'Arrays' },
// //     { title: 'Longest Palindromic Substring', difficulty: 'Medium', topic: 'DP' },
// //     { title: 'Binary Search', difficulty: 'Easy', topic: 'Search' },
// //     { title: 'Merge Sort', difficulty: 'Medium', topic: 'Sorting' },
// //     { title: 'Graph BFS Traversal', difficulty: 'Medium', topic: 'Graphs' },
// //     { title: 'Longest Common Subsequence', difficulty: 'Hard', topic: 'DP' },
// //     { title: 'Valid Parentheses', difficulty: 'Easy', topic: 'Stack' },
// //     { title: 'Coin Change', difficulty: 'Medium', topic: 'DP' },
// //     { title: 'Word Break Problem', difficulty: 'Hard', topic: 'DP' },
// //     { title: 'Reverse Linked List', difficulty: 'Easy', topic: 'Linked List' },
// //     { title: 'Maximum Subarray', difficulty: 'Medium', topic: 'Arrays' },
// // ]
// //
// // const RECENT_SEARCHES = ['Two Sum', 'Binary Search', 'DP Problems']
// // const POPULAR_TOPICS = ['Arrays', 'Dynamic Programming', 'Graphs', 'Sorting']
// //
// // const Navbar = () => {
// //     const [scrolled, setScrolled] = useState(false)
// //     const [mobileOpen, setMobileOpen] = useState(false)
// //     const [searchOpen, setSearchOpen] = useState(false)
// //     const [searchQuery, setSearchQuery] = useState('')
// //     const [searchResults, setSearchResults] = useState([])
// //     const [isDark, setIsDark] = useState(true)
// //     const [notifOpen, setNotifOpen] = useState(false)
// //     const [streak] = useState(7)
// //
// //     const location = useLocation()
// //     const navigate = useNavigate()
// //     const isAuthenticated = useSelector(selectIsAuthenticated)
// //     const user = useSelector(selectUser)
// //     const isAdmin = useSelector(selectIsAdmin)
// //     const { logout } = useAuth()
// //
// //     const searchRef = useRef(null)
// //     const searchInputRef = useRef(null)
// //     const mobileSearchRef = useRef(null)
// //
// //     useEffect(() => {
// //         const handleScroll = () => setScrolled(window.scrollY > 20)
// //         window.addEventListener('scroll', handleScroll)
// //         return () => window.removeEventListener('scroll', handleScroll)
// //     }, [])
// //
// //     useEffect(() => {
// //         setMobileOpen(false)
// //         setSearchOpen(false)
// //         setSearchQuery('')
// //         setNotifOpen(false)
// //     }, [location])
// //
// //     useEffect(() => {
// //         const handleKey = (e) => {
// //             if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
// //                 e.preventDefault()
// //                 setSearchOpen(true)
// //                 setTimeout(() => searchInputRef.current?.focus(), 50)
// //             }
// //             if (e.key === 'Escape') {
// //                 setSearchOpen(false)
// //                 setSearchQuery('')
// //                 setNotifOpen(false)
// //             }
// //         }
// //         window.addEventListener('keydown', handleKey)
// //         return () => window.removeEventListener('keydown', handleKey)
// //     }, [])
// //
// //     useEffect(() => {
// //         const handleClickOutside = (e) => {
// //             if (searchRef.current && !searchRef.current.contains(e.target)) {
// //                 setSearchOpen(false)
// //                 setSearchQuery('')
// //             }
// //         }
// //         if (searchOpen) document.addEventListener('mousedown', handleClickOutside)
// //         return () => document.removeEventListener('mousedown', handleClickOutside)
// //     }, [searchOpen])
// //
// //     useEffect(() => {
// //         if (!searchQuery.trim()) { setSearchResults([]); return }
// //         const filtered = SEARCH_PROBLEMS.filter(p =>
// //             p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
// //             p.topic.toLowerCase().includes(searchQuery.toLowerCase())
// //         )
// //         setSearchResults(filtered)
// //     }, [searchQuery])
// //
// //     const navLinks = [
// //         { label: 'Problems', href: '/problems', icon: FileText },
// //         { label: 'Leaderboard', href: '/leaderboard', icon: Trophy },
// //         ...(isAuthenticated
// //             ? [{ label: 'Submissions', href: '/submissions', icon: LayoutDashboard }]
// //             : []),
// //     ]
// //
// //     const isActive = (href) => location.pathname === href || location.pathname.startsWith(href + '/')
// //
// //     const diffColor = (d) =>
// //         d === 'Easy' ? '#22c55e' : d === 'Medium' ? '#f59e0b' : '#ef4444'
// //
// //     const notifications = [
// //         { id: 1, text: 'New daily challenge available!', time: '2m ago', unread: true, icon: '🔥' },
// //         { id: 2, text: 'You solved "Two Sum" — +100 pts', time: '1h ago', unread: true, icon: '✅' },
// //         { id: 3, text: 'Weekly contest starts in 2 hours', time: '3h ago', unread: false, icon: '🏆' },
// //     ]
// //     const unreadCount = notifications.filter(n => n.unread).length
// //
// //     return (
// //         <>
// //             <style>{`
// //         @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');
// //
// //         @keyframes icyShimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }
// //         @keyframes icyCursor { 0%,100%{opacity:1} 50%{opacity:0} }
// //         @keyframes icyUnderline { 0%,100%{transform:scaleX(.5);opacity:.35} 50%{transform:scaleX(1);opacity:1} }
// //         @keyframes flamePulse { 0%,100%{filter:drop-shadow(0 0 4px rgba(249,115,22,.6))} 50%{filter:drop-shadow(0 0 8px rgba(249,115,22,.9))} }
// //         @keyframes notifDotAnim { 0%,100%{transform:scale(1)} 50%{transform:scale(1.3)} }
// //         @keyframes dotBounceAnim { 0%,100%{transform:translateY(0);opacity:.4} 50%{transform:translateY(-3px);opacity:1} }
// //         @keyframes slideDownAnim { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
// //         @keyframes icyBadgeAnim { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
// //         @keyframes gridFadeAnim { 0%,100%{opacity:.4} 50%{opacity:.8} }
// //
// //         .nb-grid::before {
// //           content:''; position:absolute; inset:0;
// //           background:
// //             repeating-linear-gradient(90deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px),
// //             repeating-linear-gradient(180deg,rgba(226,232,240,.012) 0,transparent 1px,transparent 50px);
// //           pointer-events:none;
// //           animation:gridFadeAnim 4s ease-in-out infinite;
// //         }
// //         .nb-line::after {
// //           content:''; position:absolute; bottom:0; left:0; right:0; height:1px;
// //           background:linear-gradient(90deg,transparent,rgba(226,232,240,.3),rgba(96,165,250,.4),transparent);
// //         }
// //
// //         /* Hamburger */
// //         .nb-ham {
// //           display:flex; flex-direction:column; justify-content:center;
// //           align-items:center; gap:5px;
// //           width:40px; height:40px; border-radius:9px;
// //           background:rgba(226,232,240,.04);
// //           border:1px solid rgba(226,232,240,.1);
// //           cursor:pointer; transition:all .25s; flex-shrink:0;
// //           padding:0;
// //         }
// //         .nb-ham:hover { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
// //         .nb-ham.open { background:rgba(96,165,250,.08); border-color:rgba(96,165,250,.25); }
// //         .nb-ham-line {
// //           width:16px; height:1.5px; background:rgba(226,232,240,.7);
// //           border-radius:2px; transition:all .3s; display:block;
// //         }
// //         .nb-ham.open .nb-ham-line:nth-child(1) { transform:rotate(45deg) translate(4.5px,4.5px); background:#60a5fa; }
// //         .nb-ham.open .nb-ham-line:nth-child(2) { opacity:0; transform:translateX(-6px); }
// //         .nb-ham.open .nb-ham-line:nth-child(3) { transform:rotate(-45deg) translate(4.5px,-4.5px); background:#60a5fa; }
// //
// //         /* Nav links */
// //         .nb-link {
// //           display:flex; align-items:center; gap:7px;
// //           padding:8px 18px; border-radius:9px;
// //           font-size:14.5px; font-weight:600;
// //           color:rgba(148,163,184,.7);
// //           text-decoration:none; transition:all .2s;
// //           border:1px solid transparent;
// //           font-family:'Space Grotesk',sans-serif;
// //           letter-spacing:-.01em; white-space:nowrap;
// //         }
// //         .nb-link:hover { color:#e2e8f0; background:rgba(226,232,240,.06); }
// //         .nb-link.active {
// //           color:#e2e8f0; background:rgba(226,232,240,.07);
// //           border-color:rgba(226,232,240,.16);
// //         }
// //
// //         /* Icon btn */
// //         .nb-icon-btn {
// //           position:relative; display:flex; align-items:center; justify-content:center;
// //           width:38px; height:38px; border-radius:9px;
// //           background:transparent; border:1px solid rgba(226,232,240,.09);
// //           color:rgba(148,163,184,.7); cursor:pointer; transition:all .2s; flex-shrink:0;
// //         }
// //         .nb-icon-btn:hover { color:#e2e8f0; background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.18); }
// //
// //         /* Streak */
// //         .nb-streak {
// //           display:flex; align-items:center; gap:5px;
// //           padding:6px 13px; border-radius:20px;
// //           background:rgba(249,115,22,.09); border:1px solid rgba(249,115,22,.2);
// //           font-size:13px; font-weight:700; color:#fb923c;
// //           cursor:pointer; transition:all .2s; white-space:nowrap;
// //           font-family:'Space Grotesk',sans-serif;
// //         }
// //         .nb-streak:hover { background:rgba(249,115,22,.15); border-color:rgba(249,115,22,.3); transform:translateY(-1px); }
// //         .nb-flame { animation:flamePulse 1.5s ease-in-out infinite; }
// //
// //         /* Search */
// //         .nb-search-box {
// //           display:flex; align-items:center; gap:8px;
// //           padding:7px 14px; border-radius:9px;
// //           background:rgba(226,232,240,.05); border:1px solid rgba(226,232,240,.12);
// //           cursor:pointer; transition:all .2s; width:190px;
// //         }
// //         .nb-search-box:hover { background:rgba(226,232,240,.08); border-color:rgba(226,232,240,.2); }
// //         .nb-search-ph { font-size:12.5px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; flex:1; }
// //         .nb-kbd {
// //           font-size:9px; padding:1px 5px; border-radius:4px;
// //           background:rgba(226,232,240,.06); border:1px solid rgba(226,232,240,.12);
// //           color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace;
// //         }
// //         .nb-search-exp {
// //           position:absolute; top:0; right:0; width:340px; z-index:50;
// //           animation:slideDownAnim .15s ease-out both;
// //         }
// //         .nb-search-row {
// //           display:flex; align-items:center; gap:8px; padding:7px 12px;
// //           border-radius:9px 9px 0 0; background:rgba(6,8,14,.98);
// //           border:1px solid rgba(96,165,250,.3);
// //           box-shadow:0 0 0 3px rgba(96,165,250,.08);
// //         }
// //         .nb-search-inp {
// //           flex:1; background:none; border:none; outline:none;
// //           color:#e2e8f0; font-size:13.5px; font-family:'JetBrains Mono',monospace;
// //         }
// //         .nb-search-inp::placeholder { color:rgba(148,163,184,.35); }
// //         .nb-search-dd {
// //           background:#0d1117; border:1px solid rgba(226,232,240,.08);
// //           border-top:none; border-radius:0 0 10px 10px;
// //           overflow:hidden; box-shadow:0 8px 30px rgba(0,0,0,.5);
// //           max-height:320px; overflow-y:auto;
// //         }
// //         .nb-search-item {
// //           display:flex; align-items:center; justify-content:space-between;
// //           padding:10px 14px; cursor:pointer; transition:background .15s;
// //           border-bottom:1px solid rgba(226,232,240,.05);
// //         }
// //         .nb-search-item:last-child { border-bottom:none; }
// //         .nb-search-item:hover { background:rgba(226,232,240,.04); }
// //         .nb-search-sec { padding:8px 14px 4px; font-size:9px; color:rgba(148,163,184,.3); font-family:'JetBrains Mono',monospace; letter-spacing:.1em; }
// //         .nb-topic-chip {
// //           font-size:11px; padding:2px 8px; border-radius:12px;
// //           background:rgba(96,165,250,.08); color:#60a5fa;
// //           border:1px solid rgba(96,165,250,.15);
// //           font-family:'JetBrains Mono',monospace; cursor:pointer; transition:all .2s;
// //         }
// //         .nb-topic-chip:hover { background:rgba(96,165,250,.15); }
// //         .nb-search-empty { padding:16px; text-align:center; font-size:12px; color:rgba(148,163,184,.4); font-family:'JetBrains Mono',monospace; }
// //
// //         /* Typing dots */
// //         .nb-dot { width:4px; height:4px; border-radius:50%; background:#60a5fa; }
// //         .nb-dot:nth-child(1) { animation:dotBounceAnim .8s ease-in-out infinite 0s; }
// //         .nb-dot:nth-child(2) { animation:dotBounceAnim .8s ease-in-out infinite .15s; }
// //         .nb-dot:nth-child(3) { animation:dotBounceAnim .8s ease-in-out infinite .3s; }
// //
// //         /* Notif dot */
// //         .nb-notif-dot {
// //           position:absolute; top:6px; right:6px;
// //           width:7px; height:7px; background:#ef4444;
// //           border-radius:50%; border:1.5px solid #06080e;
// //           animation:notifDotAnim 2s ease-in-out infinite;
// //         }
// //
// //         /* Auth buttons */
// //         .nb-btn-ghost {
// //           padding:7px 16px; border-radius:8px; font-size:13.5px; font-weight:500;
// //           color:rgba(148,163,184,.7); background:transparent;
// //           border:1px solid rgba(226,232,240,.12); cursor:pointer;
// //           font-family:'Space Grotesk',sans-serif; transition:all .2s;
// //         }
// //         .nb-btn-ghost:hover { color:#e2e8f0; background:rgba(226,232,240,.05); border-color:rgba(226,232,240,.2); }
// //         .nb-btn-primary {
// //           padding:7px 18px; border-radius:8px; font-size:13.5px; font-weight:700;
// //           color:#0f172a; background:linear-gradient(135deg,#e2e8f0,#60a5fa);
// //           border:none; cursor:pointer; font-family:'Space Grotesk',sans-serif; transition:all .2s;
// //         }
// //         .nb-btn-primary:hover { transform:translateY(-1px); box-shadow:0 4px 16px rgba(96,165,250,.25); }
// //
// //         /* Logo */
// //         .nb-logo-shimmer {
// //           background:linear-gradient(90deg,#e2e8f0,#60a5fa,#e2e8f0);
// //           background-size:250% auto;
// //           -webkit-background-clip:text; -webkit-text-fill-color:transparent;
// //           background-clip:text; animation:icyShimmer 3s linear infinite;
// //         }
// //         .nb-cursor { color:#e2e8f0; -webkit-text-fill-color:#e2e8f0; font-weight:300; animation:icyCursor 1s ease-in-out infinite; }
// //         .nb-underline { width:84px; height:1.5px; background:linear-gradient(90deg,#e2e8f0,#60a5fa); border-radius:2px; transform-origin:left; animation:icyUnderline 2s ease-in-out infinite; }
// //         .nb-beta { font-size:8px; padding:1px 6px; border-radius:3px; background:rgba(226,232,240,.08); color:#94a3b8; border:1px solid rgba(226,232,240,.15); font-family:'JetBrains Mono',monospace; letter-spacing:.05em; animation:icyBadgeAnim 2s ease-in-out infinite; }
// //
// //         /* Notif dropdown */
// //         .nb-notif-dd {
// //           position:absolute; top:calc(100% + 10px); right:0; width:310px;
// //           background:#0d1117; border:1px solid rgba(226,232,240,.1);
// //           border-radius:12px; overflow:hidden; z-index:100;
// //           box-shadow:0 8px 30px rgba(0,0,0,.6);
// //         }
// //         .nb-notif-item {
// //           display:flex; align-items:flex-start; gap:10px; padding:12px 14px;
// //           cursor:pointer; transition:background .15s;
// //           border-bottom:1px solid rgba(226,232,240,.05);
// //         }
// //         .nb-notif-item:last-child { border-bottom:none; }
// //         .nb-notif-item:hover { background:rgba(226,232,240,.04); }
// //         .nb-notif-item.unread { background:rgba(96,165,250,.03); }
// //
// //         /* Mobile menu */
// //         .nb-mobile {
// //           background:rgba(6,8,14,.98);
// //           border-top:1px solid rgba(226,232,240,.06);
// //           padding:16px 20px 22px;
// //           display:flex; flex-direction:column; gap:5px;
// //         }
// //         .nb-mob-search {
// //           display:flex; align-items:center; gap:8px; padding:10px 14px;
// //           border-radius:9px; background:rgba(226,232,240,.05);
// //           border:1px solid rgba(226,232,240,.1); margin-bottom:10px;
// //         }
// //         .nb-mob-inp {
// //           flex:1; background:none; border:none; outline:none;
// //           color:#e2e8f0; font-size:13px; font-family:'JetBrains Mono',monospace;
// //         }
// //         .nb-mob-inp::placeholder { color:rgba(148,163,184,.35); }
// //         .nb-mob-link {
// //           display:flex; align-items:center; gap:9px; padding:11px 14px;
// //           border-radius:9px; font-size:14px; font-weight:600;
// //           color:rgba(148,163,184,.7); text-decoration:none;
// //           transition:all .2s; border:1px solid transparent;
// //           font-family:'Space Grotesk',sans-serif;
// //         }
// //         .nb-mob-link:hover { color:#e2e8f0; background:rgba(226,232,240,.05); }
// //         .nb-mob-link.active { color:#e2e8f0; background:rgba(226,232,240,.06); border-color:rgba(226,232,240,.12); }
// //         .nb-mob-div { height:1px; background:rgba(226,232,240,.06); margin:8px 0; }
// //         .nb-mob-streak {
// //           display:flex; align-items:center; gap:8px; padding:11px 14px;
// //           border-radius:9px; background:rgba(249,115,22,.06);
// //           border:1px solid rgba(249,115,22,.12); cursor:pointer; transition:all .2s;
// //         }
// //         .nb-mob-streak:hover { background:rgba(249,115,22,.1); }
// //       `}</style>
// //
// //             <motion.nav
// //                 initial={{ y: -100, opacity: 0 }}
// //                 animate={{ y: 0, opacity: 1 }}
// //                 transition={{ duration: 0.5, ease: 'easeOut' }}
// //                 className="nb-grid nb-line"
// //                 style={{
// //                     position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50,
// //                     background: scrolled ? 'rgba(6,8,14,.97)' : 'rgba(6,8,14,.85)',
// //                     backdropFilter: 'blur(24px)',
// //                     borderBottom: scrolled ? '1px solid rgba(226,232,240,.07)' : 'none',
// //                     boxShadow: scrolled ? '0 4px 40px rgba(0,0,0,.5)' : 'none',
// //                     transition: 'all .3s',
// //                 }}
// //             >
// //                 <div style={{ maxWidth: 1380, margin: '0 auto', padding: '0 24px' }}>
// //                     <div style={{ display: 'flex', alignItems: 'center', height: 72, gap: 0 }}>
// //
// //                         {/* ── HAMBURGER ── */}
// //                         <button
// //                             className={`nb-ham ${mobileOpen ? 'open' : ''}`}
// //                             onClick={() => setMobileOpen(!mobileOpen)}
// //                             style={{ marginRight: 14 }}
// //                         >
// //                             <span className="nb-ham-line" />
// //                             <span className="nb-ham-line" />
// //                             <span className="nb-ham-line" />
// //                         </button>
// //
// //                         {/* ── LOGO ── */}
// //                         <Link
// //                             to="/"
// //                             style={{ display: 'flex', alignItems: 'center', gap: 14, textDecoration: 'none', flexShrink: 0, marginRight: 28 }}
// //                         >
// //                             <AlgoMateLogo size={46} />
// //                             <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
// //                                 <div style={{ fontSize: 21, fontWeight: 800, letterSpacing: '-.03em', lineHeight: 1 }}>
// //                                     <span className="nb-logo-shimmer">AlgoMate</span>
// //                                     <span className="nb-cursor">_</span>
// //                                 </div>
// //                                 <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
// //                   <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(148,163,184,.38)', letterSpacing: '.12em' }}>
// //                     v1.0 · DSA Platform
// //                   </span>
// //                                     <span className="nb-beta">BETA</span>
// //                                 </div>
// //                                 <div className="nb-underline" />
// //                             </div>
// //                         </Link>
// //
// //                         {/* ── DESKTOP NAV LINKS ── */}
// //                         <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
// //                             {navLinks.map(({ label, href, icon: Icon }) => (
// //                                 <Link
// //                                     key={href}
// //                                     to={href}
// //                                     className={`nb-link ${isActive(href) ? 'active' : ''}`}
// //                                 >
// //                                     <Icon size={15} style={{ opacity: isActive(href) ? 1 : .5 }} />
// //                                     {label}
// //                                 </Link>
// //                             ))}
// //                         </div>
// //
// //                         <div style={{ flex: 1 }} />
// //
// //                         {/* ── RIGHT SIDE ── */}
// //                         <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
// //
// //                             {/* Streak */}
// //                             <div
// //                                 className="nb-streak"
// //                                 onClick={() => navigate('/problems/daily-challenge')}
// //                                 title="Go to today's daily challenge"
// //                             >
// //                                 <Flame size={15} className="nb-flame" />
// //                                 <span>{streak} day streak</span>
// //                             </div>
// //
// //                             <div style={{ width: 1, height: 22, background: 'rgba(226,232,240,.08)' }} />
// //
// //                             {/* Search */}
// //                             <div style={{ position: 'relative' }} ref={searchRef}>
// //                                 {!searchOpen ? (
// //                                     <div
// //                                         className="nb-search-box"
// //                                         onClick={() => {
// //                                             setSearchOpen(true)
// //                                             setTimeout(() => searchInputRef.current?.focus(), 50)
// //                                         }}
// //                                     >
// //                                         <Search size={13} style={{ color: 'rgba(148,163,184,.5)', flexShrink: 0 }} />
// //                                         <span className="nb-search-ph">Search problems...</span>
// //                                         <span className="nb-kbd">Ctrl K</span>
// //                                     </div>
// //                                 ) : (
// //                                     <div className="nb-search-exp">
// //                                         <div className="nb-search-row">
// //                                             <Search size={14} style={{ color: '#60a5fa', flexShrink: 0 }} />
// //                                             <input
// //                                                 ref={searchInputRef}
// //                                                 className="nb-search-inp"
// //                                                 placeholder="Search problems, topics..."
// //                                                 value={searchQuery}
// //                                                 onChange={e => setSearchQuery(e.target.value)}
// //                                                 onKeyDown={e => {
// //                                                     if (e.key === 'Enter' && searchQuery) {
// //                                                         navigate(`/problems?search=${searchQuery}`)
// //                                                         setSearchOpen(false)
// //                                                         setSearchQuery('')
// //                                                     }
// //                                                 }}
// //                                             />
// //                                             {searchQuery && (
// //                                                 <div style={{ display: 'flex', gap: 3 }}>
// //                                                     <div className="nb-dot" /><div className="nb-dot" /><div className="nb-dot" />
// //                                                 </div>
// //                                             )}
// //                                             <span
// //                                                 style={{ fontSize: 10, color: 'rgba(148,163,184,.35)', fontFamily: "'JetBrains Mono',monospace", cursor: 'pointer' }}
// //                                                 onClick={() => { setSearchOpen(false); setSearchQuery('') }}
// //                                             >Esc</span>
// //                                         </div>
// //                                         <div className="nb-search-dd">
// //                                             {!searchQuery.trim() ? (
// //                                                 <>
// //                                                     <div className="nb-search-sec">RECENT SEARCHES</div>
// //                                                     {RECENT_SEARCHES.map((t, i) => (
// //                                                         <div key={i} className="nb-search-item" onClick={() => setSearchQuery(t)}>
// //                                                             <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //                                                                 <Search size={12} style={{ color: 'rgba(148,163,184,.3)' }} />
// //                                                                 <span style={{ fontSize: 13, color: 'rgba(226,232,240,.6)' }}>{t}</span>
// //                                                             </div>
// //                                                         </div>
// //                                                     ))}
// //                                                     <div className="nb-search-sec" style={{ borderTop: '1px solid rgba(226,232,240,.05)', marginTop: 4 }}>
// //                                                         POPULAR TOPICS
// //                                                     </div>
// //                                                     <div style={{ padding: '8px 14px', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
// //                                                         {POPULAR_TOPICS.map((t, i) => (
// //                                                             <span key={i} className="nb-topic-chip" onClick={() => setSearchQuery(t)}>#{t}</span>
// //                                                         ))}
// //                                                     </div>
// //                                                 </>
// //                                             ) : searchResults.length > 0 ? (
// //                                                 searchResults.map((p, i) => (
// //                                                     <div
// //                                                         key={i}
// //                                                         className="nb-search-item"
// //                                                         onClick={() => {
// //                                                             navigate('/problems')
// //                                                             setSearchOpen(false)
// //                                                             setSearchQuery('')
// //                                                         }}
// //                                                     >
// //                                                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //                                                             <FileText size={13} style={{ color: 'rgba(148,163,184,.4)' }} />
// //                                                             <span style={{ fontSize: 13, color: '#e2e8f0', fontWeight: 500 }}>{p.title}</span>
// //                                                         </div>
// //                                                         <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //                                                             <span style={{ fontSize: 10, color: 'rgba(148,163,184,.4)', fontFamily: "'JetBrains Mono',monospace" }}>{p.topic}</span>
// //                                                             <span style={{ fontSize: 10, fontWeight: 700, color: diffColor(p.difficulty), fontFamily: "'JetBrains Mono',monospace" }}>
// //                                 {p.difficulty}
// //                               </span>
// //                                                         </div>
// //                                                     </div>
// //                                                 ))
// //                                             ) : (
// //                                                 <div className="nb-search-empty">No results for "{searchQuery}"</div>
// //                                             )}
// //                                         </div>
// //                                     </div>
// //                                 )}
// //                             </div>
// //
// //                             {/* Theme Toggle */}
// //                             <button className="nb-icon-btn" onClick={() => setIsDark(!isDark)} title="Toggle theme">
// //                                 <AnimatePresence mode="wait">
// //                                     {isDark ? (
// //                                         <motion.div key="moon" initial={{ rotate: -30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 30, opacity: 0 }} transition={{ duration: .18 }}>
// //                                             <Moon size={16} />
// //                                         </motion.div>
// //                                     ) : (
// //                                         <motion.div key="sun" initial={{ rotate: 30, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -30, opacity: 0 }} transition={{ duration: .18 }}>
// //                                             <Sun size={16} style={{ color: '#fbbf24' }} />
// //                                         </motion.div>
// //                                     )}
// //                                 </AnimatePresence>
// //                             </button>
// //
// //                             {/* Notifications */}
// //                             <div style={{ position: 'relative' }}>
// //                                 <button
// //                                     className="nb-icon-btn"
// //                                     onClick={() => setNotifOpen(!notifOpen)}
// //                                     title="Notifications"
// //                                 >
// //                                     <Bell size={16} />
// //                                     {unreadCount > 0 && <span className="nb-notif-dot" />}
// //                                 </button>
// //
// //                                 <AnimatePresence>
// //                                     {notifOpen && (
// //                                         <motion.div
// //                                             initial={{ opacity: 0, y: -8, scale: .97 }}
// //                                             animate={{ opacity: 1, y: 0, scale: 1 }}
// //                                             exit={{ opacity: 0, y: -8, scale: .97 }}
// //                                             transition={{ duration: .15 }}
// //                                             className="nb-notif-dd"
// //                                         >
// //                                             <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '13px 15px 11px', borderBottom: '1px solid rgba(226,232,240,.07)' }}>
// //                                                 <span style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0' }}>Notifications</span>
// //                                                 <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
// //                                                     {unreadCount > 0 && (
// //                                                         <span style={{ fontSize: 10, padding: '1px 7px', borderRadius: 10, background: 'rgba(96,165,250,.12)', color: '#60a5fa', border: '1px solid rgba(96,165,250,.2)', fontFamily: "'JetBrains Mono',monospace" }}>
// //                               {unreadCount} new
// //                             </span>
// //                                                     )}
// //                                                     <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(148,163,184,.5)', padding: 0, display: 'flex' }}>
// //                                                         <XIcon size={14} />
// //                                                     </button>
// //                                                 </div>
// //                                             </div>
// //                                             {notifications.map(n => (
// //                                                 <div key={n.id} className={`nb-notif-item ${n.unread ? 'unread' : ''}`}>
// //                                                     <span style={{ fontSize: 17, lineHeight: 1, marginTop: 1 }}>{n.icon}</span>
// //                                                     <div style={{ flex: 1 }}>
// //                                                         <p style={{ fontSize: 12.5, color: n.unread ? '#e2e8f0' : 'rgba(148,163,184,.65)', margin: 0, lineHeight: 1.45 }}>{n.text}</p>
// //                                                         <p style={{ fontSize: 10, fontFamily: "'JetBrains Mono',monospace", color: 'rgba(148,163,184,.35)', margin: '3px 0 0' }}>{n.time}</p>
// //                                                     </div>
// //                                                     {n.unread && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#60a5fa', flexShrink: 0, marginTop: 5 }} />}
// //                                                 </div>
// //                                             ))}
// //                                             <div style={{ padding: '10px 15px', borderTop: '1px solid rgba(226,232,240,.07)', textAlign: 'center' }}>
// //                         <span style={{ fontSize: 11, color: '#60a5fa', cursor: 'pointer', fontFamily: "'JetBrains Mono',monospace" }}>
// //                           View all notifications →
// //                         </span>
// //                                             </div>
// //                                         </motion.div>
// //                                     )}
// //                                 </AnimatePresence>
// //                             </div>
// //
// //                             <div style={{ width: 1, height: 22, background: 'rgba(226,232,240,.08)' }} />
// //
// //                             {/* Auth */}
// //                             {isAuthenticated ? (
// //                                 <DropdownMenu>
// //                                     <DropdownMenuTrigger asChild>
// //                                         <button style={{
// //                                             display: 'flex', alignItems: 'center', gap: 9,
// //                                             padding: '6px 12px', borderRadius: 10,
// //                                             background: 'rgba(226,232,240,.04)',
// //                                             border: '1px solid rgba(226,232,240,.09)',
// //                                             cursor: 'pointer', transition: 'all .2s',
// //                                         }}>
// //                                             <Avatar style={{ width: 30, height: 30, border: '1px solid rgba(226,232,240,.12)' }}>
// //                                                 <AvatarImage src={user?.avatarUrl} />
// //                                                 <AvatarFallback style={{ background: 'rgba(226,232,240,.08)', color: '#e2e8f0', fontSize: 12, fontWeight: 700 }}>
// //                                                     {user?.username?.[0]?.toUpperCase() || 'U'}
// //                                                 </AvatarFallback>
// //                                             </Avatar>
// //                                             <div style={{ textAlign: 'left' }}>
// //                                                 <p style={{ color: '#e2e8f0', fontSize: 13, fontWeight: 600, margin: 0, lineHeight: 1 }}>{user?.username}</p>
// //                                                 <p style={{ color: 'rgba(148,163,184,.5)', fontSize: 10, margin: '2px 0 0', fontFamily: "'JetBrains Mono',monospace" }}>
// //                                                     ⭐ {user?.rating || 0} pts
// //                                                 </p>
// //                                             </div>
// //                                             <ChevronDown size={12} style={{ color: 'rgba(148,163,184,.45)' }} />
// //                                         </button>
// //                                     </DropdownMenuTrigger>
// //                                     <DropdownMenuContent align="end" style={{ width: 190, background: '#0d1117', border: '1px solid rgba(226,232,240,.09)', color: '#e2e8f0', borderRadius: 10 }}>
// //                                         <DropdownMenuItem onClick={() => navigate('/profile')} style={{ cursor: 'pointer', gap: 8, color: 'rgba(203,213,225,.8)', fontSize: 13 }}>
// //                                             <User size={13} /> Profile
// //                                         </DropdownMenuItem>
// //                                         {isAdmin && (
// //                                             <DropdownMenuItem onClick={() => navigate('/admin')} style={{ cursor: 'pointer', gap: 8, color: 'rgba(203,213,225,.8)', fontSize: 13 }}>
// //                                                 <LayoutDashboard size={13} /> Admin Panel
// //                                             </DropdownMenuItem>
// //                                         )}
// //                                         <DropdownMenuSeparator style={{ background: 'rgba(226,232,240,.07)' }} />
// //                                         <DropdownMenuItem onClick={logout} style={{ cursor: 'pointer', gap: 8, color: '#f87171', fontSize: 13 }}>
// //                                             <LogOut size={13} /> Logout
// //                                         </DropdownMenuItem>
// //                                     </DropdownMenuContent>
// //                                 </DropdownMenu>
// //                             ) : (
// //                                 <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
// //                                     <button className="nb-btn-ghost" onClick={() => navigate('/login')}>Login</button>
// //                                     <button className="nb-btn-primary" onClick={() => navigate('/signup')}>Sign Up →</button>
// //                                 </div>
// //                             )}
// //                         </div>
// //                     </div>
// //                 </div>
// //
// //                 {/* ── MOBILE MENU ── */}
// //                 <AnimatePresence>
// //                     {mobileOpen && (
// //                         <motion.div
// //                             initial={{ opacity: 0, height: 0 }}
// //                             animate={{ opacity: 1, height: 'auto' }}
// //                             exit={{ opacity: 0, height: 0 }}
// //                             transition={{ duration: 0.2 }}
// //                             className="nb-mobile"
// //                         >
// //                             {/* Mobile Search */}
// //                             <div className="nb-mob-search">
// //                                 <Search size={14} style={{ color: 'rgba(148,163,184,.5)', flexShrink: 0 }} />
// //                                 <input
// //                                     ref={mobileSearchRef}
// //                                     className="nb-mob-inp"
// //                                     placeholder="Search problems..."
// //                                     onKeyDown={e => {
// //                                         if (e.key === 'Enter' && e.target.value) {
// //                                             navigate(`/problems?search=${e.target.value}`)
// //                                             setMobileOpen(false)
// //                                         }
// //                                     }}
// //                                 />
// //                             </div>
// //
// //                             {/* Nav Links */}
// //                             {navLinks.map(({ label, href, icon: Icon }) => (
// //                                 <Link
// //                                     key={href}
// //                                     to={href}
// //                                     className={`nb-mob-link ${isActive(href) ? 'active' : ''}`}
// //                                 >
// //                                     <Icon size={15} style={{ opacity: isActive(href) ? 1 : .5 }} />
// //                                     {label}
// //                                 </Link>
// //                             ))}
// //
// //                             {/* Streak */}
// //                             <div
// //                                 className="nb-mob-streak"
// //                                 onClick={() => { navigate('/problems/daily-challenge'); setMobileOpen(false) }}
// //                             >
// //                                 <Flame size={15} style={{ color: '#fb923c' }} />
// //                                 <span style={{ fontSize: 13, fontWeight: 600, color: '#fb923c' }}>
// //                   {streak} day streak — Solve today's challenge →
// //                 </span>
// //                             </div>
// //
// //                             <div className="nb-mob-div" />
// //
// //                             {/* Auth */}
// //                             {isAuthenticated ? (
// //                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// //                                     <button
// //                                         onClick={() => { navigate('/profile'); setMobileOpen(false) }}
// //                                         style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', color: '#e2e8f0', background: 'rgba(226,232,240,.04)', border: '1px solid rgba(226,232,240,.1)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontFamily: "'Space Grotesk',sans-serif" }}
// //                                     >
// //                                         <User size={13} /> Profile
// //                                     </button>
// //                                     <button
// //                                         onClick={logout}
// //                                         style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', color: '#f87171', background: 'rgba(248,113,113,.08)', border: '1px solid rgba(248,113,113,.15)', borderRadius: 9, cursor: 'pointer', fontSize: 13, fontFamily: "'Space Grotesk',sans-serif" }}
// //                                     >
// //                                         <LogOut size={13} /> Logout
// //                                     </button>
// //                                 </div>
// //                             ) : (
// //                                 <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
// //                                     <button
// //                                         className="nb-btn-ghost"
// //                                         style={{ width: '100%', textAlign: 'center', padding: '11px' }}
// //                                         onClick={() => { navigate('/login'); setMobileOpen(false) }}
// //                                     >Login</button>
// //                                     <button
// //                                         className="nb-btn-primary"
// //                                         style={{ width: '100%', textAlign: 'center', padding: '11px' }}
// //                                         onClick={() => { navigate('/signup'); setMobileOpen(false) }}
// //                                     >Sign Up →</button>
// //                                 </div>
// //                             )}
// //                         </motion.div>
// //                     )}
// //                 </AnimatePresence>
// //             </motion.nav>
// //         </>
// //     )
// // }
// //
// // export default Navbar