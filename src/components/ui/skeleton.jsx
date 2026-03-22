// src/components/ui/skeleton.jsx
import { motion } from 'framer-motion'

const shimmer = {
  animate: { backgroundPosition:['200% center','-200% center'] },
  transition: { duration:1.6, repeat:Infinity, ease:'linear' },
}

const Skeleton = ({ width = '100%', height = 14, borderRadius = 6, delay = 0, style: extra = {} }) => (
    <motion.div
        animate={shimmer.animate}
        transition={{ ...shimmer.transition, delay }}
        style={{
          width, height, borderRadius,
          background:'linear-gradient(90deg,rgba(226,232,240,.05) 25%,rgba(226,232,240,.1) 50%,rgba(226,232,240,.05) 75%)',
          backgroundSize:'200% auto',
          ...extra,
        }}
    />
)

export const SkeletonText = ({ lines = 3, lastWidth = '60%' }) => (
    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
      {Array(lines).fill(0).map((_,i) => (
          <Skeleton key={i} width={i===lines-1 ? lastWidth : '100%'} delay={i*.08}/>
      ))}
    </div>
)

export const SkeletonCard = ({ rows = 3 }) => (
    <div style={{ padding:'18px', borderRadius:12, background:'rgba(226,232,240,.03)', border:'1px solid rgba(226,232,240,.07)', display:'flex', flexDirection:'column', gap:10 }}>
      <Skeleton width="55%" height={16} delay={0}/>
      {Array(rows-1).fill(0).map((_,i) => (
          <Skeleton key={i} width={i===rows-2 ? '35%' : '100%'} delay={(i+1)*.08}/>
      ))}
    </div>
)

export const SkeletonTable = ({ rows = 5, cols = 4 }) => (
    <div style={{ borderRadius:12, border:'1px solid rgba(226,232,240,.07)', overflow:'hidden' }}>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:12, padding:'10px 16px', background:'rgba(226,232,240,.025)', borderBottom:'1px solid rgba(226,232,240,.07)' }}>
        {Array(cols).fill(0).map((_,i) => <Skeleton key={i} height={10} delay={i*.04}/>)}
      </div>
      {Array(rows).fill(0).map((_,i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:`repeat(${cols},1fr)`, gap:12, padding:'14px 16px', borderBottom:'1px solid rgba(226,232,240,.05)' }}>
            {Array(cols).fill(0).map((_,j) => <Skeleton key={j} height={12} width={j===0?'60%':'100%'} delay={(i*cols+j)*.03}/>)}
          </div>
      ))}
    </div>
)

export default Skeleton