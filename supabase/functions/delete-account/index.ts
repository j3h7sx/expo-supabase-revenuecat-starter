import { createClient } from "https://esm.sh/@supabase/supabase-js@2.110.0";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const authHeader = request.headers.get("authorization");
  const userClient = createClient(supabaseUrl, anonKey, {
    global: {
      headers: authHeader ? { authorization: authHeader } : {},
    },
  });
  const adminClient = createClient(supabaseUrl, serviceRoleKey);

  const { data, error } = await userClient.auth.getUser();

  if (error || !data.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { error: deleteError } = await adminClient.auth.admin.deleteUser(
    data.user.id
  );

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ ok: true });
});
