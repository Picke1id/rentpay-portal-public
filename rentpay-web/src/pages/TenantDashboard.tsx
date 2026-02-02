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
        <div className="overflow-x-auto">
          <table className="min-w-[520px] w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="px-2 py-2 text-left font-semibold">Due date</th>
                <th className="px-2 py-2 text-left font-semibold">Amount</th>
                <th className="px-2 py-2 text-left font-semibold">Status</th>
                <th className="px-2 py-2 text-right font-semibold">Action</th>
              </tr>
            </thead>
            <tbody>
              {(chargesQuery.data ?? []).map((charge) => (
                <tr className="border-b border-stone text-slate-700" key={charge.id}>
                  <td className="px-2 py-2">{formatDisplayDate(charge.due_date)}</td>
                  <td className="px-2 py-2">{formatMoney(charge.amount)}</td>
                  <td className="px-2 py-2">
                    <StatusBadge status={charge.status} />
                  </td>
                  <td className="px-2 py-2 text-right">
                    <Button
                      className="btn-primary"
                      onClick={() => {
                        setCheckoutError(null)
                        checkoutMutation.mutate(charge.id)
                      }}
                      disabled={checkoutMutation.isPending}
                    >
                      Pay now
                    </Button>
                  </td>
                </tr>
              ))}
              {chargesQuery.data?.length === 0 && !chargesQuery.isLoading ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-slate-500" colSpan={4}>
                    <div className="rounded-xl bg-stone/40 p-4">No charges due right now.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section id="payments" className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Payment history</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-[420px] w-full text-sm">
            <thead>
              <tr className="text-xs uppercase tracking-[0.2em] text-slate-400">
                <th className="px-2 py-2 text-left font-semibold">Date</th>
                <th className="px-2 py-2 text-left font-semibold">Amount</th>
                <th className="px-2 py-2 text-left font-semibold">Status</th>
              </tr>
            </thead>
            <tbody>
              {(paymentsQuery.data ?? []).map((payment) => (
                <tr className="border-b border-stone text-slate-700" key={payment.id}>
                  <td className="px-2 py-2">{formatDisplayDate(payment.paid_at ?? payment.created_at)}</td>
                  <td className="px-2 py-2">{formatMoney(payment.amount)}</td>
                  <td className="px-2 py-2">
                    <StatusBadge status={payment.status === 'succeeded' ? 'succeeded' : payment.status === 'failed' ? 'failed' : 'pending'} />
                  </td>
                </tr>
              ))}
              {paymentsQuery.data?.length === 0 && !paymentsQuery.isLoading ? (
                <tr>
                  <td className="px-2 py-3 text-sm text-slate-500" colSpan={3}>
                    <div className="rounded-xl bg-stone/40 p-4">No payments recorded yet.</div>
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </AppLayout>
  )
}
