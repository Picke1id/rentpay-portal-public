type AlertType = 'success' | 'error'

const styles: Record<AlertType, string> = {
  success: 'bg-emerald-50 text-emerald-700',
  error: 'bg-red-50 text-red-700',
}

export const Alert = ({ type, message, className = '' }: { type: AlertType; message: string; className?: string }) => {
  return (
    <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${styles[type]} ${className}`}>
      {message}
    </div>
  )
}
