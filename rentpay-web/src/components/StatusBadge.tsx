type StatusVariant = 'paid' | 'due' | 'void' | 'succeeded' | 'failed' | 'pending'

const styles: Record<StatusVariant, string> = {
  paid: 'bg-emerald-50 text-emerald-700',
  due: 'bg-red-50 text-red-700',
  void: 'bg-slate-100 text-slate-700',
  succeeded: 'bg-emerald-50 text-emerald-700',
  failed: 'bg-red-50 text-red-700',
  pending: 'bg-amber-50 text-amber-700',
}

export const StatusBadge = ({ status }: { status: StatusVariant }) => {
  return (
    <span className={`inline-flex w-fit items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold capitalize ${styles[status]}`}>
      {status}
    </span>
  )
}
