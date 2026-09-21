#!/usr/bin/env bash
# =============================================================================
# Script: new-module-checklist.sh
# Purpose: Interactive checklist & helper for developers adding a new module 
#          or changelog to EmiratesERP multi-tenant Liquibase setup.
# Usage: ./scripts/new-module-checklist.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "================================================================="
echo "   EmiratesERP Liquibase Module Registration Assistant"
echo "================================================================="
echo ""
echo "This wizard guides you through correctly classifying and registering"
echo "your new Liquibase changelog to avoid multi-tenant provisioning errors."
echo ""

echo "--- Architectural Layer Decision Matrix ---"
echo "1) Layer 1: Core Infra / Universal lookup tables (No foreign keys to other modules)"
echo "2) Layer 2: Standalone Module DDL (Creates new tables, no FKs to later modules)"
echo "3) Layer 3: Cross-Module Alterations / Foreign Keys (Adds FKs between existing modules)"
echo "4) Layer 4: Business Seed Data (INSERT INTO statements)"
echo ""

read -p "Which layer does your new changelog belong to? (1-4): " LAYER_CHOICE

case $LAYER_CHOICE in
    1)
        LAYER_NAME="LAYER 1: Core Infrastructure & Foundational Schemas"
        LAYER_MARKER="LAYER 1:"
        ;;
    2)
        LAYER_NAME="LAYER 2: Standard Domain Module DDL Schemas"
        LAYER_MARKER="LAYER 2:"
        ;;
    3)
        LAYER_NAME="LAYER 3: Cross-Module Foreign Keys & Inter-Module Alterations"
        LAYER_MARKER="LAYER 3:"
        ;;
    4)
        LAYER_NAME="LAYER 4: Business Seed Data"
        LAYER_MARKER="LAYER 4:"
        ;;
    *)
        echo "❌ Invalid choice! Must be 1, 2, 3, or 4."
        exit 1
        ;;
esac

echo ""
echo "Selected Layer: $LAYER_NAME"
echo ""

read -p "Enter module folder name (e.g. sales, pos, crm, fleet): " MODULE_NAME
read -p "Enter changelog filename (e.g. 001-create-my-schema.xml): " FILE_NAME

TARGET_REL_PATH="db/changelog/${MODULE_NAME}/${FILE_NAME}"
FULL_PATH="${PROJECT_ROOT}/src/main/resources/${TARGET_REL_PATH}"

echo ""
echo "Changelog Target Path: src/main/resources/${TARGET_REL_PATH}"

# Check if file exists
if [ ! -f "$FULL_PATH" ]; then
    echo ""
    read -p "File does not exist yet. Would you like to generate a starter template? (y/n): " GEN_TEMPLATE
    if [[ "$GEN_TEMPLATE" =~ ^[Yy]$ ]]; then
        mkdir -p "$(dirname "$FULL_PATH")"
        cat <<EOF > "$FULL_PATH"
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <!-- 
      DEPENDENCY DECLARATION:
      Module: ${MODULE_NAME}
      Layer: ${LAYER_CHOICE} (${LAYER_NAME})
      Pre-requisite tables: [LIST_TABLES_HERE]
    -->

    <changeSet id="${FILE_NAME%.xml}" author="$(whoami)">
        <validCheckSum>ANY</validCheckSum>
        <preConditions onFail="MARK_RAN">
            <!-- Add preConditions here if referencing external module tables -->
        </preConditions>
        
        <!-- Add your DDL / DML changes here -->
    </changeSet>

</databaseChangeLog>
EOF
        echo "✅ Generated starter template at: $FULL_PATH"
    fi
fi

# Check if registered in db.changelog-tenant.xml
TENANT_CHANGELOG="${PROJECT_ROOT}/src/main/resources/db/changelog/db.changelog-tenant.xml"
if grep -q "$TARGET_REL_PATH" "$TENANT_CHANGELOG"; then
    echo "✅ Already registered in db.changelog-tenant.xml."
else
    echo ""
    echo "⚠️  Action Required: Register in db.changelog-tenant.xml!"
    echo "   Add the following line under section [${LAYER_MARKER}]:"
    echo "   <include file=\"${TARGET_REL_PATH}\"/>"
fi

echo ""
echo "--- Pre-Commit Check ---"
echo "Before committing, run: ./scripts/test-tenant-provisioning.sh"
echo "================================================================="
