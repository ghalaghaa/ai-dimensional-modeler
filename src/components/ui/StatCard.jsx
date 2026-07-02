import { useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate } from 'framer-motion'

const TONES = {
  slate: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300',
  brand: 'bg-brand-gradient text-white shadow-glow',
  emerald: 'bg-gradient-to-br from-emerald-400 to-teal-500 text-white shadow-[0_8px_20px_-6px_rgba(16,185,129,0.5)]',
  rose: 'bg-gradient-to-br from-rose-400 to-red-500 text-white shadow-[0_8px_20px_-6px_rgba(244,63,94,0.5)]',
  amber: 'bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-[0_8px_20px_-6px_rgba(245,158,11,0.5)]',
}

function AnimatedNumber({ value }) {
  const isNumeric = typeof value === 'number'
  const motionValue = useMotionValue(0)
  const rounded = useTransform(motionValue, (v) => Math.round(v).toLocaleString())
  const [display, setDisplay] = useState(isNumeric ? 0 : value)

  useEffect(() => {
    if (!isNumeric) {
      setDisplay(value)
      return
    }
    const controls = animate(motionValue, value, { duration: 0.5, ease: 'easeOut' })
    const unsub = rounded.on('change', setDisplay)
    return () => {
      controls.stop()
      unsub()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value])

  return <>{display}</>
}

export function StatCard({ label, value, icon: Icon, tone = 'slate' }) {
  const ref = useRef(null)
  return (
    <motion.div
      ref={ref}
      layout
      whileHover={{ y: -2 }}
      className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 flex items-center gap-2.5 shadow-soft dark:shadow-soft-dark transition-shadow hover:shadow-glow min-w-0"
    >
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${TONES[tone]}`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <div className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{label}</div>
        <div className="text-lg font-semibold tabular-nums text-slate-900 dark:text-slate-100">
          <AnimatedNumber value={value} />
        </div>
      </div>
    </motion.div>
  )
}
