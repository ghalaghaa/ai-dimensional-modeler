export default function OpportunityCard({ opportunity, onApply, isApplying }) {
  const isFull = opportunity.spotsAvailable <= 0

  return (
    <li className="opportunity-card" data-testid="opportunity-card">
      <div className="opportunity-card__header">
        <h3>{opportunity.title}</h3>
        <span className="opportunity-card__category">
          {opportunity.category}
        </span>
      </div>
      <p className="opportunity-card__org">{opportunity.organization}</p>
      <p className="opportunity-card__meta">
        {opportunity.location} &middot; {opportunity.date}
      </p>
      <p className="opportunity-card__description">
        {opportunity.description}
      </p>
      <div className="opportunity-card__footer">
        <span className="opportunity-card__spots">
          {isFull
            ? 'Full'
            : `${opportunity.spotsAvailable} spot${
                opportunity.spotsAvailable === 1 ? '' : 's'
              } left`}
        </span>
        <button
          type="button"
          onClick={() => onApply(opportunity.id)}
          disabled={isFull || isApplying}
        >
          {isFull ? 'Full' : isApplying ? 'Applying…' : 'Apply'}
        </button>
      </div>
    </li>
  )
}
