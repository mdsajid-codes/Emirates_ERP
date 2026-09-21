# Seed Data (Layer 4)

This directory contains master reference and default seed data changelogs executed in Layer 4 of tenant provisioning.

## Rules for Seed Data

1. **Preconditions**:
   - Every seed changeset MUST include `<preConditions onFail="MARK_RAN">` checking that the target table exists.
   - For idempotent seeding, include `<sqlCheck expectedResult="0">SELECT COUNT(*) FROM table_name</sqlCheck>` or similar uniqueness checks.

2. **Placement**:
   - Include all seed changelogs in the Layer 4 section at the bottom of `db.changelog-tenant.xml`.
   - NEVER place `INSERT` statements inside Layer 2 DDL files.

3. **Template**:
   - Refer to `template-module-seed.xml` in this directory when adding seed data for a new module.
