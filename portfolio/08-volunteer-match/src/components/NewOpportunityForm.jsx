import { useState } from 'react'

const CATEGORIES = ['Education', 'Environment', 'Health', 'Animals']

const EMPTY_FORM = {
  title: '',
  organization: '',
  category: CATEGORIES[0],
  location: '',
  date: '',
  spotsAvailable: '',
  description: '',
}

export default function NewOpportunityForm({ onSubmit, isSubmitting }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState(null)

  function handleChange(field) {
    return (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)

    if (!form.title || !form.organization || !form.location || !form.date) {
      setError('Please fill in all required fields.')
      return
    }

    try {
      await onSubmit({
        ...form,
        spotsAvailable: Number(form.spotsAvailable) || 0,
      })
      setForm(EMPTY_FORM)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <form className="new-opportunity-form" onSubmit={handleSubmit}>
      <h2>Post a new opportunity</h2>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <div className="form-row">
        <label htmlFor="opp-title">Title*</label>
        <input
          id="opp-title"
          type="text"
          value={form.title}
          onChange={handleChange('title')}
        />
      </div>

      <div className="form-row">
        <label htmlFor="opp-org">Organization*</label>
        <input
          id="opp-org"
          type="text"
          value={form.organization}
          onChange={handleChange('organization')}
        />
      </div>

      <div className="form-row">
        <label htmlFor="opp-category">Category*</label>
        <select
          id="opp-category"
          value={form.category}
          onChange={handleChange('category')}
        >
          {CATEGORIES.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <div className="form-row">
        <label htmlFor="opp-location">Location*</label>
        <input
          id="opp-location"
          type="text"
          value={form.location}
          onChange={handleChange('location')}
        />
      </div>

      <div className="form-row">
        <label htmlFor="opp-date">Date*</label>
        <input
          id="opp-date"
          type="date"
          value={form.date}
          onChange={handleChange('date')}
        />
      </div>

      <div className="form-row">
        <label htmlFor="opp-spots">Spots available</label>
        <input
          id="opp-spots"
          type="number"
          min="0"
          value={form.spotsAvailable}
          onChange={handleChange('spotsAvailable')}
        />
      </div>

      <div className="form-row">
        <label htmlFor="opp-description">Description</label>
        <textarea
          id="opp-description"
          value={form.description}
          onChange={handleChange('description')}
          rows={3}
        />
      </div>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Posting…' : 'Post opportunity'}
      </button>
    </form>
  )
}
