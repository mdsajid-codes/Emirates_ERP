#!/bin/bash

BASE_URL="http://localhost:8080/api/warehouse"
TOKEN="eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJ0ZXN0YWRtaW4iLCJ0ZW5hbnRJZCI6InRhdGE1Iiwicm9sZXMiOlsiQURNSU4iLCJVU0VSIiwiV0FSRUhPVVNFX01BTkFHRVIiXSwiaWF0IjoxNzY3NTQzOTY4LCJleHAiOjE3Njc1NDc1Njh9._14rUFET8MC74hk9CuBPkhSEXEit00qA2KOivOkPJzs"

echo "============================================"
echo "      Testing Warehouse API Endpoints       "
echo "============================================"

check_status() {
    url=$1
    description=$2
    
    echo "Testing $description ($url)..."
    response=$(curl -s -o /dev/null -w "%{http_code}" -H "Authorization: Bearer $TOKEN" "$BASE_URL$url")
    
    if [ "$response" == "200" ]; then
        echo "✅ PASSED (200 OK)"
    else
        echo "❌ FAILED ($response)"
    fi
    echo "--------------------------------------------"
}

# 1. DepartmentController
check_status "/departments" "List all departments"

# 2. WarehouseController
check_status "/warehouses" "List all warehouses"

# 3. LocationController
check_status "/locations" "List all locations"

# 4. GateInController
check_status "/gate-in" "List Gate Ins"

# 5. EmployeeController
check_status "/employees" "List all employees"

# 6. GateKeeperController
check_status "/gate-keepers" "List all gate keepers"

# 7. GateOutController
check_status "/gate-out" "List Gate Outs"

# 8. InventoryController
check_status "/inventory" "List all inventory"

# 9. ItemController
check_status "/items" "List all items"

# 10. ProjectController
check_status "/projects" "List all projects"

# 11. QAController
check_status "/qa" "List all QA records"

# 12. RFIDMovementController
check_status "/rfid-movements" "Get movement logs"

# 13. RFIDTagController
check_status "/rfid-tags" "List all RFID tags"

# 14. RequisitionController
check_status "/requisitions" "List all requisitions"

# 15. ShipmentScheduleController
check_status "/shipments" "List shipment schedules"

# 16. StorageAssignmentController
check_status "/storage-assignments" "List storage assignments"

# 17. StoreKeeperController
check_status "/store-keepers" "List all store keepers"

# 18. TransferController
check_status "/transfers" "List transfers"

echo "Done."
