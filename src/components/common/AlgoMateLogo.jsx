const AlgoMateLogo = ({ size = 44 }) => {
    return (
        <>
            <style>{`
        @keyframes amRing1 {
          0%,100% { transform:scale(1); opacity:.2; }
          50% { transform:scale(1.2); opacity:.5; }
        }
        @keyframes amRing2 {
          0%,100% { transform:scale(1); opacity:.12; }
          50% { transform:scale(1.3); opacity:.35; }
        }
        @keyframes amOrbit1 {
          0% { transform:rotate(0deg) translateX(28px) rotate(0deg); }
          100% { transform:rotate(360deg) translateX(28px) rotate(-360deg); }
        }
        @keyframes amOrbit2 {
          0% { transform:rotate(120deg) translateX(28px) rotate(-120deg); }
          100% { transform:rotate(480deg) translateX(28px) rotate(-480deg); }
        }
        @keyframes amOrbit3 {
          0% { transform:rotate(240deg) translateX(28px) rotate(-240deg); }
          100% { transform:rotate(600deg) translateX(28px) rotate(-600deg); }
        }
        @keyframes amScan {
          0% { top:0; opacity:0; }
          20% { opacity:.6; }
          80% { opacity:.6; }
          100% { top:100%; opacity:0; }
        }
        @keyframes amBoxGlow {
          0%,100% { box-shadow:0 0 8px rgba(226,232,240,.2), inset 0 0 8px rgba(96,165,250,.04); }
          50% { box-shadow:0 0 20px rgba(226,232,240,.4), inset 0 0 14px rgba(96,165,250,.08); }
        }
        @keyframes amTextPulse {
          0%,100% { opacity:.7; transform:scale(1); }
          50% { opacity:1; transform:scale(1.06); }
        }
        @keyframes amShieldGlow {
          0%,100% { opacity:.1; }
          50% { opacity:.22; }
        }
        .am-r1 { animation: amRing1 2s ease-in-out infinite; }
        .am-r2 { animation: amRing2 2.5s ease-in-out infinite .4s; }
        .am-d1 { animation: amOrbit1 5s linear infinite; }
        .am-d2 { animation: amOrbit2 5s linear infinite; }
        .am-d3 { animation: amOrbit3 5s linear infinite; }
        .am-scan { animation: amScan 3.5s ease-in-out infinite; }
        .am-box { animation: amBoxGlow 2.5s ease-in-out infinite; }
        .am-txt { animation: amTextPulse 2.5s ease-in-out infinite; }
        .am-shield { animation: amShieldGlow 2s ease-in-out infinite; }
      `}</style>

            <div style={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
                {/* Rings */}
                <div className="am-r1" style={{
                    position: 'absolute', inset: -5,
                    borderRadius: '50%',
                    border: '1px solid rgba(226,232,240,.2)',
                }} />
                <div className="am-r2" style={{
                    position: 'absolute', inset: -11,
                    borderRadius: '50%',
                    border: '1px dashed rgba(96,165,250,.12)',
                }} />

                {/* Orbit dots */}
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="am-d1" style={{ width: 5, height: 5, background: '#e2e8f0', borderRadius: '50%', position: 'absolute', boxShadow: '0 0 5px rgba(226,232,240,.8)' }} />
                    <div className="am-d2" style={{ width: 4, height: 4, background: '#60a5fa', borderRadius: '50%', position: 'absolute', boxShadow: '0 0 5px #60a5fa' }} />
                    <div className="am-d3" style={{ width: 4, height: 4, background: '#94a3b8', borderRadius: '50%', position: 'absolute', boxShadow: '0 0 5px #94a3b8' }} />
                </div>

                {/* Main box */}
                <div className="am-box" style={{
                    position: 'absolute', inset: 0,
                    background: 'linear-gradient(135deg, rgba(226,232,240,.08), rgba(96,165,250,.06))',
                    borderRadius: 10,
                    border: '1px solid rgba(226,232,240,.15)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                }}>
                    {/* Scan line */}
                    <div className="am-scan" style={{
                        position: 'absolute', left: 0, right: 0, height: 1.5,
                        background: 'linear-gradient(90deg, transparent, rgba(226,232,240,.7), transparent)',
                    }} />
                    {/* Shield SVG */}
                    <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 80 80" fill="none" style={{ zIndex: 1 }}>
                        <defs>
                            <linearGradient id="icyGrad" x1="0" y1="0" x2="80" y2="80" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#e2e8f0" />
                                <stop offset="100%" stopColor="#60a5fa" />
                            </linearGradient>
                        </defs>
                        <path
                            className="am-shield"
                            d="M40 14 L60 23 L60 44 C60 57 40 67 40 67 C40 67 20 57 20 44 L20 23 Z"
                            fill="url(#icyGrad)"
                        />
                        <path
                            d="M40 14 L60 23 L60 44 C60 57 40 67 40 67 C40 67 20 57 20 44 L20 23 Z"
                            fill="none"
                            stroke="url(#icyGrad)"
                            strokeWidth="2"
                        />
                        <path
                            d="M40 22 L53 28 L53 43 C53 51 40 58 40 58 C40 58 27 51 27 43 L27 28 Z"
                            fill="none"
                            stroke="url(#icyGrad)"
                            strokeWidth="1"
                            opacity=".4"
                        />
                        <text
                            className="am-txt"
                            x="40" y="48"
                            textAnchor="middle"
                            fontFamily="monospace"
                            fontSize="15"
                            fontWeight="700"
                            fill="#e2e8f0"
                        >&lt;/&gt;</text>
                    </svg>
                </div>
            </div>
        </>
    )
}

export default AlgoMateLogo