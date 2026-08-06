// Deploy: supabase functions deploy send-support-email --project-ref oryswbozkjvrhxpglzwt
// Secret required: supabase secrets set RESEND_API_KEY=re_xxx --project-ref oryswbozkjvrhxpglzwt
//
// Wire-up (once deployed): Supabase Dashboard → Database → Webhooks → Create a
// new webhook → table "support_tickets", event "INSERT", type "HTTP Request",
// URL = this function's URL, and add header
// Authorization: Bearer <anon key> (or a dedicated webhook secret checked below).
import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPPORT_DESTINATION = "gm@skhaa.sa";
const FROM_ADDRESS = "Nabhni Support <support@hussainmofareh.com>";

interface SupportTicketRow {
  id: string;
  name: string | null;
  email: string;
  subject: string;
  message: string;
  created_at: string;
}

interface WebhookPayload {
  type: "INSERT";
  table: string;
  record: SupportTicketRow;
}

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  if (!RESEND_API_KEY) {
    return new Response("RESEND_API_KEY not configured", { status: 500 });
  }

  let payload: WebhookPayload;
  try {
    payload = await req.json();
  } catch {
    return new Response("Invalid JSON", { status: 400 });
  }

  const ticket = payload.record;
  if (!ticket?.email || !ticket?.message) {
    return new Response("Missing ticket fields", { status: 400 });
  }

  const emailResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: [SUPPORT_DESTINATION],
      reply_to: ticket.email,
      subject: `[نبهني] طلب دعم: ${ticket.subject}`,
      text: [
        `من: ${ticket.name ?? "غير محدد"} <${ticket.email}>`,
        `التذكرة: ${ticket.id}`,
        `التاريخ: ${ticket.created_at}`,
        "",
        ticket.message,
      ].join("\n"),
    }),
  });

  if (!emailResponse.ok) {
    const body = await emailResponse.text();
    return new Response(`Resend error: ${body}`, { status: 502 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json" },
  });
});
