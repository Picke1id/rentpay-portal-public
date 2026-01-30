# CSV Templates (Private)

These are **private** templates with extended fields for real estate operators.
Public/demo repo should keep the minimal v1 headers only.

## Units

### v1 (public)
```
property_id,name,notes
```

### v2 (private)
```
property_id,name,unit_number,building_id,floor,bedrooms,bathrooms,sq_ft,market_rent,status,notes
```

Field notes:
- `unit_number`: human‑readable unit label
- `market_rent`: cents
- `status`: occupied|vacant|offline

## Leases

### v1 (public)
```
unit_id,tenant_user_id,rent_amount,due_day,start_date,end_date
```

### v2 (private)
```
unit_id,tenant_user_id,lease_number,external_id,lease_status,rent_amount,deposit_amount,due_day,grace_period_days,late_fee_amount,auto_charge,start_date,end_date,move_in_date,move_out_date,renewal_date,prorate_amount
```

Field notes:
- `lease_status`: active|month-to-month|ended|future
- `auto_charge`: true|false
- monetary fields are cents

## Charges

### v1 (public)
```
lease_id,amount,due_date,status
```

### v2 (private)
```
lease_id,amount,charge_type,description,tax_amount,recurring,period_start,period_end,due_date,status,status_reason
```

Field notes:
- `charge_type`: rent|parking|pet|utility|fee
- `recurring`: true|false
- monetary fields are cents

## Tenants (future)

### v2 (private)
```
name,email,phone,tenant_external_id,billing_address,preferred_payment_method,notification_opt_in
```

## Payments (import/export)

### v2 (private)
```
charge_id,amount,payment_date,method,reference_id,fee_amount,received_by,status
```

Notes:
- `method`: card|ach|cash|check
- `received_by`: system|staff
- monetary fields are cents
