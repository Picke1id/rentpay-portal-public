import { useState } from 'react'
import { z } from 'zod'
import { useMutation, useQuery } from '@tanstack/react-query'
import { createLease, fetchTenants, fetchUnits } from '../api/queries'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'

const schema = z.object({
  unit_id: z.coerce.number().min(1),
  tenant_user_id: z.coerce.number().min(1),
  rent_amount: z.coerce.number().min(1000),
  due_day: z.coerce.number().min(1).max(28),
  start_date: z.string().min(10),
})

export const AdminDashboard = () => {
  const unitsQuery = useQuery({ queryKey: ['admin', 'units'], queryFn: fetchUnits })
  const tenantsQuery = useQuery({ queryKey: ['admin', 'tenants'], queryFn: fetchTenants })

  const [form, setForm] = useState({
    unit_id: '',
    tenant_user_id: '',
    rent_amount: '150000',
    due_day: '1',
    start_date: new Date().toISOString().slice(0, 10),
  })
  const [message, setMessage] = useState<string | null>(null)

  const leaseMutation = useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      setMessage('Lease created and initial charge generated.')
    },
    onError: (error: any) => {
      setMessage(error?.response?.data?.message || 'Failed to create lease.')
    },
  })

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setMessage(null)

    const parsed = schema.safeParse(form)
    if (!parsed.success) {
      setMessage('Please complete all fields with valid values.')
      return
    }

    leaseMutation.mutate({
      unit_id: Number(form.unit_id),
      tenant_user_id: Number(form.tenant_user_id),
      rent_amount: Number(form.rent_amount),
      due_day: Number(form.due_day),
      start_date: form.start_date,
    })
  }

  return (
    <AppLayout>
      <div className="page-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p>Manage leases and monitor tenant occupancy.</p>
        </div>
        <div className="badge">Operations</div>
      </div>

      <section className="card">
        <div className="section-header">
          <h3>Create lease</h3>
          <span>{leaseMutation.isPending ? 'Saving...' : ''}</span>
        </div>
        <form className="grid-form" onSubmit={onSubmit}>
          <label>
            Unit
            <select
              value={form.unit_id}
              onChange={(event) => setForm((prev) => ({ ...prev, unit_id: event.target.value }))}
            >
              <option value="">Select unit</option>
              {(unitsQuery.data ?? []).map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name} {unit.property?.name ? `• ${unit.property.name}` : ''}
                </option>
              ))}
            </select>
          </label>
          <label>
            Tenant
            <select
              value={form.tenant_user_id}
              onChange={(event) => setForm((prev) => ({ ...prev, tenant_user_id: event.target.value }))}
            >
              <option value="">Select tenant</option>
              {(tenantsQuery.data ?? []).map((tenant) => (
                <option key={tenant.id} value={tenant.id}>
                  {tenant.name} • {tenant.email}
                </option>
              ))}
            </select>
          </label>
          <label>
            Rent amount (cents)
            <input
              value={form.rent_amount}
              onChange={(event) => setForm((prev) => ({ ...prev, rent_amount: event.target.value }))}
              placeholder="150000"
            />
          </label>
          <label>
            Due day
            <input
              value={form.due_day}
              onChange={(event) => setForm((prev) => ({ ...prev, due_day: event.target.value }))}
              placeholder="1"
            />
          </label>
          <label>
            Start date
            <input
              type="date"
              value={form.start_date}
              onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
            />
          </label>
          <div className="form-actions">
            <Button type="submit" className="btn-primary" disabled={leaseMutation.isPending}>
              Create lease
            </Button>
            {message ? <span className="form-message">{message}</span> : null}
          </div>
        </form>
      </section>

      <section className="card">
        <div className="section-header">
          <h3>Units</h3>
          <span>{unitsQuery.isLoading ? 'Loading...' : ''}</span>
        </div>
        <div className="table">
          <div className="table-row header">
            <span>Unit</span>
            <span>Property</span>
            <span>Notes</span>
          </div>
          {(unitsQuery.data ?? []).map((unit) => (
            <div className="table-row" key={unit.id}>
              <span>{unit.name}</span>
              <span>{unit.property?.name ?? '—'}</span>
              <span>{unit.notes ?? '—'}</span>
            </div>
          ))}
          {unitsQuery.data?.length === 0 && !unitsQuery.isLoading ? (
            <div className="empty">No units yet. Create a property and unit first.</div>
          ) : null}
        </div>
      </section>
    </AppLayout>
  )
}
