import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createLease, createProperty, createUnit, deleteUnit, fetchProperties, fetchTenants, fetchUnits, importCsv } from '../api/queries'
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
  const queryClient = useQueryClient()
  const unitsQuery = useQuery({ queryKey: ['admin', 'units'], queryFn: fetchUnits })
  const tenantsQuery = useQuery({ queryKey: ['admin', 'tenants'], queryFn: fetchTenants })
  const propertiesQuery = useQuery({ queryKey: ['admin', 'properties'], queryFn: fetchProperties })

  const [propertyForm, setPropertyForm] = useState({ name: '' })
  const [form, setForm] = useState({
    unit_id: '',
    tenant_user_id: '',
    rent_amount: '150000',
    due_day: '1',
    start_date: new Date().toISOString().slice(0, 10),
  })
  const [unitForm, setUnitForm] = useState({ property_id: '', name: '', notes: '' })
  const [message, setMessage] = useState<string | null>(null)
  const [importTab, setImportTab] = useState<'units' | 'leases' | 'charges'>('units')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)

  const leaseMutation = useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      setMessage('Lease created and initial charge generated.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'units'] })
    },
    onError: (error: any) => {
      setMessage(error?.response?.data?.message || 'Failed to create lease.')
    },
  })

  const propertyMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      setPropertyForm({ name: '' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] })
    },
  })

  const unitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      setUnitForm({ property_id: '', name: '', notes: '' })
      queryClient.invalidateQueries({ queryKey: ['admin', 'units'] })
    },
  })

  const deleteUnitMutation = useMutation({
    mutationFn: deleteUnit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'units'] })
    },
  })

  const importMutation = useMutation({
    mutationFn: () => importCsv(importTab, importFile as File),
    onSuccess: (data) => {
      setImportMessage(`Imported ${data.imported} rows.`)
      queryClient.invalidateQueries({ queryKey: ['admin', 'units'] })
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.errors?.[0]?.errors?.[0]
      setImportMessage(detail || 'Import failed. Check CSV format.')
    },
  })

  const canImport = useMemo(() => importFile && importTab, [importFile, importTab])

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
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-display text-xl">Create property</h3>
            <p className="text-sm text-slate-500">Add a property before assigning units.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (!propertyForm.name) return
              propertyMutation.mutate({ name: propertyForm.name })
            }}
            className="flex flex-wrap gap-3"
          >
            <input
              placeholder="Property name"
              value={propertyForm.name}
              onChange={(event) => setPropertyForm({ name: event.target.value })}
            />
            <Button type="submit" className="btn-primary" disabled={propertyMutation.isPending}>
              Add property
            </Button>
          </form>
        </div>

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
        <div className="mb-6 grid gap-4 md:grid-cols-2">
          <div>
            <h3 className="font-display text-xl">Add unit</h3>
            <p className="text-sm text-slate-500">Create a unit under an existing property.</p>
          </div>
          <form
            onSubmit={(event) => {
              event.preventDefault()
              if (!unitForm.property_id || !unitForm.name) return
              unitMutation.mutate({
                property_id: Number(unitForm.property_id),
                name: unitForm.name,
                notes: unitForm.notes || undefined,
              })
            }}
            className="grid gap-3 md:grid-cols-3"
          >
            <select
              value={unitForm.property_id}
              onChange={(event) => setUnitForm((prev) => ({ ...prev, property_id: event.target.value }))}
            >
              <option value="">Property</option>
              {(propertiesQuery.data ?? []).map((property) => (
                <option key={property.id} value={property.id}>{property.name}</option>
              ))}
            </select>
            <input
              placeholder="Unit name"
              value={unitForm.name}
              onChange={(event) => setUnitForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              placeholder="Notes"
              value={unitForm.notes}
              onChange={(event) => setUnitForm((prev) => ({ ...prev, notes: event.target.value }))}
            />
            <div className="md:col-span-3">
              <Button type="submit" className="btn-primary" disabled={unitMutation.isPending}>
                Add unit
              </Button>
            </div>
          </form>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">Units</h3>
          <span className="text-sm text-slate-400">{unitsQuery.isLoading ? 'Loading...' : ''}</span>
        </div>
        <div className="grid gap-3">
          <div className="grid grid-cols-4 gap-3 border-b border-stone pb-2 text-xs uppercase tracking-[0.2em] text-slate-400">
            <span>Unit</span>
            <span>Property</span>
            <span>Notes</span>
            <span />
          </div>
          {(unitsQuery.data ?? []).map((unit) => (
            <div className="grid grid-cols-4 items-center gap-3 border-b border-stone py-2" key={unit.id}>
              <span>{unit.name}</span>
              <span>{unit.property?.name ?? '—'}</span>
              <span>{unit.notes ?? '—'}</span>
              <Button className="btn-ghost text-xs" onClick={() => deleteUnitMutation.mutate(unit.id)}>
                Remove
              </Button>
            </div>
          ))}
          {unitsQuery.data?.length === 0 && !unitsQuery.isLoading ? (
            <div className="rounded-xl bg-stone/40 p-4 text-sm text-slate-500">No units yet. Create a property and unit first.</div>
          ) : null}
        </div>
      </section>

      <section className="card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl">CSV imports</h3>
          <span className="text-sm text-slate-400">Units, leases, charges</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {(['units', 'leases', 'charges'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setImportTab(tab)}
              className={`btn ${importTab === tab ? 'btn-primary' : 'btn-ghost'}`}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
          <input
            type="file"
            accept=".csv"
            onChange={(event) => setImportFile(event.target.files?.[0] ?? null)}
          />
          <Button
            className="btn-primary"
            disabled={!canImport || importMutation.isPending}
            onClick={() => importMutation.mutate()}
          >
            {importMutation.isPending ? 'Importing...' : 'Import CSV'}
          </Button>
        </div>
        {importMessage ? <p className="mt-3 text-sm text-teal">{importMessage}</p> : null}
        <div className="mt-4 text-xs text-slate-500">
          <p>Units headers: property_id,name,notes</p>
          <p>Leases headers: unit_id,tenant_user_id,rent_amount,due_day,start_date,end_date</p>
          <p>Charges headers: lease_id,amount,due_date,status</p>
        </div>
      </section>
    </AppLayout>
  )
}
