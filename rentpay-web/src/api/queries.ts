import { api } from './client'
import type { Charge, Payment, Unit, TenantUser, Property, Lease, AdminCharge } from './types'

export const fetchTenantCharges = async () => {
  const { data } = await api.get<{ data: Charge[] }>('/api/tenant/charges')
  return data.data
}

export const fetchTenantPayments = async () => {
  const { data } = await api.get<{ data: Payment[] }>('/api/tenant/payments')
  return data.data
}

export const fetchUnits = async () => {
  const { data } = await api.get<{ data: Unit[] }>('/api/units')
  return data.data
}

export const fetchProperties = async () => {
  const { data } = await api.get<{ data: Property[] }>('/api/properties')
  return data.data
}

export const fetchTenants = async () => {
  const { data } = await api.get<{ data: TenantUser[] }>('/api/admin/tenants')
  return data.data
}

export const fetchLeases = async () => {
  const { data } = await api.get<{ data: Lease[] }>('/api/leases')
  return data.data
}

export const fetchAdminCharges = async () => {
  const { data } = await api.get<{ data: AdminCharge[] }>('/api/admin/charges')
  return data.data
}

export const createProperty = async (payload: { name: string; address_line1?: string; city?: string; state?: string; postal_code?: string }) => {
  const { data } = await api.post('/api/properties', payload)
  return data
}

export const createUnit = async (payload: { property_id: number; name: string; notes?: string }) => {
  const { data } = await api.post('/api/units', payload)
  return data
}

export const deleteUnit = async (unitId: number) => {
  const { data } = await api.delete(`/api/units/${unitId}`)
  return data
}

export const createLease = async (payload: {
  unit_id: number
  tenant_user_id: number
  rent_amount: number
  due_day: number
  start_date: string
}) => {
  const { data } = await api.post('/api/leases', payload)
  return data
}

export const createCharge = async (payload: {
  lease_id: number
  amount: number
  due_date: string
  status?: 'due' | 'paid' | 'void'
}) => {
  const { data } = await api.post('/api/admin/charges', payload)
  return data
}

export const createCheckout = async (chargeId: number) => {
  const { data } = await api.post<{ url: string }>('/api/payments/checkout', { charge_id: chargeId })
  return data.url
}

export const importCsv = async (endpoint: 'units' | 'leases' | 'charges', file: File) => {
  const form = new FormData()
  form.append('file', file)
  const { data } = await api.post(`/api/admin/import/${endpoint}`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return data
}
