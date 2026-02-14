# Cursor

Decibel CRM uses **ai-config** for AI-agnostic rules and context (see **ai-config/README.md**). For Cursor:

- **Rules**: Copy or symlink **ai-config/rules/** into **.cursor/rules/** so Cursor loads the Decibel architecture rule (e.g. `decibel-ai-architecture.mdc`). Alternatively, point Cursor at `ai-config/` if your setup supports it.
- **Context**: Paste **ai-config/prompts/context.md** into a new chat when you need Decibel context.
- **Environment**: **ai-config/environment.json** and **ai-config/environment.docker-compose.json** define install/start and terminals; use them in Cursor environment settings if you use that feature.

No Cursor-specific logic lives in the codebase; all guidance is in ai-config so it works with any coding assistant.
