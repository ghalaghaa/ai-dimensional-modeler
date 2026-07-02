import OpportunityCard from './OpportunityCard'

export default function OpportunityList({ opportunities, onApply, applyingId }) {
  if (opportunities.length === 0) {
    return <p className="empty-state">No opportunities match this filter yet.</p>
  }

  return (
    <ul className="opportunity-list">
      {opportunities.map((opportunity) => (
        <OpportunityCard
          key={opportunity.id}
          opportunity={opportunity}
          onApply={onApply}
          isApplying={applyingId === opportunity.id}
        />
      ))}
    </ul>
  )
}
