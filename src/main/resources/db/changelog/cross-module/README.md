# Cross-Module Integrations (Layer 3)

This directory contains Liquibase changelogs that establish relationships (Foreign Keys, altered columns, integration views) between distinct modules.

## Architecture Rules

1. **Layer Separation**:
   - **Layer 1: Foundation** — Core tenant tables, themes, security, notification infrastructure.
   - **Layer 2: Core DDL** — Standard table definitions (`CREATE TABLE`) grouped by module.
   - **Layer 3: Cross-Module Integrations** — Foreign Key constraints (`ALTER TABLE / addForeignKeyConstraint`) linking tables across different modules.
   - **Layer 4: Seed Data** — All `INSERT` statements seeding reference/default data.

2. **Precondition Requirements**:
   - Every file in Layer 3 MUST include `<preConditions onFail="MARK_RAN">` checking that all base and referenced tables exist before applying changes.

3. **Guidelines for Developers**:
   - When creating a feature that connects two separate modules (e.g. Sales <-> Account GL, Fleet <-> Account GL), place the FK changeset in Layer 3 of `db.changelog-tenant.xml`.
   - Never add `INSERT` statements or foreign keys to uncreated tables inside a module's initial DDL script.

4. **Pre-Commit Tools**:
   - Before adding a new module or changelog, run the interactive assistant:
     ```bash
     ./scripts/new-module-checklist.sh
     ```
   - Before committing your code, run full Liquibase architecture validation:
     ```bash
     ./scripts/test-tenant-provisioning.sh
     ```
