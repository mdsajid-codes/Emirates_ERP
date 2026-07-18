# GTR Service — System Design Architecture Document

> **Project:** GTR Service ERP Platform  
> **Stack:** Java 21 · Spring Boot 3.5 · React + Vite · MySQL · Liquibase · JWT  
> **Pattern:** Multi-Tenant SaaS (Schema-per-Tenant over separate databases)

---

## Table of Contents

1. [HLD — High Level Design](#1-hld--high-level-design)
2. [LLD — Low Level Design](#2-lld--low-level-design)
3. [Tenant Flow Diagrams](#3-tenant-flow-diagrams)
4. [Database Architecture](#4-database-architecture)
5. [Request Lifecycle](#5-request-lifecycle)
6. [Authentication Flow](#6-authentication-flow)
7. [ERP Module Design](#7-erp-module-design)
8. [Multi-Tenant Spring Boot Implementation](#8-multi-tenant-spring-boot-implementation)
9. [Sequence Diagrams](#9-sequence-diagrams)
10. [Technology Stack Summary](#10-technology-stack-summary)

---

## 1. HLD — High Level Design

### 1.1 System Context

The GTR Service platform is a **multi-tenant SaaS ERP** where multiple companies (tenants) share one deployed application instance but each have **completely isolated databases**.

```
┌─────────────────────────────────────────────────────────────────┐
│                        INTERNET                                 │
└────────────────┬────────────────────────────────────────────────┘
                 │ HTTPS
    ┌────────────▼──────────────┐
    │    React SPA (Vite)       │  ← Single Page Application
    │    Port 5173 (dev)        │    served from Spring Boot
    │    /frontend/src          │    static resources in prod
    └────────────┬──────────────┘
                 │ REST API  (Bearer JWT)
                 │ Header: X-Tenant-ID embedded in token
    ┌────────────▼──────────────────────────────────────┐
    │          Spring Boot 3.5 Application              │
    │          Port 8080                                │
    │                                                   │
    │  ┌─────────────────────────────────────────────┐  │
    │  │           Filter Chain                      │  │
    │  │  SpaRedirectFilter → JwtAuthFilter          │  │
    │  │  → TenantRoutingDataSource resolution       │  │
    │  └─────────────────────────────────────────────┘  │
    │                                                   │
    │  ┌──────────────┐    ┌────────────────────────┐   │
    │  │  Master EMF  │    │    Tenant EMF          │   │
    │  │  (masterTx)  │    │    (tenantTx)          │   │
    │  └──────┬───────┘    └───────────┬────────────┘   │
    └─────────┼───────────────────────┼────────────────┘
              │                       │
    ┌─────────▼──────┐     ┌──────────▼──────────────────┐
    │   master_db    │     │  tenant_companyA_db          │
    │  (shared meta) │     │  tenant_companyB_db          │
    │                │     │  tenant_companyC_db  ...     │
    └────────────────┘     └─────────────────────────────┘
```

### 1.2 Key Architectural Decisions

| Decision | Choice | Why |
|---|---|---|
| Multi-tenancy strategy | Database-per-tenant | Full data isolation, no cross-tenant query risk |
| Connection routing | `AbstractRoutingDataSource` | Spring-native, no extra framework needed |
| Tenant identification | JWT claim `tenantId` | Stateless, no session needed |
| Schema migration | Liquibase with contexts | Only deploy modules a tenant subscribes to |
| Frontend hosting | Served by Spring Boot static | Single deployable JAR |
| Auth | JWT (HMAC-SHA256) | Stateless, scalable |

---

## 2. LLD — Low Level Design

### 2.1 Package Structure

```
com.example.multi_tanent/
│
├── config/                          ← All infrastructure beans
│   ├── MasterDataSourceConfig.java  ← Master DB (Hikari + JPA)
│   ├── MultiTenantDataSourceConfig  ← Tenant DB (Routing + JPA)
│   ├── TenantContext.java           ← ThreadLocal tenant holder
│   ├── TenantRoutingDataSource.java ← AbstractRoutingDataSource
│   ├── TenantRegistry.java          ← ConcurrentHashMap of DataSources
│   ├── TenantBootstrap.java         ← Loads all tenants at startup
│   ├── TenantSchemaCreator.java     ← Liquibase schema provisioning
│   ├── TenantLiquibaseService.java  ← Runs Liquibase programmatically
│   ├── SecurityConfig.java          ← Spring Security filter chain
│   └── AppStartupRunner.java        ← Post-startup hooks
│
├── security/
│   ├── JwtUtil.java                 ← Token generation & parsing
│   └── JwtAuthFilter.java           ← OncePerRequestFilter → sets TenantContext
│
├── master/                          ← Master DB entities & repos
│   ├── entity/MasterTenant.java
│   └── repository/MasterTenantRepository.java
│
├── accounts/   crm/   fleet/   hanger/   materials/
├── pos/        production/   purchases/   sales/
├── warehouse/  fixedasset/   project_management/
└── tenant/     (HRMS: employee, attendance, leave, payroll, recruitment)
```

### 2.2 Dual EntityManager Design

This is the core LLD decision. The system runs **two separate JPA contexts simultaneously:**

```
masterEmf  ──────► masterDataSource  (fixed: master_db)
                    Repositories: master.repository.*

tenantEmf  ──────► tenantRoutingDataSource  (dynamic: switches per request)
   @Primary         Repositories: ALL business modules
```

**Why `@Primary` on `tenantEmf`?**  
All business repositories auto-wire to `tenantEmf`. Only `master.repository` uses `masterEmf` (declared via `@EnableJpaRepositories(..., entityManagerFactoryRef="masterEmf")`).

### 2.3 TenantContext — ThreadLocal Isolation

```java
public class TenantContext {
    private static final ThreadLocal<String> CURRENT_TENANT = new ThreadLocal<>();
    // set → get → clear   (lifecycle = one HTTP request thread)
}
```

**Critical:** `TenantContext.clear()` is called in the `finally` block of `JwtAuthFilter` — this prevents tenant ID from leaking between requests in the thread pool.

---

## 3. Tenant Flow Diagrams

### 3.1 Tenant Provisioning Flow

```
SuperAdmin
    │
    ▼
POST /api/provision  {companyName, modules: [HRMS, CRM, FLEET], jdbcUrl, ...}
    │
    ▼
MasterTenantController
    │
    ▼
MasterTenantService.createTenant()
    │   saves MasterTenant row → master_db.master_tenant
    │
    ▼
TenantRegistry.addOrUpdateTenant(masterTenant)
    │
    ├──► HikariDataSource ds = new HikariDataSource()
    │    ds.setJdbcUrl(tenant.jdbcUrl + "?createDatabaseIfNotExist=true")
    │
    ├──► TenantSchemaCreator.ensureSchema(ds, tenant)
    │       │
    │       ├── Step 1: Liquibase runUpdate(contexts=[HRMS,CRM,FLEET])
    │       │           → only runs changesets tagged with those contexts
    │       ├── Step 2: migrateData() → seeds tenants table, migrates users
    │       ├── Step 3: Liquibase runUpdate() again → applies NOT NULL constraints
    │       └── Step 4: fixDeliveryOrderForeignKey() + fixInventoryTableSchema()
    │
    ├──► map.put(tenantId, ds)
    │
    └──► TenantRoutingDataSource.setTargetDataSources(map)
         → refreshed live, no restart needed
```

### 3.2 Application Startup — Tenant Loading

```
Spring Boot starts
    │
    ▼
ManualLiquibaseRunner  → runs master_db migrations first
    │
    ▼
MasterDataSourceConfig → masterEmf ready
    │
    ▼
TenantBootstrap (ApplicationRunner)
    │
    ├── registry.attachRouting(tenantRoutingDataSource)
    │
    └── registry.loadAllFromMaster()
            │
            └── For each row in master_tenant:
                    addOrUpdateTenant(t)
                    → HikariDataSource created
                    → ensureSchema() called  (Liquibase migrations)
                    → routing map updated
```

---

## 4. Database Architecture

### 4.1 Two-Database Strategy

```
┌──────────────────────────────────────────┐
│              master_db                   │
│  (One database for the entire platform)  │
│                                          │
│  Tables:                                 │
│  ├── master_tenant  ← all companies      │
│  ├── master_users   ← superadmin users   │
│  ├── service_modules ← module catalog    │
│  └── tenant_requests ← signup requests   │
└──────────────────────────────────────────┘

┌──────────────────────────────────────────┐
│         tenant_companyA_db               │
│  (Isolated per tenant)                   │
│                                          │
│  Core tables (always present):           │
│  ├── tenants, users, roles               │
│  ├── company_info, locations             │
│                                          │
│  Module tables (context-driven):         │
│  ├── [HRMS]    employees, attendance,    │
│  │             leaves, payroll, ...      │
│  ├── [CRM]     contacts, leads,          │
│  │             follow_ups, ...           │
│  ├── [FLEET]   vehicles, drivers,        │
│  │             trips, dispatch_board...  │
│  ├── [POS]     products, orders,         │
│  │             pos_sessions, ...         │
│  ├── [SALES]   quotations, invoices,     │
│  │             delivery_orders, ...      │
│  ├── [PURCHASES] purchase_orders, GRN   │
│  ├── [WAREHOUSE] inventory, racks, ...  │
│  ├── [ACCOUNTS] journal_entries, GL...  │
│  ├── [FIXED_ASSET] assets, depreciation │
│  └── [PRODUCTION] work_orders, BOM ...  │
└──────────────────────────────────────────┘
```

### 4.2 Liquibase Context-Driven Migration

```
db/changelog/db.changelog-tenant.xml
    │
    ├── 001-core-schema.xml          (no context → always runs)
    ├── 010-create-hrms-schema.xml   context="HRMS"
    ├── 020-create-crm-schema.xml    context="CRM"
    ├── 030-create-fleet-schema.xml  context="FLEET"
    ├── 040-create-pos-schema.xml    context="POS"
    ├── 050-create-sales-schema.xml  context="SALES"
    ├── ...
    └── 114-seed-crm-templates.xml   context="CRM"
```

When `TenantLiquibaseService.runUpdate()` is called:
```java
String contextStr = tenant.getServiceModules()
    .stream().map(Enum::name).collect(joining(","));
// e.g. "HRMS,CRM,FLEET"
liquibase.update(new Contexts(contextStr), new LabelExpression());
```
Only changesets whose `context` matches are executed.

### 4.3 Connection Pooling

Each tenant gets its own **HikariCP connection pool**:
```
TenantRegistry.map =  ConcurrentHashMap<String, DataSource>
    "company_a"  →  HikariDataSource (pool to companyA DB)
    "company_b"  →  HikariDataSource (pool to companyB DB)
    "company_c"  →  HikariDataSource (pool to companyC DB)
```

---

## 5. Request Lifecycle

### 5.1 Full Request Flow (Authenticated)

```
Browser  →  GET /api/fleet/vehicles
              Authorization: Bearer eyJhb...
                 │
    ┌────────────▼─────────────────────────────────────┐
    │  1. SpaRedirectFilter                            │
    │     path starts with /api → pass through        │
    └────────────┬─────────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────────┐
    │  2. JwtAuthFilter (OncePerRequestFilter)         │
    │     a. Extract Bearer token from Authorization   │
    │     b. JwtUtil.parse(token) → Claims             │
    │     c. claims.get("tenantId") = "company_a"      │
    │     d. TenantContext.setTenantId("company_a")    │  ← ThreadLocal set
    │     e. Build UsernamePasswordAuthenticationToken │
    │     f. SecurityContextHolder.setAuthentication() │
    └────────────┬─────────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────────┐
    │  3. Spring Security Authorization Check          │
    │     /api/fleet/** → .authenticated() → PASS      │
    └────────────┬─────────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────────┐
    │  4. DispatcherServlet → VehicleController        │
    │     calls VehicleRepository.findAll()            │
    └────────────┬─────────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────────┐
    │  5. tenantEmf → TenantRoutingDataSource          │
    │     determineCurrentLookupKey()                  │
    │     → TenantContext.getTenantId() = "company_a"  │
    │     → returns HikariDataSource for company_a     │
    └────────────┬─────────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────────┐
    │  6. SQL executes on company_a DB                 │
    │     SELECT * FROM `vehicles`  (company_a schema) │
    └────────────┬─────────────────────────────────────┘
                 │
    ┌────────────▼─────────────────────────────────────┐
    │  7. Response returned as JSON                    │
    │  8. JwtAuthFilter finally block:                 │
    │     TenantContext.clear()  ← ThreadLocal cleaned │
    └──────────────────────────────────────────────────┘
```

### 5.2 Public Endpoint Flow (No Auth)

```
POST /api/auth/login  {username, password, tenantId}
    │
    ▼  (SecurityConfig: .requestMatchers("/api/auth/login").permitAll())
    │
    ▼  JwtAuthFilter: no Bearer token → skips tenant setup
    │
    ▼  AuthController.login()
       → Loads user from tenant DB (tenantId passed as request param)
       → TenantContext.setTenantId(tenantId)  ← set manually for this one call
       → BCrypt.matches(password, hash)
       → JwtUtil.generateToken(username, tenantId, roles)
       → returns { token: "eyJhb..." }
```

---

## 6. Authentication Flow

### 6.1 JWT Token Structure

```
Header:  { alg: "HS256", typ: "JWT" }
Payload: {
    sub:      "john.doe",          ← username
    tenantId: "company_a",         ← CRITICAL for routing
    roles:    ["ADMIN", "FLEET"],  ← for @PreAuthorize
    iat:      1716000000,
    exp:      1716086400           ← 24 hours (configurable)
}
Signature: HMAC-SHA256(secret)
```

### 6.2 JWT Generation

```java
// JwtUtil.generateToken()
return Jwts.builder()
    .setSubject(username)
    .claim("tenantId", tenantId)    // ← tenant embedded in token
    .claim("roles", roles)
    .setIssuedAt(now)
    .setExpiration(expiryDate)
    .signWith(key, SignatureAlgorithm.HS256)
    .compact();
```

### 6.3 Role-Based Access

```java
// SecurityConfig — role-specific endpoints
.requestMatchers("/api/provision").hasRole("MASTER_ADMIN")
.requestMatchers("/api/master/tenants/**").hasRole("MASTER_ADMIN")
.requestMatchers("/api/**").authenticated()

// Method level (on controllers)
@PreAuthorize("hasRole('ADMIN')")
public ResponseEntity<?> sensitiveOperation() { ... }
```

### 6.4 Two Auth Realms

| Realm | Login Endpoint | User Store | Roles |
|---|---|---|---|
| **Master Admin** | `/api/master/auth/login` | `master_db.master_users` | `MASTER_ADMIN` |
| **Tenant User** | `/api/auth/login` | `tenant_X_db.users` | `ADMIN`, `FLEET`, `HR`, etc. |

---

## 7. ERP Module Design

### 7.1 Module Catalog

| Module | Context Tag | Key Entities | Key Features |
|---|---|---|---|
| **HRMS** | `HRMS` | Employee, Attendance, Leave, Payroll | Biometric integration, payslips |
| **CRM** | `CRM` | Contact, Lead, FollowUp, RentalQuotation | Pipeline, reminders, email templates |
| **Fleet** | `FLEET` | Vehicle, Driver, Trip, DispatchBoard | Dispatch scheduling, POD upload |
| **POS** | `POS` | Product, PosOrder, PosSession | Point-of-sale, QR codes |
| **Sales** | `SALES` | Quotation, Invoice, DeliveryOrder | PDF generation, status tracking |
| **Purchases** | `PURCHASES` | PurchaseOrder, GRN, Supplier | Approval workflow |
| **Warehouse** | `WAREHOUSE` | Inventory, Rack, StockMovement | Storage assignment |
| **Accounts** | `ACCOUNTS` | JournalEntry, GLAccount, Trial Balance | Double-entry bookkeeping |
| **Fixed Asset** | `FIXED_ASSET` | Asset, Depreciation, AssetCategory | Depreciation schedules |
| **Production** | `PRODUCTION` | WorkOrder, BOM, ProductionRun | Hanger manufacturing flow |
| **Materials** | `MATERIALS` | MaterialRequisition, ItemMaster | Procurement requests |
| **Project Mgmt** | `PROJECT` | Project, Task, Milestone | Project tracking |

### 7.2 Standard Module Layer Pattern

Every module follows this identical layered pattern:

```
Controller  →  Service  →  Repository  →  Entity
   (REST)      (logic)       (JPA)       (MySQL table)
                 ↓
              DTO/Mapper   ← never expose entity directly
```

**Example — Fleet Module:**
```
fleet/
├── controller/
│   ├── VehicleController.java       GET/POST/PUT /api/fleet/vehicles
│   ├── TripCustomerController.java  GET/POST     /api/fleet/trips
│   └── DispatchBoardController.java
├── service/
│   ├── VehicleService.java
│   └── TripService.java
├── repository/
│   ├── VehicleRepository.java       extends JpaRepository<Vehicle, Long>
│   └── TripCustomerRepository.java
├── entity/
│   ├── Vehicle.java                 @Entity @Table(name="vehicles")
│   └── TripCustomer.java
└── dtos/
    └── ReportDashboardDataDTO.java  ← projection for dashboard aggregates
```

---

## 8. Multi-Tenant Spring Boot Implementation

### 8.1 The Five Core Classes

| Class | Role |
|---|---|
| `TenantContext` | Stores current `tenantId` in `ThreadLocal<String>` |
| `TenantRoutingDataSource` | Extends `AbstractRoutingDataSource`, returns `tenantId` as lookup key |
| `TenantRegistry` | `ConcurrentHashMap<tenantId, HikariDataSource>` — live connection pool map |
| `TenantBootstrap` | `ApplicationRunner` — loads all tenants from master DB at startup |
| `TenantSchemaCreator` | Runs Liquibase + data migration for each tenant |

### 8.2 How AbstractRoutingDataSource Works

```java
// TenantRoutingDataSource.java
public class TenantRoutingDataSource extends AbstractRoutingDataSource {
    @Override
    protected Object determineCurrentLookupKey() {
        return TenantContext.getTenantId();  // returns "company_a"
        // Spring then looks up: targetDataSources.get("company_a")
    }
}
```

`AbstractRoutingDataSource` is a Spring class that acts as a **proxy DataSource**. On every JDBC call, it calls `determineCurrentLookupKey()` to decide which real `DataSource` to delegate to.

### 8.3 Dynamic Tenant Registration (Live — No Restart)

```java
// TenantRegistry.addOrUpdateTenant()
public synchronized void addOrUpdateTenant(MasterTenant t) {
    HikariDataSource ds = new HikariDataSource();
    ds.setJdbcUrl(t.getJdbcUrl() + "?createDatabaseIfNotExist=true");
    ds.setUsername(t.getUsername());
    ds.setPassword(t.getPassword());

    schemaCreator.ensureSchema(ds, t);   // run Liquibase

    map.put(t.getTenantId(), ds);
    refreshRouting();                    // update routing map live
}

private void refreshRouting() {
    routing.setTargetDataSources(asTargetMap());
    routing.afterPropertiesSet();        // Spring refreshes internal cache
}
```

### 8.4 Hibernate Configuration for Tenant EMF

```java
Properties p = new Properties();
p.put("hibernate.hbm2ddl.auto", "none");              // Liquibase handles DDL
p.put("hibernate.boot.allow_jdbc_metadata_access", "false"); // no DB at startup
p.put("hibernate.dialect", "org.hibernate.dialect.MySQL8Dialect");
p.put("hibernate.globally_quoted_identifiers", "true"); // safe for reserved words
```

`hbm2ddl.auto=none` is critical — Hibernate must never modify tenant schemas. Liquibase is the sole schema authority.

---

## 9. Sequence Diagrams

### 9.1 Login Sequence

```
Client          AuthController      UserRepository      JwtUtil
  │                  │                   │                │
  │──POST /login────►│                   │                │
  │  {user,pass,     │                   │                │
  │   tenantId}      │                   │                │
  │                  │──setTenantId()    │                │
  │                  │  (tenantId)       │                │
  │                  │                   │                │
  │                  │──findByUsername──►│                │
  │                  │◄──User entity─────│                │
  │                  │                   │                │
  │                  │──BCrypt.matches() │                │
  │                  │                   │                │
  │                  │──generateToken(username,tenantId,roles)─►│
  │                  │◄──JWT string────────────────────────│
  │                  │                   │                │
  │◄─200 {token}─────│                   │                │
```

### 9.2 Authenticated API Request Sequence

```
Client       JwtAuthFilter    TenantRoutingDS   VehicleRepo    MySQL(companyA)
  │               │                 │               │               │
  │─GET /vehicles►│                 │               │               │
  │  Bearer JWT   │                 │               │               │
  │               │─parse(token)    │               │               │
  │               │─setTenantId     │               │               │
  │               │  ("company_a")  │               │               │
  │               │─chain.doFilter()│               │               │
  │               │                 │               │               │
  │               │         ─determineKey()──►"company_a"           │
  │               │         ◄─HikariDS(companyA)──                  │
  │               │                 │               │               │
  │               │                 │─findAll()────►│               │
  │               │                 │               │─SELECT * ────►│
  │               │                 │               │◄─rows─────────│
  │               │                 │               │               │
  │◄─200 [...]────│◄────────────────│◄──────────────│               │
  │               │                 │               │               │
  │               │─TenantContext   │               │               │
  │               │  .clear() ◄─finally block       │               │
```

### 9.3 Tenant Provisioning Sequence

```
MasterAdmin   ProvisionController   TenantRegistry   SchemaCreator   Liquibase
     │               │                   │               │               │
     │─POST /provision►│                  │               │               │
     │                 │─save MasterTenant│               │               │
     │                 │─addOrUpdateTenant►│               │               │
     │                 │                  │─new Hikari()  │               │
     │                 │                  │─ensureSchema()►│               │
     │                 │                  │               │─runUpdate()──►│
     │                 │                  │               │  contexts=    │
     │                 │                  │               │  [HRMS,CRM]   │
     │                 │                  │               │◄─done─────────│
     │                 │                  │               │─migrateData() │
     │                 │                  │               │─runUpdate()──►│
     │                 │                  │               │◄─done─────────│
     │                 │                  │◄──success─────│               │
     │                 │                  │─map.put(id,ds)│               │
     │                 │                  │─refreshRouting│               │
     │◄─201 Created────│◄─────────────────│               │               │
```

---

## 10. Technology Stack Summary

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Language | Java | 21 | LTS, records, pattern matching |
| Framework | Spring Boot | 3.5.5 | Core application framework |
| Security | Spring Security + JJWT | latest + 0.11.5 | Auth, filter chain |
| ORM | Hibernate / Spring Data JPA | 6.x | Data access layer |
| Migration | Liquibase | (spring-managed) | Schema version control |
| Connection Pool | HikariCP | (spring-managed) | Per-tenant DB pools |
| Database | MySQL | 8.x | Relational data store |
| PDF | iText 7 + OpenPDF | 7.2.5 + 1.3.41 | Report generation |
| Excel | Apache POI | 5.2.3 | Export to XLSX |
| QR Code | ZXing | 3.5.1 | POS QR generation |
| API Docs | SpringDoc OpenAPI | 2.5.0 | Swagger UI |
| Frontend | React + Vite | latest | SPA |
| HTTP Client | Axios (React) | — | API calls |
| Build | Maven | 3.x | Backend build |
| Code Gen | Lombok | 1.18.30 | Boilerplate reduction |

---

## Key Architectural Insights

> **Insight 1 — ThreadLocal is the backbone of multi-tenancy.**  
> Every request carries its `tenantId` in a `ThreadLocal`. Every JPA query automatically goes to the right database because of this. The `finally` block clear is **non-negotiable** — missing it causes tenant data leaks.

> **Insight 2 — Liquibase contexts = module subscription system.**  
> A tenant with `[HRMS, CRM]` only gets HRMS and CRM tables. This is not just migration management — it IS the module gating system. Adding a new module means adding a new Liquibase changeset with the right context.

> **Insight 3 — No restart needed for new tenants.**  
> `TenantRegistry.refreshRouting()` calls `AbstractRoutingDataSource.afterPropertiesSet()` at runtime, updating the internal `DataSource` map live. New companies can be provisioned while the system is running.

> **Insight 4 — Hibernate must never own DDL.**  
> `hbm2ddl.auto=none` + `allow_jdbc_metadata_access=false` ensures Hibernate does not inspect or modify any database at startup. This is mandatory when using `AbstractRoutingDataSource` because at startup, no tenant is set in `ThreadLocal`, so any DB access would fail or go to the wrong source.
