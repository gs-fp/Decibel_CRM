# Skills (optional / advanced)

These skills are for **Twenty’s syncable-entity and workspace-migration system**. They are only relevant when you are:

- Adding or changing **syncable metadata entities** (objects with `universalIdentifier`, `applicationId`, etc.).
- Working in **metadata-modules** or **workspace-migration** code in `twenty-server`.

For normal “AI features on top of the core CRM” (UI in `decibel-ai`, logic functions, custom objects via Apps), you **do not** need these skills. Follow **ai-config/rules/decibel-ai-architecture.mdc** and the Twenty Apps docs instead.

| Skill | Use when |
|-------|----------|
| **syncable-entity-types-and-constants** | Defining new syncable entity types, flat types, or registering in central constants. |
| **syncable-entity-builder-and-validation** | Building validators or migration action builders; business rules, uniqueness, FKs. |
| **syncable-entity-cache-and-transform** | Entity-to-flat conversion, input DTO transpilation, cache recomputation. |
| **syncable-entity-integration** | Wiring services into NestJS modules, resolvers, GraphQL. |
| **syncable-entity-runner-and-actions** | Action handlers for workspace migrations; create/update/delete in the runner. |
| **syncable-entity-testing** | Integration tests for metadata entities, validators, CRUD. |

Request a skill by name (e.g. `@syncable-entity-types-and-constants`) when you need it.
