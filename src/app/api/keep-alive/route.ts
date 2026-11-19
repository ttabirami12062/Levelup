import { createClient } from "@supabase/supabase-js";

// Vercel Cron calls this once a day (see vercel.json). Supabase's free plan
// pauses a project after 7 days with no activity, so a daily database call
// keeps the game working even when nobody has played for a while.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  // Vercel sends this header when CRON_SECRET is set, so strangers can't spam it.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } },
  );

  // keep_alive() is a tiny function in supabase/schema.sql that just returns the time.
  const { data, error } = await supabase.rpc("keep_alive");
  if (error) {
    console.error("Keep-alive failed:", error.message);
    return Response.json({ ok: false, error: error.message }, { status: 500 });
  }
  return Response.json({ ok: true, databaseTime: data });
}
