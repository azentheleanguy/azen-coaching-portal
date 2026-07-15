# Coached by Azen — Client Portal

A client check-in + progress tracking app, and a coach dashboard, built with Next.js.
Data (check-ins, notes, client list) is stored in **Vercel KV** so it's shared and
persists across all devices — your clients' phones and your dashboard all see the
same live data.

## Before you deploy: change your coach access code

Open `app/coach/page.tsx` and find this line near the top:
