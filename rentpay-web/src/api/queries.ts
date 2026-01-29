import { api } from './client'
import type { Charge, Payment, Unit, TenantUser } from './types'

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

export const fetchTenants = async () => {
  const { data } = await api.get<{ data: TenantUser[] }>('/api/admin/tenants')
  return data.data
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

export const createCheckout = async (chargeId: number) => {
  const { data } = await api.post<{ url: string }>('/api/payments/checkout', { charge_id: chargeId })
  return data.url
}
