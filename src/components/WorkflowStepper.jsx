import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Check, Users, PenSquare, Send } from 'lucide-react'
import { useRecipients } from '../context/RecipientsContext'
import { useDraft } from '../context/DraftContext'

const STEPS = [
  { key: 'recipients', to: '/', label: 'Recipients', icon: Users },
  { key: 'compose', to: '/compose', label: 'Compose', icon: PenSquare },
  { key: 'send', to: '/send', label: 'Send', icon: Send },
]

export function WorkflowStepper() {
  const { pathname } = useLocation()
  const { selectedIds } = useRecipients()
  const { draft } = useDraft()

  const hasRecipients = selectedIds.size > 0
  const hasCompose = Boolean(draft.subject.trim() && draft.bodyHtml && draft.bodyHtml !== '<p></p>')

  const activeIndex = STEPS.findIndex((s) => (s.to === '/' ? pathname === '/' : pathname.startsWith(s.to)))
  const completed = [hasRecipients, hasCompose, false]

  return (
    <div className="flex items-center gap-2 md:gap-4 px-4 md:px-8 py-3 border-b border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur overflow-x-auto">
      {STEPS.map((step, i) => {
        const isActive = i === activeIndex
        const isDone = completed[i] && !isActive
        const Icon = step.icon
        return (
          <div key={step.key} className="flex items-center gap-2 md:gap-4 shrink-0">
            <Link to={step.to} className="flex items-center gap-2 group">
              <span className="relative flex items-center justify-center h-8 w-8 rounded-full shrink-0">
                {isActive && (
                  <motion.span
                    layoutId="step-glow"
                    className="absolute inset-0 rounded-full bg-brand-gradient"
                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  />
                )}
                <span
                  className={`relative flex items-center justify-center h-8 w-8 rounded-full text-xs font-semibold transition-colors ${
                    isActive
                      ? 'text-white'
                      : isDone
                        ? 'bg-emerald-500 text-white'
                        : 'bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 group-hover:bg-slate-200 dark:group-hover:bg-slate-700'
                  }`}
                >
                  {isDone ? <Check size={15} /> : <Icon size={14} />}
                </span>
              </span>
              <span
                className={`text-sm font-medium hidden sm:inline transition-colors ${
                  isActive ? 'text-slate-900 dark:text-slate-100' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300'
                }`}
              >
                {step.label}
              </span>
            </Link>
            {i < STEPS.length - 1 && <div className="w-6 md:w-10 h-px bg-slate-200 dark:bg-slate-700" />}
          </div>
        )
      })}
    </div>
  )
}
