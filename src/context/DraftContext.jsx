import { createContext, useContext, useState } from 'react'

const DraftContext = createContext(null)

const initialDraft = {
  campaignName: '',
  subject: '',
  bodyHtml: '',
  attachmentIds: [],
  senderAccountId: '',
  delayMin: 20,
  delayMax: 60,
  aiEnabled: false,
  scheduledAt: '',
}

export function DraftProvider({ children }) {
  const [draft, setDraftState] = useState(initialDraft)

  const setDraft = (patch) => setDraftState((prev) => ({ ...prev, ...patch }))
  const resetDraft = () => setDraftState(initialDraft)

  return <DraftContext.Provider value={{ draft, setDraft, resetDraft }}>{children}</DraftContext.Provider>
}

export const useDraft = () => useContext(DraftContext)
