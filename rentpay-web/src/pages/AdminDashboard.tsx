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
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="font-display text-2xl">Admin Dashboard</h2>
          <p className="text-slate-500">Manage leases and monitor tenant occupancy.</p>
        </div>
        <div className="rounded-full bg-teal/10 px-4 py-2 text-sm font-semibold text-teal">Operations</div>
      </div>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Create lease</h3>
          <span className="text-sm text-slate-400">{leaseMutation.isPending ? 'Saving...' : ''}</span>
        </div>
        <form className="grid gap-4 md:grid-cols-2 xl:grid-cols-3" onSubmit={onSubmit}>
          <label className="flex flex-col gap-2 text-sm font-semibold">
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
          <label className="flex flex-col gap-2 text-sm font-semibold">
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
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Rent amount (cents)
            <input
              value={form.rent_amount}
              onChange={(event) => setForm((prev) => ({ ...prev, rent_amount: event.target.value }))}
              placeholder="150000"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Due day
            <input
              value={form.due_day}
              onChange={(event) => setForm((prev) => ({ ...prev, due_day: event.target.value }))}
              placeholder="1"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm font-semibold">
            Start date
            <input
              type="date"
              value={form.start_date}
              onChange={(event) => setForm((prev) => ({ ...prev, start_date: event.target.value }))}
            />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <Button type="submit" className="btn-primary" disabled={leaseMutation.isPending}>
              Create lease
            </Button>
            {message ? <span className="text-sm font-semibold text-teal">{message}</span> : null}
          </div>
        </form>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Units</h3>
          <span className="text-sm text-slate-400">{unitsQuery.isLoading ? 'Loading...' : ''}</span>
        </div>
        <div className="grid gap-3">
          <div className="grid grid-cols-3 gap-3 border-b border-stone pb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span>Unit</span>
            <span>Property</span>
            <span>Notes</span>
          </div>
          {(unitsQuery.data ?? []).map((unit) => (
            <div className="grid grid-cols-3 items-center gap-3 border-b border-stone py-2" key={unit.id}>
              <span>{unit.name}</span>
              <span>{unit.property?.name ?? '—'}</span>
              <span>{unit.notes ?? '—'}</span>
            </div>
          ))}
          {unitsQuery.data?.length === 0 && !unitsQuery.isLoading ? (
            <div className="rounded-xl bg-stone/40 p-4 text-sm text-slate-500">No units yet. Create a property and unit first.</div>
          ) : null}
        </div>
      </section>
    </AppLayout>
  )
}
