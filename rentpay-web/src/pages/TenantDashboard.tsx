import { useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createCheckout, fetchTenantCharges, fetchTenantPayments } from '../api/queries'
import { StatCard } from '../components/StatCard'
import { Button } from '../components/Button'
import { AppLayout } from '../components/AppLayout'
import { Alert } from '../components/Alert'
import { StatusBadge } from '../components/StatusBadge'
import { formatDisplayDate, formatMoney } from '../utils/format'
import { getErrorMessage } from '../utils/http'

export const TenantDashboard = () => {
  const chargesQuery = useQuery({ queryKey: ['tenant', 'charges'], queryFn: fetchTenantCharges })
  const paymentsQuery = useQuery({ queryKey: ['tenant', 'payments'], queryFn: fetchTenantPayments })
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const checkoutMutation = useMutation({
    mutationFn: createCheckout,
    onSuccess: (url) => {
      window.location.href = url
    },
    onError: (error: unknown) => {
      setCheckoutError(getErrorMessage(error, 'Unable to start checkout. Try again.'))
    },
  })

  const totalDue = useMemo(() => {
    return (chargesQuery.data ?? []).reduce((sum, charge) => sum + charge.amount, 0)
  }, [chargesQuery.data])

  return (
    <AppLayout>
      <div id="dashboard" className="flex flex-col gap-1">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Tenant / Dashboard</div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Dashboard</h2>
            <p className="text-slate-500">Review balances and pay upcoming charges.</p>
          </div>
          <div className="rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">Stripe verified</div>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Amount Due" value={formatMoney(totalDue)} hint="Upcoming rent charges" />
        <StatCard label="Charges" value={`${chargesQuery.data?.length ?? 0}`} hint="Open items" />
        <StatCard label="Payments" value={`${paymentsQuery.data?.length ?? 0}`} hint="All time" />
      </div>

      <section id="charges" className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Open charges</h3>
          <span className="text-sm text-slate-400">{chargesQuery.isLoading ? 'Loading...' : ''}</span>
        </div>
        {checkoutError ? <Alert type="error" message={checkoutError} className="mb-4" /> : null}
        <div className="grid gap-3">
          <div className="hidden grid-cols-4 gap-3 border-b border-stone pb-2 text-xs uppercase tracking-[0.2em] text-slate-400 md:grid">
            <span>Due date</span>
            <span>Amount</span>
            <span>Status</span>
            <span />
          </div>
          {(chargesQuery.data ?? []).map((charge) => (
            <div
              className="grid gap-3 border-b border-stone py-3 text-sm text-slate-700 md:grid-cols-4 md:items-center"
              key={charge.id}
            >
              <div className="flex items-center justify-between md:block">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400 md:hidden">Due date</span>
                <span>{formatDisplayDate(charge.due_date)}</span>
              </div>
              <div className="flex items-center justify-between md:block">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400 md:hidden">Amount</span>
                <span>{formatMoney(charge.amount)}</span>
              </div>
              <div className="flex items-center justify-between md:block">
                <span className="text-xs uppercase tracking-[0.2em] text-slate-400 md:hidden">Status</span>
                <StatusBadge status={charge.status} />
              </div>
              <Button
                className="btn-primary w-full md:w-auto"
                onClick={() => {
                  setCheckoutError(null)
                  checkoutMutation.mutate(charge.id)
                }}
                disabled={checkoutMutation.isPending}
              >
                Pay now
              </Button>
            </div>
          ))}
          {chargesQuery.data?.length === 0 && !chargesQuery.isLoading ? (
            <div className="rounded-xl bg-stone/40 p-4 text-sm text-slate-500">No charges due right now.</div>
          ) : null}
        </div>
      </section>

      <section id="payments" className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Payment history</h3>
        </div>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-3 border-b border-stone pb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {(paymentsQuery.data ?? []).map((payment) => (
            <div className="grid grid-cols-3 items-center gap-3 border-b border-stone py-2 text-sm text-slate-700" key={payment.id}>
              <span>{formatDisplayDate(payment.paid_at ?? payment.created_at)}</span>
              <span>{formatMoney(payment.amount)}</span>
              <StatusBadge status={payment.status === 'succeeded' ? 'succeeded' : payment.status === 'failed' ? 'failed' : 'pending'} />
            </div>
          ))}
          {paymentsQuery.data?.length === 0 && !paymentsQuery.isLoading ? (
            <div className="rounded-xl bg-stone/40 p-4 text-sm text-slate-500">No payments recorded yet.</div>
          ) : null}
        </div>
      </section>
    </AppLayout>
  )
}
