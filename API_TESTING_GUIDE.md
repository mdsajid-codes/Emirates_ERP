# 🏭 Complete API Testing Guide — Warehouse, Fleet, Sales & Purchases

**Base URL:** `http://localhost:8080`
**Auth Header:** `Authorization: Bearer <token>` (add to all requests)
**Content-Type:** `application/json`

> [!TIP]
> Follow creation order to avoid FK constraint failures:
> **UoM → Tax → Category → SubCategory → Warehouse → Floor → Zone → Rack → Shelf → Bin → Product → Batch → Serial → Inventory Movement → Transfer Order → Driver → Vehicle → Route → Delivery Order → POD**

---

## PART A — WAREHOUSE MODULE

---

### 1. Unit of Measure (UoM)
Base path: `/api/warehouse/uom`

**GET — List All**
```
GET /api/warehouse/uom
```

**POST — Create**
```json
POST /api/warehouse/uom
{
  "name": "Kilogram",
  "shortName": "kg"
}
```

**POST — Create (Second)**
```json
POST /api/warehouse/uom
{
  "name": "Pieces",
  "shortName": "PCS"
}
```

**PUT — Update {id}**
```json
PUT /api/warehouse/uom/1
{
  "name": "Kilogram",
  "shortName": "KG"
}
```

**DELETE**
```
DELETE /api/warehouse/uom/1
```

---

### 2. Tax
Base path: `/api/warehouse/taxes`

**GET — List All**
```
GET /api/warehouse/taxes
```

**POST — Create**
```json
POST /api/warehouse/taxes
{
  "name": "GST 18%",
  "percentage": 18.00
}
```

**POST — Create (Second)**
```json
POST /api/warehouse/taxes
{
  "name": "GST 5%",
  "percentage": 5.00
}
```

**PUT — Update {id}**
```json
PUT /api/warehouse/taxes/1
{
  "name": "GST 18%",
  "percentage": 18.00
}
```

**DELETE**
```
DELETE /api/warehouse/taxes/1
```

---

### 3. Category
Base path: `/api/warehouse/categories`

**GET — List All**
```
GET /api/warehouse/categories
```

**GET — By ID**
```
GET /api/warehouse/categories/1
```

**POST — Create**
```json
POST /api/warehouse/categories
{
  "name": "Electronics",
  "description": "Electronic goods and components"
}
```

**POST — Create (Second)**
```json
POST /api/warehouse/categories
{
  "name": "Food & Beverages",
  "description": "Perishable and non-perishable food items"
}
```

**PUT — Update {id}**
```json
PUT /api/warehouse/categories/1
{
  "name": "Electronics",
  "description": "Updated description for electronics"
}
```

**DELETE**
```
DELETE /api/warehouse/categories/1
```

---

### 4. Sub-Category
Base path: `/api/warehouse/sub-categories`

> Requires: `categoryId` from step 3

**GET — List All**
```
GET /api/warehouse/sub-categories
```

**POST — Create**
```json
POST /api/warehouse/sub-categories
{
  "name": "Mobile Phones",
  "description": "Smart phones and accessories",
  "categoryId": 1
}
```

**POST — Create (Second)**
```json
POST /api/warehouse/sub-categories
{
  "name": "Flour & Grains",
  "description": "Wheat flour, rice, grains",
  "categoryId": 2
}
```

**PUT — Update {id}**
```json
PUT /api/warehouse/sub-categories/1
{
  "name": "Mobile Phones",
  "description": "Updated smart phones",
  "categoryId": 1
}
```

**DELETE**
```
DELETE /api/warehouse/sub-categories/1
```

---

### 5. Warehouse
Base path: `/api/warehouse/warehouses`

| Field | Valid Values |
|-------|-------------|
| `warehouseType` | `NORMAL`, `COLD_STORAGE`, `HAZMAT`, `PRODUCTION`, `RETAIL_STORE` |
| `defaultPickStrategy` | `FIFO`, `FEFO`, `LIFO` |

**GET — List All**
```
GET /api/warehouse/warehouses
```

**GET — By ID**
```
GET /api/warehouse/warehouses/1
```

**GET — By Code**
```
GET /api/warehouse/warehouses/code/WH-001
```

**GET — By Active Status**
```
GET /api/warehouse/warehouses/status?isActive=true
```

**GET — By Warehouse Type**
```
GET /api/warehouse/warehouses/type/NORMAL
GET /api/warehouse/warehouses/type/COLD_STORAGE
```

**POST — Create (Main Warehouse)**
```json
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
```

**POST — Create (Cold Storage)**
```json
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
```

**Expected Response (Warehouse)**
```json
{
  "id": 1,
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
  "locationId": 1,
  "locationName": "Bengaluru"
}
```

**PUT — Update {id}**
```json
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
```

**DELETE**
```
DELETE /api/warehouse/warehouses/1
```

---

### 6. Floor
Base path: `/api/warehouse/floors`

> Requires: `warehouseId` from step 5

| Field | Valid Values |
|-------|-------------|
| `accessType` | `NONE`, `STAIRS`, `ELEVATOR`, `RAMP`, `FORKLIFT_LIFT` |

**GET — List All**
```
GET /api/warehouse/floors
```

**GET — By ID**
```
GET /api/warehouse/floors/1
```

**GET — By Active Status**
```
GET /api/warehouse/floors/status?isActive=true
```

**GET — By Warehouse**
```
GET /api/warehouse/floors/warehouse/1
```

**POST — Create (Ground Floor)**
```json
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
  "hazardousAllowed": false,
  "restrictedAccess": false,
  "isDefaultFloor": true,
  "isActive": true
}
```

**POST — Create (First Floor)**
```json
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
  "hazardousAllowed": false,
  "restrictedAccess": false,
  "isDefaultFloor": false,
  "isActive": true
}
```

**Expected Response (Floor)**
```json
{
  "id": 1,
  "warehouseId": 1,
  "warehouseName": "Main Warehouse",
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
```

**PUT — Update {id}**
```json
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
  "hazardousAllowed": false,
  "restrictedAccess": false,
  "isDefaultFloor": true,
  "isActive": true
}
```

**DELETE**
```
DELETE /api/warehouse/floors/1
```

---

### 7. Zone
Base path: `/api/warehouse/zones`

> Requires: `warehouseId`, `floorId` from steps 5–6

| Field | Valid Values |
|-------|-------------|
| `zoneType` | `STORAGE`, `RECEIVING`, `QC`, `QUARANTINE`, `DISPATCH`, `RETURNS`, `PRODUCTION_STAGING` |

**GET — List All**
```
GET /api/warehouse/zones
```

**GET — By ID**
```
GET /api/warehouse/zones/1
```

**GET — By Active Status**
```
GET /api/warehouse/zones/status?isActive=true
```

**GET — By Zone Type**
```
GET /api/warehouse/zones/type/STORAGE
GET /api/warehouse/zones/type/RECEIVING
```

**POST — Create (Storage Zone)**
```json
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
  "hazardous": false,
  "restrictedAccess": false,
  "isActive": true,
  "maxWeight": 10000.0,
  "maxVolume": 2000.0,
  "description": "Primary storage zone for fast-moving products"
}
```

**POST — Create (Receiving Zone)**
```json
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
  "hazardous": false,
  "restrictedAccess": false,
  "isActive": true,
  "maxWeight": 5000.0,
  "maxVolume": 1000.0,
  "description": "Inbound receiving zone"
}
```

**POST — Create (QC Zone)**
```json
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
  "hazardous": false,
  "restrictedAccess": true,
  "isActive": true,
  "maxWeight": 3000.0,
  "maxVolume": 500.0,
  "description": "Quality control inspection zone"
}
```

**Expected Response (Zone)**
```json
{
  "id": 1,
  "warehouseId": 1,
  "warehouseName": "Main Warehouse",
  "floorId": 1,
  "floorName": "Ground Floor",
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
```

**PUT — Update {id}**
```json
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
  "hazardous": false,
  "restrictedAccess": false,
  "isActive": true,
  "maxWeight": 12000.0,
  "maxVolume": 2500.0,
  "description": "Updated storage zone"
}
```

**DELETE**
```
DELETE /api/warehouse/zones/1
```

---

### 8. Rack
Base path: `/api/warehouse/racks`

> Requires: `zoneId` from step 7

| Field | Valid Values |
|-------|-------------|
| `rackType` | `STORAGE`, `BULK_STORAGE`, `PICK_FACE`, `STAGING` |

**GET — List All**
```
GET /api/warehouse/racks
```

**GET — By ID**
```
GET /api/warehouse/racks/1
```

**GET — By Active Status**
```
GET /api/warehouse/racks/status?isActive=true
```

**GET — By Rack Type**
```
GET /api/warehouse/racks/type/STORAGE
GET /api/warehouse/racks/type/PICK_FACE
```

**GET — By Barcode**
```
GET /api/warehouse/racks/barcode/RACK-BC-001
```

**POST — Create**
```json
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
```

**Expected Response (Rack)**
```json
{
  "id": 1,
  "zoneId": 1,
  "zoneName": "Zone A - Storage",
  "rackCode": "RACK-A-001",
  "barcodeTag": "RACK-BC-001",
  "barcodeImageUrl": null,
  "rackType": "STORAGE",
  "aisle": "A",
  "pickSequence": 1,
  "maxWeight": 2000.0,
  "maxVolume": 400.0,
  "isActive": true,
  "description": "Rack A01 in Zone A"
}
```

**PUT — Update {id}**
```json
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
```

**DELETE**
```
DELETE /api/warehouse/racks/1
```

---

### 9. Shelf
Base path: `/api/warehouse/shelves`

> Requires: `rackId` from step 8

**GET — List All**
```
GET /api/warehouse/shelves
```

**GET — By ID**
```
GET /api/warehouse/shelves/1
```

**GET — By Active Status**
```
GET /api/warehouse/shelves/status?isActive=true
```

**GET — By Barcode**
```
GET /api/warehouse/shelves/barcode/SHELF-BC-001
```

**POST — Create**
```json
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
```

**Expected Response (Shelf)**
```json
{
  "id": 1,
  "rackId": 1,
  "rackCode": "RACK-A-001",
  "shelfCode": "SHELF-A-001-L1",
  "barcodeTag": "SHELF-BC-001",
  "barcodeImageUrl": null,
  "levelNo": 1,
  "pickSequence": 1,
  "maxWeight": 500.0,
  "maxVolume": 100.0,
  "isActive": true,
  "description": "Shelf Level 1 of Rack A01"
}
```

**PUT — Update {id}**
```json
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
```

**DELETE**
```
DELETE /api/warehouse/shelves/1
```

---

### 10. Bin
Base path: `/api/warehouse/bins`

> Requires: `shelfId` from step 9, `warehouseId` from step 5

| Field | Valid Values |
|-------|-------------|
| `binType` | `STORAGE`, `RECEIVING`, `QC`, `QUARANTINE`, `DISPATCH`, `DAMAGE`, `RETURNS` |

**GET — List All**
```
GET /api/warehouse/bins
```

**GET — Paginated**
```
GET /api/warehouse/bins/paginated?page=0&size=10
```

**GET — By ID**
```
GET /api/warehouse/bins/1
```

**GET — By Active Status**
```
GET /api/warehouse/bins/active?isActive=true
```

**GET — By Bin Type**
```
GET /api/warehouse/bins/type/STORAGE
GET /api/warehouse/bins/type/QC
```

**GET — By Barcode**
```
GET /api/warehouse/bins/barcode/BIN-BC-001
```

**POST — Create (Storage Bin)**
```json
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
  "pickSequence": 1,
  "hazardousAllowed": false,
  "description": "Storage bin in Shelf Level 1"
}
```

**POST — Create (QC Bin)**
```json
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
  "pickSequence": 10,
  "hazardousAllowed": false,
  "description": "QC inspection bin"
}
```

**Expected Response (Bin)**
```json
{
  "id": 1,
  "shelfId": 1,
  "shelfCode": "SHELF-A-001-L1",
  "warehouseId": 1,
  "warehouseName": "Main Warehouse",
  "binCode": "BIN-A-001-L1-01",
  "barcodeTag": "BIN-BC-001",
  "barcodeImageUrl": null,
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
```

**PUT — Update {id}**
```json
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
  "pickSequence": 1,
  "hazardousAllowed": false,
  "description": "Updated storage bin"
}
```

**DELETE**
```
DELETE /api/warehouse/bins/1
```

---

### 11. Product (Unified Warehouse Product)
Base path: `/api/warehouse/products`

> Requires: `categoryId`, `subCategoryId`, `uomId`, `taxId`
> Links to source via `sourceType` + corresponding ID (only ONE source should be set)

| Field | Valid Values |
|-------|-------------|
| `sourceType` | `STANDALONE`, `CRM_PRODUCT`, `RAW_MATERIAL`, `SEMIFINISHED`, `FINISHED_GOOD` |

| sourceType | Required ID Field | Source API |
|------------|------------------|------------|
| `STANDALONE` | *(none)* | Direct warehouse product |
| `CRM_PRODUCT` | `crmProductId` | `/api/crm/sales-products` |
| `RAW_MATERIAL` | `rawMaterialId` | `/api/production/raw-materials` |
| `SEMIFINISHED` | `semifinishedId` | `/api/production/semi-finished` |
| `FINISHED_GOOD` | `finishedGoodId` | `/api/production/finished-goods` |

**GET — List All**
```
GET /api/warehouse/products
```

**GET — Paginated**
```
GET /api/warehouse/products/paginated?page=0&size=10
```

**GET — By ID**
```
GET /api/warehouse/products/1
```

**GET — By Barcode**
```
GET /api/warehouse/products/barcode/PRD-BC-001
```

**GET — Low Stock Alerts**
```
GET /api/warehouse/products/alerts/low-stock
```

**GET — Overstock Alerts**
```
GET /api/warehouse/products/alerts/overstock
```

**GET — Download Template (Excel)**
```
GET /api/warehouse/products/template
```

**GET — Export Products (Excel)**
```
GET /api/warehouse/products/export
```

**POST — Create (Standalone Product — no source link)**
```json
POST /api/warehouse/products
{
  "sku": "SKU-ELEC-001",
  "name": "Samsung Galaxy S24",
  "barcode": "PRD-BC-001",
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
  "locationId": 1,
  "sourceType": "STANDALONE",
  "warehouseId": 1,
  "minStockLevel": 10.0000,
  "maxStockLevel": 500.0000,
  "reorderPoint": 25.0000,
  "stockQuantity": 0.0000
}
```

**POST — Create (Linked to CRM Sales Product)**
> Set `sourceType: "CRM_PRODUCT"` and provide the `crmProductId` from `/api/crm/sales-products`
```json
POST /api/warehouse/products
{
  "sku": "SKU-CRM-TMT-001",
  "name": "Tata Steel TMT Bar 12mm",
  "barcode": "CRM-WH-BC-001",
  "description": "CRM product linked — TMT steel bar for warehouse tracking",
  "categoryId": 1,
  "subCategoryId": 1,
  "brand": "Tata Steel",
  "model": "TMT-12mm",
  "purchasePrice": 55.00,
  "salePrice": 72.00,
  "taxInclusive": false,
  "batchTracking": true,
  "serialTracking": false,
  "expiryTracking": false,
  "isActive": true,
  "uomId": 1,
  "taxId": 1,
  "locationId": 1,
  "sourceType": "CRM_PRODUCT",
  "crmProductId": 1,
  "warehouseId": 1,
  "minStockLevel": 100.0000,
  "maxStockLevel": 5000.0000,
  "reorderPoint": 500.0000,
  "stockQuantity": 0.0000
}
```

**POST — Create (Linked to Raw Material)**
> Set `sourceType: "RAW_MATERIAL"` and provide the `rawMaterialId` from `/api/production/raw-materials`
```json
POST /api/warehouse/products
{
  "sku": "SKU-RM-STEEL-001",
  "name": "Mild Steel Sheet 2mm",
  "barcode": "RM-WH-BC-001",
  "description": "Raw material linked — mild steel sheet for warehouse tracking",
  "categoryId": 1,
  "subCategoryId": 1,
  "brand": "JSW Steel",
  "model": "MS-2mm",
  "purchasePrice": 850.00,
  "salePrice": 0,
  "taxInclusive": false,
  "batchTracking": true,
  "serialTracking": false,
  "expiryTracking": false,
  "isActive": true,
  "uomId": 1,
  "taxId": 1,
  "locationId": 1,
  "sourceType": "RAW_MATERIAL",
  "rawMaterialId": 1,
  "warehouseId": 1,
  "minStockLevel": 50.0000,
  "maxStockLevel": 2000.0000,
  "reorderPoint": 100.0000,
  "stockQuantity": 0.0000
}
```

**POST — Create (Linked to Semi-Finished Good)**
> Set `sourceType: "SEMIFINISHED"` and provide the `semifinishedId` from `/api/production/semi-finished`
```json
POST /api/warehouse/products
{
  "sku": "SKU-SF-FRAME-001",
  "name": "Steel Frame Assembly",
  "barcode": "SF-WH-BC-001",
  "description": "Semi-finished good linked — pre-assembled steel frame",
  "categoryId": 1,
  "subCategoryId": 1,
  "brand": "In-House",
  "model": "FRAME-STD",
  "purchasePrice": 2500.00,
  "salePrice": 0,
  "taxInclusive": false,
  "batchTracking": true,
  "serialTracking": false,
  "expiryTracking": false,
  "isActive": true,
  "uomId": 1,
  "taxId": 1,
  "locationId": 1,
  "sourceType": "SEMIFINISHED",
  "semifinishedId": 1,
  "warehouseId": 1,
  "minStockLevel": 5.0000,
  "maxStockLevel": 200.0000,
  "reorderPoint": 20.0000,
  "stockQuantity": 0.0000
}
```

**POST — Create (Linked to Finished Good)**
> Set `sourceType: "FINISHED_GOOD"` and provide the `finishedGoodId` from `/api/production/finished-goods`
```json
POST /api/warehouse/products
{
  "sku": "SKU-FG-FAN-001",
  "name": "Heavy Duty Industrial Fan",
  "barcode": "FG-WH-BC-001",
  "description": "Finished good linked — 48-inch industrial fan for warehouse dispatch",
  "categoryId": 1,
  "subCategoryId": 1,
  "brand": "In-House",
  "model": "FAN-48HD",
  "purchasePrice": 3500.00,
  "salePrice": 5999.00,
  "taxInclusive": false,
  "batchTracking": false,
  "serialTracking": true,
  "expiryTracking": false,
  "isActive": true,
  "uomId": 1,
  "taxId": 1,
  "locationId": 1,
  "sourceType": "FINISHED_GOOD",
  "finishedGoodId": 1,
  "warehouseId": 1,
  "minStockLevel": 5.0000,
  "maxStockLevel": 100.0000,
  "reorderPoint": 10.0000,
  "stockQuantity": 0.0000
}
```

**PUT — Update {id}**
```json
PUT /api/warehouse/products/1
{
  "sku": "SKU-ELEC-001",
  "name": "Samsung Galaxy S24 (Updated)",
  "barcode": "PRD-BC-001",
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
  "locationId": 1,
  "sourceType": "STANDALONE",
  "warehouseId": 1,
  "minStockLevel": 15.0000,
  "maxStockLevel": 600.0000,
  "reorderPoint": 30.0000,
  "stockQuantity": 0.0000
}
```

**POST — Import Products (multipart/form-data)**
```
POST /api/warehouse/products/import
Content-Type: multipart/form-data
file: <attach .xlsx file>
```

**DELETE**
```
DELETE /api/warehouse/products/1
```

---

### 12. Product Batch
Base path: `/api/warehouse/batches`

> Requires: `productId` (product should have `batchTracking: true`)

**GET — By Product**
```
GET /api/warehouse/batches/product/2
```

**POST — Create**
```json
POST /api/warehouse/batches
{
  "batchNumber": "BATCH-2026-001",
  "mfgDate": "2026-01-15",
  "expiryDate": "2027-01-15",
  "productId": 2
}
```

**PUT — Update {id}**
```json
PUT /api/warehouse/batches/1
{
  "batchNumber": "BATCH-2026-001",
  "mfgDate": "2026-01-15",
  "expiryDate": "2027-06-15",
  "productId": 2
}
```

**DELETE**
```
DELETE /api/warehouse/batches/1
```

---

### 13. Product Serial
Base path: `/api/warehouse/serials`

> Requires: `batchId` from step 12

**GET — By Serial Number**
```
GET /api/warehouse/serials/SRL-001
```

**POST — Create**
```json
POST /api/warehouse/serials
{
  "serialNumber": "SRL-001",
  "batchId": 1
}
```

**PUT — Update {id}**
```json
PUT /api/warehouse/serials/1
{
  "serialNumber": "SRL-001-UPDATED",
  "batchId": 1
}
```

**DELETE**
```
DELETE /api/warehouse/serials/1
```

---

### 14. Inventory Movement (Auto Stock Update)
Base path: `/api/warehouse/inventory-movements`

> **Stock is auto-updated!** When you create a movement with a `productId`, the service
> auto-reads current stock → calculates `qtyBefore`/`qtyAfter` → updates `product.stockQuantity`.
> You do NOT need to pass `qtyBefore`/`qtyAfter` — they are auto-calculated.

| Field | Valid Values |
|-------|-------------|
| `type` | `INWARD`, `OUTWARD`, `INBOUND_RECEIPT`, `QC_ACCEPT`, `QC_REJECT`, `QC_HOLD`, `PUT_AWAY`, `PICK`, `PACK`, `SALES_DISPATCH`, `TRANSFER`, `TRANSFER_DISPATCH`, `TRANSFER_RECEIVE`, `PRODUCTION_ISSUE`, `PRODUCTION_RECEIPT`, `ADJUSTMENT_IN`, `ADJUSTMENT_OUT`, `STOCK_ADJUSTMENT`, `SCRAP` |
| `status` / `previousStatus` / `newStatus` | `AVAILABLE`, `UNDER_QC`, `HOLD`, `DAMAGED`, `EXPIRED`, `TRANSIT`, `RESERVED` |
| `referenceType` | `PURCHASE_GRN`, `TRANSFER`, `SALES_ORDER`, `DELIVERY_ORDER`, `PRODUCTION_ISSUE`, `RETURN_GRN`, `ADJUSTMENT` |
| `syncStatus` | `PENDING_SYNC`, `SYNCED` |

| Stock ⬆️ Increases | Stock ⬇️ Decreases | No Change |
|---|---|---|
| `INWARD`, `INBOUND_RECEIPT` | `OUTWARD`, `SALES_DISPATCH` | `TRANSFER`, `ADJUSTMENT` |
| `ADJUSTMENT_IN`, `PRODUCTION_RECEIPT` | `PRODUCTION_ISSUE`, `TRANSFER_DISPATCH` | `STOCK_ADJUSTMENT`, `QC_HOLD` |
| `TRANSFER_RECEIVE`, `QC_ACCEPT`, `PUT_AWAY` | `ADJUSTMENT_OUT`, `SCRAP`, `PICK`, `QC_REJECT` | `PACK` |

**GET — List All**
```
GET /api/warehouse/inventory-movements
```

**GET — By ID**
```
GET /api/warehouse/inventory-movements/1
```

**GET — By Status**
```
GET /api/warehouse/inventory-movements/status/AVAILABLE
GET /api/warehouse/inventory-movements/status/UNDER_QC
```

**GET — By Warehouse**
```
GET /api/warehouse/inventory-movements/warehouse/1
```

---

#### FLOW 1: Purchase → QC → Put Away (Full Inbound)

> 100 units purchased → QC inspection → 95 accepted, 5 rejected → stored in bin

**Step 1 — INBOUND_RECEIPT (GRN)** → stock +100 as UNDER_QC
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-GRN-2026-001",
  "type": "INBOUND_RECEIPT",
  "status": "UNDER_QC",
  "previousStatus": "UNDER_QC",
  "newStatus": "UNDER_QC",
  "productId": 1,
  "warehouseId": 1,
  "binId": 1,
  "uomId": 1,
  "quantity": 100.0,
  "unitCost": 450.00,
  "totalCost": 45000.00,
  "referenceType": "PURCHASE_GRN",
  "referenceId": 101,
  "remarks": "GRN received from supplier Tata Steel",
  "createdBy": 1,
  "movementAt": "2026-03-22T10:00:00",
  "syncStatus": "SYNCED"
}
```

**Step 2a — QC_ACCEPT** → stock +95 (passed inspection)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-QC-ACC-2026-001",
  "type": "QC_ACCEPT",
  "status": "AVAILABLE",
  "previousStatus": "UNDER_QC",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 1,
  "binId": 1,
  "uomId": 1,
  "quantity": 95.0,
  "unitCost": 450.00,
  "totalCost": 42750.00,
  "referenceType": "PURCHASE_GRN",
  "referenceId": 101,
  "remarks": "95 units passed QC inspection",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2026-03-22T12:00:00",
  "syncStatus": "SYNCED"
}
```

**Step 2b — QC_REJECT** → stock -5 (failed inspection)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-QC-REJ-2026-001",
  "type": "QC_REJECT",
  "status": "DAMAGED",
  "previousStatus": "UNDER_QC",
  "newStatus": "DAMAGED",
  "productId": 1,
  "warehouseId": 1,
  "binId": 1,
  "uomId": 1,
  "quantity": 5.0,
  "unitCost": 450.00,
  "totalCost": 2250.00,
  "referenceType": "PURCHASE_GRN",
  "referenceId": 101,
  "remarks": "5 units failed QC - surface damage",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2026-03-22T12:05:00",
  "syncStatus": "SYNCED"
}
```

**Step 3 — PUT_AWAY** → stock +95 (moved to storage bin)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-PA-2026-001",
  "type": "PUT_AWAY",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 1,
  "binId": 1,
  "destinationBinId": 3,
  "uomId": 1,
  "quantity": 95.0,
  "unitCost": 450.00,
  "totalCost": 42750.00,
  "referenceType": "PURCHASE_GRN",
  "referenceId": 101,
  "remarks": "Put away to Bin B-01-03 (Heavy Items Zone)",
  "createdBy": 1,
  "movementAt": "2026-03-22T13:00:00",
  "syncStatus": "SYNCED"
}
```

---

#### FLOW 2: Sales → Pick → Pack → Dispatch (Full Outbound)

> Customer ordered 20 units → pick from shelf → pack → dispatch

**Step 1 — PICK** → stock -20 (reserved for order)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-PICK-2026-001",
  "type": "PICK",
  "status": "RESERVED",
  "previousStatus": "AVAILABLE",
  "newStatus": "RESERVED",
  "productId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 20.0,
  "unitCost": 450.00,
  "totalCost": 9000.00,
  "referenceType": "SALES_ORDER",
  "referenceId": 301,
  "remarks": "Picking 20 units for Sales Order SO-2026-001",
  "createdBy": 1,
  "movementAt": "2026-03-22T14:00:00",
  "syncStatus": "SYNCED"
}
```

**Step 2 — PACK** → no stock change (just status update)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-PACK-2026-001",
  "type": "PACK",
  "status": "RESERVED",
  "previousStatus": "RESERVED",
  "newStatus": "RESERVED",
  "productId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 20.0,
  "unitCost": 450.00,
  "totalCost": 9000.00,
  "referenceType": "DELIVERY_ORDER",
  "referenceId": 1,
  "remarks": "Packed 20 units in 2 cartons",
  "createdBy": 1,
  "movementAt": "2026-03-22T14:30:00",
  "syncStatus": "SYNCED"
}
```

**Step 3 — SALES_DISPATCH** → stock -20 (leaves warehouse)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-DISP-2026-001",
  "type": "SALES_DISPATCH",
  "status": "AVAILABLE",
  "previousStatus": "RESERVED",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 20.0,
  "unitCost": 450.00,
  "totalCost": 9000.00,
  "referenceType": "DELIVERY_ORDER",
  "referenceId": 1,
  "remarks": "Dispatched to customer via KA-01-AB-1234",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2026-03-22T15:00:00",
  "syncStatus": "SYNCED"
}
```

---

#### FLOW 3: Inter-Warehouse Transfer

> Move 50 units from Warehouse 1 to Warehouse 2

**Step 1 — TRANSFER_DISPATCH** → stock -50 (from source warehouse)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-TRF-OUT-2026-001",
  "type": "TRANSFER_DISPATCH",
  "status": "TRANSIT",
  "previousStatus": "AVAILABLE",
  "newStatus": "TRANSIT",
  "productId": 1,
  "warehouseId": 1,
  "sourceWarehouseId": 1,
  "destinationWarehouseId": 2,
  "sourceBinId": 3,
  "uomId": 1,
  "quantity": 50.0,
  "unitCost": 450.00,
  "totalCost": 22500.00,
  "referenceType": "TRANSFER",
  "referenceId": 1,
  "remarks": "Dispatched to Pune warehouse",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2026-03-22T16:00:00",
  "syncStatus": "SYNCED"
}
```

**Step 2 — TRANSFER_RECEIVE** → stock +50 (at destination warehouse)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-TRF-IN-2026-001",
  "type": "TRANSFER_RECEIVE",
  "status": "AVAILABLE",
  "previousStatus": "TRANSIT",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 2,
  "sourceWarehouseId": 1,
  "destinationWarehouseId": 2,
  "destinationBinId": 5,
  "uomId": 1,
  "quantity": 48.0,
  "unitCost": 450.00,
  "totalCost": 21600.00,
  "referenceType": "TRANSFER",
  "referenceId": 1,
  "remarks": "Received at Pune warehouse — 2 units damaged in transit",
  "createdBy": 3,
  "movementAt": "2026-03-23T10:00:00",
  "syncStatus": "SYNCED"
}
```

---

#### FLOW 4: Production Issue & Receipt

> Send 100 units of raw material to production, receive 80 finished goods back

**Step 1 — PRODUCTION_ISSUE** → stock -100 (raw materials to production)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-PI-2026-001",
  "type": "PRODUCTION_ISSUE",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 3,
  "rawMaterialId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 100.0,
  "unitCost": 850.00,
  "totalCost": 85000.00,
  "referenceType": "PRODUCTION_ISSUE",
  "referenceId": 501,
  "remarks": "Issued raw material for MO-2026-001",
  "createdBy": 1,
  "movementAt": "2026-03-22T09:00:00",
  "syncStatus": "SYNCED"
}
```

**Step 2 — PRODUCTION_RECEIPT** → stock +80 (finished goods from production)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-PR-2026-001",
  "type": "PRODUCTION_RECEIPT",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 5,
  "finishedGoodId": 1,
  "warehouseId": 1,
  "binId": 4,
  "uomId": 1,
  "quantity": 80.0,
  "unitCost": 3500.00,
  "totalCost": 280000.00,
  "referenceType": "PRODUCTION_ISSUE",
  "referenceId": 501,
  "remarks": "Received finished goods from production MO-2026-001",
  "createdBy": 1,
  "movementAt": "2026-03-23T16:00:00",
  "syncStatus": "SYNCED"
}
```

---

#### FLOW 5: Stock Adjustment (Single Step)

**ADJUSTMENT_IN** → stock +5 (found extra during count)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-ADJ-IN-2026-001",
  "type": "ADJUSTMENT_IN",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 5.0,
  "unitCost": 450.00,
  "totalCost": 2250.00,
  "referenceType": "ADJUSTMENT",
  "referenceId": 1,
  "remarks": "Cycle count found 5 extra units",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2026-03-22T17:00:00",
  "syncStatus": "SYNCED"
}
```

**ADJUSTMENT_OUT** → stock -3 (missing/lost)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-ADJ-OUT-2026-001",
  "type": "ADJUSTMENT_OUT",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 3.0,
  "unitCost": 450.00,
  "totalCost": 1350.00,
  "referenceType": "ADJUSTMENT",
  "referenceId": 2,
  "remarks": "3 units missing — probable shrinkage",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2026-03-22T17:30:00",
  "syncStatus": "SYNCED"
}
```

---

#### FLOW 6: Scrap Write-off (Single Step)

**SCRAP** → stock -10 (damaged beyond use)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-SCRAP-2026-001",
  "type": "SCRAP",
  "status": "DAMAGED",
  "previousStatus": "DAMAGED",
  "newStatus": "DAMAGED",
  "productId": 1,
  "warehouseId": 1,
  "binId": 1,
  "uomId": 1,
  "quantity": 10.0,
  "unitCost": 450.00,
  "totalCost": 4500.00,
  "referenceType": "ADJUSTMENT",
  "referenceId": 3,
  "remarks": "QC rejected units scrapped",
  "createdBy": 1,
  "approvedBy": 2,
  "movementAt": "2026-03-22T18:00:00",
  "syncStatus": "SYNCED"
}
```

---

#### FLOW 7: Generic INWARD / OUTWARD (Single Step)

**INWARD** → stock +25 (quick stock-in, e.g. customer return)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-IN-2026-001",
  "type": "INWARD",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 25.0,
  "unitCost": 450.00,
  "totalCost": 11250.00,
  "referenceType": "RETURN_GRN",
  "referenceId": 401,
  "remarks": "Customer return — all items in good condition",
  "createdBy": 1,
  "movementAt": "2026-03-22T09:00:00",
  "syncStatus": "SYNCED"
}
```

**OUTWARD** → stock -15 (quick stock-out, e.g. samples)
```json
POST /api/warehouse/inventory-movements
{
  "movementNo": "MOV-OUT-2026-001",
  "type": "OUTWARD",
  "status": "AVAILABLE",
  "previousStatus": "AVAILABLE",
  "newStatus": "AVAILABLE",
  "productId": 1,
  "warehouseId": 1,
  "binId": 3,
  "uomId": 1,
  "quantity": 15.0,
  "unitCost": 450.00,
  "totalCost": 6750.00,
  "referenceType": "SALES_ORDER",
  "referenceId": 302,
  "remarks": "Sample units sent to client for evaluation",
  "createdBy": 1,
  "movementAt": "2026-03-22T11:00:00",
  "syncStatus": "SYNCED"
}
```

---

**PATCH — Update Quantity**
```
PATCH /api/warehouse/inventory-movements/1/quantity?quantity=150.0
```

**DELETE**
```
DELETE /api/warehouse/inventory-movements/1
```

---

### 15. Transfer Orders
Base path: `/api/warehouse/transfers`

| Field | Valid Values |
|-------|-------------|
| `TransferStatus` | `DRAFT`, `APPROVED`, `DISPATCHED`, `IN_TRANSIT`, `RECEIVED`, `CANCELLED` |

**POST — Create Transfer (DRAFT)**
```json
POST /api/warehouse/transfers
{
  "sourceWarehouseId": 1,
  "destinationWarehouseId": 2,
  "requestedDate": "2026-03-25",
  "remarks": "Quarterly stock replenishment",
  "items": [
    {
      "productId": 1,
      "batchId": 1,
      "requestedQty": 50.000000,
      "sourceBinId": 1,
      "destinationBinId": 2,
      "remarks": "Handle with care - electronics"
    }
  ]
}
```

**PUT — Approve Transfer**
```
PUT /api/warehouse/transfers/1/approve
```

**PUT — Dispatch Transfer**
```json
PUT /api/warehouse/transfers/1/dispatch
[
  {
    "productId": 1,
    "batchId": 1,
    "dispatchedQty": 50.000000,
    "sourceBinId": 1,
    "remarks": "Dispatched via KA-01-AB-1234"
  }
]
```

**PUT — Receive Transfer**
```json
PUT /api/warehouse/transfers/1/receive
[
  {
    "productId": 1,
    "batchId": 1,
    "receivedQty": 48.000000,
    "destinationBinId": 2,
    "remarks": "2 units damaged in transit"
  }
]
```

**PUT — Cancel Transfer**
```
PUT /api/warehouse/transfers/1/cancel
```

**GET — List All (Paginated)**
```
GET /api/warehouse/transfers?page=0&size=10&sort=createdAt,desc
```

**GET — By Status**
```
GET /api/warehouse/transfers/status/DRAFT?page=0&size=10
GET /api/warehouse/transfers/status/RECEIVED?page=0&size=10
```

**GET — By ID**
```
GET /api/warehouse/transfers/1
```

---

### 16. Stock Alerts
Base path: `/api/warehouse/stock-alerts`

**GET — Get Stock Alerts (default 30 days expiry window)**
```
GET /api/warehouse/stock-alerts
```

**GET — Custom expiry window**
```
GET /api/warehouse/stock-alerts?expiryDays=60
```

---

### 17. Costing
Base path: `/api/warehouse/costing`

**GET — Costing Summary (all products)**
```
GET /api/warehouse/costing/summary
```

**GET — Costing Summary (filtered by warehouse)**
```
GET /api/warehouse/costing/summary?warehouseId=1
```

**GET — Product Costing**
```
GET /api/warehouse/costing/product/1
GET /api/warehouse/costing/product/1?warehouseId=1
```

---

### 18. Dashboard
Base path: `/api/warehouse/dashboard`

**GET — Dashboard Stats**
```
GET /api/warehouse/dashboard
```

---

### 19. Reports
Base path: `/api/warehouse/reports`

**GET — Stock Ledger**
```
GET /api/warehouse/reports/stock-ledger?productId=1&from=2026-01-01T00:00:00&to=2026-12-31T23:59:59
```

**GET — Stock Valuation**
```
GET /api/warehouse/reports/stock-valuation
GET /api/warehouse/reports/stock-valuation?warehouseId=1
```

**GET — Transfer History**
```
GET /api/warehouse/reports/transfer-history?from=2026-01-01&to=2026-12-31
```

**GET — Delivery Performance**
```
GET /api/warehouse/reports/delivery-performance?from=2026-01-01T00:00:00&to=2026-12-31T23:59:59
```

---

## PART B — FLEET MODULE

---

### 20. Drivers
Base path: `/api/fleet/drivers`

**GET — List All (Paginated)**
```
GET /api/fleet/drivers?page=0&size=10
```

**GET — Filter by Status**
```
GET /api/fleet/drivers?status=AVAILABLE&page=0&size=10
```

**GET — By ID**
```
GET /api/fleet/drivers/1
```

**POST — Create Driver**
```json
POST /api/fleet/drivers
{
  "employeeCode": "DRV-001",
  "name": "Amit Sharma",
  "phone": "+91-9988776655",
  "email": "amit.sharma@company.com",
  "address": "123, Brigade Road, Bengaluru",
  "dateOfBirth": "1990-05-15",
  "joiningDate": "2024-01-10",
  "emergencyContact": "+91-9876543200",
  "licenseNumber": "KA-LIC-DRV-2024-001",
  "licenseType": "HMV",
  "licenseExpiry": "2028-12-31",
  "status": "AVAILABLE",
  "notes": "Experienced heavy vehicle driver"
}
```

**POST — Create Second Driver**
```json
POST /api/fleet/drivers
{
  "employeeCode": "DRV-002",
  "name": "Vikram Singh",
  "phone": "+91-9988776644",
  "email": "vikram.singh@company.com",
  "address": "456, MG Road, Pune",
  "dateOfBirth": "1985-08-20",
  "joiningDate": "2023-06-15",
  "emergencyContact": "+91-9876543300",
  "licenseNumber": "KA-LIC-DRV-2023-002",
  "licenseType": "LMV",
  "licenseExpiry": "2027-06-30",
  "status": "AVAILABLE",
  "notes": "Light vehicle specialist, city routes"
}
```

**PUT — Update Driver {id}**
```json
PUT /api/fleet/drivers/1
{
  "employeeCode": "DRV-001",
  "name": "Amit Sharma",
  "phone": "+91-9988776655",
  "email": "amit.sharma@company.com",
  "address": "123, Brigade Road, Bengaluru",
  "dateOfBirth": "1990-05-15",
  "joiningDate": "2024-01-10",
  "emergencyContact": "+91-9876543200",
  "licenseNumber": "KA-LIC-DRV-2024-001",
  "licenseType": "HMV",
  "licenseExpiry": "2028-12-31",
  "status": "ON_TRIP",
  "assignedVehicleId": 1,
  "notes": "Assigned to main truck"
}
```

**POST — Upload Profile Image**
```
POST /api/fleet/drivers/1/profile-image
Content-Type: multipart/form-data
file: <attach image file>
```

**GET — Get Profile Image**
```
GET /api/fleet/drivers/1/profile-image
```

**DELETE**
```
DELETE /api/fleet/drivers/1
```

---

### 21. Vehicles
Base path: `/api/fleet/vehicles`

**GET — List All (Paginated)**
```
GET /api/fleet/vehicles?page=0&size=10
```

**GET — By ID**
```
GET /api/fleet/vehicles/1
```

**POST — Create Vehicle**
```json
POST /api/fleet/vehicles
{
  "plateNumber": "KA-01-AB-1234",
  "vehicleType": "TRUCK",
  "make": "Tata Motors",
  "model": "Ace Gold",
  "year": 2024,
  "color": "White",
  "vinNumber": "TATA1234567890",
  "fuelType": "DIESEL",
  "capacityWeight": 1500.0,
  "capacityVolume": 8.0,
  "odometerReading": 12500.0,
  "insuranceNumber": "INS-2026-001",
  "insuranceExpiry": "2027-03-31",
  "registrationExpiry": "2029-12-31",
  "assignedDriverId": 1,
  "notes": "Primary delivery truck"
}
```

**POST — Create Second Vehicle**
```json
POST /api/fleet/vehicles
{
  "plateNumber": "KA-01-CD-5678",
  "vehicleType": "VAN",
  "make": "Tata Motors",
  "model": "Winger",
  "year": 2025,
  "color": "Silver",
  "vinNumber": "TATA0987654321",
  "fuelType": "CNG",
  "capacityWeight": 800.0,
  "capacityVolume": 5.0,
  "odometerReading": 3200.0,
  "insuranceNumber": "INS-2026-002",
  "insuranceExpiry": "2027-06-30",
  "registrationExpiry": "2030-06-30",
  "assignedDriverId": 2,
  "notes": "City delivery van"
}
```

**PUT — Update Vehicle {id}**
```json
PUT /api/fleet/vehicles/1
{
  "plateNumber": "KA-01-AB-1234",
  "vehicleType": "TRUCK",
  "make": "Tata Motors",
  "model": "Ace Gold",
  "year": 2024,
  "color": "White",
  "vinNumber": "TATA1234567890",
  "fuelType": "DIESEL",
  "capacityWeight": 1500.0,
  "capacityVolume": 8.0,
  "odometerReading": 15000.0,
  "insuranceNumber": "INS-2026-001",
  "insuranceExpiry": "2027-03-31",
  "registrationExpiry": "2029-12-31",
  "assignedDriverId": 1,
  "notes": "Updated odometer reading"
}
```

**DELETE**
```
DELETE /api/fleet/vehicles/1
```

---

### 22. Routes
Base path: `/api/fleet/routes`

**GET — List All**
```
GET /api/fleet/routes
```

**GET — Route Details**
```
GET /api/fleet/routes/1
```

**POST — Create Route**
```json
POST /api/fleet/routes
{
  "routeName": "Bengaluru City Route - Morning",
  "driverId": 1,
  "vehicleId": 1,
  "routeDate": "2026-03-25",
  "status": "PLANNED",
  "totalDistanceKm": 45.0,
  "estimatedDurationMins": 120,
  "stops": [
    {
      "deliveryOrderId": 1,
      "stopOrder": 1,
      "customerName": "ABC Electronics Pvt Ltd",
      "address": "Shop 12, Commercial Complex, Koramangala",
      "latitude": 12.9352,
      "longitude": 77.6245,
      "estimatedArrival": "2026-03-25T09:30:00"
    },
    {
      "deliveryOrderId": 2,
      "stopOrder": 2,
      "customerName": "XYZ Tech Solutions",
      "address": "Tower B, IT Park, Whitefield",
      "latitude": 12.9698,
      "longitude": 77.7500,
      "estimatedArrival": "2026-03-25T11:00:00"
    }
  ]
}
```

**PUT — Mark Stop Arrived**
```
PUT /api/fleet/routes/stops/1/arrive
```

**PUT — Mark Stop Completed**
```
PUT /api/fleet/routes/stops/1/complete
```

---

## PART C — SALES MODULE (Phase-Related Changes)

---

### 23. Delivery Orders (Fleet Integration)
Base path: `/api/sales/delivery-orders`

**GET — List All (Paginated)**
```
GET /api/sales/delivery-orders?page=0&size=10
```

**GET — With Filters**
```
GET /api/sales/delivery-orders?search=ABC&fromDate=2026-01-01&toDate=2026-12-31&page=0&size=10
```

**GET — By ID**
```
GET /api/sales/delivery-orders/1
```

**POST — Create Delivery Order** *(multipart/form-data)*
```
POST /api/sales/delivery-orders
Content-Type: multipart/form-data

Part "data" (application/json):
{
  "deliveryOrderDate": "2026-03-25",
  "shipmentDate": "2026-03-26",
  "customerId": 1,
  "salesOrderId": 1,
  "reference": "DO-2026-001",
  "poNumber": "PO-CUST-001",
  "salespersonId": 1,
  "items": [
    {
      "productId": 1,
      "quantity": 10,
      "unitPrice": 54999.00
    }
  ],
  "totalDiscount": 0,
  "otherCharges": 500.00,
  "notes": "Deliver before 5 PM",
  "status": "DRAFT",
  "driverId": 1,
  "vehicleId": 1,
  "warehouseId": 1,
  "routeNotes": "Use back gate for delivery"
}

Part "attachments" (optional): <attach files>
```

**PATCH — Update Status**
```
PATCH /api/sales/delivery-orders/1/status?status=CONFIRMED
```

**PUT — Assign Fleet**
```
PUT /api/sales/delivery-orders/1/assign-fleet?driverId=1&vehicleId=1
```

**PUT — Start Picking**
```
PUT /api/sales/delivery-orders/1/start-picking
```

**PUT — Confirm Packed**
```
PUT /api/sales/delivery-orders/1/confirm-packed
```

**PUT — Dispatch**
```
PUT /api/sales/delivery-orders/1/dispatch
```

**PUT — Mark Delivered**
```
PUT /api/sales/delivery-orders/1/mark-delivered
```

**DELETE**
```
DELETE /api/sales/delivery-orders/1
```

---

### 24. Proof of Delivery (POD)
Base path: `/api/sales/delivery-orders/{doId}/pod`

**POST — Submit POD** *(multipart/form-data)*
```
POST /api/sales/delivery-orders/1/pod
Content-Type: multipart/form-data

Part "data" (JSON string):
{
  "status": "DELIVERED",
  "receivedByName": "Priya Menon",
  "receivedByPhone": "+91-9876500001",
  "gpsLatitude": 12.9352,
  "gpsLongitude": 77.6245,
  "remarks": "All items received in good condition"
}

Part "signature" (optional): <attach signature image>
Part "photo" (optional): <attach delivery photo>
```

**GET — Get POD**
```
GET /api/sales/delivery-orders/1/pod
```

**GET — Get Signature Image**
```
GET /api/sales/delivery-orders/1/pod/signature
```

**GET — Get Delivery Photo**
```
GET /api/sales/delivery-orders/1/pod/photo
```

---

## PART D — CRM MODULE

---

### 25. CRM Sales Products
Base path: `/api/crm/sales-products`

> These are CRM-level product definitions used in quotations, leads, and the sales pipeline.

| Field | Valid Values |
|-------|-------------|
| `itemType` | `PRODUCT`, `SERVICE` |

**GET — List All (Paginated)**
```
GET /api/crm/sales-products?page=0&size=10
```

**GET — By ID**
```
GET /api/crm/sales-products/1
```

**POST — Create (JSON)**
```json
POST /api/crm/sales-products
Content-Type: application/json
{
  "itemType": "PRODUCT",
  "isPurchase": true,
  "isSales": true,
  "itemCode": "CRM-PRD-001",
  "name": "Tata Steel TMT Bar 12mm",
  "description": "High-strength TMT steel bar, 12mm diameter, Fe-500 grade",
  "unitOfMeasure": "KG",
  "reorderLimit": 500,
  "vatClassificationCode": "HSN-7214",
  "purchasePrice": 55.00,
  "salesPrice": 72.00,
  "tax": "GST 18%",
  "taxRate": 18.0
}
```

**POST — Create (Service)**
```json
POST /api/crm/sales-products
Content-Type: application/json
{
  "itemType": "SERVICE",
  "isPurchase": false,
  "isSales": true,
  "itemCode": "CRM-SRV-001",
  "name": "Annual Maintenance Contract",
  "description": "Annual maintenance service for industrial machinery",
  "unitOfMeasure": "NOS",
  "reorderLimit": 0,
  "purchasePrice": 0,
  "salesPrice": 150000.00,
  "tax": "GST 18%",
  "taxRate": 18.0
}
```

**POST — Create with Image (Multipart)**
```
POST /api/crm/sales-products
Content-Type: multipart/form-data

Part "product" (application/json):
{
  "itemType": "PRODUCT",
  "isPurchase": true,
  "isSales": true,
  "itemCode": "CRM-PRD-002",
  "name": "Copper Wire 2.5mm",
  "description": "Copper electrical wire, 2.5mm cross-section",
  "unitOfMeasure": "MTR",
  "reorderLimit": 1000,
  "purchasePrice": 25.00,
  "salesPrice": 35.00,
  "tax": "GST 18%",
  "taxRate": 18.0
}

Part "image" (optional): <attach product image>
```

**PUT — Update (JSON) {id}**
```json
PUT /api/crm/sales-products/1
Content-Type: application/json
{
  "itemType": "PRODUCT",
  "isPurchase": true,
  "isSales": true,
  "itemCode": "CRM-PRD-001",
  "name": "Tata Steel TMT Bar 12mm (Updated)",
  "description": "Updated description",
  "unitOfMeasure": "KG",
  "reorderLimit": 600,
  "vatClassificationCode": "HSN-7214",
  "purchasePrice": 58.00,
  "salesPrice": 75.00,
  "tax": "GST 18%",
  "taxRate": 18.0
}
```

**PUT — Update with Image (Multipart) {id}**
```
PUT /api/crm/sales-products/1
Content-Type: multipart/form-data

Part "product" (application/json): { ... updated fields ... }
Part "image" (optional): <attach new image>
```

**GET — Product Image**
```
GET /api/crm/sales-products/1/image
```

**GET — Product Barcode**
```
GET /api/crm/sales-products/1/barcode
```

**DELETE**
```
DELETE /api/crm/sales-products/1
```

---

## PART E — PRODUCTION MODULE

---

### 26. Raw Materials
Base path: `/api/production/raw-materials`

> Uses `multipart/form-data` with `@ModelAttribute` — send fields as form fields, not JSON body.

| Field | Valid Values |
|-------|-------------|
| `itemType` | `PRODUCT`, `SERVICE` |

**GET — List All (Paginated)**
```
GET /api/production/raw-materials?page=0&size=20
```

**GET — By ID**
```
GET /api/production/raw-materials/1
```

**GET — By Item Code**
```
GET /api/production/raw-materials/by-item-code/RM-STEEL-001
```

**POST — Create** *(multipart/form-data)*
```
POST /api/production/raw-materials
Content-Type: multipart/form-data

Fields:
  itemCode       = RM-STEEL-001
  name           = Mild Steel Sheet 2mm
  itemType       = PRODUCT
  forPurchase    = true
  forSales       = false
  categoryId     = 1
  subCategoryId  = 1
  barcode        = RM-BC-001
  description    = 2mm thick mild steel sheet, standard grade
  issueUnitId    = 1
  purchaseUnitId = 1
  unitRelation   = 1.0000
  reorderLimit   = 100.0000
  taxId          = 1
  purchasePrice  = 850.0000
  salesPrice     = 0.0000
  stockQuantity  = 500.0000
  discontinued   = false

Part "image" (optional): <attach image file>
```

**POST — Create (Second)**
```
POST /api/production/raw-materials
Content-Type: multipart/form-data

Fields:
  itemCode       = RM-COPPER-001
  name           = Copper Rod 8mm
  itemType       = PRODUCT
  forPurchase    = true
  forSales       = false
  categoryId     = 1
  subCategoryId  = 1
  description    = 8mm diameter copper rod
  issueUnitId    = 1
  purchaseUnitId = 1
  unitRelation   = 1.0000
  reorderLimit   = 50.0000
  taxId          = 1
  purchasePrice  = 720.0000
  salesPrice     = 0.0000
  stockQuantity  = 200.0000
  discontinued   = false
```

**PUT — Update {id}** *(multipart/form-data)*
```
PUT /api/production/raw-materials/1
Content-Type: multipart/form-data

Fields:
  itemCode       = RM-STEEL-001
  name           = Mild Steel Sheet 2mm (Updated)
  itemType       = PRODUCT
  forPurchase    = true
  forSales       = false
  reorderLimit   = 150.0000
  purchasePrice  = 900.0000
  stockQuantity  = 450.0000
  discontinued   = false

Part "image" (optional): <attach new image>
```

**PUT — Update Stock Quantity**
```
PUT /api/production/raw-materials/1/stock-quantity?quantity=600.0000
```

**GET — Product Image**
```
GET /api/production/raw-materials/1/image
```

**GET — Barcode Image**
```
GET /api/production/raw-materials/1/barcode-image
```

**GET — View File by Path**
```
GET /api/production/raw-materials/view-file?path=uploads/tenant/production/raw/image.png
```

**GET — Download Bulk Template**
```
GET /api/production/raw-materials/bulk-template
```

**POST — Bulk Import (Excel)**
```
POST /api/production/raw-materials/bulk
Content-Type: multipart/form-data
file: <attach .xlsx file>
```

**GET — Export All (Excel)**
```
GET /api/production/raw-materials/export
```

**DELETE**
```
DELETE /api/production/raw-materials/1
```

---

### 27. Semi-Finished Goods
Base path: `/api/production/semi-finished`

> Uses `multipart/form-data` with `@ModelAttribute`.

| Field | Valid Values |
|-------|-------------|
| `itemType` | `PRODUCT`, `SERVICE` |

**GET — List All (Paginated)**
```
GET /api/production/semi-finished?page=0&size=20
```

**GET — By ID**
```
GET /api/production/semi-finished/1
```

**GET — By Item Code**
```
GET /api/production/semi-finished/by-item-code/SF-FRAME-001
```

**POST — Create** *(multipart/form-data)*
```
POST /api/production/semi-finished
Content-Type: multipart/form-data

Fields:
  itemCode          = SF-FRAME-001
  name              = Steel Frame Assembly
  itemType          = PRODUCT
  forPurchase       = false
  forSales          = false
  isRoll            = false
  isScrapItem       = false
  categoryId        = 1
  subCategoryId     = 1
  barcode           = SF-BC-001
  description       = Pre-assembled steel frame for final products
  issueUnitId       = 1
  purchaseUnitId    = 1
  unitRelation      = 1.0000
  wastagePercentage = 2.50
  reorderLimit      = 20.0000
  stockQuantity     = 100.0000
  taxId             = 1
  isTaxInclusive    = false
  purchasePrice     = 2500.0000
  salesPrice        = 0.0000

  imageFile (optional): <attach image>
```

**POST — Create (Scrap Item)**
```
POST /api/production/semi-finished
Content-Type: multipart/form-data

Fields:
  itemCode          = SF-SCRAP-001
  name              = Steel Scrap Offcuts
  itemType          = PRODUCT
  forPurchase       = false
  forSales          = true
  isRoll            = false
  isScrapItem       = true
  description       = Reusable steel scrap from cutting process
  wastagePercentage = 0
  reorderLimit      = 0
  stockQuantity     = 50.0000
  purchasePrice     = 0
  salesPrice        = 150.0000
```

**PUT — Update {id}** *(multipart/form-data)*
```
PUT /api/production/semi-finished/1
Content-Type: multipart/form-data

Fields:
  itemCode          = SF-FRAME-001
  name              = Steel Frame Assembly (Updated)
  wastagePercentage = 3.00
  reorderLimit      = 30.0000
  stockQuantity     = 80.0000
```

**GET — Product Image**
```
GET /api/production/semi-finished/1/image
```

**GET — Barcode Image**
```
GET /api/production/semi-finished/1/barcode-image
```

**GET — Download Bulk Template**
```
GET /api/production/semi-finished/bulk-template
```

**POST — Bulk Import (Excel)**
```
POST /api/production/semi-finished/bulk
Content-Type: multipart/form-data
file: <attach .xlsx file>
```

**GET — Export All (Excel)**
```
GET /api/production/semi-finished/export
```

**DELETE**
```
DELETE /api/production/semi-finished/1
```

---

### 28. Finished Goods
Base path: `/api/production/finished-goods`

> Uses `multipart/form-data` with `@ModelAttribute`.

| Field | Valid Values |
|-------|-------------|
| `itemType` | `PRODUCT`, `SERVICE` |

**GET — List All**
```
GET /api/production/finished-goods
```

**GET — By ID**
```
GET /api/production/finished-goods/1
```

**POST — Create** *(multipart/form-data)*
```
POST /api/production/finished-goods
Content-Type: multipart/form-data

Fields:
  name                = Heavy Duty Industrial Fan
  itemCode            = FG-FAN-001
  barcode             = FG-BC-001
  hsnSacCode          = HSN-8414
  description         = 48-inch heavy duty industrial ceiling fan
  inventoryTypeId     = 1
  itemType            = PRODUCT
  forPurchase         = false
  forSales            = true
  isTaxInclusive      = false
  categoryId          = 1
  subCategoryId       = 1
  issueUnitId         = 1
  purchaseUnitId      = 1
  taxId               = 1
  unitRelation        = 1.0000
  tolerancePercentage = 1.50
  reorderLimit        = 10.0000
  stockQuantity       = 50.0000
  purchasePrice       = 3500.0000
  salesPrice          = 5999.0000

  imageFile (optional): <attach product image>
```

**POST — Create (Second)**
```
POST /api/production/finished-goods
Content-Type: multipart/form-data

Fields:
  name                = Steel Storage Rack 6-Tier
  itemCode            = FG-RACK-001
  barcode             = FG-BC-002
  hsnSacCode          = HSN-9403
  description         = 6-tier heavy duty steel storage rack
  itemType            = PRODUCT
  forPurchase         = false
  forSales            = true
  isTaxInclusive      = true
  categoryId          = 1
  subCategoryId       = 1
  issueUnitId         = 1
  purchaseUnitId      = 1
  taxId               = 1
  unitRelation        = 1.0000
  tolerancePercentage = 2.00
  reorderLimit        = 5.0000
  stockQuantity       = 25.0000
  purchasePrice       = 4200.0000
  salesPrice          = 7499.0000
```

**PUT — Update {id}** *(multipart/form-data)*
```
PUT /api/production/finished-goods/1
Content-Type: multipart/form-data

Fields:
  name                = Heavy Duty Industrial Fan (Updated)
  itemCode            = FG-FAN-001
  tolerancePercentage = 2.00
  reorderLimit        = 15.0000
  salesPrice          = 6499.0000

  imageFile (optional): <attach new image>
```

**GET — Product Image**
```
GET /api/production/finished-goods/1/image
```

**GET — Barcode Image**
```
GET /api/production/finished-goods/1/barcode-image
```

**GET — View File by Path**
```
GET /api/production/finished-goods/view-file?path=uploads/tenant/production/finished/image.png
```

**GET — Download Import Template**
```
GET /api/production/finished-goods/template
```

**POST — Import from Excel**
```
POST /api/production/finished-goods/import
Content-Type: multipart/form-data
file: <attach .xlsx file>
```

**GET — Export All (Excel)**
```
GET /api/production/finished-goods/export
```

**DELETE**
```
DELETE /api/production/finished-goods/1
```

---

## 📋 QUICK REFERENCE — All Endpoints

### Warehouse Module

| Module | Method | Endpoint |
|--------|--------|----------|
| **UoM** | GET | `/api/warehouse/uom` |
| | POST | `/api/warehouse/uom` |
| | PUT | `/api/warehouse/uom/{id}` |
| | DELETE | `/api/warehouse/uom/{id}` |
| **Tax** | GET | `/api/warehouse/taxes` |
| | POST | `/api/warehouse/taxes` |
| | PUT | `/api/warehouse/taxes/{id}` |
| | DELETE | `/api/warehouse/taxes/{id}` |
| **Category** | GET | `/api/warehouse/categories` |
| | GET | `/api/warehouse/categories/{id}` |
| | POST | `/api/warehouse/categories` |
| | PUT | `/api/warehouse/categories/{id}` |
| | DELETE | `/api/warehouse/categories/{id}` |
| **SubCategory** | GET | `/api/warehouse/sub-categories` |
| | POST | `/api/warehouse/sub-categories` |
| | PUT | `/api/warehouse/sub-categories/{id}` |
| | DELETE | `/api/warehouse/sub-categories/{id}` |
| **Warehouse** | GET | `/api/warehouse/warehouses` |
| | GET | `/api/warehouse/warehouses/{id}` |
| | GET | `/api/warehouse/warehouses/code/{code}` |
| | GET | `/api/warehouse/warehouses/status?isActive=` |
| | GET | `/api/warehouse/warehouses/type/{type}` |
| | POST | `/api/warehouse/warehouses` |
| | PUT | `/api/warehouse/warehouses/{id}` |
| | DELETE | `/api/warehouse/warehouses/{id}` |
| **Floor** | GET | `/api/warehouse/floors` |
| | GET | `/api/warehouse/floors/{id}` |
| | GET | `/api/warehouse/floors/status?isActive=` |
| | GET | `/api/warehouse/floors/warehouse/{id}` |
| | POST | `/api/warehouse/floors` |
| | PUT | `/api/warehouse/floors/{id}` |
| | DELETE | `/api/warehouse/floors/{id}` |
| **Zone** | GET | `/api/warehouse/zones` |
| | GET | `/api/warehouse/zones/{id}` |
| | GET | `/api/warehouse/zones/status?isActive=` |
| | GET | `/api/warehouse/zones/type/{type}` |
| | POST | `/api/warehouse/zones` |
| | PUT | `/api/warehouse/zones/{id}` |
| | DELETE | `/api/warehouse/zones/{id}` |
| **Rack** | GET | `/api/warehouse/racks` |
| | GET | `/api/warehouse/racks/{id}` |
| | GET | `/api/warehouse/racks/status?isActive=` |
| | GET | `/api/warehouse/racks/type/{type}` |
| | GET | `/api/warehouse/racks/barcode/{tag}` |
| | POST | `/api/warehouse/racks` |
| | PUT | `/api/warehouse/racks/{id}` |
| | DELETE | `/api/warehouse/racks/{id}` |
| **Shelf** | GET | `/api/warehouse/shelves` |
| | GET | `/api/warehouse/shelves/{id}` |
| | GET | `/api/warehouse/shelves/status?isActive=` |
| | GET | `/api/warehouse/shelves/barcode/{tag}` |
| | POST | `/api/warehouse/shelves` |
| | PUT | `/api/warehouse/shelves/{id}` |
| | DELETE | `/api/warehouse/shelves/{id}` |
| **Bin** | GET | `/api/warehouse/bins` |
| | GET | `/api/warehouse/bins/paginated` |
| | GET | `/api/warehouse/bins/{id}` |
| | GET | `/api/warehouse/bins/active?isActive=` |
| | GET | `/api/warehouse/bins/type/{type}` |
| | GET | `/api/warehouse/bins/barcode/{tag}` |
| | POST | `/api/warehouse/bins` |
| | PUT | `/api/warehouse/bins/{id}` |
| | DELETE | `/api/warehouse/bins/{id}` |
| **Product** | GET | `/api/warehouse/products` |
| | GET | `/api/warehouse/products/paginated` |
| | GET | `/api/warehouse/products/{id}` |
| | GET | `/api/warehouse/products/barcode/{barcode}` |
| | GET | `/api/warehouse/products/alerts/low-stock` |
| | GET | `/api/warehouse/products/alerts/overstock` |
| | GET | `/api/warehouse/products/template` |
| | GET | `/api/warehouse/products/export` |
| | POST | `/api/warehouse/products` |
| | POST | `/api/warehouse/products/import` |
| | PUT | `/api/warehouse/products/{id}` |
| | DELETE | `/api/warehouse/products/{id}` |
| **Batch** | GET | `/api/warehouse/batches/product/{id}` |
| | POST | `/api/warehouse/batches` |
| | PUT | `/api/warehouse/batches/{id}` |
| | DELETE | `/api/warehouse/batches/{id}` |
| **Serial** | GET | `/api/warehouse/serials/{serial}` |
| | POST | `/api/warehouse/serials` |
| | PUT | `/api/warehouse/serials/{id}` |
| | DELETE | `/api/warehouse/serials/{id}` |
| **Inventory** | GET | `/api/warehouse/inventory-movements` |
| | GET | `/api/warehouse/inventory-movements/{id}` |
| | GET | `/api/warehouse/inventory-movements/status/{status}` |
| | GET | `/api/warehouse/inventory-movements/warehouse/{id}` |
| | POST | `/api/warehouse/inventory-movements` |
| | PATCH | `/api/warehouse/inventory-movements/{id}/quantity?quantity=` |
| | DELETE | `/api/warehouse/inventory-movements/{id}` |
| **Transfer** | GET | `/api/warehouse/transfers` |
| | GET | `/api/warehouse/transfers/{id}` |
| | GET | `/api/warehouse/transfers/status/{status}` |
| | POST | `/api/warehouse/transfers` |
| | PUT | `/api/warehouse/transfers/{id}/approve` |
| | PUT | `/api/warehouse/transfers/{id}/dispatch` |
| | PUT | `/api/warehouse/transfers/{id}/receive` |
| | PUT | `/api/warehouse/transfers/{id}/cancel` |
| **Stock Alerts** | GET | `/api/warehouse/stock-alerts?expiryDays=30` |
| **Costing** | GET | `/api/warehouse/costing/summary` |
| | GET | `/api/warehouse/costing/product/{id}` |
| **Dashboard** | GET | `/api/warehouse/dashboard` |
| **Reports** | GET | `/api/warehouse/reports/stock-ledger` |
| | GET | `/api/warehouse/reports/stock-valuation` |
| | GET | `/api/warehouse/reports/transfer-history` |
| | GET | `/api/warehouse/reports/delivery-performance` |

### Fleet Module

| Module | Method | Endpoint |
|--------|--------|----------|
| **Driver** | GET | `/api/fleet/drivers?page=&size=&status=` |
| | GET | `/api/fleet/drivers/{id}` |
| | POST | `/api/fleet/drivers` |
| | PUT | `/api/fleet/drivers/{id}` |
| | DELETE | `/api/fleet/drivers/{id}` |
| | POST | `/api/fleet/drivers/{id}/profile-image` |
| | GET | `/api/fleet/drivers/{id}/profile-image` |
| **Vehicle** | GET | `/api/fleet/vehicles?page=&size=` |
| | GET | `/api/fleet/vehicles/{id}` |
| | POST | `/api/fleet/vehicles` |
| | PUT | `/api/fleet/vehicles/{id}` |
| | DELETE | `/api/fleet/vehicles/{id}` |
| **Route** | GET | `/api/fleet/routes` |
| | GET | `/api/fleet/routes/{id}` |
| | POST | `/api/fleet/routes` |
| | PUT | `/api/fleet/routes/stops/{stopId}/arrive` |
| | PUT | `/api/fleet/routes/stops/{stopId}/complete` |

### Sales Module (Phase Changes)

| Module | Method | Endpoint |
|--------|--------|----------|
| **Delivery Order** | GET | `/api/sales/delivery-orders?page=&size=` |
| | GET | `/api/sales/delivery-orders/{id}` |
| | POST | `/api/sales/delivery-orders` |
| | PUT | `/api/sales/delivery-orders/{id}` |
| | DELETE | `/api/sales/delivery-orders/{id}` |
| | PATCH | `/api/sales/delivery-orders/{id}/status?status=` |
| | PUT | `/api/sales/delivery-orders/{id}/assign-fleet?driverId=&vehicleId=` |
| | PUT | `/api/sales/delivery-orders/{id}/start-picking` |
| | PUT | `/api/sales/delivery-orders/{id}/confirm-packed` |
| | PUT | `/api/sales/delivery-orders/{id}/dispatch` |
| | PUT | `/api/sales/delivery-orders/{id}/mark-delivered` |
| **POD** | GET | `/api/sales/delivery-orders/{doId}/pod` |
| | POST | `/api/sales/delivery-orders/{doId}/pod` |
| | GET | `/api/sales/delivery-orders/{doId}/pod/signature` |
| | GET | `/api/sales/delivery-orders/{doId}/pod/photo` |

### CRM Module

| Module | Method | Endpoint |
|--------|--------|----------|
| **Sales Product** | GET | `/api/crm/sales-products?page=&size=` |
| | GET | `/api/crm/sales-products/{id}` |
| | POST | `/api/crm/sales-products` (JSON) |
| | POST | `/api/crm/sales-products` (Multipart) |
| | PUT | `/api/crm/sales-products/{id}` (JSON) |
| | PUT | `/api/crm/sales-products/{id}` (Multipart) |
| | DELETE | `/api/crm/sales-products/{id}` |
| | GET | `/api/crm/sales-products/{id}/image` |
| | GET | `/api/crm/sales-products/{id}/barcode` |

### Production Module

| Module | Method | Endpoint |
|--------|--------|----------|
| **Raw Material** | GET | `/api/production/raw-materials?page=&size=` |
| | GET | `/api/production/raw-materials/{id}` |
| | GET | `/api/production/raw-materials/by-item-code/{code}` |
| | POST | `/api/production/raw-materials` (Multipart) |
| | PUT | `/api/production/raw-materials/{id}` (Multipart) |
| | PUT | `/api/production/raw-materials/{id}/stock-quantity?quantity=` |
| | DELETE | `/api/production/raw-materials/{id}` |
| | GET | `/api/production/raw-materials/{id}/image` |
| | GET | `/api/production/raw-materials/{id}/barcode-image` |
| | GET | `/api/production/raw-materials/view-file?path=` |
| | GET | `/api/production/raw-materials/bulk-template` |
| | POST | `/api/production/raw-materials/bulk` |
| | GET | `/api/production/raw-materials/export` |
| **Semi-Finished** | GET | `/api/production/semi-finished?page=&size=` |
| | GET | `/api/production/semi-finished/{id}` |
| | GET | `/api/production/semi-finished/by-item-code/{code}` |
| | POST | `/api/production/semi-finished` (Multipart) |
| | PUT | `/api/production/semi-finished/{id}` (Multipart) |
| | DELETE | `/api/production/semi-finished/{id}` |
| | GET | `/api/production/semi-finished/{id}/image` |
| | GET | `/api/production/semi-finished/{id}/barcode-image` |
| | GET | `/api/production/semi-finished/bulk-template` |
| | POST | `/api/production/semi-finished/bulk` |
| | GET | `/api/production/semi-finished/export` |
| **Finished Good** | GET | `/api/production/finished-goods` |
| | GET | `/api/production/finished-goods/{id}` |
| | POST | `/api/production/finished-goods` (Multipart) |
| | PUT | `/api/production/finished-goods/{id}` (Multipart) |
| | DELETE | `/api/production/finished-goods/{id}` |
| | GET | `/api/production/finished-goods/{id}/image` |
| | GET | `/api/production/finished-goods/{id}/barcode-image` |
| | GET | `/api/production/finished-goods/view-file?path=` |
| | GET | `/api/production/finished-goods/template` |
| | POST | `/api/production/finished-goods/import` |
| | GET | `/api/production/finished-goods/export` |

---

## PART E — END-TO-END SALES + FLEET FLOW (Step-by-Step)

> [!TIP]
> This section walks through the **complete outbound sales cycle** from Quotation to Invoice with real API calls.
> Follow these steps in order. Each step assumes you completed the previous one.

```
Quotation → Sales Order → Delivery Order → PICKING → PACKED
→ Assign Fleet → DISPATCHED → OUT_FOR_DELIVERY → DELIVERED
→ POD Capture → Route Stops Complete → Sales Invoice
```

---

### Step 1: Create a Quotation

**Endpoint:** `POST /api/sales/quotations` (multipart/form-data)

> Send the JSON as a form field named `quotation`, and optional file attachments.

**Form field `quotation` (JSON):**
```json
{
  "quotationDate": "2026-03-22",
  "customerId": 1,
  "salespersonId": 1,
  "reference": "REF-Q-001",
  "expiryDate": "2026-04-22",
  "quotationType": "STANDARD",
  "status": "DRAFT",
  "totalDiscount": 500.00,
  "otherCharges": 200.00,
  "termsAndConditions": "Payment within 30 days",
  "notes": "Urgent requirement for Q1",
  "emailTo": "customer@example.com",
  "template": "default",
  "items": [
    {
      "crmProductId": 1,
      "itemCode": "PROD-001",
      "itemName": "Steel Rod 10mm",
      "categoryId": 1,
      "subcategoryId": 1,
      "quantity": 100,
      "rate": 250.00,
      "taxPercentage": 18.00,
      "taxValue": 4500.00,
      "isTaxExempt": false
    },
    {
      "crmProductId": 2,
      "itemCode": "PROD-002",
      "itemName": "Copper Wire 5mm",
      "categoryId": 1,
      "subcategoryId": 2,
      "quantity": 50,
      "rate": 180.00,
      "taxPercentage": 18.00,
      "taxValue": 1620.00,
      "isTaxExempt": false
    }
  ]
}
```

---

### Step 2: Update Quotation Status → SENT

**Endpoint:** `PATCH /api/sales/quotations/{id}/status?status=SENT`
```
PATCH /api/sales/quotations/1/status?status=SENT
```
> Quotation is now sent to the customer for review.

---

### Step 3: Update Quotation Status → ACCEPTED

**Endpoint:** `PATCH /api/sales/quotations/{id}/status?status=ACCEPTED`
```
PATCH /api/sales/quotations/1/status?status=ACCEPTED
```
> Customer has accepted the quotation. Ready for Sales Order conversion.

---

### Step 4: Convert Quotation → Sales Order (Auto)

**Endpoint:** `POST /api/sales/orders/from-quotation/{quotationId}`
```
POST /api/sales/orders/from-quotation/1
```

> This auto-creates a Sales Order with all items copied from the Quotation.
> The Quotation status changes to `CONVERTED`, and a new Sales Order is created with status `ORDERED`.

**Expected Response:**
```json
{
  "id": 1,
  "salesOrderNumber": "SO-2026-XXXXXX",
  "customer": { "id": 1, "name": "ABC Industries" },
  "status": "ORDERED",
  "items": [
    { "itemCode": "PROD-001", "itemName": "Steel Rod 10mm", "quantity": 100, "rate": 250.00 },
    { "itemCode": "PROD-002", "itemName": "Copper Wire 5mm", "quantity": 50, "rate": 180.00 }
  ]
}
```

---

### Step 5: Create Delivery Order (from Sales Order)

**Endpoint:** `POST /api/sales/delivery-orders` (multipart/form-data)

> Send the JSON as a form field named `data`.

**Form field `data` (JSON):**
```json
{
  "deliveryOrderDate": "2026-03-22",
  "shipmentDate": "2026-03-23",
  "customerId": 1,
  "salesOrderId": 1,
  "reference": "REF-DO-001",
  "poNumber": "PO-CUST-5678",
  "salespersonId": 1,
  "warehouseId": 1,
  "status": "DRAFT",
  "totalDiscount": 500.00,
  "otherCharges": 200.00,
  "termsAndConditions": "Deliver by March 25",
  "notes": "Handle with care - fragile items",
  "emailTo": "customer@example.com",
  "template": "default",
  "routeNotes": "Use South Gate entrance",
  "items": [
    {
      "crmProductId": 1,
      "itemCode": "PROD-001",
      "itemName": "Steel Rod 10mm",
      "categoryId": 1,
      "subcategoryId": 1,
      "quantity": 100,
      "rate": 250.00,
      "taxPercentage": 18.0,
      "taxValue": 4500.00,
      "taxExempt": false
    },
    {
      "crmProductId": 2,
      "itemCode": "PROD-002",
      "itemName": "Copper Wire 5mm",
      "categoryId": 1,
      "subcategoryId": 2,
      "quantity": 50,
      "rate": 180.00,
      "taxPercentage": 18.0,
      "taxValue": 1620.00,
      "taxExempt": false
    }
  ]
}
```

> DO is now in `DRAFT` status. Note the `deliveryOrderId` (e.g., `1`) from the response.

---

### Step 6: Start Picking → Status: PICKING

**Endpoint:** `PUT /api/sales/delivery-orders/{id}/start-picking`
```
PUT /api/sales/delivery-orders/1/start-picking
```

> Warehouse staff begin picking items from storage bins.
> DO status changes: `DRAFT` → `PICKING`

---

### Step 7: Confirm Packed → Status: PACKED

**Endpoint:** `PUT /api/sales/delivery-orders/{id}/confirm-packed`
```
PUT /api/sales/delivery-orders/1/confirm-packed
```

> Items are boxed and placed on the loading dock.
> DO status changes: `PICKING` → `PACKED`

---

### Step 8: Assign Fleet (Driver + Vehicle)

**Endpoint:** `PUT /api/sales/delivery-orders/{id}/assign-fleet?driverId=1&vehicleId=1`
```
PUT /api/sales/delivery-orders/1/assign-fleet?driverId=1&vehicleId=1
```

> Links a specific driver and vehicle to this delivery order.

**Expected Response (partial):**
```json
{
  "id": 1,
  "status": "PACKED",
  "driverId": 1,
  "driverName": "Rajesh Kumar",
  "vehicleId": 1,
  "vehiclePlateNumber": "KA-01-AB-1234"
}
```

---

### Step 9: Create a Delivery Route (Fleet Module)

**Endpoint:** `POST /api/fleet/routes`
```json
POST /api/fleet/routes
{
  "routeName": "Bengaluru South Route - March 23",
  "driverId": 1,
  "vehicleId": 1,
  "routeDate": "2026-03-23",
  "status": "PLANNED",
  "totalDistanceKm": 45.5,
  "estimatedDurationMins": 120,
  "stops": [
    {
      "deliveryOrderId": 1,
      "stopOrder": 1,
      "customerName": "ABC Industries",
      "address": "123 Industrial Area, Bengaluru South",
      "latitude": 12.8996,
      "longitude": 77.5963,
      "estimatedArrival": "2026-03-23T10:00:00"
    },
    {
      "deliveryOrderId": 2,
      "stopOrder": 2,
      "customerName": "XYZ Corp",
      "address": "456 Tech Park, Electronic City",
      "latitude": 12.8456,
      "longitude": 77.6603,
      "estimatedArrival": "2026-03-23T11:30:00"
    }
  ]
}
```

> Route is now `PLANNED` with 2 stops. Note each stop's `id` from the response for later use.

---

### Step 10: Dispatch Delivery Order → Status: DISPATCHED

**Endpoint:** `PUT /api/sales/delivery-orders/{id}/dispatch`
```
PUT /api/sales/delivery-orders/1/dispatch
```

> Goods physically leave the warehouse.
> DO status: `PACKED` → `DISPATCHED`
> `dispatchedAt` timestamp is automatically set.
> This should also create a `SALES_DISPATCH` inventory movement (stock decreases).

---

### Step 11: Update DO Status → OUT_FOR_DELIVERY

**Endpoint:** `PATCH /api/sales/delivery-orders/{id}/status?status=OUT_FOR_DELIVERY`
```
PATCH /api/sales/delivery-orders/1/status?status=OUT_FOR_DELIVERY
```

> Driver is on the way to the customer.
> DO status: `DISPATCHED` → `OUT_FOR_DELIVERY`

---

### Step 12: Mark Route Stop as ARRIVED

**Endpoint:** `PUT /api/fleet/routes/stops/{stopId}/arrive`
```
PUT /api/fleet/routes/stops/1/arrive
```

> Driver has arrived at Stop 1 (ABC Industries).
> RouteStop status: `PENDING` → `ARRIVED`

---

### Step 13: Mark Delivery Order as DELIVERED

**Endpoint:** `PUT /api/sales/delivery-orders/{id}/mark-delivered`
```
PUT /api/sales/delivery-orders/1/mark-delivered
```

> Customer confirms receipt of goods.
> DO status: `OUT_FOR_DELIVERY` → `DELIVERED`
> `deliveredAt` timestamp is automatically set.

---

### Step 14: Submit Proof of Delivery (POD)

**Endpoint:** `POST /api/sales/delivery-orders/{doId}/pod` (multipart/form-data)

> Send three parts:
> - `data` — JSON string with POD details
> - `signature` — image file (optional)
> - `photo` — image file (optional)

**Form field `data` (JSON string):**
```json
{
  "status": "DELIVERED",
  "receivedByName": "Amit Patel",
  "receivedByPhone": "9876543210",
  "gpsLatitude": 12.8996,
  "gpsLongitude": 77.5963,
  "remarks": "All items received in good condition"
}
```

> Attach `signature` (e.g., `signature.jpg`) and `photo` (e.g., `delivery_photo.jpg`) as file parts.

**POD Status values:**
| Status | Meaning |
|--------|---------|
| `DELIVERED` | All items fully delivered and accepted |
| `PARTIAL` | Some items delivered, some missing/damaged |
| `REJECTED` | Customer refused delivery |

**For REJECTED POD, also include:**
```json
{
  "status": "REJECTED",
  "receivedByName": "Amit Patel",
  "receivedByPhone": "9876543210",
  "gpsLatitude": 12.8996,
  "gpsLongitude": 77.5963,
  "remarks": "Customer refused",
  "rejectionReason": "Wrong items delivered — order mismatch"
}
```

---

### Step 15: Complete Route Stop

**Endpoint:** `PUT /api/fleet/routes/stops/{stopId}/complete`
```
PUT /api/fleet/routes/stops/1/complete
```

> Mark Stop 1 as complete after POD.
> RouteStop status: `ARRIVED` → `COMPLETED`

> Repeat Steps 12–15 for each stop in the route.

**For Stop 2:**
```
PUT /api/fleet/routes/stops/2/arrive
PUT /api/sales/delivery-orders/2/mark-delivered
POST /api/sales/delivery-orders/2/pod  (with data + files)
PUT /api/fleet/routes/stops/2/complete
```

---

### Step 16: Generate Sales Invoice

**Endpoint:** `POST /api/sales/sales-invoices` (multipart/form-data)

> Send the JSON as a form field named `data`.

**Form field `data` (JSON string):**
```json
{
  "invoiceLedger": "SALES",
  "invoiceDate": "2026-03-23",
  "customerId": 1,
  "reference": "REF-INV-001",
  "orderNumber": "SO-2026-XXXXXX",
  "customerPoNo": "PO-CUST-5678",
  "customerPoDate": "2026-03-20",
  "saleType": "CREDIT",
  "dueDate": "2026-04-22",
  "dateOfSupply": "2026-03-23",
  "salespersonId": 1,
  "status": "OPEN",
  "subTotal": 34000.00,
  "totalDiscount": 500.00,
  "grossTotal": 33500.00,
  "totalTax": 6120.00,
  "otherCharges": 200.00,
  "netTotal": 39820.00,
  "termsAndConditions": "Payment within 30 days",
  "notes": "Against SO-2026-XXXXXX",
  "template": "default",
  "emailTo": "customer@example.com",
  "items": [
    {
      "crmProductId": 1,
      "itemCode": "PROD-001",
      "itemName": "Steel Rod 10mm",
      "categoryId": 1,
      "subcategoryId": 1,
      "invoiceQuantity": 100,
      "rate": 250.00,
      "amount": 25000.00,
      "taxPercentage": 18.00,
      "taxValue": 4500.00,
      "isTaxExempt": false
    },
    {
      "crmProductId": 2,
      "itemCode": "PROD-002",
      "itemName": "Copper Wire 5mm",
      "categoryId": 1,
      "subcategoryId": 2,
      "invoiceQuantity": 50,
      "rate": 180.00,
      "amount": 9000.00,
      "taxPercentage": 18.00,
      "taxValue": 1620.00,
      "isTaxExempt": false
    }
  ]
}
```

> Invoice is created. You can download its PDF:
```
GET /api/sales/sales-invoices/pdf/1
```

---

### 📊 Complete Status Progression Summary

```
STEP   API CALL                                          DO STATUS         DRIVER       ROUTE STOP
─────  ──────────────────────────────────────────────── ────────────────  ──────────── ────────────
1-4    Quotation → Sales Order                           (no DO yet)       -            -
5      POST delivery-orders                              DRAFT             -            -
6      PUT  .../start-picking                            PICKING           -            -
7      PUT  .../confirm-packed                           PACKED            -            -
8      PUT  .../assign-fleet                             PACKED            AVAILABLE    -
9      POST /api/fleet/routes                            PACKED            AVAILABLE    PENDING
10     PUT  .../dispatch                                 DISPATCHED        ON_TRIP      PENDING
11     PATCH .../status?status=OUT_FOR_DELIVERY          OUT_FOR_DELIVERY  ON_TRIP      PENDING
12     PUT  /routes/stops/{id}/arrive                    OUT_FOR_DELIVERY  ON_TRIP      ARRIVED
13     PUT  .../mark-delivered                           DELIVERED         ON_TRIP      ARRIVED
14     POST .../pod                                      DELIVERED         ON_TRIP      ARRIVED
15     PUT  /routes/stops/{id}/complete                  DELIVERED         ON_TRIP      COMPLETED
16     POST /sales-invoices                              (INVOICED)        AVAILABLE    COMPLETED
```

---

### 🔗 Quick Reference — All Endpoints in This Flow

| Step | Method | Endpoint |
|------|--------|----------|
| 1 | POST | `/api/sales/quotations` (multipart) |
| 2 | PATCH | `/api/sales/quotations/{id}/status?status=SENT` |
| 3 | PATCH | `/api/sales/quotations/{id}/status?status=ACCEPTED` |
| 4 | POST | `/api/sales/orders/from-quotation/{quotationId}` |
| 5 | POST | `/api/sales/delivery-orders` (multipart) |
| 6 | PUT | `/api/sales/delivery-orders/{id}/start-picking` |
| 7 | PUT | `/api/sales/delivery-orders/{id}/confirm-packed` |
| 8 | PUT | `/api/sales/delivery-orders/{id}/assign-fleet?driverId=&vehicleId=` |
| 9 | POST | `/api/fleet/routes` |
| 10 | PUT | `/api/sales/delivery-orders/{id}/dispatch` |
| 11 | PATCH | `/api/sales/delivery-orders/{id}/status?status=OUT_FOR_DELIVERY` |
| 12 | PUT | `/api/fleet/routes/stops/{stopId}/arrive` |
| 13 | PUT | `/api/sales/delivery-orders/{id}/mark-delivered` |
| 14 | POST | `/api/sales/delivery-orders/{doId}/pod` (multipart) |
| 15 | PUT | `/api/fleet/routes/stops/{stopId}/complete` |
| 16 | POST | `/api/sales/sales-invoices` (multipart) |
| PDF | GET | `/api/sales/sales-invoices/pdf/{id}` |
