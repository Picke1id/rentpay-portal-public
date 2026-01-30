export const StatCard = ({ label, value, hint }: { label: string; value: string; hint?: string }) => {
  return (
    <div className="card p-5">
      <p className="text-xs uppercase tracking-[0.2em] text-slate-500">{label}</p>
      <h2 className="font-display text-3xl">{value}</h2>
      {hint ? <p className="text-sm text-slate-500">{hint}</p> : null}
    </div>
  )
}
