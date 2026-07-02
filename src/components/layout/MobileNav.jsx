import { NavLink, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { NAV } from './Sidebar'

export function MobileNav() {
  const { pathname } = useLocation()

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-20 flex border-t border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur">
      {NAV.map(({ to, label, icon: Icon, end }) => {
        const isActive = end ? pathname === to : pathname.startsWith(to)
        return (
          <NavLink key={to} to={to} end={end} className="relative flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium">
            {isActive && (
              <motion.span layoutId="mobile-active" className="absolute top-0.5 h-0.5 w-8 rounded-full bg-brand-gradient" />
            )}
            <Icon size={18} className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'} />
            <span className={isActive ? 'text-brand-600 dark:text-brand-400' : 'text-slate-500 dark:text-slate-400'}>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
