export const StatCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => {
  return (
    <div className="card stat">
      <p className="stat-label">{label}</p>
      <h2 className="stat-value">{value}</h2>
      {hint ? <p className="stat-hint">{hint}</p> : null}
    </div>
  )
}
