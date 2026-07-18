# Supply Tendering / RFQ Module Architecture

Based on the requirements (Supplier Tendering Process) and the existing system modules (`Sales` and `Purchases`), here is the detailed entity schema and data dictionary required to build this feature natively into the system.

*(Note for the Developer: Pay close attention to the **System Integration & Foreign Keys** section at the bottom to ensure fields map correctly to the existing `SalesOrder` and `PurchaseOrder` workflows.)*

---

## 1. Request for Quote (RFQ)
The core entity representing the tendering process. This is generated directly from a target `SalesOrder`.

### Entity: `RequestForQuote` (table: `warehouse_request_for_quote`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key |
| `tenantId` | `Long` | Foreign Key to `Tenant` (aligned with `SalesOrder.tenant`) |
| `rfqNumber` | `String` | Auto-generated standard reference (e.g., RFQ-2023-0001) |
| `title` | `String` | Title or short description of the RFQ |
| `salesOrderId` | `Long` | Foreign Link to the `SalesOrder` that triggered this RFQ |
| `status` | `String` | `DRAFT`, `PUBLISHED`, `CLOSED`, `CANCELLED`, `PO_GENERATED` |
| `submissionDeadline` | `LocalDate` | The latest date suppliers can submit their quote |
| `remarks` | `String` | Internal notes |
| `created_by` | `String` | Audit field (matches `SalesOrder.createdBy`) |
| `updated_by` | `String` | Audit field (matches `SalesOrder.updatedBy`) |
| `createdAt` | `OffsetDateTime` | Audit field (aligned with `SalesOrder` & `PurchaseOrder`) |
| `updatedAt` | `OffsetDateTime` | Audit field (aligned with `SalesOrder`) |

---

## 2. RFQ Items
The specific products/items being requested in the quote. Derived directly from `SalesOrderItem`s.

### Entity: `RequestForQuoteItem` (table: `warehouse_rfq_item`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key |
| `rfqId` | `Long` | Foreign Key to `RequestForQuote` |
| `crmProductId` | `Long` | Foreign Key to `CrmSalesProduct` (copied exactly from `SalesOrderItem.crmProduct`) |
| `itemCode` | `String` | Copied from `SalesOrderItem.itemCode` |
| `itemName` | `String` | Copied from `SalesOrderItem.itemName` |
| `requestedQuantity` | `Long` | The amount needed from the supplier. |
| `expectedDeliveryDate` | `LocalDate` | When the items are needed |
| `description` | `String` | Specific instructions for this item |

*(Developer Note: You may also include `categoryId` and `subcategoryId` mappings if they are necessary for the RFQ views, mimicking the `SalesOrderItem` structure).*

---

## 3. Targeted Suppliers
The suppliers selected to receive this Request for Quote. They will interact with this system via a password-less public link.

### Entity: `RfqSupplier` (table: `warehouse_rfq_supplier`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key |
| `rfqId` | `Long` | Foreign Key to `RequestForQuote` |
| `supplierName` | `String` | Target supplier's name (matches `PurchaseOrder.supplierName`) |
| `accessToken` | `String` | **Crucial:** A unique UUID string generated specifically to give this supplier secure, password-less access to the public quote form. |
| `emailStatus` | `String` | `PENDING`, `SENT`, `FAILED` |
| `supplierStatus` | `String` | `INVITED`, `VIEWED`, `RESPONDED`, `DECLINED` |
| `sentAt` | `OffsetDateTime` | When the email was sent |
| `viewedAt` | `OffsetDateTime` | When they first opened the link |

---

## 4. Custom RFQ Questions
Dynamic questions you want the suppliers to answer on the public form.

### Entity: `RfqQuestion` (table: `warehouse_rfq_question`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key |
| `rfqId` | `Long` | Foreign Key to `RequestForQuote` |
| `questionText` | `String` | The actual question ("What is your lead time?") |
| `questionType` | `String` | `TEXT`, `NUMBER`, `BOOLEAN`, `DATE` |
| `isRequired` | `Boolean` | True if the supplier must answer it to submit |
| `sortOrder` | `Integer` | For UI ordering on the public form |

---

## 5. Supplier Responses (The Quotes)
When a supplier submits the public link form, it creates these records. This is what the internal team evaluates.

### Entity: `RfqResponse` (table: `warehouse_rfq_response`)
| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key |
| `rfqSupplierId` | `Long` | Foreign Key linking back to `RfqSupplier` |
| `isWinningBid` | `Boolean` | True if this response is selected to generate the final PO |
| `totalQuoteAmount` | `BigDecimal` | Calculated sum of all item total prices |
| `validUntil` | `LocalDate` | Expiry date of the supplier's price guarantee |
| `supplierRemarks` | `String` | Notes left by the supplier at the bottom of the form |
| `submittedAt` | `OffsetDateTime` | When they clicked submit |

---

### Entity: `RfqResponseItem` (table: `warehouse_rfq_response_item`)
This captures the specific pricing, tax, and quantity offered for individual products.

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key |
| `rfqResponseId` | `Long` | Foreign Key to `RfqResponse` |
| `rfqItemId` | `Long` | Foreign Key to the original `RequestForQuoteItem` |
| `offeredQuantity` | `Long` | How much they can actually supply. Maps directly to `PurchaseOrderItem.quantity_ordered` upon PO generation. |
| `unitCostCents` | `Long` | Price per unit quoted by supplier in cents. Maps directly to `PurchaseOrderItem.unitCostCents`. |
| `taxAmount` | `BigDecimal` | Taxes applicable on this item line |
| `totalPrice` | `BigDecimal` | `(qty * (unitCostCents / 100)) + tax` |
| `leadTimeDays` | `Integer` | How many days until they can deliver this item |
| `supplierNotes` | `String` | Any note specific to this item line from the supplier |

---

### Entity: `RfqResponseAnswer` (table: `warehouse_rfq_response_answer`)
Captures the answers to the custom questions (`RfqQuestion`).

| Field | Type | Description |
| :--- | :--- | :--- |
| `id` | `Long` | Primary Key |
| `rfqResponseId` | `Long` | Foreign Key to `RfqResponse` |
| `rfqQuestionId` | `Long` | Foreign Key to `RfqQuestion` |
| `answerValue` | `String` | The supplier's answer (stored as string, casted in frontend based on questionType) |

---

## System Integration & Foreign Keys (Developer Reference)

To ensure this module functions correctly, the developer must understand how the RFQ tables interface directly with the existing `Sales` and `Purchase` entities. 

### 1. Generating RFQ from Sales Module (Input)
When "Generate RFQ" is clicked on a Sales Order, read from these existing entities in `com.example.multi_tanent.sales.entity`:

- **`SalesOrder`** (`sales_orders` table): 
  - Use `SalesOrder.id` to set `RequestForQuote.salesOrderId`.
  - Use `SalesOrder.tenant` to set `RequestForQuote.tenantId`.
- **`SalesOrderItem`** (`sales_order_items` table):
  - Iterate through `SalesOrder.items`.
  - Copy `SalesOrderItem.crmProduct` to `RequestForQuoteItem.crmProductId`.
  - Copy `SalesOrderItem.itemCode` and `SalesOrderItem.itemName`.
  - Map `SalesOrderItem.quantity` to `RequestForQuoteItem.requestedQuantity`.

### 2. Public Portal Security
- The `RfqSupplier.accessToken` must be a high-entropy string (e.g., `java.util.UUID.randomUUID().toString()`).
- In backend Spring Security config, endpoints like `/api/public/rfq/**` must **bypass JWT auth**. Instead, resolve the RFQ object by querying `RfqSupplier` where `accessToken` matches the path variable.

### 3. Generating Purchase Order from RFQ Module (Output)
When `RfqResponse.isWinningBid` is marked `true`, the system must auto-generate records in `com.example.multi_tanent.pos.entity`:

- **`PurchaseOrder`** (`purchase_orders` table):
  - Set `PurchaseOrder.tenant` using `RequestForQuote.tenantId`.
  - Set `PurchaseOrder.supplierName` using `RfqSupplier.supplierName`.
  - Set `PurchaseOrder.status` to `"open"`.
- **`PurchaseOrderItem`** (`purchase_order_items` table):
  - Iterate through `RfqResponseItem`s.
  - Set `PurchaseOrderItem.quantityOrdered` to `RfqResponseItem.offeredQuantity` (both are `Long`).
  - Set `PurchaseOrderItem.unitCostCents` to `RfqResponseItem.unitCostCents` (both are `Long`).
  - *Note: `PurchaseOrderItem` expects a `ProductVariant`. The developer will need to map `RequestForQuoteItem.crmProductId` back to the corresponding `ProductVariant` in the system.*
