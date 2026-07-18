# Hanger Manufacturing Module — API Documentation

This document outlines the available API endpoints and Data Transfer Objects (DTOs) for the Hanger Manufacturing ERP module.

## API Endpoints

All endpoints are protected by the `@RequiresHangerModule` guard and require the `HANGER_MANUFACTURING` service module to be active for the tenant.

### Hanger Types (Master Data)
Base URL: `/api/hanger/types`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all active hanger types for the current tenant. |
| GET | `/{id}` | Get a single hanger type by its ID. |
| GET | `/by-type/{typeName}` | Get a hanger type by its enum name (`ADULT`, `CHILD`, `HEAVY_DUTY`). |
| POST | `/` | Create a new hanger type. |
| PUT | `/{id}` | Update an existing hanger type. |
| DELETE | `/{id}` | Soft-delete (deactivate) a hanger type. |

### Coil Stock Management
Base URL: `/api/hanger/coil-stock`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/` | List all coils for the current tenant. |
| GET | `/available` | List available and partially used coils (production-ready). |
| GET | `/total-remaining-weight` | Get the total weight of wire currently in stock. |
| GET | `/{id}` | Get a single coil by its ID. |
| GET | `/by-inspection-status/{status}` | Filter coils by QC status (`PENDING`, `APPROVED`, `REJECTED`). |
| GET | `/eligible-for-issue` | Find coils matching specific gauge and weight requirements (Query params: `wireGaugeMm`, `minWeightRequired`). |
| PATCH | `/{id}/inspection` | Update coil QC status (Params: `status`, optional `remarks`). |

---

## Data Transfer Objects (DTOs)

### HangerTypeRequest
Used for creating or updating hanger type specifications.

```json
{
  "typeName": "ADULT",           // Enum: ADULT, CHILD, HEAVY_DUTY
  "unitWeightGrams": 50.0,      // BigDecimal
  "standardWidthCm": 42.0,      // BigDecimal
  "standardHookCm": 4.5,        // BigDecimal
  "toleranceMm": 1.0,           // BigDecimal (Optional, default 1.0)
  "maxDefectPct": 2.0,          // BigDecimal (Optional, default 2.0)
  "minQcSampleSize": 300,       // Integer (Optional, default 300)
  "defaultBundleSize": 100,     // Integer (Optional, default 100)
  "minLoadTestKg": 3.0,         // BigDecimal (Optional, default 3.0)
  "standardWireGaugeMm": 1.6,   // BigDecimal (Optional)
  "description": "String"       // Optional
}
```

### HangerTypeResponse
Returns the full hanger type record.

```json
{
  "id": 1,
  "typeName": "ADULT",
  "unitWeightGrams": 50.0,
  "standardWidthCm": 42.0,
  "standardHookCm": 4.5,
  "toleranceMm": 1.0,
  "maxDefectPct": 2.0,
  "minQcSampleSize": 300,
  "defaultBundleSize": 100,
  "minLoadTestKg": 3.0,
  "standardWireGaugeMm": 1.6,
  "isActive": true,
  "description": "String",
  "createdAt": "ISO-8601 String",
  "updatedAt": "ISO-8601 String"
}
```

### HngCoilStockResponse
Returns details for a physical wire coil, including calculated fields for usage.

```json
{
  "id": 1,
  "coilNo": "COIL-2024-001",
  "lotNo": "LOT-ABC",
  "heatNo": "HEAT-XYZ",
  "supplierName": "Supplier Name",
  "materialType": "MS",           // Enum: MS, GALVANIZED, SS
  "wireGaugeMm": 1.6,
  "totalWeightKg": 1000.0,
  "remainingWeightKg": 850.0,
  "ratePerKg": 5.5,
  "warehouseLocation": "Rack A1",
  "inspectionStatus": "APPROVED", // Enum: PENDING, APPROVED, REJECTED
  "status": "PARTIAL",           // Enum: AVAILABLE, PARTIAL, EXHAUSTED, QUARANTINE
  "usedWeightKg": 150.0,         // Calculated: total - remaining
  "remainingPct": 85.0,          // Calculated percentage
  "estimatedCoilValue": 4675.0,  // Calculated: remainingWeight * ratePerKg
  "receivedDate": "YYYY-MM-DD",
  "createdAt": "ISO-8601 String"
}
```

---

## Enumerations

| Enum | Values |
|---|---|
| **HangerTypeEnum** | `ADULT`, `CHILD`, `HEAVY_DUTY` |
| **WireMaterialType** | `MS`, `GALVANIZED`, `SS` |
| **CoilStatus** | `AVAILABLE`, `PARTIAL`, `EXHAUSTED`, `QUARANTINE` |
| **CoilInspectionStatus** | `PENDING`, `APPROVED`, `REJECTED` |
