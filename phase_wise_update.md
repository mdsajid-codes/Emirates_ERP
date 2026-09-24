# Implementation Plan — Centralized Master Data Hub

## Overview
We will create a dedicated **Master Data Settings** module in EmiratesERP under Company Settings (`/company-settings/master-data`) to permanently unify all master data domains (Categories & Subcategories, UOM, Tax, Currency, and Countries). Standalone duplicate category management will be removed from Production Settings and routed to this central hub.

---

## Proposed Changes

### Component 1 — Settings Dashboard (`Settings.jsx`)

#### [MODIFY] [Settings.jsx](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/company/Settings.jsx)
- Register a new **Master Data** card in `allSettingsSections` with route `/company-settings/master-data` and icon `Database`.

---

### Component 2 — Centralized Master Data Settings Hub (`MasterDataSettings.jsx`)

#### [NEW] [MasterDataSettings.jsx](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/company/MasterDataSettings.jsx)
- Wrap in `<CompanyHubLayout>` for full-width layout with left sidebar and top navigation.
- Render 5 unified tabs:
  1. 📁 **Category & Subcategory**: Parent categories & subcategory management with category codes and parent mapping.
  2. 📏 **Unit of Measure (UOM)**: Code, Name, Abbreviation (Pcs, Box, Kg, Mtr, Ltr, Hours, etc.).
  3. 🏷️ **Tax Specifications**: Tax Code, Name, Rate %, TRN rule type (`UAE VAT 5%`, `0% Zero-Rated`, `Exempt`).
  4. 💱 **Currencies**: Currency Code (`AED` Emirates Dirham default base currency, `USD`, `EUR`, `SAR`), Name, Symbol, Exchange Rate.
  5. 🌍 **Countries**: Country Name (`United Arab Emirates` default), Dial Code (`+971`), Country Code (`AE`).
- Each tab will feature real-time search, an Add/Edit modal, status toggles, and delete actions linked to backend `/api/v1/mdm/...` endpoints.

---

### Component 3 — App Routing (`App.jsx`)

#### [MODIFY] [App.jsx](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/App.jsx)
- Add route `/company-settings/master-data` pointing to `<MasterDataSettings />`.

---

# POS Accounting + Split Payment — Implementation Plan

> **Scope**: Fix GL accuracy, add POS-specific Chart of Accounts, enable multi-method split payments (e.g. AED 300 cash + AED 200 card), and add POS accounting reports.  
> **Reference**: [pos_accounting_deep_dive.md](file:///home/sajid-codes/.gemini/antigravity-ide/brain/bccb747b-c49a-4c91-9021-b8f0aef35b07/pos_accounting_deep_dive.md)

---

## How Split Payment Changes the GL

A sale of **AED 500** paid **AED 300 cash + AED 200 card** must produce:

| JE #1 — POS Sale | Dr | Cr |
|------------------|----|-----|
| POS Cash in Till (POS-1010) | 300 | |
| POS Card Clearing (POS-1015) | 200 | |
| POS Sales Revenue (POS-4010) | | ~476 |
| POS VAT Payable (POS-2010) | | ~24 |

Each payment leg must debit its **own GL account**. This requires the posting engine to iterate `Sale.payments` instead of reading a single `paymentMethod` string.

---

## Phase 1 — POS Chart of Accounts

### [MODIFY] [`AccountSection.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/accounts/entity/enums/AccountSection.java)

Add 3 new POS-specific account sections:
```java
// ─── POS-SPECIFIC ───────────────────────────────────────────
BS_POS_CARD_CLEARING,   // Bridge: card tender, clears to zero after acquirer settlement
PL_POS_BANK_CHARGES,    // Merchant/acquirer processing fees (not COGS)
PL_POS_CASH_VARIANCE,   // Cash over/short at shift close (not COGS)
```

### [NEW] `pos/006-seed-pos-chart-of-accounts.xml`

Seed 10 dedicated POS GL accounts:

| Code | Name | Section |
|------|------|---------|
| `POS-1010` | POS Cash in Till | `BS_CASH` |
| `POS-1015` | POS Card Clearing | `BS_POS_CARD_CLEARING` |
| `POS-1020` | POS Petty Cash Float | `BS_CASH` |
| `POS-2010` | POS VAT Payable | `BS_VAT_PAYABLE` |
| `POS-4010` | POS Sales Revenue | `PL_SALES_GOODS` |
| `POS-4015` | POS Sales Returns | `PL_TRADE_DISCOUNTS` |
| `POS-5010` | POS Cost of Goods Sold | `PL_COS_GOODS` |
| `POS-6010` | POS Merchant Processing Fee | `PL_POS_BANK_CHARGES` |
| `POS-6020` | POS Cash Over/Short | `PL_POS_CASH_VARIANCE` |
| `POS-6030` | POS Loyalty Discount Expense | `PL_OPERATING_EXPENSES` |

### [MODIFY] `db.changelog-tenant.xml` — register new changelog

---

## Phase 2 — Split Payment Engine

### 2A — Database

### [NEW] `pos/007-add-split-payment-fields.xml`

```xml
<addColumn tableName="payments">
    <column name="payment_reference" type="VARCHAR(255)"/>
    <column name="card_terminal_id"  type="VARCHAR(100)"/>
    <column name="gl_posted"         type="BOOLEAN" defaultValueBoolean="false"/>
</addColumn>
```

### 2B — Backend

### [MODIFY] [`Payment.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/entity/Payment.java)

Add: `paymentReference`, `cardTerminalId`, `glPosted` fields.

### [MODIFY] [`PaymentRequest.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/dto/PaymentRequest.java)

Add: `cardTerminalId` optional field.

### [MODIFY] [`PostingRequest.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/accounts/dto/posting/PostingRequest.java)

Add `PaymentLeg` inner class + `paymentLegs` list:

```java
@Data
public static class PaymentLeg {
    private String method;       // "cash", "card", "wallet"
    private Long amountCents;
    private String reference;
}
private List<PaymentLeg> paymentLegs = new ArrayList<>();
```

### [MODIFY] [`PosAccountingIntegrationService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/service/PosAccountingIntegrationService.java) — `postSaleToLedger()`

Replace single `paymentMethod` lookup with a loop over `sale.getPayments()` to populate `paymentLegs`:

```java
// One PaymentLeg per payment tender
for (Payment payment : sale.getPayments()) {
    PostingRequest.PaymentLeg leg = new PostingRequest.PaymentLeg();
    leg.setMethod(payment.getMethod().toLowerCase());
    leg.setAmountCents(payment.getAmountCents());
    leg.setReference(payment.getReference());
    request.getPaymentLegs().add(leg);
}
```

### [MODIFY] [`PostingRulesFactory.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/accounts/service/posting/PostingRulesFactory.java) — `generatePosSaleLines()`

Replace single debit line with a loop over `paymentLegs`:

```java
for (PostingRequest.PaymentLeg leg : request.getPaymentLegs()) {
    AccountSection section;
    String method = leg.getMethod().toLowerCase();
    if (method.contains("card") || method.contains("terminal")) {
        section = AccountSection.BS_POS_CARD_CLEARING;   // Bridge account
    } else if (method.contains("credit") || method.contains("account")) {
        section = AccountSection.BS_TRADE_RECEIVABLES;
    } else {
        section = AccountSection.BS_CASH;               // Cash in till
    }
    BigDecimal legAmt = BigDecimal.valueOf(leg.getAmountCents()).divide(BigDecimal.valueOf(100), 2, HALF_UP);
    JournalEntryLineRequest drLine = new JournalEntryLineRequest();
    drLine.setAccountId(resolver.resolveAccountBySection(section, tenantId).getAccountId());
    drLine.setDebitAmount(legAmt);
    drLine.setCreditAmount(BigDecimal.ZERO);
    drLine.setDescription("POS " + leg.getMethod() + " Payment");
    targetLines.add(drLine);
}
// Fallback to old single paymentMethod if paymentLegs is empty
```

### 2C — Frontend

### [MODIFY] [`BillModal.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/sales/components/BillModal.jsx)

**Replace** single `paymentMethod` state with a `paymentLegs` array:

```jsx
const [paymentLegs, setPaymentLegs] = useState([
    { method: 'CASH', amountCents: 0, reference: null, cardTerminalId: null }
]);
const allocatedCents = paymentLegs.reduce((s, l) => s + (l.amountCents || 0), 0);
const remainingCents = total - allocatedCents;
```

**New payment panel UI**:
- Each row: `[Method dropdown (Cash/Card/Wallet/Online)] [AED amount input] [Quick-fill remaining button] [Remove row ×]`
- `+ Add another payment method` link to add a second/third row
- Live **"Remaining: AED X.XX"** counter — must be 0.00 to enable Confirm
- Cash rows: show change-due if over-tendered
- Card rows: show optional `Card Terminal ID` input

**What gets sent to backend**:
```jsx
onProcessSale(orderId,
    paymentLegs.filter(l => l.amountCents > 0).map(l => ({
        method: l.method,
        amountCents: l.amountCents,
        reference: l.method === 'CARD' ? (l.reference || 'CARD_TRANSACTION') : null,
        cardTerminalId: l.cardTerminalId || null
    })),
    { orderType, adultsCount, kidsCount, salesSource }
);
```

### [MODIFY] [`PaymentModal.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/sales/components/PaymentModal.jsx)

Same `paymentLegs` pattern in compact form (this is the quick-checkout modal).

---

## Phase 3 — GL Posting Bug Fixes

### [MODIFY] [`PostingRulesFactory.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/accounts/service/posting/PostingRulesFactory.java)

| Method | Bug | Fix |
|--------|-----|-----|
| `generatePosCardSettlementLines()` | Merchant fee → `PL_COS_GOODS` | Change to `PL_POS_BANK_CHARGES` |
| `generatePosCardSettlementLines()` | Clearing → `BS_TRADE_RECEIVABLES` | Change to `BS_POS_CARD_CLEARING` |
| `generatePosShiftReconciliationLines()` | Cash variance → `PL_COS_GOODS` | Change to `PL_POS_CASH_VARIANCE` |

---

## Phase 4 — POS Accounting Reports

### 4A — Backend

### [MODIFY] [`ReportController.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/controller/ReportController.java)

| New Endpoint | Returns |
|-------------|---------|
| `GET /api/pos/reports/gl-journal-entries` | All JEs from POS sales in date range |
| `GET /api/pos/reports/trial-balance` | Balance per POS GL account |
| `GET /api/pos/reports/card-settlement` | Gross / fee / net per settlement |
| `GET /api/pos/reports/vat-output` | Total output VAT per period |
| `GET /api/pos/reports/cash-variance` | Over/short by shift and terminal |

### [MODIFY] [`ReportService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/service/ReportService.java)

Add 5 service methods querying `journal_entries` filtered to POS document types.

### 4B — Frontend

### [MODIFY] [`PosReportsLayout.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/page/reports/PosReportsLayout.jsx)

Add **"Accounting"** sidebar section with 5 links.

### [NEW] 5 Report Components in `src/pos/page/reports/`

| File | Shows |
|------|-------|
| `GlJournalEntries.jsx` | Date, ref, account, Dr, Cr, docType |
| `PosTrialBalance.jsx` | Account, Dr Total, Cr Total, Net |
| `CardSettlementReport.jsx` | Settlement ref, gross, fee, net to bank |
| `VatOutputReport.jsx` | Period, gross sales, VAT 5%, cumulative |
| `CashVarianceReport.jsx` | Shift, terminal, cashier, expected, actual, over/short |

### [MODIFY] [`App.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/App.jsx)

Register 5 new routes under `/pos-reports`.

---

## Phase 5 — Cleanup

### [MODIFY] [`PosReportsLayout.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/page/reports/PosReportsLayout.jsx)
- Remove dead sidebar entries: `abstract`, `weekly-sales`

### [MODIFY] [`ReportsView.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/page/ReportsView.jsx)
- Replace hardcoded 6-card catalog with a redirect to `/pos-reports/business-summary`

---

## All Files to Change

| Phase | File | Action |
|-------|------|--------|
| 1 | `AccountSection.java` | Add 3 enum values |
| 1 | `pos/006-seed-pos-chart-of-accounts.xml` | **[NEW]** 10 POS GL accounts |
| 1 | `db.changelog-tenant.xml` | Register changelog |
| 2A | `pos/007-add-split-payment-fields.xml` | **[NEW]** 3 columns on payments |
| 2B | `Payment.java` | Add 3 fields |
| 2B | `PaymentRequest.java` | Add `cardTerminalId` |
| 2B | `PostingRequest.java` | Add `PaymentLeg` + `paymentLegs` |
| 2B | `PosAccountingIntegrationService.java` | Loop payments → multi-leg GL |
| 2B | `PostingRulesFactory.java` | Split debit legs + 3 bug fixes |
| 2C | `BillModal.jsx` | **Redesign** split payment UX |
| 2C | `PaymentModal.jsx` | **Redesign** compact split payment |
| 4A | `ReportController.java` | Add 5 accounting endpoints |
| 4A | `ReportService.java` | Add 5 service methods |
| 4B | `PosReportsLayout.jsx` | Add Accounting sidebar section |
| 4B | `App.jsx` | Register 5 report routes |
| 4B | 5 new report files | **[NEW]** Accounting report components |
| 5 | `PosReportsLayout.jsx` | Remove 2 dead links |
| 5 | `ReportsView.jsx` | Replace with redirect |

---

## Correct Final GL — Split Payment Example

**Sale: AED 500 | AED 300 cash + AED 200 card | VAT 5% included**

**JE 1 — POS Sale**

| Account | Dr | Cr |
|---------|----|----||
| POS-1010 POS Cash in Till | 300.00 | |
| POS-1015 POS Card Clearing (bridge) | 200.00 | |
| POS-4010 POS Sales Revenue | | 476.19 |
| POS-2010 POS VAT Payable | | 23.81 |

**JE 2 — COGS**

| Account | Dr | Cr |
|---------|----|----||
| POS-5010 Cost of Goods Sold | 280.00 | |
| Inventory | | 280.00 |

**JE 3 — Card Settlement (next day, 2% fee)**

| Account | Dr | Cr |
|---------|----|----||
| Bank Account | 196.00 | |
| POS-6010 Merchant Processing Fee | 4.00 | |
| POS-1015 POS Card Clearing | | 200.00 |

> After JE 3: **POS Card Clearing = AED 0** ✅ Bridge cleared. Trial balance balances.

---

## Phase 6 — Master Data Settings: Subcategory Tab + Inline Form Redesign

> **Trigger**: User request: *"add subcategory tab, remove category/subcategory/tax/uom from Production settings, keep here in Master Data with exact Production-style inline forms and functionality"*

### What Exists Now

| Location | Tabs present | Design style |
|----------|--------------|--------------|
| `MasterDataSettings.jsx` | Categories, UOM, Tax, Currency, Country | ❌ Modal pop-up add/edit (poor UX) |
| `ProductionSettings.jsx` | Categories (no Subcategory!), UOM, Tax + production tabs | ✅ Inline form above table |
| `CategoryTab.jsx` | Full inline form + table | ✅ Uses `/production/categories` API |
| `SubCategoryTab.jsx` | Full inline form + table + category filter | ✅ Uses `/production/sub-categories` API |
| `TaxTab.jsx` | Full inline form + table | ✅ Uses `/production/taxes` API |
| `UnitTab.jsx` | Full inline form + table | ✅ Uses `/production/units` API |

### 6A — MasterDataSettings.jsx Redesign

### [MODIFY] [`MasterDataSettings.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/company/MasterDataSettings.jsx)

**Remove** the current modal-based add/edit system entirely for the Category, UOM, and Tax tabs.

**Replace** those 3 tabs with direct component imports from Production settings:

```jsx
// Import the exact Production tab components
import CategoryTab from '../production/settings/CategoryTab';
import SubCategoryTab from '../production/settings/SubCategoryTab';
import UnitTab from '../production/settings/UnitTab';
import TaxTab from '../production/settings/TaxTab';

// Tab definitions — add Subcategory between Category and UOM
const TABS = [
    { key: 'categories',   label: 'Category',            icon: FolderTree },
    { key: 'subcategory',  label: 'Sub Category',         icon: FolderTree },  // ← NEW
    { key: 'uom',          label: 'Units of Measure (UOM)', icon: Ruler },
    { key: 'tax',          label: 'Tax Specifications (VAT)', icon: Percent },
    { key: 'currency',     label: 'Currencies (AED)',     icon: Coins },
    { key: 'country',      label: 'Countries (+971)',     icon: Globe },
];
```

**Tab render switch** — replace the table-inside-main block with:
```jsx
{activeTab === 'categories'  && <CategoryTab locationId="all" />}
{activeTab === 'subcategory' && <SubCategoryTab locationId="all" />}   {/* NEW */}
{activeTab === 'uom'         && <UnitTab locationId="all" />}
{activeTab === 'tax'         && <TaxTab locationId="all" />}
{/* Currency and Country keep existing table + modal as-is */}
{activeTab === 'currency' && ( /* existing currency table */ )}
{activeTab === 'country'  && ( /* existing country table */ )}
```

**Remove** from `MasterDataSettings.jsx`:
- `openAddModal`, `openEditModal`, `handleFormSubmit` functions (only needed for Currency + Country now)
- All inline modal form JSX for `categories`, `uom`, `tax` tab cases
- `categories`, `uoms`, `taxes` state and their `fetchData` branches (handled inside imported tabs)
- The toolbar `+ Add New Entry` button row (each imported tab has its own `+ Add Category / + Add Unit / + Add Tax` button)
- The global `Search` bar (each imported tab has its own search)

**Keep** for Currency and Country:
- Modal add/edit, `currencies` and `countries` state, their `fetchData` branches, `handleDelete` for currency/country

### 6B — Production Settings Cleanup

### [MODIFY] [`ProductionLayout.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/production/layout/ProductionLayout.jsx)

Remove `'Categories'` from `productionNavLinks`:
```js
// REMOVE this line:
{ name: 'Categories', ... }
// NOTE: SubCategory was never added, so nothing to remove there
```

### [MODIFY] [`ProductionSettings.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/production/settings/ProductionSettings.jsx)

Remove from `componentMap`:
```js
// REMOVE these entries:
'Categories': ProCategories,
// (SubCategory tab was never added to production, so nothing to remove)
```

Remove unused imports:
```js
// REMOVE:
import ProCategories from './ProCategories';
```

> **Note**: `UOM` and `Tax` were never in `productionNavLinks` or `componentMap` — they were only tab components inside `ProCategories`. No changes needed for those in ProductionSettings.

### 6C — Summary of Phase 6 File Changes

| File | Action |
|------|--------|
| `MasterDataSettings.jsx` | Import 4 production tab components; add Subcategory tab; remove modal form for cat/uom/tax |
| `ProductionLayout.jsx` | Remove `'Categories'` from `productionNavLinks` |
| `ProductionSettings.jsx` | Remove `'Categories': ProCategories` from `componentMap`; remove unused import |


### Automated Tests
- Run `./scripts/test-tenant-provisioning.sh` to ensure all Spring Boot backend endpoints and Liquibase migration scripts build and execute with zero errors.

### Manual Verification
2. Click **Master Data** and test all 5 tabs:
   - **Category & Subcategory**: Create a main category and a child subcategory.
   - **UOM**: Create a unit of measure.
   - **Tax**: View & manage UAE VAT rules.
   - **Currency**: Verify AED base currency and additional currency definitions.
   - **Countries**: Verify UAE (+971) default country.
3. Open Production Settings and confirm standalone category management has been removed and redirected to Master Data.

---

## Phase 7 — Master Product: Master Category & Subcategory Linkage

> **Trigger**: User request: *"here in product which i kept as master product here i want to add category field and sub category field relations of mster category, and master sub category, let add this in implementation plan"*

### 7A — Database Migration (Liquibase)

#### [NEW] `db/changelog/tenant/115-add-category-sub-category-to-crm-sales-products.xml`
- Add `category_id` (BIGINT, FK to `pro_categories(id)`) and `sub_category_id` (BIGINT, FK to `pro_sub_categories(id)`) columns to `crm_sales_products` table.
- Register migration in `db.changelog-tenant.xml`.

### 7B — Backend Entity & DTO Updates

#### [MODIFY] [`CrmSalesProduct.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/spersusers/enitity/CrmSalesProduct.java)
- Add `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "category_id") private ProCategory category;`
- Add `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "sub_category_id") private ProSubCategory subCategory;`

#### [MODIFY] [`CrmSalesProductRequest.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/crm/dto/CrmSalesProductRequest.java)
- Add `private Long categoryId;`
- Add `private Long subCategoryId;`

#### [MODIFY] [`CrmSalesProductResponse.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/crm/dto/CrmSalesProductResponse.java)
- Add `private Long categoryId;`
- Add `private String categoryName;`
- Add `private Long subCategoryId;`
- Add `private String subCategoryName;`

#### [MODIFY] [`CrmSalesProductService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/crm/services/CrmSalesProductService.java)
- Inject `ProCategoryRepository` and `ProSubCategoryRepository`.
- In `mapRequestToEntity()`: map `request.getCategoryId()` -> `product.setCategory()` and `request.getSubCategoryId()` -> `product.setSubCategory()`.
- In `mapEntityToResponse()`: include `categoryId`, `categoryName`, `subCategoryId`, and `subCategoryName`.

### 7C — Frontend Integration

#### [MODIFY] [`CrmSalesProductForm.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/crm/components/CrmSalesProductForm.jsx)
- Fetch master categories list from `/api/v1/production/categories?locationId=all`.
- Fetch master subcategories list filtered by category (`/api/v1/production/sub-categories?categoryId=...`).
- Add **Category** dropdown and dependent **Sub Category** dropdown in the Product & Services form UI.
- Bind `categoryId` and `subCategoryId` to form payload.

#### [MODIFY] [`CrmSalesProduct.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/crm/components/CrmSalesProduct.jsx)
- Add **Category** and **Sub Category** columns to the Master Product data table.

### 7D — Summary of Phase 7 File Changes

| File | Action |
|------|--------|
| `115-add-category-sub-category-to-crm-sales-products.xml` | **[NEW]** Liquibase migration for FK columns |
| `db.changelog-tenant.xml` | Register changelog |
| `CrmSalesProduct.java` | Add `@ManyToOne` relations for `category` and `subCategory` |
| `CrmSalesProductRequest.java` | Add `categoryId` & `subCategoryId` fields |
| `CrmSalesProductResponse.java` | Add category/sub-category IDs and Names |
| `CrmSalesProductService.java` | Map category and subcategory entity relationships |
| `CrmSalesProductForm.jsx` | Add category & subcategory dropdowns + API fetch |
| `CrmSalesProduct.jsx` | Display Category and Sub Category in list table |

---

## Phase 8 — Complete POS Duplicate Table Removal & Single Product Truth Integration

> **Trigger**: User request: *"i want remove completly pos dubpicates table and use and make relation with sing product and all transaction according to that product single truth update my implementation plan"*

### 8A — Database Schema Liquibase Migration

#### [NEW] `db/changelog/pos/008-refactor-pos-tables-to-master-product.xml`
- **Drop FKs & Deprecate Legacy Duplicate POS Tables**:
  - `pos_products`
  - `product_variants`
  - `pos_categories`
  - `pos_tax_rates`
  - `pos_customers` *(Deprecate duplicate POS customers table)*
- **Add Master Product & Unified Party Foreign Keys**:
  - `inventory`: Drop `product_variant_id`, add `product_id` (BIGINT, FK to `crm_sales_products(id)`).
  - `sale_items`: Drop `product_variant_id`, add `product_id` (BIGINT, FK to `crm_sales_products(id)`).
  - `stock_movements`: Drop `product_variant_id`, add `product_id` (BIGINT, FK to `crm_sales_products(id)`).
  - `pur_order_items`: Drop `product_variant_id`, add `product_id` (BIGINT, FK to `crm_sales_products(id)`).
  - `return_items`: Drop `product_variant_id`, add `product_id` (BIGINT, FK to `crm_sales_products(id)`).
  - `sales`: Update `customer_id` foreign key to reference unified `parties(id)` (`PartyType.CUSTOMER`).
- Register change log in `db.changelog-tenant.xml`.

---

### 8B — Backend Entity & Repository Refactoring

#### [MODIFY] [`Inventory.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/entity/Inventory.java)
- Remove `private ProductVariant productVariant;`
- Add `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private CrmSalesProduct product;`

#### [MODIFY] [`SaleItem.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/entity/SaleItem.java)
- Remove `private ProductVariant productVariant;`
- Add `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private CrmSalesProduct product;`

#### [MODIFY] [`Sale.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/entity/Sale.java)
- Replace legacy POS `Customer` entity with `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "customer_id") private BaseCustomer customer;` (unified `PartyType.CUSTOMER`).

#### [MODIFY] [`StockMovement.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/entity/StockMovement.java)
- Remove `private ProductVariant productVariant;`
- Add `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private CrmSalesProduct product;`

#### [MODIFY] [`PurchaseOrderItem.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/entity/PurchaseOrderItem.java)
- Remove `private ProductVariant productVariant;`
- Add `@ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "product_id", nullable = false) private CrmSalesProduct product;`

#### [DELETE/DEPRECATE] Legacy POS Duplicate Entities & Repositories
- Deprecate `Product.java`, `ProductVariant.java`, `PosCategory.java`, `TaxRate.java`, and `Customer.java` (POS duplicate).
- Deprecate respective repositories (`ProductRepository`, `ProductVariantRepository`, `CategoryRepository`, `TaxRateRepository`, `CustomerRepository`).

---

### 8C — POS Backend Services Refactoring

#### [MODIFY] [`SaleService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/service/SaleService.java)
- Validate inventory and build `SaleItem` records directly referencing `CrmSalesProduct`.
- Calculate line tax rate dynamically using `product.getTaxRate()` from `CrmSalesProduct`.
- Link sales orders to unified customer parties (`BaseCustomer` / `Party` with `PartyType.CUSTOMER`).

#### [MODIFY] [`CustomerService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/service/CustomerService.java)
- Delegate all POS customer retrieval and creation directly to `PartyService` (`PartyType.CUSTOMER`).

#### [MODIFY] [`InventoryService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/service/InventoryService.java)
- Track store-specific stock balances using `findByStoreIdAndProductId(storeId, productId)`.

#### [MODIFY] [`StockMovementService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/service/StockMovementService.java)
- Log stock entries, deductions, and transfers directly against `CrmSalesProduct`.

#### [MODIFY] [`PosAccountingIntegrationService.java`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/src/main/java/com/example/multi_tanent/pos/service/PosAccountingIntegrationService.java)
- Post POS sales and COGS journal entries reading product costs and descriptions directly from `CrmSalesProduct`.

---

### 8D — POS Frontend UI Refactoring

#### [MODIFY] [`PosSettingsView.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/page/PosSettingsView.jsx)
- Remove `Taxes` (`TaxSettingsTab`) and `Categories` (`CategorySettingsTab`) tabs.
- Taxes and Categories are now fully managed under **Master Data Settings** (`/company-settings/master-data`).

#### [MODIFY] [`PosDashboard.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/page/PosDashboard.jsx)
- Redirect **Products** navigation link (`/pos/products`) to point directly to centralized **Product & Services** (`/company-settings/product-services`).

#### [MODIFY] [`CustomersView.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/page/CustomersView.jsx)
- Fetch customer list and create new customers using unified Party endpoint (`/api/v1/parties?type=CUSTOMER`).

#### [MODIFY] [`SalesView.jsx`](file:///home/sajid-codes/Desktop/Dummy/Sajid/EmiratesErp/EmiratesErp_Frontend/src/pos/page/SalesView.jsx)
- Fetch products catalog directly from `/api/v1/crm/sales-products` (`CrmSalesProduct`).
- Fetch customer dropdown list from `/api/v1/parties?type=CUSTOMER`.
- Render category filter tabs dynamically using Master Data Categories (`/api/v1/production/categories`).

---

### 8E — Summary of Phase 8 File Changes

| Layer | File | Action |
|-------|------|--------|
| DB Migration | `008-refactor-pos-tables-to-master-product.xml` | **[NEW]** Drop duplicate POS tables (`pos_products`, `pos_customers`, etc.) & add `product_id` and `party_id` FKs |
| DB Migration | `db.changelog-tenant.xml` | Register new POS Liquibase migration |
| Backend Entity | `Inventory.java` | Replace `ProductVariant` with `CrmSalesProduct` |
| Backend Entity | `SaleItem.java` | Replace `ProductVariant` with `CrmSalesProduct` |
| Backend Entity | `Sale.java` | Replace legacy `Customer` with unified `BaseCustomer` (`PartyType.CUSTOMER`) |
| Backend Entity | `StockMovement.java` | Replace `ProductVariant` with `CrmSalesProduct` |
| Backend Entity | `PurchaseOrderItem.java` | Replace `ProductVariant` with `CrmSalesProduct` |
| Backend Service | `SaleService.java` | Process sales & line items against `CrmSalesProduct` and unified Customer Party |
| Backend Service | `CustomerService.java` | Delegate POS customers to `PartyService` (`PartyType.CUSTOMER`) |
| Backend Service | `InventoryService.java` | Manage stock per store & `CrmSalesProduct` |
| Backend Service | `StockMovementService.java` | Log stock movements against `CrmSalesProduct` |
| Backend Service | `PosAccountingIntegrationService.java` | Post COGS & JE using `CrmSalesProduct` price & cost |
| Frontend | `PosSettingsView.jsx` | Remove duplicate `Taxes` & `Categories` tabs |
| Frontend | `PosDashboard.jsx` | Redirect POS Products to Product & Services |
| Frontend | `CustomersView.jsx` | Use unified Party Customer API (`/api/v1/parties?type=CUSTOMER`) |
| Frontend | `SalesView.jsx` | Load catalog from `CrmSalesProduct` & customers from `PartyType.CUSTOMER` |




