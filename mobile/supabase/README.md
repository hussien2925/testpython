# Supabase setup — نبهني (Nabhni)

Project: `Nabhni` under the `Skhaa Tech` organization
URL: `https://oryswbozkjvrhxpglzwt.supabase.co`

## 1. Run the schema

Supabase Dashboard → **SQL Editor** → New query → paste the entire contents
of [`schema.sql`](./schema.sql) → **Run**. Safe to re-run if you need to.

Creates: `profiles` (auto-filled on signup via trigger), `addresses`,
`reminders` (cloud mirror, synced once signed in), `tracked_subscriptions`
(the user's own Netflix-style subscriptions), `support_tickets` — all with
row-level security so each user only ever sees their own rows.

## 2. Deploy the support-email function

Needs the Supabase CLI (`npm install -g supabase`, then `supabase login`).

```bash
cd mobile
supabase link --project-ref oryswbozkjvrhxpglzwt
supabase secrets set RESEND_API_KEY=re_your_key_here --project-ref oryswbozkjvrhxpglzwt
supabase functions deploy send-support-email --project-ref oryswbozkjvrhxpglzwt
```

Update `FROM_ADDRESS` in
[`functions/send-support-email/index.ts`](./functions/send-support-email/index.ts)
to a sender address on a domain you've verified in Resend (Resend requires
DNS verification before it will send as that domain — their dashboard walks
through adding the TXT/DKIM records).

## 3. Wire up the webhook (Dashboard, no CLI needed)

Dashboard → **Database** → **Webhooks** → **Create a new webhook**:
- Table: `support_tickets`
- Events: `INSERT`
- Type: `HTTP Request` → your deployed function's URL
  (`https://oryswbozkjvrhxpglzwt.supabase.co/functions/v1/send-support-email`)
- HTTP header: `Authorization: Bearer <anon key>` (Project Settings → API)

Now every row inserted into `support_tickets` (i.e. every submitted support
form in the app) emails `gm@skhaa.sa` automatically.

## 4. App-side env vars

In `mobile/.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://oryswbozkjvrhxpglzwt.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_0R9ErkgzuWXOhPZHU1DYfA_gu_C46df
```

Both are safe to embed client-side — access is enforced by the RLS policies
in `schema.sql`, not by keeping this key secret.
