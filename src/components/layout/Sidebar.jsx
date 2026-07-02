import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Users, PenSquare, History, Settings, Mail } from 'lucide-react'

export const NAV = [
  { to: '/', label: 'Recipients', icon: Users, end: true },
  { to: '/compose', label: 'Compose', icon: PenSquare },
  { to: '/send', label: 'Send', icon: LayoutDashboard },
  { to: '/history', label: 'History', icon: History },
  { to: '/settings', label: 'Settings', icon: Settings },
]

export function Sidebar() {
  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2 px-5 h-16 border-b border-slate-100 dark:border-slate-800">
        <div className="h-8 w-8 rounded-lg bg-brand-600 flex items-center justify-center text-white">
          <Mail size={18} />
        </div>
        <span className="font-semibold text-slate-900 dark:text-slate-100">ApplyFlow</span>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
              }`
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>
      <div className="px-5 py-4 text-xs text-slate-400 border-t border-slate-100 dark:border-slate-800">
        One email per recipient. Never CC/BCC.
      </div>
    </aside>
  )
}
