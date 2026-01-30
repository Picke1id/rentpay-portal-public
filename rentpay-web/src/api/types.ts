export type Property = {
  id: number
  name: string
  address_line1?: string | null
  city?: string | null
  state?: string | null
  postal_code?: string | null
}

export type Unit = {
  id: number
  property_id: number
  name: string
  notes?: string | null
  property?: Property
}

export type Lease = {
  id: number
  unit_id: number
  tenant_user_id: number
  rent_amount: number
  due_day: number
  start_date: string
  end_date?: string | null
  unit?: Unit
  tenant?: { id: number; name: string; email: string }
}

export type Charge = {
  id: number
  lease_id: number
  amount: number
  due_date: string
  status: 'due' | 'paid' | 'void'
}

export type Payment = {
  id: number
  charge_id: number
  provider: string
  provider_payment_id?: string | null
  status: 'pending' | 'succeeded' | 'failed'
  amount: number
  paid_at?: string | null
  created_at?: string
}

export type AdminCharge = {
  id: number
  lease_id: number
  amount: number
  due_date: string
  status: 'due' | 'paid' | 'void'
  unit?: string | null
  property?: string | null
  tenant?: string | null
}

export type TenantUser = {
  id: number
  name: string
  email: string
}
