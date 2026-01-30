import { useMemo } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createCheckout, fetchTenantCharges, fetchTenantPayments } from '../api/queries'
import { StatCard } from '../components/StatCard'
import { Button } from '../components/Button'
import { AppLayout } from '../components/AppLayout'

const formatMoney = (amount: number) => `$${(amount / 100).toFixed(2)}`

export const TenantDashboard = () => {
  const chargesQuery = useQuery({ queryKey: ['tenant', 'charges'], queryFn: fetchTenantCharges })
  const paymentsQuery = useQuery({ queryKey: ['tenant', 'payments'], queryFn: fetchTenantPayments })

  const checkoutMutation = useMutation({
    mutationFn: createCheckout,
    onSuccess: (url) => {
      window.location.href = url
    },
  })

  const totalDue = useMemo(() => {
    return (chargesQuery.data ?? []).reduce((sum, charge) => sum + charge.amount, 0)
  }, [chargesQuery.data])

  return (
    <AppLayout>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl">Tenant Dashboard</h2>
          <p className="text-slate-500">Review your balance and pay upcoming charges.</p>
        </div>
        <div className="rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">Stripe verified</div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <StatCard label="Amount Due" value={formatMoney(totalDue)} hint="Upcoming rent charges" />
        <StatCard label="Charges" value={`${chargesQuery.data?.length ?? 0}`} hint="Open items" />
        <StatCard label="Payments" value={`${paymentsQuery.data?.length ?? 0}`} hint="All time" />
      </div>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Open charges</h3>
          <span className="text-sm text-slate-400">{chargesQuery.isLoading ? 'Loading...' : ''}</span>
        </div>
        <div className="grid gap-3">
          <div className="grid grid-cols-4 gap-3 border-b border-stone pb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span>Due date</span>
            <span>Amount</span>
            <span>Status</span>
            <span />
          </div>
          {(chargesQuery.data ?? []).map((charge) => (
            <div className="grid grid-cols-4 items-center gap-3 border-b border-stone py-2" key={charge.id}>
              <span>{charge.due_date}</span>
              <span>{formatMoney(charge.amount)}</span>
              <span className="text-sm font-semibold capitalize text-orange-600">{charge.status}</span>
              <Button
                className="btn-primary"
                onClick={() => checkoutMutation.mutate(charge.id)}
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

      <section className="card p-6">
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
            <div className="grid grid-cols-3 items-center gap-3 border-b border-stone py-2" key={payment.id}>
              <span>{payment.paid_at ?? payment.created_at ?? '—'}</span>
              <span>{formatMoney(payment.amount)}</span>
              <span className={`text-sm font-semibold capitalize ${payment.status === 'succeeded' ? 'text-emerald-600' : payment.status === 'failed' ? 'text-red-600' : 'text-slate-500'}`}>{payment.status}</span>
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
