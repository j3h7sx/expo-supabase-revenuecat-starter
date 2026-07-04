create or replace function public.prevent_client_billing_field_updates()
returns trigger
language plpgsql
as $$
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  if new.has_active_entitlement is distinct from old.has_active_entitlement
    or new.subscription_status is distinct from old.subscription_status
    or new.revenuecat_entitlement_ids is distinct from old.revenuecat_entitlement_ids
    or new.subscription_product_id is distinct from old.subscription_product_id
    or new.subscription_expires_at is distinct from old.subscription_expires_at
  then
    raise exception 'Billing fields are managed by the server';
  end if;

  return new;
end;
$$;

drop trigger if exists protect_profile_billing_fields on public.profiles;

create trigger protect_profile_billing_fields
  before update on public.profiles
  for each row execute function public.prevent_client_billing_field_updates();
