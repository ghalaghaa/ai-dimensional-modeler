import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { SocketProvider } from './context/SocketContext'
import { RecipientsProvider } from './context/RecipientsContext'
import { DraftProvider } from './context/DraftContext'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { WorkflowStepper } from './components/WorkflowStepper'
import { RecipientsPage } from './pages/RecipientsPage'
import { SendPage } from './pages/SendPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

const ComposePage = lazy(() => import('./pages/ComposePage').then((m) => ({ default: m.ComposePage })))

const STEPPER_ROUTES = ['/', '/compose', '/send']

function AppShell() {
  const location = useLocation()
  const showStepper = STEPPER_ROUTES.includes(location.pathname)

  return (
    <div className="flex h-screen overflow-hidden bg-mesh-light dark:bg-mesh-dark bg-fixed">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
        {showStepper && <WorkflowStepper />}
        <main className="flex-1 overflow-y-auto">
          <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading…</div>}>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Routes>
                <Route path="/" element={<RecipientsPage />} />
                <Route path="/compose" element={<ComposePage />} />
                <Route path="/send" element={<SendPage />} />
                <Route path="/send/:campaignId" element={<SendPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Routes>
            </motion.div>
          </Suspense>
        </main>
      </div>
      <MobileNav />
    </div>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SocketProvider>
          <RecipientsProvider>
            <DraftProvider>
              <AppShell />
            </DraftProvider>
          </RecipientsProvider>
        </SocketProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
