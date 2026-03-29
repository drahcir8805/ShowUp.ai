# ShowUp.ai

Polymarket for people who skip classes — stay locked in. This repo contains the marketing site (Next.js).

## Develop

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Build

```bash
npm run build
npm start
```

## Location Check-In + Social Alerts

1. Add env vars from `.env.example` into `.env`.
2. Run `database/location_social_system.sql` in your Supabase SQL editor.
3. (Optional) Run `database/location_social_seed.sql` after replacing sample UUIDs/emails with real `auth.users` IDs.
4. Start the app and use:
   - `/profile` for profile/follow/trusted-friends management
   - `/check-in` for location-aware class check-ins
