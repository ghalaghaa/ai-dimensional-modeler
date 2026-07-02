import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Users, PenSquare, History, Settings, Mail } from 'lucide-react'

export const NAV = [
  { to: '/', label: 'Recipients', icon: Users, end: true },
  { to: '/compose', label: 'Compose', icon: PenSquare },
  { to: '/send', label: 'Send', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  const { pathname } = useLocation()

  return (
    <aside className="hidden md:flex md:w-64 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 relative">
      <div className="flex items-center gap-2.5 px-5 h-16 border-b border-slate-100 dark:border-slate-800">
        <div className="h-9 w-9 rounded-xl bg-brand-gradient flex items-center justify-center text-white shadow-glow shrink-0">
          <Mail size={18} strokeWidth={2.25} />
        </div>
        <div className="min-w-0">
          <span className="font-semibold text-slate-900 dark:text-slate-100 tracking-tight block leading-tight">ApplyFlow</span>
          <span className="text-[11px] text-slate-400 leading-tight">Job application sender</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => {
          const isActive = end ? pathname === to : pathname.startsWith(to)
          return (
            <NavLink
              key={to}
              to={to}
              end={end}
              className="relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors group"
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-active"
                  className="absolute inset-0 rounded-xl bg-brand-50 dark:bg-brand-500/10"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              <Icon
                size={18}
                className={`relative shrink-0 transition-colors ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`}
              />
              <span className={`relative transition-colors ${isActive ? 'text-brand-700 dark:text-brand-300' : 'text-slate-600 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-slate-100'}`}>
                {label}
              </span>
            </NavLink>
          )
        })}
      </nav>
      <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800 flex items-center gap-1.5">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        One email per recipient. Never CC/BCC.
      </div>
    </aside>
  )
}
