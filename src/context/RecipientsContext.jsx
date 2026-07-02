import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../api/client'

const RecipientsContext = createContext(null)

export function RecipientsProvider({ children }) {
  const [recipients, setRecipients] = useState([])
  const [selectedIds, setSelectedIds] = useState(() => new Set())
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    setLoading(true)
    try {
      const rows = await api.get('/recipients')
      setRecipients(rows)
      setSelectedIds((prev) => new Set([...prev].filter((id) => rows.some((r) => r.id === id))))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    refresh()
  }, [refresh])

  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const selectAll = useCallback(() => setSelectedIds(new Set(recipients.map((r) => r.id))), [recipients])
  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  const value = useMemo(
    () => ({ recipients, selectedIds, loading, refresh, toggleSelect, selectAll, clearSelection, setSelectedIds }),
    [recipients, selectedIds, loading, refresh, toggleSelect, selectAll, clearSelection]
  )

  return <RecipientsContext.Provider value={value}>{children}</RecipientsContext.Provider>
}

export const useRecipients = () => useContext(RecipientsContext)
