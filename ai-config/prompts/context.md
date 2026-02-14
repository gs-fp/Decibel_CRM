# Decibel context (paste into new session)

**This repo:** Decibel CRM — a separate project adding AI features on top of Twenty. We pull from upstream when we want their latest; we never merge to Twenty’s main.

**Where AI code lives:** In **`packages/decibel-ai/`**, not inside `twenty-front` modules. One bridge in Twenty: **`packages/twenty-front/src/modules/decibel/decibel-bridge.ts`** (re-exports only). In core Twenty files, add a single line to import from `@/decibel` and render.

**Data:** No new columns on standard tables. Use custom objects with a relation to `person`/`company`. Backend AI via logic functions (custom app + `databaseEvent`/`route`/`cron`), not NestJS.

**Git:** Modular commits; use `bridge: [description]` when touching a core file. Use `.gitattributes` + `merge=ours` for files you always keep as Decibel’s (e.g. branding).

Full rule: **ai-config/rules/decibel-ai-architecture.mdc**.
