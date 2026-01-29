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
      <div className="page-header">
        <div>
          <h2>Tenant Dashboard</h2>
          <p>Review your balance and pay upcoming charges.</p>
        </div>
        <div className="badge">Stripe verified</div>
      </div>

      <div className="grid">
        <StatCard label="Amount Due" value={formatMoney(totalDue)} hint="Upcoming rent charges" />
        <StatCard label="Charges" value={`${chargesQuery.data?.length ?? 0}`} hint="Open items" />
        <StatCard label="Payments" value={`${paymentsQuery.data?.length ?? 0}`} hint="All time" />
      </div>

      <section className="card">
        <div className="section-header">
          <h3>Open charges</h3>
          <span>{chargesQuery.isLoading ? 'Loading...' : ''}</span>
        </div>
        <div className="table">
          <div className="table-row header">
            <span>Due date</span>
            <span>Amount</span>
            <span>Status</span>
            <span></span>
          </div>
          {(chargesQuery.data ?? []).map((charge) => (
            <div className="table-row" key={charge.id}>
              <span>{charge.due_date}</span>
              <span>{formatMoney(charge.amount)}</span>
              <span className="status due">{charge.status}</span>
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
            <div className="empty">No charges due right now.</div>
          ) : null}
        </div>
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Payment history</h3>
        </div>
        <div className="table">
          <div className="table-row header">
            <span>Date</span>
            <span>Amount</span>
            <span>Status</span>
          </div>
          {(paymentsQuery.data ?? []).map((payment) => (
            <div className="table-row" key={payment.id}>
              <span>{payment.paid_at ?? payment.created_at ?? '—'}</span>
              <span>{formatMoney(payment.amount)}</span>
              <span className={`status ${payment.status}`}>{payment.status}</span>
            </div>
          ))}
          {paymentsQuery.data?.length === 0 && !paymentsQuery.isLoading ? (
            <div className="empty">No payments recorded yet.</div>
          ) : null}
        </div>
      </section>
    </AppLayout>
  )
}
