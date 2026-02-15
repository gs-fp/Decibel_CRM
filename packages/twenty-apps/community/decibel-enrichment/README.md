# Decibel Contact Enrichment

Extracts contact info (phone, job title, city, LinkedIn URL) from email messages. Stores enrichment in the **personEnrichment** shadow table and updates the standard **Person** record (Job Title, Phones, LinkedIn, Location) so data is visible in All People and record views.

## Setup

1. **From this directory** (`packages/twenty-apps/community/decibel-enrichment`), install and sync (do this once, or after changing the app):
   ```bash
   cd packages/twenty-apps/community/decibel-enrichment
   yarn install          # if needed (generates/updates yarn.lock here)
   yarn sync             # register app with Twenty (server must be running)
   ```
   This app is a **standalone** Twenty app (its own `yarn.lock`); it is not in the root workspace. Run `yarn install` and `yarn sync` from this directory only. For the main CRM, run `yarn start` from the **repo root**.
2. **Configure the app** – In Twenty: **Settings** → **Applications** → **Decibel Contact Enrichment** → **Settings** tab → **Configuration**. Set **TWENTY_API_KEY** (create a key under Settings → APIs & Webhooks if needed) and **TWENTY_API_URL** for self-hosted (e.g. `http://localhost:3000`; leave empty on Twenty Cloud). See [App variables](#app-variables-twenty_api_key-twenty_api_url) for details.

## App variables (TWENTY_API_KEY, TWENTY_API_URL)

App variables are set in the UI: **Settings** → **Applications** → **Decibel Contact Enrichment** → **Settings** tab → **Configuration**. Create an API key under **Settings** → **APIs & Webhooks** if you don’t have one; paste it as **TWENTY_API_KEY**. For self-hosted, set **TWENTY_API_URL** (e.g. `http://localhost:3000`); on Twenty Cloud leave it empty.

## Triggers

- **messageParticipant.updated** (when `personId` is set) – **main trigger after Gmail sync.** Twenty links participants to Person records asynchronously; when a participant gets `personId`, we run enrichment for that message.
- **message.created** – runs when a new message is created (participants may not have `personId` yet).
- **messageChannel.updated** (when `syncStatus` → ACTIVE) – runs a backfill when a channel sync completes.
- **Cron (every 15 min)** – backfills any messages that don’t have enrichment yet.
- **Route `POST /s/backfill`** – **manual backfill.** Call this to run enrichment on demand (e.g. after sync). Requires auth (Bearer token). Returns `{ ok, processed, enriched, hasMore }`.

## Shadow table: personEnrichment

- **personId** (TEXT) – UUID of the person this enrichment belongs to (relation by ID; no new column on standard `person` table).
- **phone**, **jobTitle**, **city**, **linkedInUrl** (TEXT, nullable) – extracted from email body.
- **sourceMessageId** (TEXT, nullable) – message UUID the data was extracted from.
- **enrichedAt** (DATE_TIME) – when the record was created.

## Unique matching

- Only participants with a non-null `personId` are enriched.
- Extraction runs on the **full message body**; for multiple participants the same text is used for each (no per-participant body split). Refinements (e.g. exclude CC’d colleagues) can be added by filtering participants by role.

## Frontend

- Use **usePersonEnrichment(personId)** and **PersonEnrichmentBadge** from `@/decibel` to show a “New Info Available” badge on the Person profile.

## Troubleshooting

**"Applications" not visible in Settings:**

The Applications page requires the `IS_APPLICATION_ENABLED` feature flag. If your workspace was created before this flag existed, it won't be set. Two options:

- **Option A (fresh start):** Run `npx nx database:reset twenty-server` from the repo root. This resets the database and seeds all feature flags including `IS_APPLICATION_ENABLED`.
- **Option B (preserve data):** Insert the flag directly:
  ```sql
  -- Find your workspace ID
  SELECT id FROM core.workspace LIMIT 1;
  -- Enable the flag (replace <workspace-id>)
  INSERT INTO core."featureFlag" (id, key, "workspaceId", value, "createdAt", "updatedAt")
  VALUES (gen_random_uuid(), 'IS_APPLICATION_ENABLED', '<workspace-id>', true, NOW(), NOW())
  ON CONFLICT ON CONSTRAINT "IDX_FEATURE_FLAG_KEY_WORKSPACE_ID_UNIQUE" DO UPDATE SET value = true;
  ```
  Restart the server after inserting.

**Nothing populating after sync (Job Title, Phones, LinkedIn, Location stay empty):**

1. **App variables** – See [App variables](#app-variables-twenty_api_key-twenty_api_url) above. Set **TWENTY_API_KEY** (required) and, for self-hosted, **TWENTY_API_URL** (e.g. `http://localhost:3000`). Logic functions run with these env vars; if the key is missing, enrichment is skipped.
2. **Re-sync the app** – After changing code or variables, run from this directory:
   ```bash
   yarn sync
   ```
   (Main server must be running: `yarn start` from repo root.)
3. **Trigger backfill manually** – To see if the app can read messages and write data, call the backfill route (use a valid Bearer token for your workspace):
   ```bash
   curl -X POST https://YOUR_TWENTY_URL/s/backfill -H "Authorization: Bearer YOUR_TOKEN"
   ```
   Response: `{ "ok": true, "processed": N, "enriched": M, "hasMore": false }`. If you get `processed: 0` and `enriched: 0`, there are no messages yet or none with participants linked to people. If you get 401, the token is wrong or route auth is failing.
4. **Check server logs** – Look for `[decibel-enrichment]` in the Twenty server (or logic-function worker) logs. You may see "TWENTY_API_KEY not set" or REST errors (401, 404). Fix the cause (variables, sync, or REST path).
5. **Participants must have Person links** – Enrichment only runs for message participants that have a **personId**. After Gmail sync, Twenty creates/links contacts; until that job runs, new participants may not have personId, so no enrichment. The cron (every 15 min) and the **POST /s/backfill** run will then pick up those messages.

- **REST 404 on personEnrichments** – Re-sync the app and confirm it is enabled for the workspace.
