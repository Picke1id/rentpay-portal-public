import { useEffect, useMemo, useState } from 'react'
import { z } from 'zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  createLease,
  createCharge,
  createProperty,
  createUnit,
  deleteUnit,
  updateUnit,
  fetchAdminCharges,
  fetchLeases,
  fetchProperties,
  fetchTenants,
  fetchUnits,
  importCsv,
} from '../api/queries'
import { AppLayout } from '../components/AppLayout'
import { Button } from '../components/Button'
import { Alert } from '../components/Alert'
import { StatusBadge } from '../components/StatusBadge'
import { formatCurrencyInput, formatDisplayDate, formatMoney, normalizeCurrencyInput } from '../utils/format'
import { getErrorMessage } from '../utils/http'

const leaseSchema = z.object({
  unit_id: z.coerce.number().min(1),
  tenant_user_id: z.coerce.number().min(1),
  rent_amount: z.coerce.number().min(1),
  due_day: z.coerce.number().min(1).max(28),
  start_date: z.string().min(10),
})

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
  const [editingUnitId, setEditingUnitId] = useState<number | null>(null)
  const [editUnitForm, setEditUnitForm] = useState({ property_id: '', name: '', notes: '' })
  const [leaseForm, setLeaseForm] = useState({
    unit_id: '',
    tenant_user_id: '',
    rent_amount: '1500.00',
    due_day: '1',
    start_date: new Date(),
  })
  const [chargeForm, setChargeForm] = useState({
    lease_id: '',
    amount: '',
    due_date: new Date(),
    status: 'due',
  })
  const [propertyMessage, setPropertyMessage] = useState<string | null>(null)
  const [propertyStatus, setPropertyStatus] = useState<'success' | 'error' | null>(null)
  const [unitMessage, setUnitMessage] = useState<string | null>(null)
  const [unitStatus, setUnitStatus] = useState<'success' | 'error' | null>(null)
  const [leaseMessage, setLeaseMessage] = useState<string | null>(null)
  const [leaseStatus, setLeaseStatus] = useState<'success' | 'error' | null>(null)
  const [chargeMessage, setChargeMessage] = useState<string | null>(null)
  const [chargeStatus, setChargeStatus] = useState<'success' | 'error' | null>(null)

  const [importTab, setImportTab] = useState<'units' | 'leases' | 'charges'>('units')
  const [importFile, setImportFile] = useState<File | null>(null)
  const [importMessage, setImportMessage] = useState<string | null>(null)
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null)

  const [unitSearch, setUnitSearch] = useState('')
  const [unitPropertyFilter, setUnitPropertyFilter] = useState('all')
  const [leaseSearch, setLeaseSearch] = useState('')

  useEffect(() => {
    if (!propertyMessage) return
    const timer = window.setTimeout(() => {
      setPropertyMessage(null)
      setPropertyStatus(null)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [propertyMessage])

  useEffect(() => {
    if (!unitMessage) return
    const timer = window.setTimeout(() => {
      setUnitMessage(null)
      setUnitStatus(null)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [unitMessage])

  useEffect(() => {
    if (!leaseMessage) return
    const timer = window.setTimeout(() => {
      setLeaseMessage(null)
      setLeaseStatus(null)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [leaseMessage])

  useEffect(() => {
    if (!chargeMessage) return
    const timer = window.setTimeout(() => {
      setChargeMessage(null)
      setChargeStatus(null)
    }, 5000)
    return () => window.clearTimeout(timer)
  }, [chargeMessage])

  const filteredUnits = useMemo(() => {
    const units = unitsQuery.data ?? []
    return units.filter((unit) => {
      const matchesSearch = unit.name.toLowerCase().includes(unitSearch.toLowerCase())
      const matchesProperty = unitPropertyFilter === 'all' || String(unit.property_id) === unitPropertyFilter
      return matchesSearch && matchesProperty
    })
  }, [unitsQuery.data, unitSearch, unitPropertyFilter])

  const filteredLeases = useMemo(() => {
    const leases = leasesQuery.data ?? []
    const query = leaseSearch.trim().toLowerCase()
    if (!query) return leases
    return leases.filter((lease) => {
      const unitName = lease.unit?.name?.toLowerCase() ?? ''
      const tenantName = lease.tenant?.name?.toLowerCase() ?? ''
      return unitName.includes(query) || tenantName.includes(query)
    })
  }, [leasesQuery.data, leaseSearch])

  const propertyMutation = useMutation({
    mutationFn: createProperty,
    onSuccess: () => {
      setPropertyForm({ name: '' })
      setPropertyMessage('Property created successfully.')
      setPropertyStatus('success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'properties'] })
    },
    onError: (error: unknown) => {
      setPropertyMessage(getErrorMessage(error, 'Failed to create property.'))
      setPropertyStatus('error')
    },
  })

  const unitMutation = useMutation({
    mutationFn: createUnit,
    onSuccess: () => {
      setUnitForm({ property_id: '', name: '', notes: '' })
      setUnitMessage('Unit created successfully.')
      setUnitStatus('success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'units'] })
    },
    onError: (error: unknown) => {
      setUnitMessage(getErrorMessage(error, 'Failed to create unit.'))
      setUnitStatus('error')
    },
  })

  const updateUnitMutation = useMutation({
    mutationFn: ({ unitId, payload }: { unitId: number; payload: { property_id: number; name: string; notes?: string } }) =>
      updateUnit(unitId, payload),
    onSuccess: () => {
      setEditingUnitId(null)
      setEditUnitForm({ property_id: '', name: '', notes: '' })
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
      setLeaseStatus('success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'leases'] })
    },
    onError: (error: unknown) => {
      setLeaseMessage(getErrorMessage(error, 'Failed to create lease.'))
      setLeaseStatus('error')
    },
  })

  const chargeMutation = useMutation({
    mutationFn: createCharge,
    onSuccess: () => {
      setChargeMessage('Charge created successfully.')
      setChargeStatus('success')
      setChargeForm((prev) => ({ ...prev, amount: '' }))
      queryClient.invalidateQueries({ queryKey: ['admin', 'charges'] })
    },
    onError: (error: unknown) => {
      setChargeMessage(getErrorMessage(error, 'Failed to create charge.'))
      setChargeStatus('error')
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
    onError: (error: unknown) => {
      const errorList = (error as { response?: { data?: { errors?: Array<{ row: number; errors: string[] }> } } }).response?.data
        ?.errors as Array<{ row: number; errors: string[] }> | undefined
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
      rent_amount: Number(parseFloat(normalizeCurrencyInput(leaseForm.rent_amount)) * 100),
      start_date: leaseForm.start_date.toISOString().slice(0, 10),
    })

    if (!parsed.success) {
      setLeaseMessage('Please complete all fields with valid values.')
      return
    }

    leaseMutation.mutate({
      unit_id: Number(leaseForm.unit_id),
      tenant_user_id: Number(leaseForm.tenant_user_id),
      rent_amount: Number(parseFloat(normalizeCurrencyInput(leaseForm.rent_amount)) * 100),
      due_day: Number(leaseForm.due_day),
      start_date: leaseForm.start_date.toISOString().slice(0, 10),
    })
  }

  const submitCharge = (event: React.FormEvent) => {
    event.preventDefault()
    setChargeMessage(null)
    setChargeStatus(null)

    const amountValue = Number.parseFloat(chargeForm.amount)
    if (!chargeForm.lease_id || Number.isNaN(amountValue)) {
      setChargeMessage('Please select a lease and enter a valid amount.')
      setChargeStatus('error')
      return
    }

    chargeMutation.mutate({
      lease_id: Number(chargeForm.lease_id),
      amount: Math.round(Number.parseFloat(normalizeCurrencyInput(chargeForm.amount)) * 100),
      due_date: chargeForm.due_date.toISOString().slice(0, 10),
      status: chargeForm.status as 'due' | 'paid' | 'void',
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
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[560px] w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-2 py-2 text-left font-semibold">Unit</th>
                    <th className="px-2 py-2 text-left font-semibold">Property</th>
                    <th className="px-2 py-2 text-left font-semibold">Notes</th>
                    <th className="px-2 py-2 text-center font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUnits.map((unit) => (
                    <tr key={unit.id} className="border-b border-stone text-slate-700">
                      {editingUnitId === unit.id ? (
                        <>
                          <td className="px-2 py-2">
                            <input
                              value={editUnitForm.name}
                              onChange={(event) => setEditUnitForm((prev) => ({ ...prev, name: event.target.value }))}
                            />
                          </td>
                          <td className="px-2 py-2">
                            <select
                              value={editUnitForm.property_id}
                              onChange={(event) => setEditUnitForm((prev) => ({ ...prev, property_id: event.target.value }))}
                            >
                              <option value="">Property</option>
                              {(propertiesQuery.data ?? []).map((property) => (
                                <option key={property.id} value={property.id}>{property.name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="px-2 py-2">
                            <input
                              value={editUnitForm.notes}
                              onChange={(event) => setEditUnitForm((prev) => ({ ...prev, notes: event.target.value }))}
                              placeholder="Notes"
                            />
                          </td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                                onClick={() => {
                                  if (!editUnitForm.property_id || !editUnitForm.name) return
                                  updateUnitMutation.mutate({
                                    unitId: unit.id,
                                    payload: {
                                      property_id: Number(editUnitForm.property_id),
                                      name: editUnitForm.name,
                                      notes: editUnitForm.notes || undefined,
                                    },
                                  })
                                }}
                              >
                                Save
                              </button>
                              <button
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-stone bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-stone/40"
                                onClick={() => {
                                  setEditingUnitId(null)
                                  setEditUnitForm({ property_id: '', name: '', notes: '' })
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="px-2 py-2">{unit.name}</td>
                          <td className="px-2 py-2">{unit.property?.name ?? '—'}</td>
                          <td className="px-2 py-2">{unit.notes ?? '—'}</td>
                          <td className="px-2 py-2">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stone bg-white text-slate-500 transition hover:bg-stone/40"
                                onClick={() => {
                                  setEditingUnitId(unit.id)
                                  setEditUnitForm({
                                    property_id: String(unit.property_id),
                                    name: unit.name,
                                    notes: unit.notes ?? '',
                                  })
                                }}
                                aria-label="Edit unit"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M12 20h9" />
                                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                                </svg>
                              </button>
                              <button
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-200 bg-red-50 text-red-600 transition hover:bg-red-100"
                                onClick={() => {
                                  if (confirm('Remove this unit?')) {
                                    deleteUnitMutation.mutate(unit.id)
                                  }
                                }}
                                aria-label="Remove unit"
                              >
                                <svg
                                  viewBox="0 0 24 24"
                                  aria-hidden="true"
                                  className="h-4 w-4"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="1.8"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M3 6h18" />
                                  <path d="M8 6V4h8v2" />
                                  <path d="M7 6l1 14h8l1-14" />
                                  <path d="M10 11v6" />
                                  <path d="M14 11v6" />
                                </svg>
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                  {filteredUnits.length === 0 ? (
                    <tr>
                      <td className="px-2 py-3 text-sm text-slate-500" colSpan={4}>
                        <div className="rounded-xl bg-stone/40 p-4">No units yet. Add one →</div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section id="leases" className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h3 className="font-display text-xl">Leases</h3>
              <div className="flex items-center gap-3">
                <input
                  className="w-48"
                  placeholder="Search leases"
                  value={leaseSearch}
                  onChange={(event) => setLeaseSearch(event.target.value)}
                />
                <span className="text-sm text-slate-400">{filteredLeases.length} total</span>
              </div>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[520px] w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-2 py-2 text-left font-semibold">Unit</th>
                    <th className="px-2 py-2 text-left font-semibold">Tenant</th>
                    <th className="px-2 py-2 text-left font-semibold">Rent</th>
                    <th className="px-2 py-2 text-left font-semibold">Start</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredLeases.map((lease) => (
                    <tr key={lease.id} className="border-b border-stone text-slate-700">
                      <td className="px-2 py-2">{lease.unit?.name ?? lease.unit_id}</td>
                      <td className="px-2 py-2">{lease.tenant?.name ?? lease.tenant_user_id}</td>
                      <td className="px-2 py-2">{formatMoney(lease.rent_amount)}</td>
                      <td className="px-2 py-2">{formatDisplayDate(lease.start_date)}</td>
                    </tr>
                  ))}
                  {filteredLeases.length === 0 ? (
                    <tr>
                      <td className="px-2 py-3 text-sm text-slate-500" colSpan={4}>
                        <div className="rounded-xl bg-stone/40 p-4">No leases yet.</div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section id="charges" className="card p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-xl">Charges</h3>
              <span className="text-sm text-slate-400">{chargesQuery.data?.length ?? 0} total</span>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-[520px] w-full text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.08em] text-slate-400">
                    <th className="px-2 py-2 text-left font-semibold">Unit</th>
                    <th className="px-2 py-2 text-left font-semibold">Tenant</th>
                    <th className="px-2 py-2 text-left font-semibold">Amount</th>
                    <th className="px-2 py-2 text-left font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(chargesQuery.data ?? []).map((charge) => (
                    <tr key={charge.id} className="border-b border-stone text-slate-700">
                      <td className="px-2 py-2">{charge.unit ?? '—'}</td>
                      <td className="px-2 py-2">{charge.tenant ?? '—'}</td>
                      <td className="px-2 py-2">{formatMoney(charge.amount)}</td>
                      <td className="px-2 py-2">
                        <StatusBadge status={charge.status} />
                      </td>
                    </tr>
                  ))}
                  {chargesQuery.data?.length === 0 ? (
                    <tr>
                      <td className="px-2 py-3 text-sm text-slate-500" colSpan={4}>
                        <div className="rounded-xl bg-stone/40 p-4">No charges yet.</div>
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <div className="flex flex-col gap-6">
          <section id="properties" className="card p-6">
            <h3 className="font-display text-xl">Create Property</h3>
            <form
              className="mt-4 flex gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                setPropertyMessage(null)
                setPropertyStatus(null)
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
            {propertyMessage ? (
              <Alert type={propertyStatus === 'error' ? 'error' : 'success'} message={propertyMessage} className="mt-3" />
            ) : null}
          </section>

          <section className="card p-6">
            <h3 className="font-display text-xl">Add Unit</h3>
            <form
              className="mt-4 grid gap-3"
              onSubmit={(event) => {
                event.preventDefault()
                setUnitMessage(null)
                setUnitStatus(null)
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
                Add Unit
              </Button>
            </form>
            {unitMessage ? (
              <Alert type={unitStatus === 'error' ? 'error' : 'success'} message={unitMessage} className="mt-3" />
            ) : null}
          </section>

          <section className="card p-6">
            <h3 className="font-display text-xl">Create Lease</h3>
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
                  onBlur={(event) =>
                    setLeaseForm((prev) => ({ ...prev, rent_amount: formatCurrencyInput(event.target.value) }))
                  }
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
                <DatePicker
                  selected={leaseForm.start_date}
                  onChange={(date: Date | null) => date && setLeaseForm((prev) => ({ ...prev, start_date: date }))}
                  dateFormat="MM/dd/yyyy"
                  className="w-full"
                />
              </div>
              <Button type="submit" className="btn-primary" disabled={leaseMutation.isPending}>
                {leaseMutation.isPending ? 'Creating...' : 'Create Lease'}
              </Button>
              {leaseMessage ? (
                <Alert type={leaseStatus === 'error' ? 'error' : 'success'} message={leaseMessage} />
              ) : null}
            </form>
          </section>

          <section className="card p-6">
            <h3 className="font-display text-xl">Add Charge</h3>
            <form className="mt-4 grid gap-3" onSubmit={submitCharge}>
              <select
                value={chargeForm.lease_id}
                onChange={(event) => setChargeForm((prev) => ({ ...prev, lease_id: event.target.value }))}
              >
                <option value="">Lease</option>
                {(leasesQuery.data ?? []).map((lease) => (
                  <option key={lease.id} value={lease.id}>
                    {lease.unit?.name ?? `Unit ${lease.unit_id}`} • {lease.tenant?.name ?? `Tenant ${lease.tenant_user_id}`}
                  </option>
                ))}
              </select>
              <div>
                <label className="text-xs text-slate-500">Amount ($)</label>
                <input
                  value={chargeForm.amount}
                  onChange={(event) => setChargeForm((prev) => ({ ...prev, amount: event.target.value }))}
                  placeholder="e.g. 1500.00"
                  onBlur={(event) =>
                    setChargeForm((prev) => ({ ...prev, amount: formatCurrencyInput(event.target.value) }))
                  }
                />
                <p className="text-xs text-slate-400">Stored in cents internally.</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <DatePicker
                  selected={chargeForm.due_date}
                  onChange={(date: Date | null) => date && setChargeForm((prev) => ({ ...prev, due_date: date }))}
                  dateFormat="MM/dd/yyyy"
                  className="w-full"
                />
                <select
                  value={chargeForm.status}
                  onChange={(event) => setChargeForm((prev) => ({ ...prev, status: event.target.value }))}
                >
                  <option value="due">Due</option>
                  <option value="paid">Paid</option>
                  <option value="void">Void</option>
                </select>
              </div>
              <Button type="submit" className="btn-primary" disabled={chargeMutation.isPending}>
                {chargeMutation.isPending ? 'Saving...' : 'Add Charge'}
              </Button>
              {chargeMessage ? (
                <Alert type={chargeStatus === 'error' ? 'error' : 'success'} message={chargeMessage} />
              ) : null}
            </form>
          </section>

          <section id="imports" className="card p-6">
            <h3 className="font-display text-xl">CSV Import</h3>
            <div className="mt-4 flex gap-2">
              {(['units', 'leases', 'charges'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setImportTab(tab)}
                  className={`btn text-xs ${importTab === tab ? 'btn-primary' : 'btn-ghost'}`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <div className="mt-4 grid gap-3">
              <Button className="btn-ghost" onClick={() => downloadTemplate(importTab)}>
                Download Template
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
