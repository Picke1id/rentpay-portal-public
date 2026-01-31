import { useMemo, useState } from 'react'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createLease,
  createProperty,
  createUnit,
  deleteUnit,
  fetchAdminCharges,
  fetchLeases,
  fetchProperties,
  fetchTenants,
  fetchUnits,
  importCsv,
} from '../api/queries'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'

const leaseSchema = z.object({
  unit_id: z.coerce.number().min(1),
  tenant_user_id: z.coerce.number().min(1),
  rent_amount: z.coerce.number().min(1),
  due_day: z.coerce.number().min(1).max(28),
  start_date: z.string().min(10),
})

const currency = (amount: number) => `$${(amount / 100).toFixed(2)}`

const downloadTemplate = (tab: 'units' | 'leases' | 'charges') => {
  const headers: Record<typeof tab, string> = {
    units: 'property_id,name,notes\n',
    leases: 'unit_id,tenant_user_id,rent_amount,due_day,start_date,end_date\n',
    charges: 'lease_id,amount,due_date,status\n',
  }

  const blob = new Blob([headers[tab]], { type: 'text/csv;charset=utf-8;' })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.setAttribute('download', `rentpay_${tab}_template.csv`)
  document.body.appendChild(link)
  link.click()
  link.remove()
}

export const AdminDashboard = () => {
  const queryClient = useQueryClient()
  const unitsQuery = useQuery({ queryKey: ['admin', 'units'], queryFn: fetchUnits })
  const tenantsQuery = useQuery({ queryKey: ['admin', 'tenants'], queryFn: fetchTenants })
  const propertiesQuery = useQuery({ queryKey: ['admin', 'properties'], queryFn: fetchProperties })
  const leasesQuery = useQuery({ queryKey: ['admin', 'leases'], queryFn: fetchLeases })
  const chargesQuery = useQuery({ queryKey: ['admin', 'charges'], queryFn: fetchAdminCharges })

  const [propertyForm, setPropertyForm] = useState({ name: '' })
  const [unitForm, setUnitForm] = useState({ property_id: '', name: '', notes: '' })
  const [leaseForm, setLeaseForm] = useState({
    unit_id: '',
    tenant_user_id: '',
    rent_amount: '1500.00',
    due_day: '1',
    start_date: new Date().toISOString().slice(0, 10),
  })
  const [leaseMessage, setLeaseMessage] = useState<string | null>(null)

  const [importTab, setImportTab] = useState<'units' | 'leases' | 'charges'>('units')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null)

  const [unitSearch, setUnitSearch] = useState('')
  const [unitPropertyFilter, setUnitPropertyFilter] = useState('all')

  const filteredUnits = useMemo(() => {
    const units = unitsQuery.data ?? []
    return units.filter((unit) => {
      const matchesSearch = unit.name.toLowerCase().includes(unitSearch.toLowerCase())
      const matchesProperty = unitPropertyFilter === 'all' || String(unit.property_id) === unitPropertyFilter
      return matchesSearch && matchesProperty
    })
  }, [unitsQuery.data, unitSearch, unitPropertyFilter])

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

  const leaseMutation = useMutation({
    mutationFn: createLease,
    onSuccess: () => {
      setLeaseMessage('Lease created and initial charge generated.')
      queryClient.invalidateQueries({ queryKey: ['admin', 'leases'] })
    },
    onError: (error: any) => {
      setLeaseMessage(error?.response?.data?.message || 'Failed to create lease.')
    },
  })

  const importMutation = useMutation({
    mutationFn: () => importCsv(importTab, importFile as File),
    onSuccess: (data) => {
      setImportMessage(`Imported ${data.imported} rows.`)
      setImportStatus('success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'units'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'leases'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'charges'] })
    },
    onError: (error: any) => {
      const errorList = error?.response?.data?.errors as Array<{ row: number; errors: string[] }> | undefined
      if (errorList && errorList.length > 0) {
        const topErrors = errorList.slice(0, 3).map((item) => `Row ${item.row}: ${item.errors[0]}`)
        setImportMessage(topErrors.join(' • '))
      } else {
        setImportMessage('Import failed. Check CSV format.')
      }
      setImportStatus('error')
    },
  })

  const dueDayOptions = Array.from({ length: 28 }, (_, i) => String(i + 1))

  const submitLease = (event: React.FormEvent) => {
    event.preventDefault()
    setLeaseMessage(null)

    const parsed = leaseSchema.safeParse({
      ...leaseForm,
      rent_amount: Number(parseFloat(leaseForm.rent_amount) * 100),
    })

    if (!parsed.success) {
      setLeaseMessage('Please complete all fields with valid values.')
      return
    }

    leaseMutation.mutate({
      unit_id: Number(leaseForm.unit_id),
      tenant_user_id: Number(leaseForm.tenant_user_id),
      rent_amount: Number(parseFloat(leaseForm.rent_amount) * 100),
      due_day: Number(leaseForm.due_day),
      start_date: leaseForm.start_date,
    })
  }

  return (
    <AppLayout>
      <div id="dashboard" className="flex flex-col gap-1">
        <div className="text-xs uppercase tracking-[0.2em] text-slate-400">Admin / Dashboard</div>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl">Dashboard</h2>
            <p className="text-slate-500">Manage properties, units, leases, and imports.</p>
          </div>
          <Button className="btn-primary">Create</Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex flex-col gap-6">
          <section id="units" className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <h3 className="font-display text-xl">Units</h3>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  className="w-48"
                  placeholder="Search units"
                  value={unitSearch}
                  onChange={(event) => setUnitSearch(event.target.value)}
                />
                <select
                  className="w-44"
                  value={unitPropertyFilter}
                  onChange={(event) => setUnitPropertyFilter(event.target.value)}
                >
                  <option value="all">All properties</option>
                  {(propertiesQuery.data ?? []).map((property) => (
                    <option key={property.id} value={property.id}>{property.name}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <div className="grid grid-cols-[1.2fr_1.2fr_1.4fr_80px] gap-3">
                <span>Unit</span>
                <span>Property</span>
                <span>Notes</span>
                <span className="text-right">Actions</span>
              </div>
              {filteredUnits.map((unit) => (
                <div key={unit.id} className="grid grid-cols-[1.2fr_1.2fr_1.4fr_80px] items-center gap-3 border-b border-stone py-2 text-sm normal-case text-slate-700">
                  <span>{unit.name}</span>
                  <span>{unit.property?.name ?? '—'}</span>
                  <span>{unit.notes ?? '—'}</span>
                  <div className="text-right">
                    <button
                      className="text-xs text-slate-400 hover:text-red-500"
                      onClick={() => {
                        if (confirm('Remove this unit?')) {
                          deleteUnitMutation.mutate(unit.id)
                        }
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
              {filteredUnits.length === 0 ? (
                <div className="rounded-xl bg-stone/40 p-4 text-sm normal-case text-slate-500">No units yet. Add one →</div>
              ) : null}
            </div>
          </section>

          <section id="leases" className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Leases</h3>
              <span className="text-sm text-slate-400">{leasesQuery.data?.length ?? 0} total</span>
            </div>
            <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <div className="grid grid-cols-4 gap-3">
                <span>Unit</span>
                <span>Tenant</span>
                <span>Rent</span>
                <span>Start</span>
              </div>
              {(leasesQuery.data ?? []).map((lease) => (
                <div key={lease.id} className="grid grid-cols-4 gap-3 border-b border-stone py-2 text-sm normal-case text-slate-700">
                  <span>{lease.unit?.name ?? lease.unit_id}</span>
                  <span>{lease.tenant?.name ?? lease.tenant_user_id}</span>
                  <span>{currency(lease.rent_amount)}</span>
                  <span>{lease.start_date}</span>
                </div>
              ))}
              {leasesQuery.data?.length === 0 ? (
                <div className="rounded-xl bg-stone/40 p-4 text-sm normal-case text-slate-500">No leases yet.</div>
              ) : null}
            </div>
          </section>

          <section id="charges" className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Charges</h3>
              <span className="text-sm text-slate-400">{chargesQuery.data?.length ?? 0} total</span>
            </div>
            <div className="mt-4 grid gap-2 text-xs uppercase tracking-[0.2em] text-slate-400">
              <div className="grid grid-cols-4 gap-3">
                <span>Unit</span>
                <span>Tenant</span>
                <span>Amount</span>
                <span>Status</span>
              </div>
              {(chargesQuery.data ?? []).map((charge) => (
                <div key={charge.id} className="grid grid-cols-4 gap-3 border-b border-stone py-2 text-sm normal-case text-slate-700">
                  <span>{charge.unit ?? '—'}</span>
                  <span>{charge.tenant ?? '—'}</span>
                  <span>{currency(charge.amount)}</span>
                  <span className="capitalize">{charge.status}</span>
                </div>
              ))}
              {chargesQuery.data?.length === 0 ? (
                <div className="rounded-xl bg-stone/40 p-4 text-sm normal-case text-slate-500">No charges yet.</div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section id="properties" className="card p-6">
            <h3 className="font-display text-xl">Create property</h3>
            <form
              className="mt-4 flex gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (!propertyForm.name) return
                propertyMutation.mutate({ name: propertyForm.name })
              }}
            >
              <input
                placeholder="Property name"
                value={propertyForm.name}
                onChange={(event) => setPropertyForm({ name: event.target.value })}
              />
              <Button type="submit" className="btn-primary" disabled={propertyMutation.isPending}>
                Add
              </Button>
            </form>
          </section>

          <section className="card p-6">
            <h3 className="font-display text-xl">Add unit</h3>
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                if (!unitForm.property_id || !unitForm.name) return
                unitMutation.mutate({
                  property_id: Number(unitForm.property_id),
                  name: unitForm.name,
                  notes: unitForm.notes || undefined,
                })
              }}
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
              <Button type="submit" className="btn-primary" disabled={unitMutation.isPending}>
                Add unit
              </Button>
            </form>
          </section>

          <section className="card p-6">
            <h3 className="font-display text-xl">Create lease</h3>
            <form className="mt-4 grid gap-3" onSubmit={submitLease}>
              <select
                value={leaseForm.unit_id}
                onChange={(event) => setLeaseForm((prev) => ({ ...prev, unit_id: event.target.value }))}
              >
                <option value="">Unit</option>
                {(unitsQuery.data ?? []).map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.name} {unit.property?.name ? `• ${unit.property.name}` : ''}
                  </option>
                ))}
              </select>
              <select
                value={leaseForm.tenant_user_id}
                onChange={(event) => setLeaseForm((prev) => ({ ...prev, tenant_user_id: event.target.value }))}
              >
                <option value="">Tenant</option>
                {(tenantsQuery.data ?? []).map((tenant) => (
                  <option key={tenant.id} value={tenant.id}>{tenant.name}</option>
                ))}
              </select>
              <div>
                <label className="text-xs text-slate-500">Rent amount ($)</label>
                <input
                  value={leaseForm.rent_amount}
                  onChange={(event) => setLeaseForm((prev) => ({ ...prev, rent_amount: event.target.value }))}
                />
                <p className="text-xs text-slate-400">Stored in cents internally.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={leaseForm.due_day}
                  onChange={(event) => setLeaseForm((prev) => ({ ...prev, due_day: event.target.value }))}
                >
                  {dueDayOptions.map((day) => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
                <input
                  type="date"
                  value={leaseForm.start_date}
                  onChange={(event) => setLeaseForm((prev) => ({ ...prev, start_date: event.target.value }))}
                />
              </div>
              <Button type="submit" className="btn-primary" disabled={leaseMutation.isPending}>
                {leaseMutation.isPending ? 'Creating...' : 'Create lease'}
              </Button>
              {leaseMessage ? <p className="text-sm text-teal">{leaseMessage}</p> : null}
            </form>
          </section>

          <section id="imports" className="card p-6">
            <h3 className="font-display text-xl">CSV import</h3>
            <div className="mt-4 flex gap-2">
              {(['units', 'leases', 'charges'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setImportTab(tab)}
                  className={`btn text-xs ${importTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              <Button className="btn-ghost" onClick={() => downloadTemplate(importTab)}>
                Download template
              </Button>
              <label className="flex flex-col gap-2 rounded-xl border border-dashed border-stone bg-white p-4 text-sm text-slate-500">
                Drag & drop CSV here, or browse
                <input type="file" accept=".csv" onChange={(event) => setImportFile(event.target.files?.[0] ?? null)} />
              </label>
              <Button
                className="btn-primary"
                disabled={!importFile || importMutation.isPending}
                onClick={() => {
                  setImportMessage(null)
                  setImportStatus(null)
                  importMutation.mutate()
                }}
              >
                {importMutation.isPending ? 'Validating...' : 'Import CSV'}
              </Button>
              {importMessage ? (
                <div
                  className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                    importStatus === 'error'
                      ? 'bg-red-50 text-red-700'
                      : 'bg-emerald-50 text-emerald-700'
                  }`}
                >
                  {importMessage}
                </div>
              ) : null}
            </div>
          </section>
        </div>
      </div>
    </AppLayout>
  )
}
