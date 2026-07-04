import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

type RevenueCatEvent = {
  app_user_id?: string;
  entitlement_id?: string;
  entitlement_ids?: string[];
  expiration_at_ms?: number | null;
  product_id?: string | null;
  type?: string;
};

type RevenueCatPayload = {
  event?: RevenueCatEvent;
};

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const webhookSecret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey);

function hasActiveAccess(event: RevenueCatEvent) {
  const type = event.type?.toUpperCase();
  return type === "INITIAL_PURCHASE" ||
    type === "RENEWAL" ||
    type === "UNCANCELLATION" ||
    type === "NON_RENEWING_PURCHASE" ||
    type === "SUBSCRIPTION_EXTENDED";
}

function normalizeEntitlements(event: RevenueCatEvent) {
  if (event.entitlement_ids?.length) {
    return event.entitlement_ids;
  }

  return event.entitlement_id ? [event.entitlement_id] : [];
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authorization = request.headers.get("authorization") ?? "";
  const token = authorization.replace(/^Bearer\s+/i, "");

  if (!webhookSecret || token !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  const payload = await request.json() as RevenueCatPayload;
  const event = payload.event;
  const appUserId = event?.app_user_id;

  if (!event || !appUserId) {
    return new Response("Missing event.app_user_id", { status: 400 });
  }

  const active = hasActiveAccess(event);
  const entitlementIds = active ? normalizeEntitlements(event) : [];
  const expiresAt = event.expiration_at_ms
    ? new Date(event.expiration_at_ms).toISOString()
    : null;

  const { error } = await supabase
    .from("profiles")
    .update({
      has_active_entitlement: active && entitlementIds.length > 0,
      revenuecat_app_user_id: appUserId,
      revenuecat_entitlement_ids: entitlementIds,
      subscription_expires_at: expiresAt,
      subscription_product_id: event.product_id ?? null,
      subscription_status: active ? "active" : "expired",
      updated_at: new Date().toISOString(),
    })
    .eq("id", appUserId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ ok: true });
});
