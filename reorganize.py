import os
import json
import re

base_path = '/home/sajid/Desktop/Manipal University/Dummy/multi_tanent/src/main/resources/db/changelog'
changes_dir = os.path.join(base_path, 'changes')

mapping = {
    'master': ['001-create-master-tenant-table.json', '002-create-master-db-tables.xml'],
    'tenant': ['008-create-tenants-table.json', '009-create-audit-logs-table.json', '014-create-companies-table.json', '062-create-superusers-schema.xml'],
    'item': ['012-create-items-table.json', '013-create-item-gl-accounts-table.json'],
    'account': [
        '010-create-chart-of-accounts-table.json', '011-create-account-dimensions-table.json',
        '015-create-company-gl-accounts-table.json', '016-create-expense-items-tables.json',
        '017-create-income-cash-flow-items-tables.json', '018-create-journal-entries-tables.json',
        '019-create-invoices-tables.json', '020-seed-coa-batch1.xml', '021-seed-coa-batch2.xml',
        '022-seed-coa-batch3-4.xml', '023-seed-coa-batch5.xml', '024-seed-coa-batch6-9.xml',
        '025-create-cash-equivalents-table.json', '026-seed-expense-item-types.xml',
        '027-seed-income-items.xml', '028-seed-cash-flow-items.xml', '029-seed-expense-items.xml',
        '030-seed-account-dimensions.xml', '031-fix-account-dimensions.xml', '032-fix-non-current-assets-dimensions.xml',
        '033-fix-current-assets-dimensions.xml', '034-fix-equity-dimensions.xml', '035-fix-non-current-liabilities-dimensions.xml',
        '036-fix-current-liabilities-dimensions.xml', '037-fix-income-dimensions.xml', '038-fix-expenses-dimensions.xml',
        '039-fix-profit-loss-dimensions.xml', '040-fix-off-balance-sheet-dimensions.xml', '042-add-gl-accounts-to-invoices.json',
        '043-update-group-sections.xml', '058-add-cash-flow-item-fields.json', '059-create-cash-flow-transactions-table.json',
        '060-create-equity-accounts-table.json', '061-create-equity-transactions-table.json'
    ],
    'warehouse': ['048-create-warehouse-schema.xml', '049-seed-warehouse-data.xml'],
    'crm': ['crm-schema.xml'],
    'production': ['production-schema.xml'],
    'sales': ['063-create-sales-customer-schema.xml']
}

# Ensure folders exist
for folder in mapping.keys():
    folder_path = os.path.join(base_path, folder)
    if not os.path.exists(folder_path):
        os.makedirs(folder_path)

# Move files
file_to_folder = {}
for folder, files in mapping.items():
    for f in files:
        file_to_folder[f] = folder
        old_path = os.path.join(changes_dir, f)
        new_path = os.path.join(base_path, folder, f)
        if os.path.exists(old_path):
            os.rename(old_path, new_path)

# Remove changes_dir if empty (or later)
if os.path.exists(changes_dir) and not os.listdir(changes_dir):
    os.rmdir(changes_dir)

# Update db.changelog-common.json
common_json_path = os.path.join(base_path, 'db.changelog-common.json')
if os.path.exists(common_json_path):
    with open(common_json_path, 'r') as f:
        data = json.load(f)
    for c in data.get('databaseChangeLog', []):
        include = c.get('include', {})
        file_path = include.get('file', '')
        if file_path.startswith('db/changelog/changes/'):
            filename = file_path.replace('db/changelog/changes/', '')
            if filename in file_to_folder:
                include['file'] = f"db/changelog/{file_to_folder[filename]}/{filename}"
    with open(common_json_path, 'w') as f:
        json.dump(data, f, indent=4)

# Update XML files
def update_xml(filename):
    xml_path = os.path.join(base_path, filename)
    if os.path.exists(xml_path):
        with open(xml_path, 'r') as f:
            content = f.read()
            # replace db/changelog/changes/XXX with db/changelog/FOLDER/XXX
            for fname, folder in file_to_folder.items():
                content = content.replace(f"db/changelog/changes/{fname}", f"db/changelog/{folder}/{fname}")
        with open(xml_path, 'w') as f:
            f.write(content)

update_xml('db.changelog-master-db.xml')
update_xml('db.changelog-tenant.xml')

print("Reorganization complete.")
