import { useEffect, useState, useCallback } from 'react'
import CategoryFilter from './components/CategoryFilter'
import OpportunityList from './components/OpportunityList'
import NewOpportunityForm from './components/NewOpportunityForm'
import { fetchOpportunities, applyToOpportunity, createOpportunity } from './api'
import './App.css'

export default function App() {
  const [opportunities, setOpportunities] = useState([])
  const [category, setCategory] = useState('All')
  const [status, setStatus] = useState('idle') // idle | loading | error
  const [errorMessage, setErrorMessage] = useState(null)
  const [applyingId, setApplyingId] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadOpportunities = useCallback(async (selectedCategory) => {
    setStatus('loading')
    setErrorMessage(null)
    try {
      const data = await fetchOpportunities(selectedCategory)
      setOpportunities(data)
      setStatus('idle')
    } catch (err) {
      setErrorMessage(err.message)
      setStatus('error')
    }
  }, [])

  useEffect(() => {
    loadOpportunities(category)
  }, [category, loadOpportunities])

  async function handleApply(id) {
    setApplyingId(id)
    try {
      const updated = await applyToOpportunity(id)
      setOpportunities((prev) =>
        prev.map((o) => (o.id === id ? updated : o))
      )
    } catch (err) {
      setErrorMessage(err.message)
    } finally {
      setApplyingId(null)
    }
  }

  async function handleCreate(newOpportunity) {
    setIsSubmitting(true)
    try {
      const created = await createOpportunity(newOpportunity)
      if (category === 'All' || category === created.category) {
        setOpportunities((prev) => [...prev, created])
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1>Volunteer Match</h1>
        <p>Find a volunteering opportunity near you, or post one for your organization.</p>
      </header>

      <main className="app__main">
        <section aria-labelledby="browse-heading">
          <h2 id="browse-heading">Browse opportunities</h2>
          <CategoryFilter value={category} onChange={setCategory} />

          {status === 'loading' && <p>Loading opportunities…</p>}
          {status === 'error' && (
            <p role="alert" className="form-error">
              Could not load opportunities: {errorMessage}
            </p>
          )}
          {status === 'idle' && (
            <OpportunityList
              opportunities={opportunities}
              onApply={handleApply}
              applyingId={applyingId}
            />
          )}
        </section>

        <section aria-labelledby="post-heading">
          <h2 id="post-heading">Post an opportunity</h2>
          <NewOpportunityForm onSubmit={handleCreate} isSubmitting={isSubmitting} />
        </section>
      </main>
    </div>
  )
}
