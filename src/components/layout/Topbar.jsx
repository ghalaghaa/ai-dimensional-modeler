import { motion, AnimatePresence } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../context/ThemeContext'

export function Topbar({ title, subtitle, actions }) {
  const { theme, toggle } = useTheme()
  return (
    <header className="flex items-center justify-between h-16 px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-20">
      <div className="min-w-0">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-slate-100 tracking-tight">{title}</h1>
        <AnimatePresence mode="wait">
          {subtitle && (
            <motion.p
              key={typeof subtitle === 'string' ? subtitle : 'subtitle'}
              initial={{ opacity: 0, y: -2 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-sm text-slate-500 dark:text-slate-400 truncate"
            >
              {subtitle}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {actions}
        <button
          onClick={toggle}
          aria-label="Toggle theme"
          className="h-9 w-9 rounded-lg flex items-center justify-center text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>
    </header>
  )
}
