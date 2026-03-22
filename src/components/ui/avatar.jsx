// src/components/ui/avatar.jsx
import { motion } from 'framer-motion'

const Avatar = ({ src, name, size = 36, showStatus = false, status = 'online' }) => {
    const letter  = name?.[0]?.toUpperCase() || '?'
    const hue     = name ? [...name].reduce((a,c) => a + c.charCodeAt(0), 0) % 360 : 200

    const statusColors = { online:'#22c55e', away:'#f59e0b', offline:'rgba(148,163,184,.4)' }

    return (
        <motion.div
            whileHover={{ scale:1.08 }}
            style={{ position:'relative', width:size, height:size, flexShrink:0 }}
        >
            {src ? (
                <img
                    src={src}
                    alt={name}
                    style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:`2px solid hsl(${hue},40%,26%)` }}
                />
            ) : (
                <div style={{
                    width:size, height:size, borderRadius:'50%',
                    background:`hsl(${hue},40%,16%)`,
                    color:`hsl(${hue},70%,65%)`,
                    border:`2px solid hsl(${hue},40%,26%)`,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:size * .38, fontWeight:800,
                    fontFamily:"'JetBrains Mono',monospace",
                }}>
                    {letter}
                </div>
            )}

            {showStatus && (
                <motion.div
                    initial={{ scale:0 }}
                    animate={{ scale:1 }}
                    style={{
                        position:'absolute', bottom:0, right:0,
                        width:size * .28, height:size * .28,
                        borderRadius:'50%',
                        background: statusColors[status] || statusColors.offline,
                        border:`2px solid #06080e`,
                    }}
                />
            )}
        </motion.div>
    )
}

export const AvatarGroup = ({ users = [], max = 4, size = 32 }) => {
    const visible = users.slice(0, max)
    const extra   = users.length - max

    return (
        <div style={{ display:'flex', alignItems:'center' }}>
            {visible.map((u, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity:0, x:-10 }}
                    animate={{ opacity:1, x:0 }}
                    transition={{ delay:i*.05 }}
                    style={{ marginLeft: i===0 ? 0 : -size*.3, zIndex: visible.length - i }}
                >
                    <Avatar name={u.username || u.name} src={u.avatarUrl} size={size}/>
                </motion.div>
            ))}
            {extra > 0 && (
                <div style={{ marginLeft:-size*.3, width:size, height:size, borderRadius:'50%', background:'rgba(226,232,240,.08)', border:'2px solid rgba(226,232,240,.12)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.3, fontWeight:700, color:'rgba(148,163,184,.6)', fontFamily:"'JetBrains Mono',monospace" }}>
                    +{extra}
                </div>
            )}
        </div>
    )
}

export { Avatar as default, Avatar }