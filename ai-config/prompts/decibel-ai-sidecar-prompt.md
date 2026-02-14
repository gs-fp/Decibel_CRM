# Cursor prompt: Decibel AI sidecar architecture

Copy this into a Cursor chat or new AI process when you want to enforce the sidecar strategy.

---

**Decibel CRM – AI / custom code architecture**

This repo is a fork of Twenty CRM. We keep a clean separation from upstream by putting all AI and Decibel-specific code in a **sidecar package**, not inside core Twenty packages.

1. **Do not** add files or features into `packages/twenty-front/src/modules/` (or other core package internals) for Decibel or AI.

2. **Do** use a dedicated top-level package: **`packages/decibel-ai/`**.
   - Create this package if it doesn’t exist.
   - Add **`packages/decibel-ai`** to the **`workspaces.packages`** array in the **root `package.json`**.

3. **Integration**: Have `twenty-front` (or other apps) import and use `decibel-ai` via clear boundaries (e.g. imports, routes, or dependency injection). Keep core Twenty code unchanged so upstream merges stay easy.

When implementing or designing AI or Decibel-specific work, always target `packages/decibel-ai/` and ensure the new package is listed in root `package.json` workspaces.
