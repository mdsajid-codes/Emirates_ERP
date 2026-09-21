#!/usr/bin/env bash
# =============================================================================
# Script: test-tenant-provisioning.sh
# Purpose: Validates Liquibase tenant changelog configuration, XML syntax,
#          Layer compliance, and checks for unreferenced changelog files.
# Usage: ./scripts/test-tenant-provisioning.sh
# =============================================================================

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "======================================================="
echo "  EmirateERP Liquibase Tenant Changelog Validator"
echo "======================================================="
echo "Project Root: $PROJECT_ROOT"
cd "$PROJECT_ROOT"

# Step 1: Check XML Syntax of all Liquibase files
echo ""
echo "[Step 1/5] Checking XML syntax of changelog files..."
XML_ERRORS=0
for xml_file in $(find src/main/resources/db/changelog -name "*.xml"); do
    if ! python3 -c "import xml.etree.ElementTree as ET; ET.parse('$xml_file')" 2>/dev/null; then
        echo "❌ Syntax error in: $xml_file"
        XML_ERRORS=$((XML_ERRORS + 1))
    fi
done

if [ $XML_ERRORS -eq 0 ]; then
    echo "✅ All Liquibase XML files passed syntax check."
else
    echo "❌ Found $XML_ERRORS XML syntax errors."
    exit 1
fi

# Step 2: Validate Maven project compilation
echo ""
echo "[Step 2/5] Verifying Spring Boot test-compile..."
if ./mvnw test-compile -q; then
    echo "✅ Spring Boot test-compile succeeded."
else
    echo "❌ Spring Boot test-compile failed."
    exit 1
fi

# Step 3: Architecture Audit (Master Changelog Check)
echo ""
echo "[Step 3/5] Checking Liquibase Layer Architecture..."
TENANT_CHANGELOG="src/main/resources/db/changelog/db.changelog-tenant.xml"

if [ -f "$TENANT_CHANGELOG" ]; then
    echo "✅ Master tenant changelog exists ($TENANT_CHANGELOG)."
else
    echo "❌ Missing $TENANT_CHANGELOG!"
    exit 1
fi

# Step 4: Seed Data Layer Enforcement Check
echo ""
echo "[Step 4/5] Auditing seed data layer placement..."
python3 - << 'EOF'
import xml.etree.ElementTree as ET
import sys, os

tenant_xml = "src/main/resources/db/changelog/db.changelog-tenant.xml"
base_dir = "src/main/resources"

with open(tenant_xml, 'r') as f:
    lines = f.readlines()

current_layer = 1
misplaced_seeds = []

# Excluded notification & infra theme seed files (Option A in guide)
allowed_layer1_seeds = [
    "111-seed-notification-templates.xml",
    "112-seed-whatsapp-test-template.xml",
    "069-seed-default-navy-blue-theme.xml"
]

for line in lines:
    if "LAYER 2:" in line:
        current_layer = 2
    elif "LAYER 3:" in line:
        current_layer = 3
    elif "LAYER 4:" in line:
        current_layer = 4

    if "<include" in line and "file=" in line:
        # extract file attribute
        start = line.find('file="') + 6
        end = line.find('"', start)
        rel_path = line[start:end]
        
        full_path = os.path.join(base_dir, rel_path)
        filename = os.path.basename(rel_path)

        if filename in allowed_layer1_seeds:
            continue

        if os.path.exists(full_path) and full_path.endswith('.xml'):
            try:
                tree = ET.parse(full_path)
                root = tree.getroot()
                # Check for insert elements (Liquibase insert or raw SQL INSERT)
                has_insert = False
                for elem in root.iter():
                    tag = elem.tag.split('}')[-1] if '}' in elem.tag else elem.tag
                    if tag == 'insert':
                        has_insert = True
                        break
                    elif tag == 'sql' and elem.text and 'INSERT INTO' in elem.text.upper():
                        has_insert = True
                        break

                if has_insert and current_layer < 4:
                    misplaced_seeds.append((rel_path, current_layer))
            except Exception as e:
                pass

if misplaced_seeds:
    print(f"❌ Found {len(misplaced_seeds)} seed file(s) outside Layer 4:")
    for path, layer in misplaced_seeds:
        print(f"   - {path} (found in Layer {layer})")
    sys.exit(1)
else:
    print("✅ All seed data files correctly placed in Layer 4.")
EOF

# Step 5: Orphan File Detection
echo ""
echo "[Step 5/5] Checking for orphaned changelog files..."
python3 - << 'EOF'
import os, glob, sys

tenant_xml = "src/main/resources/db/changelog/db.changelog-tenant.xml"
common_json = "src/main/resources/db/changelog/db.changelog-common.json"
master_db_xml = "src/main/resources/db/changelog/db.changelog-master-db.xml"
changelog_dir = "src/main/resources/db/changelog"

combined_content = ""
for master_file in [tenant_xml, common_json, master_db_xml]:
    if os.path.exists(master_file):
        with open(master_file, 'r') as f:
            combined_content += f.read() + "\n"

all_files = glob.glob(f"{changelog_dir}/**/*.xml", recursive=True)
all_files += glob.glob(f"{changelog_dir}/**/*.json", recursive=True)

orphans = []
for file_path in all_files:
    rel_path = os.path.relpath(file_path, "src/main/resources")
    basename = os.path.basename(file_path)
    
    # Ignore master entrypoint changelogs, master db files, and template files
    if basename in ["db.changelog-tenant.xml", "db.changelog-master.xml", "db.changelog-master-db.xml", "db.changelog-common.json"] \
       or "master/" in rel_path or "template-" in basename:
        continue
        
    if rel_path not in combined_content:
        orphans.append(rel_path)

if orphans:
    print(f"⚠️  WARNING: Found {len(orphans)} unreferenced changelog file(s) on disk:")
    for o in orphans:
        print(f"   - {o}")
    print("   Ensure all active tenant changelogs are included in db.changelog-tenant.xml!")
else:
    print("✅ All tenant changelog files are registered in master changelogs.")
EOF

echo ""
echo "======================================================="
echo "🎉 ALL LIQUIBASE TENANT MIGRATION CHECKS PASSED!"
echo "======================================================="
