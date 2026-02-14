# ai-config

AI-agnostic configuration for **Decibel CRM**: a fork that adds AI features on top of Twenty and rebases from upstream when needed. Use with any coding assistant (e.g. Cursor, Claude Code, Antigravity). This folder tells the AI how Decibel differs from vanilla Twenty and how to work in this repo.

---

## What lives here

| Item | Purpose |
|------|--------|
| **rules/** | The one rule that matters for Decibel: **decibel-ai-architecture.mdc**. Where to put AI code (sidecar, bridge, shadow tables, logic functions, git). Always applied. **rules/archive/** holds old copies of Twenty upstream rules (not loaded); restore or copy from upstream if needed. |
| **prompts/context.md** | Short text to paste into a new session (chat, composer, etc.) so the AI has Decibel context without loading the full rule. Use when starting fresh. |
| **skills/** | Optional, advanced. Six skills for Twenty’s **syncable-entity** system (metadata, workspace migrations). Use only when you need to add new syncable entities or touch that layer; ignore for normal AI feature work. See **skills/README.md**. |
| **environment.json** | Dev environment: install/start commands and terminal config (e.g. start Docker, DB, dev server). Used by the IDE or agent to set up the project. |
| **environment.docker-compose.json** | Same for a Docker Compose–based environment. |
| **Dockerfile** | For running the IDE or AI agent in a container. |
| **worktrees.json** | Worktrees configuration, if your tool supports multiple worktrees. |

---

## Rules (rules/)

Only **decibel-ai-architecture.mdc** is needed. It covers:

1. **Sidecar** – AI code in `packages/decibel-ai/`, not inside `twenty-front` modules.
2. **Bridge** – Single touch point: `twenty-front/src/modules/decibel/decibel-bridge.ts`; core files add one line to import from `@/decibel`.
3. **Shadow tables** – Custom objects with a relation to standard objects; no new columns on `person`/`company`.
4. **Logic functions** – Backend AI in a custom app (e.g. Twenty Apps) with `databaseEvent`/`route`/`cron` triggers, not in NestJS.
5. **Git** – Separate project; pull from upstream when you want Twenty’s latest; modular commits and `bridge:` prefix for touch points; `.gitattributes` for files you keep as Decibel’s.

For general Twenty patterns (TypeScript, React, Nx, testing), rely on the repo you’re rebasing onto. Optional: copy upstream Twenty’s rules (e.g. from .cursor/rules or your tool equivalent) into this repo if you want more guidance.

---

## Prompts (prompts/)

- **context.md** – Paste into a new session (chat, composer, etc.) to set Decibel context quickly. Full details are in **rules/decibel-ai-architecture.mdc**.

---

## Skills (skills/)

Six skills for **Twenty’s syncable-entity / workspace-migration** system (validators, cache, types, integration, runner, testing). Only relevant when you are:

- Adding or changing syncable metadata entities.
- Working in `twenty-server` metadata-modules or workspace-migration code.

For “AI features on top of the core CRM,” you usually do **not** need these. See **skills/README.md** for when to use each.

---

## Useful commands (from Twenty)

```bash
yarn start                                    # Frontend + server + worker
npx nx database:reset twenty-server            # Reset DB
npx nx lint:diff-with-main twenty-front        # Lint changed files (fast)
npx nx typecheck twenty-front                  # Type check
```

Full command reference: upstream Twenty repo or their docs.
