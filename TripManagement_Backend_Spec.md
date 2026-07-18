# Trip Management Module — Backend Developer Specification
**Project:** GTR Service Backend (multi_tanent)
**Module:** `trip_management`
**Prepared for:** New Backend Developer
**Last Updated:** March 2026

---

## 1. Project Overview

This is a **Spring Boot multi-tenant application**. Every table you create must be **tenant-scoped** using the `Tenant` entity. The app uses:

- **Spring Boot** + **Spring Data JPA**
- **PostgreSQL** (multi-schema, one schema per tenant)
- **Liquibase** for all DDL (no JPA auto-ddl — `ddl-auto=none`)
- **JWT Authentication** via `JwtAuthFilter`
- **Lombok** for boilerplate reduction

> ⚠️ **CRITICAL:** `ddl-auto=none` — JPA never creates tables. You MUST write Liquibase changelogs for every table.

---

## 2. Base Package

```
com.example.multi_tanent
```

Your new module goes inside:
```
com.example.multi_tanent.trip_management
```

Sub-packages to create:
```
trip_management/
├── entity/
├── enums/
├── dto/
├── repository/
├── service/
└── controller/
```

---

## 3. Existing Entities You Must Reuse (DO NOT Duplicate)

### 3.1 — Tenant Entity
**File:** `com.example.multi_tanent.spersusers.enitity.Tenant`
**Table:** `tenants`

Every entity in this project has a `ManyToOne` to `Tenant`. This is **mandatory**.

```java
@ManyToOne(optional = false, fetch = FetchType.LAZY)
@JoinColumn(name = "tenant_id", nullable = false)
private Tenant tenant;
```

Get current tenant in services using:
```java
String tenantId = TenantContext.getTenantId(); // com.example.multi_tanent.config.TenantContext
Tenant tenant = tenantRepository.findByTenantId(tenantId).orElseThrow(...);
```

### 3.2 — Employee Entity (USE AS DRIVER)
**File:** `com.example.multi_tanent.spersusers.enitity.Employee`
**Table:** `employees`

The **Driver = existing Employee**. Do NOT create a separate driver table.

Available fields:
- `id` (Long), `firstName`, `lastName`, `phonePrimary`, `employeeCode`, `status`
- Helper: `employee.getName()` → returns `firstName + " " + lastName`

### 3.3 — BaseCustomer
**File:** `com.example.multi_tanent.spersusers.enitity.BaseCustomer`
**Table:** `base_customers`

Do **NOT** reuse this for Trip customers. Transport logistics customers are different — create dedicated `TripCustomer` table (see Section 5).

---

## 4. Enums to Create

**Package:** `com.example.multi_tanent.trip_management.enums`

### TripStatus.java
```java
public enum TripStatus {
    CREATED,        // Trip just entered
    IN_PROGRESS,    // Driver on the road
    COMPLETED,      // Trip delivered
    INVOICED,       // Invoice generated
    PAID,           // Customer paid
    CLOSED          // Fully settled (vendor paid too)
}
```

### TripPaymentStatus.java
```java
public enum TripPaymentStatus {
    PENDING,
    PARTIAL,
    PAID
}
```

### OtherChargeType.java
```java
public enum OtherChargeType {
    INSPECTION,
    WAITING,
    COMMISSION,
    TOKEN_CANCELLATION,
    OTHER
}
```

### InvoiceStatus.java
```java
public enum InvoiceStatus {
    DRAFT,
    ISSUED,
    PAID,
    CANCELLED
}
```

---

## 5. Normalized Entity Design (4 Tables for Trip)

The Trip data is split into **4 focused tables** for clean separation of concerns:

```
trips                     ← Core identity & status
trip_charges              ← Financial amounts (1:1)
trip_payment              ← Customer payment tracking (1:1)
trip_vendor_assignment    ← Outsource vendor info (1:1, optional)
```

**Package:** `com.example.multi_tanent.trip_management.entity`

---

### 5.1 — TripCustomer.java
Transport logistics customers (separate from CRM/Sales customers).

```java
@Entity
@Table(name = "trip_customers",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "company_name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripCustomer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "phone")
    private String phone;

    @Column(name = "email")
    private String email;

    @Column(name = "trn_number")         // UAE Tax Registration Number
    private String trnNumber;

    @Column(name = "address")
    private String address;

    @Column(name = "customer_type")      // COMPANY or INDIVIDUAL
    private String customerType;

    @Column(name = "active")
    private Boolean active = Boolean.TRUE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

---

### 5.2 — TripVendor.java
Outsource transport companies (vendor trucks).

```java
@Entity
@Table(name = "trip_vendors",
       uniqueConstraints = @UniqueConstraint(columnNames = {"tenant_id", "company_name"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripVendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "company_name", nullable = false)
    private String companyName;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "phone")
    private String phone;

    @Column(name = "active")
    private Boolean active = Boolean.TRUE;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

---

### 5.3 — TripInvoice.java
One invoice groups multiple trips for one customer (UAE VAT tax invoice).

```java
@Entity
@Table(name = "trip_invoices")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripInvoice {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;            // e.g. NKT-000490

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private TripCustomer customer;

    @Column(name = "invoice_date")
    private LocalDate invoiceDate;

    @Column(name = "sub_total_amount", precision = 12, scale = 2)
    private BigDecimal subTotalAmount;       // Sum of all trip amounts

    @Column(name = "total_token_amount", precision = 12, scale = 2)
    private BigDecimal totalTokenAmount;     // Sum of all token amounts (0% VAT)

    @Column(name = "total_other_charges", precision = 12, scale = 2)
    private BigDecimal totalOtherCharges;    // Sum of all other charges

    @Column(name = "total_vat_amount", precision = 12, scale = 2)
    private BigDecimal totalVatAmount;       // Sum of all VAT amounts

    @Column(name = "grand_total", precision = 12, scale = 2)
    private BigDecimal grandTotal;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", length = 30)
    private InvoiceStatus status = InvoiceStatus.DRAFT;

    @Column(name = "payment_received_date")
    private LocalDate paymentReceivedDate;

    @Column(name = "payment_method")        // CASH, CHEQUE, BANK_TRANSFER
    private String paymentMethod;

    @Column(name = "cheque_number")
    private String chequeNumber;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // Trips on this invoice (reverse side)
    @OneToMany(mappedBy = "invoice", fetch = FetchType.LAZY)
    private List<Trip> trips = new ArrayList<>();

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

---

### 5.4 — Trip.java (Core — Identity & Route Only)
Lean master record. Only stores trip identity, route, status, and relations.

```java
@Entity
@Table(name = "trips")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Trip {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "tenant_id", nullable = false)
    private Tenant tenant;

    // ── Identity ───────────────────────────────────────────────
    @Column(name = "trip_no", nullable = false)
    private Integer tripNo;                  // Auto-generated, sequential per tenant

    @Column(name = "trip_date", nullable = false)
    private LocalDate tripDate;

    @Column(name = "trip_month", length = 10)
    private String tripMonth;                // e.g. JAN, FEB

    // ── Driver (HRMS Employee) ─────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "driver_id")
    private Employee driver;                 // → employees table

    // ── Container ──────────────────────────────────────────────
    @Column(name = "container_number", length = 20)
    private String containerNumber;

    // ── Customer ───────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private TripCustomer customer;

    @Column(name = "customer_ref_job_no")
    private String customerRefJobNo;

    @Column(name = "contact_person")
    private String contactPerson;

    @Column(name = "customer_type", length = 20)
    private String customerType;             // COMPANY or INDIVIDUAL

    // ── Route ──────────────────────────────────────────────────
    @Column(name = "from_location", nullable = false, length = 100)
    private String fromLocation;

    @Column(name = "to_location", nullable = false, length = 100)
    private String toLocation;

    // ── Status ─────────────────────────────────────────────────
    @Enumerated(EnumType.STRING)
    @Column(name = "trip_status", length = 20)
    private TripStatus tripStatus = TripStatus.CREATED;

    // ── Invoice Link ───────────────────────────────────────────
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invoice_id")
    private TripInvoice invoice;             // Set when invoice is generated

    // ── Related Tables (1:1) ────────────────────────────────────
    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TripCharges charges;             // Always present

    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TripPayment payment;             // Created when payment starts

    @OneToOne(mappedBy = "trip", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private TripVendorAssignment vendorAssignment; // Only if outsourced

    // ── Notes ──────────────────────────────────────────────────
    @Column(name = "remarks", columnDefinition = "TEXT")
    private String remarks;

    // ── Audit ──────────────────────────────────────────────────
    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "updated_by")
    private String updatedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

---

### 5.5 — TripCharges.java (Financial Data — 1:1 with Trip)
Stores all money fields. Always created alongside the trip.

```java
@Entity
@Table(name = "trip_charges")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripCharges {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Strict 1:1 — one charge record per trip
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    @Column(name = "amount", nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;              // Base trip rate

    @Column(name = "token_amount", precision = 10, scale = 2)
    private BigDecimal tokenAmount;         // Advance/deposit — 0% VAT

    @Column(name = "other_charges", precision = 10, scale = 2)
    private BigDecimal otherCharges;        // Inspection / Waiting / Commission

    @Enumerated(EnumType.STRING)
    @Column(name = "other_charge_type", length = 30)
    private OtherChargeType otherChargeType;

    // ── CALCULATED FIELDS — Always set by service, never by frontend ──
    @Column(name = "vat_amount", precision = 10, scale = 2)
    private BigDecimal vatAmount;           // = (amount + otherCharges) × 0.05

    @Column(name = "total_amount", precision = 10, scale = 2)
    private BigDecimal totalAmount;         // = amount + vatAmount + otherCharges + tokenAmount

    @Column(name = "driver_commission", precision = 10, scale = 2)
    private BigDecimal driverCommission;    // = amount × 0.10

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

---

### 5.6 — TripPayment.java (Customer Payment — 1:1 with Trip)
Created when payment tracking begins. Can be absent if no payment yet recorded.

```java
@Entity
@Table(name = "trip_payment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    @Enumerated(EnumType.STRING)
    @Column(name = "payment_status", length = 20)
    private TripPaymentStatus paymentStatus = TripPaymentStatus.PENDING;

    @Column(name = "payment_date")
    private LocalDate paymentDate;

    @Column(name = "received_by")
    private String receivedBy;              // Who collected the payment

    @Column(name = "token_payment_method", length = 30)
    private String tokenPaymentMethod;      // CASH, CARD, BANK_TRANSFER

    @Column(name = "cheque_number")
    private String chequeNumber;

    @Column(name = "other_reference")
    private String otherReference;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

---

### 5.7 — TripVendorAssignment.java (Outsource Vendor — 1:1 with Trip, Optional)
Only created when the trip is outsourced to a vendor. If company uses own truck, no row is created.

```java
@Entity
@Table(name = "trip_vendor_assignment")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class TripVendorAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trip_id", nullable = false, unique = true)
    private Trip trip;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendor_id", nullable = false)
    private TripVendor vendor;

    @Column(name = "vendor_amount", precision = 10, scale = 2)
    private BigDecimal vendorAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "vendor_payment_status", length = 20)
    private TripPaymentStatus vendorPaymentStatus = TripPaymentStatus.PENDING;

    @Column(name = "vendor_payment_date")
    private LocalDate vendorPaymentDate;

    @Column(name = "vendor_notes", columnDefinition = "TEXT")
    private String vendorNotes;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;
}
```

---

## 6. Entity Relationship Diagram

```
              tenants (existing)
                    │
        ┌───────────┼──────────────────┐
        │           │                  │
  trip_customers  trip_vendors    employees (HRMS - existing)
        │           │                  │
        └──────────►│◄─────────────────┘
                    │
                  TRIPS  ← master record (identity + route + status)
                    │
          ┌─────────┼──────────────────────┐
          │         │                      │
   trip_charges  trip_payment  trip_vendor_assignment
  (financials,   (customer      (outsource only,
   always 1:1)   payment, 1:1)  nullable 1:1)
                    │
              trip_invoices
             (groups many trips)
```

---

## 7. Business Logic Rules (Service Layer — CRITICAL)

### 7.1 Auto-Calculation (MANDATORY — Never Trust Frontend)
In `TripService`, always recalculate on create AND update:

```java
private void calculateFinancials(TripCharges charges) {
    BigDecimal amount = charges.getAmount() != null ? charges.getAmount() : BigDecimal.ZERO;
    BigDecimal other  = charges.getOtherCharges() != null ? charges.getOtherCharges() : BigDecimal.ZERO;
    BigDecimal token  = charges.getTokenAmount() != null ? charges.getTokenAmount() : BigDecimal.ZERO;

    // UAE VAT Rule: token is 0% VAT, amount + otherCharges are 5% VAT
    BigDecimal vat        = amount.add(other).multiply(new BigDecimal("0.05"))
                                  .setScale(2, RoundingMode.HALF_UP);
    BigDecimal total      = amount.add(vat).add(other).add(token);
    BigDecimal commission = amount.multiply(new BigDecimal("0.10"))
                                  .setScale(2, RoundingMode.HALF_UP);

    charges.setVatAmount(vat);
    charges.setTotalAmount(total);
    charges.setDriverCommission(commission);
}
```

### 7.2 Trip No — Auto Sequential Per Tenant
```java
// TripRepository query:
@Query("SELECT COALESCE(MAX(t.tripNo), 0) FROM Trip t WHERE t.tenant = :tenant")
Integer findMaxTripNoByTenant(@Param("tenant") Tenant tenant);

// Service usage:
int nextNo = tripRepository.findMaxTripNoByTenant(tenant) + 1;
trip.setTripNo(nextNo);
trip.setTripMonth(trip.getTripDate().getMonth().name().substring(0, 3));
```

### 7.3 Invoice Number — Auto Sequential Per Tenant
```java
// Format: NKT-000490
Long count = tripInvoiceRepository.countByTenant(tenant);
String invoiceNumber = String.format("NKT-%06d", count + 1);
```

### 7.4 Trip Status — Lifecycle Rules
Only these transitions are allowed:

```
CREATED → IN_PROGRESS → COMPLETED → INVOICED → PAID → CLOSED
```

Enforce in `TripService.updateStatus()`:
- Cannot skip steps
- Cannot go backwards
- Trip must be `COMPLETED` before invoice can be generated
- Invoice auto-changes trips to `INVOICED` status

### 7.5 Invoice Creation Logic
When `POST /api/trip-invoices` is called:
1. Receive `{ customerId, tripIds[], invoiceDate }`
2. Validate all trips belong to same **tenant** and same **customer**
3. Validate all trips have status = `COMPLETED`
4. Sum all charges from `trip_charges` table to build invoice totals
5. Generate invoice number (auto)
6. Save `TripInvoice`
7. For each trip: set `invoice = savedInvoice`, update `tripStatus = INVOICED`

### 7.6 Vendor Assignment — Optional
```java
// In TripService.createTrip():
if (request.getVendorId() != null) {
    TripVendorAssignment va = TripVendorAssignment.builder()
        .trip(savedTrip)
        .vendor(vendorRepo.findById(request.getVendorId()).orElseThrow())
        .vendorAmount(request.getVendorAmount())
        .vendorPaymentStatus(TripPaymentStatus.PENDING)
        .build();
    tripVendorAssignmentRepo.save(va);
}
```

---

## 8. Repositories

**Package:** `com.example.multi_tanent.trip_management.repository`

### TripRepository.java
```java
public interface TripRepository extends JpaRepository<Trip, Long> {
    List<Trip> findAllByTenantOrderByTripDateDesc(Tenant tenant);
    List<Trip> findAllByTenantAndTripMonth(Tenant tenant, String month);
    List<Trip> findAllByTenantAndDriver(Tenant tenant, Employee driver);
    List<Trip> findAllByTenantAndCustomer(Tenant tenant, TripCustomer customer);
    List<Trip> findAllByTenantAndTripStatus(Tenant tenant, TripStatus status);
    List<Trip> findAllByTenantAndCustomerAndTripStatusAndInvoiceIsNull(
        Tenant tenant, TripCustomer customer, TripStatus status);

    @Query("SELECT COALESCE(MAX(t.tripNo), 0) FROM Trip t WHERE t.tenant = :tenant")
    Integer findMaxTripNoByTenant(@Param("tenant") Tenant tenant);

    // Reports
    @Query("""
        SELECT t.driver.id, COUNT(t), SUM(tc.amount), SUM(tc.driverCommission)
        FROM Trip t JOIN t.charges tc
        WHERE t.tenant = :tenant AND t.tripMonth = :month
        GROUP BY t.driver.id
        """)
    List<Object[]> getDriverReportByMonth(@Param("tenant") Tenant tenant, @Param("month") String month);

    @Query("""
        SELECT t.customer.id, COUNT(t), SUM(tc.totalAmount)
        FROM Trip t JOIN t.charges tc
        WHERE t.tenant = :tenant AND t.tripMonth = :month
        GROUP BY t.customer.id
        """)
    List<Object[]> getCustomerReportByMonth(@Param("tenant") Tenant tenant, @Param("month") String month);

    @Query("""
        SELECT va.vendor.id, COUNT(t), SUM(va.vendorAmount)
        FROM Trip t JOIN t.vendorAssignment va
        WHERE t.tenant = :tenant AND t.tripMonth = :month
        GROUP BY va.vendor.id
        """)
    List<Object[]> getVendorReportByMonth(@Param("tenant") Tenant tenant, @Param("month") String month);
}
```

### TripChargesRepository.java
```java
public interface TripChargesRepository extends JpaRepository<TripCharges, Long> {
    Optional<TripCharges> findByTrip(Trip trip);
    Optional<TripCharges> findByTripId(Long tripId);
}
```

### TripPaymentRepository.java
```java
public interface TripPaymentRepository extends JpaRepository<TripPayment, Long> {
    Optional<TripPayment> findByTrip(Trip trip);
    Optional<TripPayment> findByTripId(Long tripId);
}
```

### TripVendorAssignmentRepository.java
```java
public interface TripVendorAssignmentRepository extends JpaRepository<TripVendorAssignment, Long> {
    Optional<TripVendorAssignment> findByTrip(Trip trip);
    Optional<TripVendorAssignment> findByTripId(Long tripId);
    List<TripVendorAssignment> findAllByVendor(TripVendor vendor);
}
```

### TripCustomerRepository.java
```java
public interface TripCustomerRepository extends JpaRepository<TripCustomer, Long> {
    List<TripCustomer> findAllByTenantAndActiveTrue(Tenant tenant);
    boolean existsByTenantAndCompanyName(Tenant tenant, String companyName);
}
```

### TripVendorRepository.java
```java
public interface TripVendorRepository extends JpaRepository<TripVendor, Long> {
    List<TripVendor> findAllByTenantAndActiveTrue(Tenant tenant);
}
```

### TripInvoiceRepository.java
```java
public interface TripInvoiceRepository extends JpaRepository<TripInvoice, Long> {
    List<TripInvoice> findAllByTenantOrderByCreatedAtDesc(Tenant tenant);
    Optional<TripInvoice> findByTenantAndInvoiceNumber(Tenant tenant, String invoiceNumber);
    Long countByTenant(Tenant tenant);
}
```

---

## 9. DTOs

**Package:** `com.example.multi_tanent.trip_management.dto`

### TripRequest.java
```java
public class TripRequest {
    // Core
    @NotNull  private LocalDate tripDate;
    @NotNull  private Long driverId;           // Employee ID from HRMS
    @NotBlank private String containerNumber;
    @NotNull  private Long customerId;
    private String customerRefJobNo;
    private String contactPerson;
    private String customerType;
    @NotBlank private String fromLocation;
    @NotBlank private String toLocation;
    private String remarks;

    // Charges (goes to trip_charges table)
    @NotNull  private BigDecimal amount;
    private BigDecimal tokenAmount;
    private BigDecimal otherCharges;
    private String otherChargeType;            // OtherChargeType enum value

    // Vendor assignment (optional — creates trip_vendor_assignment row if provided)
    private Long vendorId;
    private BigDecimal vendorAmount;

    // Payment info (optional — creates trip_payment row if provided)
    private String receivedBy;
    private String tokenPaymentMethod;
    private String chequeNumber;
    private String otherReference;
}
```

### TripResponse.java (Flattened for API consumers)
```java
public class TripResponse {
    // Core trip fields
    private Long id;
    private Integer tripNo;
    private LocalDate tripDate;
    private String tripMonth;
    private String tripStatus;
    private String containerNumber;
    private String fromLocation;
    private String toLocation;
    private String remarks;
    private OffsetDateTime createdAt;

    // Driver
    private Long driverId;
    private String driverName;

    // Customer
    private Long customerId;
    private String customerName;
    private String customerRefJobNo;
    private String contactPerson;

    // Charges (from trip_charges)
    private BigDecimal amount;
    private BigDecimal tokenAmount;
    private BigDecimal otherCharges;
    private String otherChargeType;
    private BigDecimal vatAmount;
    private BigDecimal totalAmount;
    private BigDecimal driverCommission;

    // Payment (from trip_payment, may be null)
    private String paymentStatus;
    private LocalDate paymentDate;
    private String receivedBy;

    // Vendor (from trip_vendor_assignment, may be null)
    private Long vendorId;
    private String vendorName;
    private BigDecimal vendorAmount;
    private String vendorPaymentStatus;

    // Invoice link (may be null)
    private Long invoiceId;
    private String invoiceNumber;
}
```

### InvoiceCreateRequest.java
```java
public class InvoiceCreateRequest {
    @NotNull  private Long customerId;
    @NotEmpty private List<Long> tripIds;      // Must all be COMPLETED trips
    @NotNull  private LocalDate invoiceDate;
    private String notes;
    // invoiceNumber is auto-generated — do NOT accept from frontend
}
```

### TripStatusUpdateRequest.java
```java
public class TripStatusUpdateRequest {
    @NotNull private TripStatus newStatus;
}
```

### TripPaymentUpdateRequest.java
```java
public class TripPaymentUpdateRequest {
    @NotNull private TripPaymentStatus paymentStatus;
    private LocalDate paymentDate;
    private String receivedBy;
    private String paymentMethod;
    private String chequeNumber;
    private String otherReference;
    private String notes;
}
```

### VendorPaymentUpdateRequest.java
```java
public class VendorPaymentUpdateRequest {
    @NotNull private TripPaymentStatus vendorPaymentStatus;
    private LocalDate vendorPaymentDate;
    private String vendorNotes;
}
```

---

## 10. Controllers

**Package:** `com.example.multi_tanent.trip_management.controller`

### TripController.java — `/api/trips`
```java
@RestController
@RequestMapping("/api/trips")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TripController {
    @PostMapping                              // Create trip + charges + optional vendor
    @GetMapping                              // List all trips
    @GetMapping("/{id}")                     // Single trip (all related data)
    @PutMapping("/{id}")                     // Update core trip + recalc charges
    @DeleteMapping("/{id}")                  // Delete (CREATED status only)
    @PatchMapping("/{id}/status")            // Update lifecycle status
    @PatchMapping("/{id}/payment")           // Update customer payment (trip_payment)
    @PatchMapping("/{id}/vendor-payment")    // Update vendor payment (trip_vendor_assignment)
    @GetMapping("/by-month/{month}")         // e.g. /by-month/JAN
    @GetMapping("/by-driver/{driverId}")
    @GetMapping("/by-customer/{customerId}")
    @GetMapping("/available-for-invoice/{customerId}") // COMPLETED trips not yet invoiced
}
```

### TripCustomerController.java — `/api/trip-customers`
```java
@PostMapping   // Create customer
@GetMapping    // List all active customers for tenant
@GetMapping("/{id}")
@PutMapping("/{id}")
@DeleteMapping("/{id}")  // Soft delete (sets active=false)
```

### TripVendorController.java — `/api/trip-vendors`
```java
@PostMapping
@GetMapping
@GetMapping("/{id}")
@PutMapping("/{id}")
@DeleteMapping("/{id}")
```

### TripInvoiceController.java — `/api/trip-invoices`
```java
@PostMapping           // Create invoice (groups trips, auto-generates invoice number)
@GetMapping            // List all invoices
@GetMapping("/{id}")   // Invoice detail with all trips
@GetMapping("/{id}/pdf") // Download UAE VAT invoice PDF
@PatchMapping("/{id}/payment") // Mark invoice as paid
```

### TripReportController.java — `/api/trip-reports`
```java
@GetMapping("/driver")    // ?month=JAN&year=2025
@GetMapping("/customer")  // ?month=JAN&year=2025
@GetMapping("/vendor")    // ?month=JAN&year=2025
@GetMapping("/summary")   // Monthly P&L: revenue - vendor - commission
```

---

## 11. Security Configuration Update

Open: `com.example.multi_tanent.config.SecurityConfig`

Add these lines **before** the final `.anyRequest().authenticated()` line:

```java
// Trip Management Module
.requestMatchers("/api/trips/**").authenticated()
.requestMatchers("/api/trip-customers/**").authenticated()
.requestMatchers("/api/trip-vendors/**").authenticated()
.requestMatchers("/api/trip-invoices/**").authenticated()
.requestMatchers("/api/trip-reports/**").authenticated()
```

---

## 12. Liquibase Changelogs

**Create folder:** `src/main/resources/db/changelog/trip/`

**Create file:** `001-create-trip-management-schema.xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<databaseChangeLog
    xmlns="http://www.liquibase.org/xml/ns/dbchangelog"
    xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
    xsi:schemaLocation="http://www.liquibase.org/xml/ns/dbchangelog
    http://www.liquibase.org/xml/ns/dbchangelog/dbchangelog-latest.xsd">

    <!-- 1. trip_customers -->
    <changeSet id="trip-001-trip-customers" author="developer">
        <createTable tableName="trip_customers">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tenant_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_tc_tenant" references="tenants(id)"/></column>
            <column name="company_name" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="contact_person" type="VARCHAR(255)"/>
            <column name="phone" type="VARCHAR(50)"/>
            <column name="email" type="VARCHAR(255)"/>
            <column name="trn_number" type="VARCHAR(50)"/>
            <column name="address" type="TEXT"/>
            <column name="customer_type" type="VARCHAR(20)"/>
            <column name="active" type="BOOLEAN" defaultValueBoolean="true"/>
            <column name="created_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
        </createTable>
        <addUniqueConstraint tableName="trip_customers" columnNames="tenant_id,company_name"/>
    </changeSet>

    <!-- 2. trip_vendors -->
    <changeSet id="trip-002-trip-vendors" author="developer">
        <createTable tableName="trip_vendors">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tenant_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_tv_tenant" references="tenants(id)"/></column>
            <column name="company_name" type="VARCHAR(255)"><constraints nullable="false"/></column>
            <column name="contact_person" type="VARCHAR(255)"/>
            <column name="phone" type="VARCHAR(50)"/>
            <column name="active" type="BOOLEAN" defaultValueBoolean="true"/>
            <column name="created_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>

    <!-- 3. trip_invoices -->
    <changeSet id="trip-003-trip-invoices" author="developer">
        <createTable tableName="trip_invoices">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tenant_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_tinv_tenant" references="tenants(id)"/></column>
            <column name="invoice_number" type="VARCHAR(50)"><constraints nullable="false" unique="true"/></column>
            <column name="customer_id" type="BIGINT"><constraints foreignKeyName="fk_tinv_customer" references="trip_customers(id)"/></column>
            <column name="invoice_date" type="DATE"/>
            <column name="sub_total_amount" type="DECIMAL(12,2)"/>
            <column name="total_token_amount" type="DECIMAL(12,2)"/>
            <column name="total_other_charges" type="DECIMAL(12,2)"/>
            <column name="total_vat_amount" type="DECIMAL(12,2)"/>
            <column name="grand_total" type="DECIMAL(12,2)"/>
            <column name="status" type="VARCHAR(20)" defaultValue="DRAFT"/>
            <column name="payment_received_date" type="DATE"/>
            <column name="payment_method" type="VARCHAR(30)"/>
            <column name="cheque_number" type="VARCHAR(100)"/>
            <column name="notes" type="TEXT"/>
            <column name="created_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>

    <!-- 4. trips (core master record) -->
    <changeSet id="trip-004-trips" author="developer">
        <createTable tableName="trips">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="tenant_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_trip_tenant" references="tenants(id)"/></column>
            <column name="trip_no" type="INT"><constraints nullable="false"/></column>
            <column name="trip_date" type="DATE"><constraints nullable="false"/></column>
            <column name="trip_month" type="VARCHAR(10)"/>
            <column name="driver_id" type="BIGINT"><constraints foreignKeyName="fk_trip_driver" references="employees(id)"/></column>
            <column name="container_number" type="VARCHAR(20)"/>
            <column name="customer_id" type="BIGINT"><constraints foreignKeyName="fk_trip_customer" references="trip_customers(id)"/></column>
            <column name="customer_ref_job_no" type="VARCHAR(100)"/>
            <column name="contact_person" type="VARCHAR(255)"/>
            <column name="customer_type" type="VARCHAR(20)"/>
            <column name="from_location" type="VARCHAR(100)"><constraints nullable="false"/></column>
            <column name="to_location" type="VARCHAR(100)"><constraints nullable="false"/></column>
            <column name="trip_status" type="VARCHAR(20)" defaultValue="CREATED"/>
            <column name="invoice_id" type="BIGINT"><constraints foreignKeyName="fk_trip_invoice" references="trip_invoices(id)"/></column>
            <column name="remarks" type="TEXT"/>
            <column name="created_by" type="VARCHAR(255)"/>
            <column name="updated_by" type="VARCHAR(255)"/>
            <column name="created_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
        </createTable>
        <addUniqueConstraint tableName="trips" columnNames="tenant_id,trip_no"/>
    </changeSet>

    <!-- 5. trip_charges (1:1 with trips) -->
    <changeSet id="trip-005-trip-charges" author="developer">
        <createTable tableName="trip_charges">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="trip_id" type="BIGINT"><constraints nullable="false" unique="true" foreignKeyName="fk_tch_trip" references="trips(id)"/></column>
            <column name="amount" type="DECIMAL(10,2)"><constraints nullable="false"/></column>
            <column name="token_amount" type="DECIMAL(10,2)"/>
            <column name="other_charges" type="DECIMAL(10,2)"/>
            <column name="other_charge_type" type="VARCHAR(30)"/>
            <column name="vat_amount" type="DECIMAL(10,2)"/>
            <column name="total_amount" type="DECIMAL(10,2)"/>
            <column name="driver_commission" type="DECIMAL(10,2)"/>
            <column name="created_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>

    <!-- 6. trip_payment (1:1 with trips) -->
    <changeSet id="trip-006-trip-payment" author="developer">
        <createTable tableName="trip_payment">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="trip_id" type="BIGINT"><constraints nullable="false" unique="true" foreignKeyName="fk_tp_trip" references="trips(id)"/></column>
            <column name="payment_status" type="VARCHAR(20)" defaultValue="PENDING"/>
            <column name="payment_date" type="DATE"/>
            <column name="received_by" type="VARCHAR(255)"/>
            <column name="token_payment_method" type="VARCHAR(30)"/>
            <column name="cheque_number" type="VARCHAR(100)"/>
            <column name="other_reference" type="VARCHAR(255)"/>
            <column name="notes" type="TEXT"/>
            <column name="created_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>

    <!-- 7. trip_vendor_assignment (optional 1:1 with trips) -->
    <changeSet id="trip-007-trip-vendor-assignment" author="developer">
        <createTable tableName="trip_vendor_assignment">
            <column name="id" type="BIGINT" autoIncrement="true"><constraints primaryKey="true"/></column>
            <column name="trip_id" type="BIGINT"><constraints nullable="false" unique="true" foreignKeyName="fk_tva_trip" references="trips(id)"/></column>
            <column name="vendor_id" type="BIGINT"><constraints nullable="false" foreignKeyName="fk_tva_vendor" references="trip_vendors(id)"/></column>
            <column name="vendor_amount" type="DECIMAL(10,2)"/>
            <column name="vendor_payment_status" type="VARCHAR(20)" defaultValue="PENDING"/>
            <column name="vendor_payment_date" type="DATE"/>
            <column name="vendor_notes" type="TEXT"/>
            <column name="created_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
            <column name="updated_at" type="TIMESTAMPTZ"><constraints nullable="false"/></column>
        </createTable>
    </changeSet>

</databaseChangeLog>
```

**Then register in** `src/main/resources/db/changelog/db.changelog-tenant.xml` — add after the sales module lines:

```xml
<!-- Trip Management Module -->
<include file="db/changelog/trip/001-create-trip-management-schema.xml"/>
```

---

## 13. Complete API Endpoint Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/trip-customers` | Create transport customer |
| GET | `/api/trip-customers` | List all active customers |
| GET | `/api/trip-customers/{id}` | Get customer |
| PUT | `/api/trip-customers/{id}` | Update customer |
| DELETE | `/api/trip-customers/{id}` | Deactivate customer |
| POST | `/api/trip-vendors` | Create vendor |
| GET | `/api/trip-vendors` | List all active vendors |
| PUT | `/api/trip-vendors/{id}` | Update vendor |
| DELETE | `/api/trip-vendors/{id}` | Deactivate vendor |
| POST | `/api/trips` | Create trip (+ charges + optional vendor) |
| GET | `/api/trips` | List all trips |
| GET | `/api/trips/{id}` | Get trip (all related data flattened) |
| PUT | `/api/trips/{id}` | Update trip + recalculate charges |
| DELETE | `/api/trips/{id}` | Delete (CREATED status only) |
| PATCH | `/api/trips/{id}/status` | Change lifecycle status |
| PATCH | `/api/trips/{id}/payment` | Update customer payment |
| PATCH | `/api/trips/{id}/vendor-payment` | Update vendor payment |
| GET | `/api/trips/by-month/{month}` | Filter by month (JAN, FEB…) |
| GET | `/api/trips/by-driver/{driverId}` | Filter by driver |
| GET | `/api/trips/by-customer/{customerId}` | Filter by customer |
| GET | `/api/trips/available-for-invoice/{customerId}` | COMPLETED uninvoiced trips |
| POST | `/api/trip-invoices` | Create invoice (groups trips) |
| GET | `/api/trip-invoices` | List all invoices |
| GET | `/api/trip-invoices/{id}` | Invoice + all trip lines |
| GET | `/api/trip-invoices/{id}/pdf` | Download UAE VAT invoice PDF |
| PATCH | `/api/trip-invoices/{id}/payment` | Mark invoice as paid |
| GET | `/api/trip-reports/driver?month=JAN` | Driver report |
| GET | `/api/trip-reports/customer?month=JAN` | Customer report |
| GET | `/api/trip-reports/vendor?month=JAN` | Vendor report |
| GET | `/api/trip-reports/summary?month=JAN` | Monthly P&L |

---

## 14. Table Summary

| Table | Always Created? | Purpose |
|---|---|---|
| `trip_customers` | Master data | Transport logistics customers |
| `trip_vendors` | Master data | Outsource transport companies |
| `trip_invoices` | On invoicing | UAE VAT tax invoices |
| `trips` | ✅ Every trip | Core: identity, route, status |
| `trip_charges` | ✅ Every trip | Financials (amount, VAT, total, commission) |
| `trip_payment` | When payment recorded | Customer payment tracking |
| `trip_vendor_assignment` | Only if outsourced | Vendor outsource details |

---

## 15. Important Notes for Developer

1. **`ddl-auto=none`** — Never auto-create tables. Use Liquibase only.
2. **Tenant scope** — Every query must filter by tenant. Never leak data across tenants.
3. **No manual calculations** — VAT, total, commission are always set by service. Reject frontend values.
4. **Driver = Employee** — Use `employee.getName()` helper (`firstName + lastName`). No separate driver table.
5. **Token is 0% VAT** — Only `amount + otherCharges` attract 5% UAE VAT.
6. **Vendor assignment is optional** — Only create `trip_vendor_assignment` row if `vendorId` is provided.
7. **Cascade saves** — When saving a trip, also save `TripCharges` in same transaction.
8. **Invoice groups trips** — Validate all tripIds belong to same tenant + customer + have COMPLETED status.
9. **All amounts** — Use `BigDecimal`. Never `double` or `float`.
10. **TenantContext** — Call `TenantContext.getTenantId()` (package: `com.example.multi_tanent.config`). Already set by `TenantFilter` on each request.
11. **Lombok** — Use `@Getter @Setter @Builder @NoArgsConstructor @AllArgsConstructor` on all entities.
12. **Timestamps** — Use `@CreationTimestamp` and `@UpdateTimestamp` from Hibernate (consistent with existing code).
