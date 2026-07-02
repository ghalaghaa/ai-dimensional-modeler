import { NavLink } from 'react-router-dom'
import { NAV } from './Sidebar'

export function MobileNav() {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      {NAV.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          className={({ isActive }) =>
            `flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium ${
              isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'
            }`
          }
        >
          <Icon size={18} />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}
