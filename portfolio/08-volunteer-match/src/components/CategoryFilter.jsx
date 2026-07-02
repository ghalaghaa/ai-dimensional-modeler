const CATEGORIES = ['All', 'Education', 'Environment', 'Health', 'Animals']

export default function CategoryFilter({ value, onChange }) {
  return (
    <div className="category-filter">
      <label htmlFor="category-select">Filter by category</label>
      <select
        id="category-select"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {CATEGORIES.map((category) => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>
  )
}
