🏭 Warehouse Module — Manual API Testing Guide
Base URL: http://localhost:8080 Auth Header: Authorization: Bearer <token> (add to all requests) Content-Type: application/json

TIP

Follow creation order to avoid FK constraint failures: UoM → Tax → Category → SubCategory → Warehouse → Floor → Zone → Rack → Shelf → Bin → Product → Batch → Serial → Inventory Movement

1. Unit of Measure (UoM)
Base path: /api/warehouse/uom

GET — List All
GET /api/warehouse/uom
POST — Create
json
POST /api/warehouse/uom
{
  "name": "Kilogram",
  "shortName": "kg"
}
PUT — Update {id}
json
PUT /api/warehouse/uom/1
{
  "name": "Kilogram",
  "shortName": "KG"
}
DELETE
DELETE /api/warehouse/uom/1
2. Tax
Base path: /api/warehouse/taxes

GET — List All
GET /api/warehouse/taxes
POST — Create
json
POST /api/warehouse/taxes
{
  "name": "GST 18%",
  "percentage": 18.00
}
PUT — Update {id}
json
PUT /api/warehouse/taxes/1
{
  "name": "GST 18%",
  "percentage": 18.00
}
DELETE
DELETE /api/warehouse/taxes/1
3. Category
Base path: /api/warehouse/categories

GET — List All
GET /api/warehouse/categories
GET — By ID
GET /api/warehouse/categories/1
POST — Create
json
POST /api/warehouse/categories
{
  "name": "Electronics",
  "description": "Electronic goods and components"
}
PUT — Update {id}
json
PUT /api/warehouse/categories/1
{
  "name": "Electronics",
  "description": "Electronic goods and components"
}
DELETE
DELETE /api/warehouse/categories/1
4. Sub-Category
Base path: /api/warehouse/subcategories

Requires: categoryId from step 3

GET — List All (optional filter by category)
GET /api/warehouse/subcategories
GET /api/warehouse/subcategories?categoryId=1
POST — Create
json
POST /api/warehouse/subcategories
{
  "name": "Mobile Phones",
  "description": "Smart phones and accessories",
  "categoryId": 1
}
PUT — Update {id}
json
PUT /api/warehouse/subcategories/1
{
  "name": "Mobile Phones",
  "description": "Smart phones and accessories",
  "categoryId": 1
}
DELETE
DELETE /api/warehouse/subcategories/1
5. Warehouse
Base path: /api/warehouse/warehouses

Enum Reference
Field	Valid Values
warehouseType	NORMAL, COLD_STORAGE, HAZMAT, PRODUCTION, RETAIL_STORE
defaultPickStrategy	FIFO, FEFO, LIFO
GET — List All
GET /api/warehouse/warehouses
GET — By ID
GET /api/warehouse/warehouses/1
GET — By Code
GET /api/warehouse/warehouses/code/WH-001
GET — By Active Status
GET /api/warehouse/warehouses/status?isActive=true
GET /api/warehouse/warehouses/status?isActive=false
GET — By Warehouse Type
GET /api/warehouse/warehouses/type/NORMAL
GET /api/warehouse/warehouses/type/COLD_STORAGE
POST — Create
json
POST /api/warehouse/warehouses
{
  "code": "WH-001",
  "name": "Main Warehouse",
  "address": "123 Industrial Area, Bengaluru, Karnataka",
  "contactPerson": "Rahul Sharma",
  "contactPhone": "9876543210",
  "contactEmail": "rahul@company.com",
  "qcRequired": true,
  "binTrackingEnabled": true,
  "isActive": true,
  "description": "Primary storage warehouse for finished goods",
  "warehouseType": "NORMAL",
  "defaultPickStrategy": "FEFO",
  "allowNegativeStock": false,
  "openTime": "08:00:00",
  "closeTime": "20:00:00",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "totalCapacityWeight": 50000.0,
  "totalCapacityVolume": 10000.0,
  "locationId": 1
}
POST — Create (Cold Storage)
json
POST /api/warehouse/warehouses
{
  "code": "WH-002",
  "name": "Cold Storage Warehouse",
  "address": "456 Freezer Park, Pune, Maharashtra",
  "contactPerson": "Priya Mehta",
  "contactPhone": "9988776655",
  "contactEmail": "priya@company.com",
  "qcRequired": true,
  "binTrackingEnabled": true,
  "isActive": true,
  "description": "Cold storage for perishable goods",
  "warehouseType": "COLD_STORAGE",
  "defaultPickStrategy": "FIFO",
  "allowNegativeStock": false,
  "openTime": "06:00:00",
  "closeTime": "22:00:00",
  "latitude": 18.5204,
  "longitude": 73.8567,
  "totalCapacityWeight": 20000.0,
  "totalCapacityVolume": 5000.0,
  "locationId": 1
}
PUT — Update {id}
json
PUT /api/warehouse/warehouses/1
{
  "code": "WH-001",
  "name": "Main Warehouse (Updated)",
  "address": "123 Industrial Area, Bengaluru",
  "contactPerson": "Rahul Sharma",
  "contactPhone": "9876543210",
  "contactEmail": "rahul@company.com",
  "qcRequired": true,
  "binTrackingEnabled": true,
  "isActive": true,
  "description": "Updated description",
  "warehouseType": "NORMAL",
  "defaultPickStrategy": "FIFO",
  "allowNegativeStock": false,
  "openTime": "07:00:00",
  "closeTime": "21:00:00",
  "latitude": 12.9716,
  "longitude": 77.5946,
  "totalCapacityWeight": 60000.0,
  "totalCapacityVolume": 12000.0,
  "locationId": 1
}
DELETE
DELETE /api/warehouse/warehouses/1
6. Floor
Base path: /api/warehouse/floors

Requires: warehouseId from step 5

Enum Reference
Field	Valid Values
accessType	NONE, STAIRS, ELEVATOR, RAMP, FORKLIFT_LIFT
GET — List All
GET /api/warehouse/floors
GET — By ID
GET /api/warehouse/floors/1
GET — By Active Status
GET /api/warehouse/floors/status?isActive=true
GET — By Warehouse
GET /api/warehouse/floors/warehouse/1
POST — Create (Ground Floor)
json
POST /api/warehouse/floors
{
  "warehouseId": 1,
  "code": "FL-G",
  "name": "Ground Floor",
  "description": "Main ground level storage area",
  "levelNo": 0,
  "length": 100.0,
  "width": 50.0,
  "height": 8.0,
  "accessType": "NONE",
  "temperatureControlled": false,
  "minTemp": null,
  "maxTemp": null,
  "hazardousAllowed": false,
  "restrictedAccess": false,
  "isDefaultFloor": true,
  "isActive": true
}
POST — Create (First Floor)
json
POST /api/warehouse/floors
{
  "warehouseId": 1,
  "code": "FL-1",
  "name": "First Floor",
  "description": "First floor storage area",
  "levelNo": 1,
  "length": 100.0,
  "width": 50.0,
  "height": 8.0,
  "accessType": "ELEVATOR",
  "temperatureControlled": false,
  "minTemp": null,
  "maxTemp": null,
  "hazardousAllowed": false,
  "restrictedAccess": false,
  "isDefaultFloor": false,
  "isActive": true
}
PUT — Update {id}
json
PUT /api/warehouse/floors/1
{
  "warehouseId": 1,
  "code": "FL-G",
  "name": "Ground Floor (Updated)",
  "description": "Updated main ground level",
  "levelNo": 0,
  "length": 110.0,
  "width": 55.0,
  "height": 9.0,
  "accessType": "RAMP",
  "temperatureControlled": false,
  "minTemp": null,
  "maxTemp": null,
  "hazardousAllowed": false,
  "restrictedAccess": false,
  "isDefaultFloor": true,
  "isActive": true
}
DELETE
DELETE /api/warehouse/floors/1
7. Zone
Base path: /api/warehouse/zones

Requires: warehouseId, floorId from steps 5–6

Enum Reference
Field	Valid Values
zoneType	STORAGE, RECEIVING, QC, QUARANTINE, DISPATCH, RETURNS, PRODUCTION_STAGING
GET — List All
GET /api/warehouse/zones
GET — By ID
GET /api/warehouse/zones/1
GET — By Active Status
GET /api/warehouse/zones/status?isActive=true
GET — By Zone Type
GET /api/warehouse/zones/type/STORAGE
GET /api/warehouse/zones/type/RECEIVING
POST — Create (Storage Zone)
json
POST /api/warehouse/zones
{
  "warehouseId": 1,
  "floorId": 1,
  "name": "Zone A - Storage",
  "zoneType": "STORAGE",
  "pickPriority": 1,
  "putAwayPriority": 1,
  "fastMovingZone": true,
  "temperatureControlled": false,
  "minTemp": null,
  "maxTemp": null,
  "hazardous": false,
  "hazardClass": null,
  "restrictedAccess": false,
  "isActive": true,
  "maxWeight": 10000.0,
  "maxVolume": 2000.0,
  "description": "Primary storage zone for fast-moving products"
}
POST — Create (Receiving Zone)
json
POST /api/warehouse/zones
{
  "warehouseId": 1,
  "floorId": 1,
  "name": "Zone R - Receiving",
  "zoneType": "RECEIVING",
  "pickPriority": 5,
  "putAwayPriority": 1,
  "fastMovingZone": false,
  "temperatureControlled": false,
  "minTemp": null,
  "maxTemp": null,
  "hazardous": false,
  "hazardClass": null,
  "restrictedAccess": false,
  "isActive": true,
  "maxWeight": 5000.0,
  "maxVolume": 1000.0,
  "description": "Inbound receiving zone"
}
POST — Create (QC Zone)
json
POST /api/warehouse/zones
{
  "warehouseId": 1,
  "floorId": 1,
  "name": "Zone QC",
  "zoneType": "QC",
  "pickPriority": 4,
  "putAwayPriority": 2,
  "fastMovingZone": false,
  "temperatureControlled": false,
  "minTemp": null,
  "maxTemp": null,
  "hazardous": false,
  "hazardClass": null,
  "restrictedAccess": true,
  "isActive": true,
  "maxWeight": 3000.0,
  "maxVolume": 500.0,
  "description": "Quality control inspection zone"
}
PUT — Update {id}
json
PUT /api/warehouse/zones/1
{
  "warehouseId": 1,
  "floorId": 1,
  "name": "Zone A - Storage (Updated)",
  "zoneType": "STORAGE",
  "pickPriority": 1,
  "putAwayPriority": 1,
  "fastMovingZone": true,
  "temperatureControlled": false,
  "minTemp": null,
  "maxTemp": null,
  "hazardous": false,
  "hazardClass": null,
  "restrictedAccess": false,
  "isActive": true,
  "maxWeight": 12000.0,
  "maxVolume": 2500.0,
  "description": "Updated primary storage zone"
}
DELETE
DELETE /api/warehouse/zones/1
8. Rack
Base path: /api/warehouse/racks

Requires: zoneId from step 7

Enum Reference
Field	Valid Values
rackType	STORAGE, BULK_STORAGE, PICK_FACE, STAGING
GET — List All
GET /api/warehouse/racks
GET — By ID
GET /api/warehouse/racks/1
GET — By Active Status
GET /api/warehouse/racks/status?isActive=true
GET — By Rack Type
GET /api/warehouse/racks/type/STORAGE
GET /api/warehouse/racks/type/PICK_FACE
GET — By Barcode
GET /api/warehouse/racks/barcode/RACK-BC-001
POST — Create
json
POST /api/warehouse/racks
{
  "zoneId": 1,
  "rackCode": "RACK-A-001",
  "barcodeTag": "RACK-BC-001",
  "rackType": "STORAGE",
  "aisle": "A",
  "pickSequence": 1,
  "maxWeight": 2000.0,
  "maxVolume": 400.0,
  "isActive": true,
  "description": "Rack A01 in Zone A"
}
PUT — Update {id}
json
PUT /api/warehouse/racks/1
{
  "zoneId": 1,
  "rackCode": "RACK-A-001",
  "barcodeTag": "RACK-BC-001",
  "rackType": "PICK_FACE",
  "aisle": "A",
  "pickSequence": 1,
  "maxWeight": 2500.0,
  "maxVolume": 500.0,
  "isActive": true,
  "description": "Updated Rack A01"
}
DELETE
DELETE /api/warehouse/racks/1
9. Shelf
Base path: /api/warehouse/shelves

Requires: rackId from step 8

GET — List All
GET /api/warehouse/shelves
GET — By ID
GET /api/warehouse/shelves/1
GET — By Active Status
GET /api/warehouse/shelves/status?isActive=true
GET — By Barcode
GET /api/warehouse/shelves/barcode/SHELF-BC-001
POST — Create
json
POST /api/warehouse/shelves
{
  "rackId": 1,
  "shelfCode": "SHELF-A-001-L1",
  "barcodeTag": "SHELF-BC-001",
  "levelNo": 1,
  "pickSequence": 1,
  "maxWeight": 500.0,
  "maxVolume": 100.0,
  "isActive": true,
  "description": "Shelf Level 1 of Rack A01"
}
PUT — Update {id}
json
PUT /api/warehouse/shelves/1
{
  "rackId": 1,
  "shelfCode": "SHELF-A-001-L1",
  "barcodeTag": "SHELF-BC-001",
  "levelNo": 1,
  "pickSequence": 1,
  "maxWeight": 600.0,
  "maxVolume": 120.0,
  "isActive": true,
  "description": "Updated Shelf Level 1"
}
DELETE
DELETE /api/warehouse/shelves/1
10. Bin
Base path: /api/warehouse/bins

Requires: shelfId from step 9, warehouseId from step 5

Enum Reference
Field	Valid Values
binType	STORAGE, RECEIVING, QC, QUARANTINE, DISPATCH, DAMAGE, RETURNS
GET — List All
GET /api/warehouse/bins
GET — Paginated
GET /api/warehouse/bins/paginated?page=0&size=10
GET — By ID
GET /api/warehouse/bins/1
GET — By Active Status
GET /api/warehouse/bins/active?isActive=true
GET — By Bin Type
GET /api/warehouse/bins/type/STORAGE
GET /api/warehouse/bins/type/QC
GET — By Barcode
GET /api/warehouse/bins/barcode/BIN-BC-001
POST — Create (Storage Bin)
json
POST /api/warehouse/bins
{
  "shelfId": 1,
  "warehouseId": 1,
  "binCode": "BIN-A-001-L1-01",
  "barcodeTag": "BIN-BC-001",
  "binType": "STORAGE",
  "capacityQty": 100,
  "capacityWeight": 50.0,
  "capacityVolume": 10.0,
  "isActive": true,
  "blocked": false,
  "blockReason": null,
  "pickSequence": 1,
  "hazardousAllowed": false,
  "minTemp": null,
  "maxTemp": null,
  "description": "Storage bin in Shelf Level 1"
}
POST — Create (QC Bin)
json
POST /api/warehouse/bins
{
  "shelfId": 1,
  "warehouseId": 1,
  "binCode": "BIN-QC-001",
  "barcodeTag": "BIN-QC-BC-001",
  "binType": "QC",
  "capacityQty": 50,
  "capacityWeight": 25.0,
  "capacityVolume": 5.0,
  "isActive": true,
  "blocked": false,
  "blockReason": null,
  "pickSequence": 10,
  "hazardousAllowed": false,
  "minTemp": null,
  "maxTemp": null,
  "description": "QC inspection bin"
}
PUT — Update {id}
json
PUT /api/warehouse/bins/1
{
  "shelfId": 1,
  "warehouseId": 1,
  "binCode": "BIN-A-001-L1-01",
  "barcodeTag": "BIN-BC-001",
  "binType": "STORAGE",
  "capacityQty": 120,
  "capacityWeight": 60.0,
  "capacityVolume": 12.0,
  "isActive": true,
  "blocked": false,
  "blockReason": null,
  "pickSequence": 1,
  "hazardousAllowed": false,
  "minTemp": null,
  "maxTemp": null,
  "description": "Updated storage bin"
}
DELETE
DELETE /api/warehouse/bins/1
11. Product
Base path: /api/warehouse/products

Requires: categoryId, subCategoryId, uomId, taxId, locationId

GET — List All
GET /api/warehouse/products
GET — Paginated
GET /api/warehouse/products/paginated?page=0&size=10
GET — By ID
GET /api/warehouse/products/1
GET — By Barcode
GET /api/warehouse/products/barcode/PRD-BC-001
GET — Download Template (Excel)
GET /api/warehouse/products/template
GET — Export Products (Excel)
GET /api/warehouse/products/export
POST — Create (Standard Product)
json
POST /api/warehouse/products
{
  "sku": "SKU-ELEC-001",
  "name": "Samsung Galaxy S24",
  "barcode": "PRD-BC-001",
  "barcodeImageUrl": null,
  "imageUrl": null,
  "description": "Samsung Galaxy S24 128GB Smartphone",
  "categoryId": 1,
  "subCategoryId": 1,
  "brand": "Samsung",
  "model": "Galaxy S24",
  "purchasePrice": 45000.00,
  "salePrice": 54999.00,
  "taxInclusive": false,
  "batchTracking": false,
  "serialTracking": true,
  "expiryTracking": false,
  "isActive": true,
  "uomId": 1,
  "taxId": 1,
  "locationId": 1
}
POST — Create (Product with Batch & Expiry Tracking)
json
POST /api/warehouse/products
{
  "sku": "SKU-FOOD-001",
  "name": "Organic Wheat Flour",
  "barcode": "PRD-BC-002",
  "barcodeImageUrl": null,
  "imageUrl": null,
  "description": "Organic whole wheat flour 5kg pack",
  "categoryId": 2,
  "subCategoryId": 2,
  "brand": "NatureFresh",
  "model": "5KG",
  "purchasePrice": 250.00,
  "salePrice": 350.00,
  "taxInclusive": true,
  "batchTracking": true,
  "serialTracking": false,
  "expiryTracking": true,
  "isActive": true,
  "uomId": 1,
  "taxId": 1,
  "locationId": 1
}
PUT — Update {id}
json
PUT /api/warehouse/products/1
{
  "sku": "SKU-ELEC-001",
  "name": "Samsung Galaxy S24 (Updated)",
  "barcode": "PRD-BC-001",
  "barcodeImageUrl": null,
  "imageUrl": null,
  "description": "Updated description",
  "categoryId": 1,
  "subCategoryId": 1,
  "brand": "Samsung",
  "model": "Galaxy S24",
  "purchasePrice": 43000.00,
  "salePrice": 52999.00,
  "taxInclusive": false,
  "batchTracking": false,
  "serialTracking": true,
  "expiryTracking": false,
  "isActive": true,
  "uomId": 1,
  "taxId": 1,
  "locationId": 1
}
POST — Import Products (multipart/form-data)
POST /api/warehouse/products/import
Content-Type: multipart/form-data
file: <attach .xlsx file>
DELETE
DELETE /api/warehouse/products/1
12. Product Batch
Base path: /api/warehouse/batches

Requires: productId (must have batchTracking: true)

GET — By Product
GET /api/warehouse/batches/product/1
POST — Create
json
POST /api/warehouse/batches
{
  "batchNumber": "BATCH-2025-001",
  "mfgDate": "2025-01-15",
  "expiryDate": "2026-01-15",
  "productId": 1
}
PUT — Update {id}
json
PUT /api/warehouse/batches/1
{
  "batchNumber": "BATCH-2025-001",
  "mfgDate": "2025-01-15",
  "expiryDate": "2026-06-15",
  "productId": 1
}
DELETE
DELETE /api/warehouse/batches/1
13. Product Serial
Base path: /api/warehouse/serials

Requires: batchId from step 12

GET — By Serial Number
GET /api/warehouse/serials/SRL-001
POST — Create
json
POST /api/warehouse/serials
{
  "serialNumber": "SRL-001",
  "batchId": 1
}
PUT — Update {id}
json
PUT /api/warehouse/serials/1
{
  "serialNumber": "SRL-001-UPDATED",
  "batchId": 1
}
DELETE
DELETE /api/warehouse/serials/1
14. Inventory Movement
Base path: /api/warehouse/inventory-movements

Enum Reference
Field	Valid Values
type (MovementType)	INWARD, OUTWARD, TRANSFER, ADJUSTMENT, PRODUCTION_ISSUE, PRODUCTION_RECEIPT, INBOUND_RECEIPT, QC_ACCEPT, QC_REJECT, QC_HOLD, PUT_AWAY, PICK, PACK, DISPATCH, TRANSFER_DISPATCH, TRANSFER_RECEIVE, ADJUSTMENT_IN, ADJUSTMENT_OUT, SCRAP
status / previousStatus / newStatus (StockStatus)	AVAILABLE, UNDER_QC, HOLD, DAMAGED, EXPIRED, TRANSIT, RESERVED
referenceType	PURCHASE_GRN, TRANSFER, SALES_ORDER, PRODUCTION_ISSUE, RETURN_GRN, ADJUSTMENT
syncStatus	PENDING_SYNC, SYNCED
GET — List All
GET /api/warehouse/inventory-movements
GET — By ID
GET /api/warehouse/inventory-movements/1
GET — By Status
GET /api/warehouse/inventory-movements/status/AVAILABLE
GET /api/warehouse/inventory-movements/status/UNDER_QC
GET — By Warehouse
GET /api/warehouse/inventory-movements/warehouse/1
POST — Create (Inward / GRN)
json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-GRN-2025-001",
  "type": "INBOUND_RECEIPT",
  "status": "UNDER_QC",
  "previousStatus": null,
  "newStatus": "UNDER_QC",
  "productId": 1,
  "rawMaterialId": null,
  "semifinishedId": null,
  "finishedGoodId": null,
  "batchId": null,
  "serialId": null,
  "warehouseId": 1,
  "sourceWarehouseId": null,
  "destinationWarehouseId": 1,
  "binId": 1,
  "sourceBinId": null,
  "destinationBinId": 1,
  "uomId": 1,
  "quantity": 100.0,
  "qtyBefore": 0.0,
  "qtyAfter": 100.0,
  "unitCost": 450.00,
  "totalCost": 45000.00,
  "referenceType": "PURCHASE_GRN",
  "referenceId": 101,
  "remarks": "GRN received from supplier",
  "createdBy": 1,
  "approvedBy": null,
  "movementAt": "2025-03-05T10:30:00",
  "deviceId": "DEVICE-001",
  "clientTime": "2025-03-05T10:30:00",
  "syncStatus": "PENDING_SYNC"
}
POST — Create (Adjustment In)
json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-ADJ-2025-001",
  "type": "ADJUSTMENT_IN",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "rawMaterialId": null,
  "semifinishedId": null,
  "finishedGoodId": null,
  "batchId": 1,
  "serialId": null,
  "warehouseId": 1,
  "sourceWarehouseId": null,
  "destinationWarehouseId": null,
  "binId": 1,
  "sourceBinId": null,
  "destinationBinId": null,
  "uomId": 1,
  "quantity": 10.0,
  "qtyBefore": 90.0,
  "qtyAfter": 100.0,
  "unitCost": 450.00,
  "totalCost": 4500.00,
  "referenceType": "ADJUSTMENT",
  "referenceId": null,
  "remarks": "Stock count adjustment",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2025-03-05T14:00:00",
  "deviceId": "DEVICE-001",
  "clientTime": "2025-03-05T14:00:00",
  "syncStatus": "SYNCED"
}
POST — Create (Transfer Between Warehouses)
json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-TRF-2025-001",
  "type": "TRANSFER",
  "status": "TRANSIT",
  "previousStatus": "AVAILABLE",
  "newStatus": "TRANSIT",
  "productId": 1,
  "rawMaterialId": null,
  "semifinishedId": null,
  "finishedGoodId": null,
  "batchId": null,
  "serialId": null,
  "warehouseId": 1,
  "sourceWarehouseId": 1,
  "destinationWarehouseId": 2,
  "binId": null,
  "sourceBinId": 1,
  "destinationBinId": 5,
  "uomId": 1,
  "quantity": 50.0,
  "qtyBefore": 100.0,
  "qtyAfter": 50.0,
  "unitCost": 450.00,
  "totalCost": 22500.00,
  "referenceType": "TRANSFER",
  "referenceId": 201,
  "remarks": "Transfer to Pune warehouse",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2025-03-05T15:00:00",
  "deviceId": null,
  "clientTime": "2025-03-05T15:00:00",
  "syncStatus": "SYNCED"
}
PATCH — Update Quantity
PATCH /api/warehouse/inventory-movements/1/quantity?quantity=150.0
DELETE
DELETE /api/warehouse/inventory-movements/1
📋 Quick Reference — All Endpoints
Module	Method	Endpoint
UoM	GET	/api/warehouse/uom
POST	/api/warehouse/uom
PUT	/api/warehouse/uom/{id}
DELETE	/api/warehouse/uom/{id}
Tax	GET	/api/warehouse/taxes
POST	/api/warehouse/taxes
PUT	/api/warehouse/taxes/{id}
DELETE	/api/warehouse/taxes/{id}
Category	GET	/api/warehouse/categories
GET	/api/warehouse/categories/{id}
POST	/api/warehouse/categories
PUT	/api/warehouse/categories/{id}
DELETE	/api/warehouse/categories/{id}
SubCategory	GET	/api/warehouse/subcategories?categoryId={id}
POST	/api/warehouse/subcategories
PUT	/api/warehouse/subcategories/{id}
DELETE	/api/warehouse/subcategories/{id}
Warehouse	GET	/api/warehouse/warehouses
GET	/api/warehouse/warehouses/{id}
GET	/api/warehouse/warehouses/code/{code}
GET	/api/warehouse/warehouses/status?isActive=true
GET	/api/warehouse/warehouses/type/{type}
POST	/api/warehouse/warehouses
PUT	/api/warehouse/warehouses/{id}
DELETE	/api/warehouse/warehouses/{id}
Floor	GET	/api/warehouse/floors
GET	/api/warehouse/floors/{id}
GET	/api/warehouse/floors/status?isActive=true
GET	/api/warehouse/floors/warehouse/{id}
POST	/api/warehouse/floors
PUT	/api/warehouse/floors/{id}
DELETE	/api/warehouse/floors/{id}
Zone	GET	/api/warehouse/zones
GET	/api/warehouse/zones/{id}
GET	/api/warehouse/zones/status?isActive=true
GET	/api/warehouse/zones/type/{type}
POST	/api/warehouse/zones
PUT	/api/warehouse/zones/{id}
DELETE	/api/warehouse/zones/{id}
Rack	GET	/api/warehouse/racks
GET	/api/warehouse/racks/{id}
GET	/api/warehouse/racks/status?isActive=true
GET	/api/warehouse/racks/type/{type}
GET	/api/warehouse/racks/barcode/{tag}
POST	/api/warehouse/racks
PUT	/api/warehouse/racks/{id}
DELETE	/api/warehouse/racks/{id}
Shelf	GET	/api/warehouse/shelves
GET	/api/warehouse/shelves/{id}
GET	/api/warehouse/shelves/status?isActive=true
GET	/api/warehouse/shelves/barcode/{tag}
POST	/api/warehouse/shelves
PUT	/api/warehouse/shelves/{id}
DELETE	/api/warehouse/shelves/{id}
Bin	GET	/api/warehouse/bins
GET	/api/warehouse/bins/paginated
GET	/api/warehouse/bins/{id}
GET	/api/warehouse/bins/active?isActive=true
GET	/api/warehouse/bins/type/{type}
GET	/api/warehouse/bins/barcode/{tag}
POST	/api/warehouse/bins
PUT	/api/warehouse/bins/{id}
DELETE	/api/warehouse/bins/{id}
Product	GET	/api/warehouse/products
GET	/api/warehouse/products/paginated
GET	/api/warehouse/products/{id}
GET	/api/warehouse/products/barcode/{barcode}
GET	/api/warehouse/products/template
GET	/api/warehouse/products/export
POST	/api/warehouse/products
POST	/api/warehouse/products/import
PUT	/api/warehouse/products/{id}
DELETE	/api/warehouse/products/{id}
Batch	GET	/api/warehouse/batches/product/{id}
POST	/api/warehouse/batches
PUT	/api/warehouse/batches/{id}
DELETE	/api/warehouse/batches/{id}
Serial	GET	/api/warehouse/serials/{serial}
POST	/api/warehouse/serials
PUT	/api/warehouse/serials/{id}
DELETE	/api/warehouse/serials/{id}
Inventory Movement	GET	/api/warehouse/inventory-movements
GET	/api/warehouse/inventory-movements/{id}
GET	/api/warehouse/inventory-movements/status/{status}
GET	/api/warehouse/inventory-movements/warehouse/{id}
POST	/api/warehouse/inventory-movements
PATCH	/api/warehouse/inventory-movements/{id}/quantity?quantity={}
DELETE	/api/warehouse/inventory-movements/{id}