# Warehouse Management System - Frontend Developer Guide

## 1. API Configuration

**Base URL:** `http://localhost:8080`

All warehouse-related endpoints are prefixed with `/api/warehouse`.

## 2. Authentication & Login

The application uses **JWT** for authentication.

### Login
**Endpoint:** `POST /api/auth/login`

**Request Body:**
```json
{
  "tenantId": "string",
  "email": "user@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "token": "jwt_token_string",
  "roles": ["ROLE_USER", "ROLE_ADMIN"],
  "modules": ["WAREHOUSE", "CRM"]
}
```

**Headers:**
Include `Authorization: Bearer <token>` in all subsequent requests.

---

## 3. Warehouse API Endpoints

### Warehouse Management
**Base Path:** `/api/warehouse/warehouses`

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create Warehouse | [WarehouseRequest](#warehouserequest) | [WarehouseResponse](#warehouseresponse) |
| `GET` | `/` | List Warehouses | - | List<[WarehouseResponse](#warehouseresponse)> |

### Inventory Management
**Base Path:** `/api/warehouse/inventory`

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Upload Inventory | [Inventory](#inventory) | String |
| `GET` | `/` | List Inventory | - | List<[InventoryResponse](#inventoryresponse)> |

### Gate In Operations
**Base Path:** `/api/warehouse/gate-in`

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create Entry | [GateInRequest](#gateinrequest) | [GateInResponse](#gateinresponse) |
| `GET` | `/` | List Entries | - | [GateInResponse](#gateinresponse) |
| `POST` | `/{id}/confirm` | Confirm Entry | - | [GateInResponse](#gateinresponse) |
| `POST` | `/{id}/assign-location` | Assign Location | [AssignLocationRequest](#assignlocationrequest) | [GateInResponse](#gateinresponse) |
| `POST` | `/{id}/attach-rfid` | Attach RFID | [AttachRFIDTagsRequest](#attachrfidtagsrequest) | [GateInResponse](#gateinresponse) |

### Gate Out Operations
**Base Path:** `/api/warehouse/gate-out`

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create Exit | [GateOutRequest](#gateoutrequest) | [GateOutResponse](#gateoutresponse) |
| `GET` | `/` | List Exits | - | [GateOutResponse](#gateoutresponse) |
| `POST` | `/{id}/confirm` | Confirm Exit | - | [GateOutResponse](#gateoutresponse) |
| `POST` | `/{id}/attach-rfid` | Attach RFID | - | [GateOutResponse](#gateoutresponse) |

### Requisitions
**Base Path:** `/api/warehouse/requisitions`

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create Requisition | [RequisitionRequest](#requisitionrequest) | [RequisitionResponse](#requisitionresponse) |
| `GET` | `/` | List Requisitions | - | [RequisitionResponse](#requisitionresponse) |
| `POST` | `/{id}/submit` | Submit | - | [RequisitionResponse](#requisitionresponse) |
| `POST` | `/{id}/approve` | Approve | - | [RequisitionResponse](#requisitionresponse) |
| `POST` | `/{id}/reject` | Reject | - | [RequisitionResponse](#requisitionresponse) |

### Transfers
**Base Path:** `/api/warehouse/transfers`

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Create Transfer | [TransferRequest](#transferrequest) | [TransferResponse](#transferresponse) |
| `GET` | `/` | Get Transfer History | - | [IssueRecordResponse](#issuerecordresponse) |

### RFID Movements
**Base Path:** `/api/warehouse/rfid-movements`

| Method | Endpoint | Description | Request Body | Response Body |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/` | Log Movement | [RFIDMovementRequest](#rfidmovementrequest) | String |
| `GET` | `/` | List Movements | - | List<RFIDMovementLogEntity> |

---

## 5. Comprehensive DTO Reference
Below are the JSON structures for all Warehouse models.

### AssignLocationRequest
```json
{
  "gateInLineId": 0,
  "locationId": 0,
  "quantity": 0
}
```

### AttachRFIDTagsRequest
```json
{
  "gateInLineId": 0,
  "rfidTags": []
}
```

### CompleteStorageRequest
```json
{
  "completionRemarks": "string"
}
```

### CreateTransferRequest
```json
{
  "fromLocationId": null,
  "toLocationId": null,
  "itemId": null,
  "quantity": 0,
  "remarks": "string"
}
```

### GateInLineRequest
```json
{
  "itemId": 0,
  "poLineId": 0,
  "qtyReceived": 0,
  "rejectedQty": 0,
  "rejectionReason": "string"
}
```

### GateInLineResponse
```json
{
  "id": 0,
  "itemId": 0,
  "itemName": "string",
  "poLineId": 0,
  "qtyReceived": 0,
  "rejectedQty": 0,
  "rejectionReason": "string"
}
```

### GateInRequest
```json
{
  "supplierId": 0,
  "billOfLadingNo": "string",
  "vehicleNo": "string",
  "gateKeeperId": 0,
  "lines": [
    {
      "$ref": "GateInLineRequest"
    }
  ],
  "remarks": "string"
}
```

### GateInResponse
```json
{
  "id": 0,
  "supplierId": 0,
  "supplierName": "string",
  "billOfLadingNo": "string",
  "vehicleNo": "string",
  "gateKeeperId": 0,
  "gateKeeperName": "string",
  "status": null,
  "timestamp": "2024-01-01T12:00:00",
  "lines": [
    {
      "$ref": "GateInLineResponse"
    }
  ],
  "remarks": "string",
  "gateInNo": "string"
}
```

### GateKeeperRequest
```json
{
  "name": "string",
  "employeeCode": "string",
  "phone": "string",
  "warehouseId": 0
}
```

### GateKeeperResponse
```json
{
  "id": 0,
  "name": "string",
  "employeeCode": "string",
  "phone": "string",
  "warehouseId": 0,
  "warehouseName": "string"
}
```

### GateOutLineRequest
```json
{
  "itemId": 0,
  "rfidTagCode": "string",
  "qty": 0,
  "fromLocationId": 0,
  "reason": null
}
```

### GateOutLineResponse
```json
{
  "id": 0,
  "itemId": 0,
  "itemName": "string",
  "rfidTagCode": "string",
  "qty": 0,
  "fromLocationId": 0,
  "fromLocationName": "string",
  "reason": null
}
```

### GateOutRequest
```json
{
  "vehicleNo": "string",
  "gateKeeperId": 0,
  "storeKeeperId": 0,
  "remarks": "string",
  "lines": [
    {
      "$ref": "GateOutLineRequest"
    }
  ],
  "destinationWarehouseId": 0,
  "customerName": "string",
  "customerAddress": "string",
  "referenceGateInId": 0
}
```

### GateOutResponse
```json
{
  "id": 0,
  "gateOutNo": "string",
  "timestamp": null,
  "vehicleNo": "string",
  "gateKeeperId": 0,
  "gateKeeperName": "string",
  "storeKeeperId": 0,
  "storeKeeperName": "string",
  "remarks": "string",
  "status": null,
  "lines": [
    {
      "$ref": "GateOutLineResponse"
    }
  ],
  "destinationWarehouseId": 0,
  "destinationWarehouseName": "string",
  "customerName": "string",
  "customerAddress": "string",
  "referenceGateInId": 0,
  "referenceGateInNo": "string"
}
```

### Inventory
```json
{
  "locationId": 0,
  "itemId": 0,
  "quantity": 0
}
```

### InventoryResponse
```json
{
  "id": 0,
  "locationId": 0,
  "locationName": "string",
  "itemId": 0,
  "itemName": "string",
  "quantity": 0
}
```

### IssueRecordResponse
```json
{
  "id": 0,
  "date": null,
  "toLocation": "string",
  "qty": 0,
  "ratePerUnit": 0.0,
  "vatPercent": 0.0,
  "amount": 0.0
}
```

### IssueRequest
```json
{
  "quantity": 0,
  "ratePerUnit": 0.0,
  "vatPercent": 0.0,
  "fromRFIDTag": "string",
  "toRFIDTag": "string"
}
```

### Item
```json
{
  "id": 0,
  "code": "string",
  "name": "string",
  "defaultRate": 0.0,
  "defaultVatPercent": 0.0
}
```

### Location
```json
{
  "id": 0,
  "name": "string",
  "locationType": "string",
  "parentLocationId": 0,
  "warehouseId": 0,
  "code": "string",
  "description": "string"
}
```

### LocationNode
```json
{
  "id": 0,
  "name": "string",
  "locationType": "string",
  "code": "string",
  "children": [
    {
      "$ref": "LocationNode"
    }
  ]
}
```

### QARequest
```json
{
  "gateInId": 0,
  "driverRating": 0,
  "itemQualityRating": 0,
  "qaRemarks": "string",
  "inspectedById": 0
}
```

### QAResponse
```json
{
  "id": 0,
  "gateInId": 0,
  "gateInNo": "string",
  "driverRating": 0,
  "itemQualityRating": 0,
  "qaRemarks": "string",
  "inspectedById": 0,
  "inspectedByName": "string",
  "inspectionDate": null
}
```

### RFIDMovementRequest
```json
{
  "tagCode": "string",
  "locationId": 0,
  "movementType": "string"
}
```

### RFIDMovementResponse
```json
{
  "id": 0,
  "tagCode": "string",
  "locationId": 0,
  "locationName": "string",
  "movementType": "string",
  "timestamp": "2024-01-01T12:00:00"
}
```

### RFIDTagRequest
```json
{
  "tagCode": "string",
  "itemId": 0
}
```

### RFIDTagResponse
```json
{
  "id": 0,
  "tagCode": "string",
  "itemId": 0,
  "itemCode": "string",
  "itemName": "string",
  "active": true
}
```

### RequisitionLineRequest
```json
{
  "itemId": 0,
  "serviceId": 0,
  "expenseItemId": 0,
  "content": "string",
  "quantityTotal": 0.0,
  "quantityToPurchase": 0.0,
  "quantityToTransfer": 0.0,
  "uom": "string",
  "projectTaskId": 0,
  "transactionContent": "string",
  "fulfillmentMethod": "string",
  "fulfillmentSourceId": 0,
  "price": 0.0,
  "pricesIncludeVat": true,
  "vatPercentage": 0.0
}
```

### RequisitionLineResponse
```json
{
  "id": 0,
  "lineNumber": 0,
  "itemId": 0,
  "itemName": "string",
  "serviceId": 0,
  "serviceName": "string",
  "expenseItemId": 0,
  "expenseItemName": "string",
  "content": "string",
  "quantityTotal": 0.0,
  "quantityToPurchase": 0.0,
  "quantityToTransfer": 0.0,
  "uom": "string",
  "stockBalance": 0.0,
  "remainingBudgetQty": 0.0,
  "projectTaskId": 0,
  "projectTaskName": "string",
  "transactionContent": "string",
  "fulfillmentMethod": "string",
  "fulfillmentSourceId": 0,
  "price": 0.0,
  "pricesIncludeVat": true,
  "vatPercentage": 0.0,
  "amountExclVat": 0.0,
  "vatAmount": 0.0,
  "totalAmount": 0.0
}
```

### RequisitionRequest
```json
{
  "entityId": 0,
  "recipientId": 0,
  "requestedById": 0,
  "requiredDate": null,
  "fromDate": null,
  "customerOrderId": 0,
  "basisType": "string",
  "basisId": 0,
  "projectId": 0,
  "projectTaskId": 0,
  "comment": "string"
}
```

### RequisitionResponse
```json
{
  "id": 0,
  "requisitionNo": "string",
  "entityId": 0,
  "entityName": "string",
  "recipientId": 0,
  "recipientName": "string",
  "requestedById": 0,
  "requestedByName": "string",
  "requiredDate": null,
  "status": "string",
  "fromDate": null,
  "customerOrderId": 0,
  "basisType": "string",
  "basisId": 0,
  "projectId": 0,
  "projectName": "string",
  "projectTaskId": 0,
  "projectTaskName": "string",
  "comment": "string",
  "totalAmount": 0.0,
  "createdAt": null,
  "updatedAt": null
}
```

### ShipmentScheduleRequest
```json
{
  "expectedArrivalDate": null,
  "driverName": "string",
  "truckNumber": "string",
  "supplierName": "string",
  "warehouseId": 0,
  "remarks": "string",
  "lines": [
    {
      "$ref": "ShipmentScheduleLineRequest"
    }
  ],
  "itemId": 0,
  "expectedQuantity": 0
}
```

### ShipmentScheduleResponse
```json
{
  "id": 0,
  "scheduleNo": "string",
  "expectedArrivalDate": null,
  "driverName": "string",
  "truckNumber": "string",
  "supplierName": "string",
  "warehouseId": 0,
  "warehouseName": "string",
  "status": "string",
  "remarks": "string",
  "createdAt": null,
  "gateInId": 0,
  "gateInNo": "string",
  "lines": [
    {
      "$ref": "ShipmentScheduleLineResponse"
    }
  ],
  "itemId": 0,
  "itemName": "string",
  "itemCode": "string",
  "expectedQuantity": 0
}
```

### StorageAssignmentRequest
```json
{
  "gateInLineId": 0,
  "assignedToId": 0,
  "targetLocationId": 0,
  "quantityToStore": 0
}
```

### StorageAssignmentResponse
```json
{
  "id": 0,
  "assignmentNo": "string",
  "gateInLineId": 0,
  "itemId": 0,
  "itemName": "string",
  "assignedToId": 0,
  "assignedToName": "string",
  "assignedToCode": "string",
  "targetLocationId": 0,
  "binName": "string",
  "rackName": "string",
  "floorName": "string",
  "zoneName": "string",
  "quantityToStore": 0,
  "status": "string",
  "assignedAt": null,
  "completedAt": null,
  "completionRemarks": "string"
}
```

### StoreKeeperRequest
```json
{
  "name": "string",
  "employeeCode": "string",
  "phone": "string",
  "warehouseId": 0
}
```

### StoreKeeperResponse
```json
{
  "id": 0,
  "name": "string",
  "employeeCode": "string",
  "phone": "string",
  "warehouseId": 0,
  "warehouseName": "string"
}
```

### TransferLineRequest
```json
{
  "itemId": 0,
  "requisitionQty": 0,
  "ratePerUnit": 0.0,
  "vatPercent": 0.0
}
```

### TransferLineResponse
```json
{
  "itemId": 0,
  "itemCode": "string",
  "itemName": "string",
  "requisitionQty": 0,
  "issuedQty": 0,
  "ratePerUnit": 0.0,
  "vatPercent": 0.0
}
```

### TransferRequest
```json
{
  "fromLocationId": 0,
  "toLocationId": 0,
  "fromRFIDTag": "string",
  "toRFIDTag": "string",
  "remarks": "string",
  "lines": [
    {
      "$ref": "TransferLineRequest"
    }
  ]
}
```

### TransferResponse
```json
{
  "id": 0,
  "issueNo": "string",
  "issueDate": null,
  "fromLocation": "string",
  "fromLocationName": "string",
  "fromRFIDTag": "string",
  "toLocation": "string",
  "toLocationName": "string",
  "toRFIDTag": "string",
  "remarks": "string",
  "status": null,
  "lines": [
    {
      "$ref": "Line"
    }
  ],
  "lineId": 0,
  "itemCode": "string",
  "itemName": "string",
  "requisitionQty": 0,
  "issuedQty": 0,
  "ratePerUnit": 0.0,
  "vatPercent": 0.0
}
```

### WarehouseRequest
```json
{
  "name": "string",
  "address": "string",
  "active": true
}
```

### WarehouseResponse
```json
{
  "id": 0,
  "name": "string",
  "address": "string",
  "active": true
}
```
