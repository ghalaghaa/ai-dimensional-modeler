import { Suspense, lazy } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { ToastProvider } from './context/ToastContext'
import { SocketProvider } from './context/SocketContext'
import { RecipientsProvider } from './context/RecipientsContext'
import { DraftProvider } from './context/DraftContext'
import { Sidebar } from './components/layout/Sidebar'
import { MobileNav } from './components/layout/MobileNav'
import { RecipientsPage } from './pages/RecipientsPage'
import { SendPage } from './pages/SendPage'
import { HistoryPage } from './pages/HistoryPage'
import { SettingsPage } from './pages/SettingsPage'

const ComposePage = lazy(() => import('./pages/ComposePage').then((m) => ({ default: m.ComposePage })))

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <SocketProvider>
          <RecipientsProvider>
            <DraftProvider>
              <div className="flex h-screen overflow-hidden">
                <Sidebar />
                <div className="flex-1 flex flex-col overflow-hidden pb-14 md:pb-0">
                  <main className="flex-1 overflow-y-auto">
                    <Suspense fallback={<div className="p-8 text-sm text-slate-400">Loading…</div>}>
                      <Routes>
                        <Route path="/" element={<RecipientsPage />} />
                        <Route path="/compose" element={<ComposePage />} />
                        <Route path="/send" element={<SendPage />} />
                        <Route path="/send/:campaignId" element={<SendPage />} />
                        <Route path="/history" element={<HistoryPage />} />
                        <Route path="/settings" element={<SettingsPage />} />
                      </Routes>
                    </Suspense>
                  </main>
                </div>
                <MobileNav />
              </div>
            </DraftProvider>
          </RecipientsProvider>
        </SocketProvider>
      </ToastProvider>
    </ThemeProvider>
  )
}
