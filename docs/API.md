# RentPay Portal API (MVP)

Base URL (local): `http://localhost:8000`

Auth uses **Bearer tokens** from `/api/auth/login` (Laravel Sanctum personal access tokens).

## Auth

### POST /api/auth/login
Request:
```json
{
  "email": "tenant@rentpay.test",
  "password": "password"
}
```
Response:
```json
{
  "token": "<token>",
  "user": { "id": 2, "role": "tenant", "email": "tenant@rentpay.test", "name": "Tenant User" }
}
```

### POST /api/auth/logout
Headers: `Authorization: Bearer <token>`

### GET /api/auth/me
Headers: `Authorization: Bearer <token>`

## Admin (role=admin)

### Properties
- GET `/api/properties`
- POST `/api/properties`
- GET `/api/properties/{id}`
- PUT `/api/properties/{id}`
- DELETE `/api/properties/{id}`

Create property:
```json
{ "name": "Maple Apartments", "address_line1": "123 Maple St", "city": "Springfield", "state": "CA", "postal_code": "90001" }
```

### Units
- GET `/api/units`
- POST `/api/units`
- GET `/api/units/{id}`
- PUT `/api/units/{id}`
- DELETE `/api/units/{id}`

Create unit:
```json
{ "property_id": 1, "name": "Unit 1A", "notes": "Main floor" }
```

### Leases
- GET `/api/leases`
- POST `/api/leases`
- GET `/api/leases/{id}`
- PUT `/api/leases/{id}`
- DELETE `/api/leases/{id}`

Create lease (auto-creates a due charge):
```json
{ "unit_id": 1, "tenant_user_id": 2, "rent_amount": 150000, "due_day": 1, "start_date": "2026-01-01" }
```

### Tenants
- GET `/api/admin/tenants`

Returns tenant list (id, name, email).

## Tenant (role=tenant)

### GET /api/tenant/charges
Returns due charges for the current tenant.

### GET /api/tenant/payments
Returns payment history for the current tenant.

## Payments

### POST /api/payments/checkout
Creates a Stripe Checkout Session and returns a redirect URL.

Request:
```json
{ "charge_id": 1 }
```
Response:
```json
{ "url": "https://checkout.stripe.com/..." }
```

### POST /api/webhooks/stripe
Stripe webhook endpoint. **Do not call manually in production.**

Configure Stripe CLI:
```bash
stripe listen --forward-to http://localhost:8000/api/webhooks/stripe
```

## Seeded users (local)
- Admin: `admin@rentpay.test` / `password`
- Tenant: `tenant@rentpay.test` / `password`

## Notes
- Amounts are stored in cents.
- Charges are only marked paid on Stripe webhook success.
