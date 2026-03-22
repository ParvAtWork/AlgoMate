// src/components/user/AvatarUpload.jsx
import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, Upload, X, Check } from 'lucide-react'

const AvatarUpload = ({ name, src, size = 88, onUpload }) => {
    const [preview,   setPreview]   = useState(src || null)
    const [hovering,  setHovering]  = useState(false)
    const [uploading, setUploading] = useState(false)
    const [success,   setSuccess]   = useState(false)
    const inputRef = useRef(null)

    const hue    = name ? [...name].reduce((a,c) => a + c.charCodeAt(0), 0) % 360 : 200
    const letter = name?.[0]?.toUpperCase() || '?'

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return

        // Preview
        const reader = new FileReader()
        reader.onload = (ev) => setPreview(ev.target.result)
        reader.readAsDataURL(file)

        // Upload
        if (onUpload) {
            setUploading(true)
            try {
                await onUpload(file)
                setSuccess(true)
                setTimeout(() => setSuccess(false), 2000)
            } catch {}
            finally { setUploading(false) }
        }
    }

    return (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:10 }}>
            <motion.div
                onHoverStart={() => setHovering(true)}
                onHoverEnd={() => setHovering(false)}
                onClick={() => inputRef.current?.click()}
                whileHover={{ scale:1.04 }}
                whileTap={{ scale:.97 }}
                style={{ position:'relative', width:size, height:size, cursor:'pointer', borderRadius:'50%' }}
            >
                {/* Avatar */}
                {preview ? (
                    <img src={preview} alt={name} style={{ width:size, height:size, borderRadius:'50%', objectFit:'cover', border:`3px solid hsl(${hue},40%,26%)` }}/>
                ) : (
                    <div style={{ width:size, height:size, borderRadius:'50%', background:`hsl(${hue},40%,16%)`, color:`hsl(${hue},70%,65%)`, border:`3px solid hsl(${hue},40%,26%)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*.38, fontWeight:800, fontFamily:"'JetBrains Mono',monospace" }}>
                        {letter}
                    </div>
                )}

                {/* Hover overlay */}
                <AnimatePresence>
                    {hovering && (
                        <motion.div
                            initial={{ opacity:0 }}
                            animate={{ opacity:1 }}
                            exit={{ opacity:0 }}
                            style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,.6)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:4 }}
                        >
                            <Camera size={size*.22} style={{ color:'#fff' }}/>
                            <span style={{ fontSize:9, color:'rgba(255,255,255,.8)', fontFamily:"'JetBrains Mono',monospace" }}>Change</span>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload spinner */}
                {uploading && (
                    <div style={{ position:'absolute', inset:0, borderRadius:'50%', background:'rgba(0,0,0,.5)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <motion.div
                            animate={{ rotate:360 }}
                            transition={{ duration:.7, repeat:Infinity, ease:'linear' }}
                            style={{ width:size*.3, height:size*.3, border:`2px solid rgba(255,255,255,.2)`, borderTop:'2px solid #60a5fa', borderRadius:'50%' }}
                        />
                    </div>
                )}

                {/* Success tick */}
                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ scale:0 }}
                            animate={{ scale:1 }}
                            exit={{ scale:0 }}
                            style={{ position:'absolute', bottom:2, right:2, width:22, height:22, borderRadius:'50%', background:'#22c55e', border:'2px solid #06080e', display:'flex', alignItems:'center', justifyContent:'center' }}
                        >
                            <Check size={11} style={{ color:'#fff' }}/>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Camera badge */}
                {!hovering && !uploading && !success && (
                    <motion.div
                        initial={{ scale:0 }}
                        animate={{ scale:1 }}
                        style={{ position:'absolute', bottom:2, right:2, width:22, height:22, borderRadius:'50%', background:'rgba(96,165,250,.9)', border:'2px solid #06080e', display:'flex', alignItems:'center', justifyContent:'center' }}
                    >
                        <Camera size={10} style={{ color:'#fff' }}/>
                    </motion.div>
                )}
            </motion.div>

            <input
                ref={inputRef}
                type="file"
                accept="image/*"
                onChange={handleFile}
                style={{ display:'none' }}
            />

            <motion.button
                whileHover={{ scale:1.04 }}
                whileTap={{ scale:.97 }}
                onClick={() => inputRef.current?.click()}
                style={{ display:'flex', alignItems:'center', gap:6, padding:'5px 14px', borderRadius:8, background:'rgba(96,165,250,.08)', border:'1px solid rgba(96,165,250,.2)', color:'#60a5fa', fontSize:12, fontWeight:600, cursor:'pointer', fontFamily:"'Space Grotesk',sans-serif" }}
            >
                <Upload size={12}/> Upload Photo
            </motion.button>
        </div>
    )
}

export default AvatarUpload