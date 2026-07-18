// com/example/multi_tanent/config/TenantRegistry.java
package com.example.multi_tanent.config;

import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.stereotype.Component;

import com.example.multi_tanent.crm.services.CrmDefaultRoleSeeder;
import com.example.multi_tanent.ats.services.AtsDefaultDegreeSeeder;
import javax.sql.DataSource;
import java.util.*;
import java.util.concurrent.*;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class TenantRegistry {

  private final MasterTenantRepository masterRepo;
  private final TenantSchemaCreator schemaCreator;
  private final CrmDefaultRoleSeeder defaultRoleSeeder;
  private final AtsDefaultDegreeSeeder defaultDegreeSeeder;

  // Thread-safe map: stores the active DataSource for each tenantId
  private final ConcurrentHashMap<String, DataSource> map = new ConcurrentHashMap<>();
  private TenantRoutingDataSource routing;

  public TenantRegistry(MasterTenantRepository masterRepo, TenantSchemaCreator schemaCreator,
                        CrmDefaultRoleSeeder defaultRoleSeeder, AtsDefaultDegreeSeeder defaultDegreeSeeder) {
    this.masterRepo = masterRepo;
    this.schemaCreator = schemaCreator;
    this.defaultRoleSeeder = defaultRoleSeeder;
    this.defaultDegreeSeeder = defaultDegreeSeeder;
  }

  public void attachRouting(TenantRoutingDataSource routing) {
    this.routing = routing;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // PARALLEL LOADING — called once at startup from TenantBootstrap
  //
  // How it works:
  //   1. Fetch all tenants from master DB (one SQL query)
  //   2. For each tenant, launch a Virtual Thread that runs ALL the heavy work:
  //        - Build HikariDataSource
  //        - Run Liquibase migrations
  //        - Seed CRM roles + ATS degrees
  //   3. Wait for ALL threads to finish (CompletableFuture.allOf)
  //   4. Do ONE single refreshRouting() at the very end
  //
  // Time with 50 tenants:
  //   Sequential (before): 50 x 8s = 400 seconds
  //   Parallel   (after) : max(8s, 8s, 8s ...) = ~10-15 seconds  [OK]
  // ─────────────────────────────────────────────────────────────────────────
  public void loadAllFromMaster() {
    List<MasterTenant> tenants = masterRepo.findAll();

    if (tenants.isEmpty()) {
      System.out.println("⚠️  No tenants found in master_tenant table.");
      return;
    }

    System.out.println("🚀 Starting PARALLEL load of " + tenants.size() + " tenants...");
    long startTime = System.currentTimeMillis();

    // Java 21 Virtual Thread executor — one lightweight virtual thread per tenant
    // Virtual Threads are perfect here: they block on I/O (Liquibase SQL) without
    // wasting OS threads. 50 virtual threads = near zero OS overhead.
    ExecutorService virtualThreadExecutor = Executors.newVirtualThreadPerTaskExecutor();

    AtomicInteger successCount = new AtomicInteger(0);
    AtomicInteger failCount    = new AtomicInteger(0);

    // Launch one async task per tenant — ALL run simultaneously
    List<CompletableFuture<Void>> futures = tenants.stream()
        .map(tenant -> CompletableFuture.runAsync(
            () -> loadSingleTenantAsync(tenant, successCount, failCount),
            virtualThreadExecutor
        ))
        .toList();

    // Block until ALL tenants have finished (or failed)
    CompletableFuture.allOf(futures.toArray(new CompletableFuture[0])).join();

    // Final refresh routing to ensure all contexts are updated correctly
    refreshRouting();

    long elapsed = System.currentTimeMillis() - startTime;
    System.out.printf("✅ Parallel tenant load complete: %d succeeded, %d failed in %dms%n",
        successCount.get(), failCount.get(), elapsed);

    virtualThreadExecutor.shutdown();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // SINGLE TENANT ASYNC LOADER
  //
  // Runs on its own Virtual Thread. Does the heavy I/O work:
  //   Step 1 — Build HikariDataSource (network connection to tenant DB)
  //   Step 2 — Run Liquibase schema migrations   (slowest: ~3-8 seconds)
  //   Step 3 — Seed default data (CRM roles, ATS degrees)
  //   Step 4 — Register in the shared ConcurrentHashMap
  //
  // IMPORTANT — TenantContext (ThreadLocal):
  //   ThreadLocal values do NOT propagate to child threads automatically.
  //   We MUST call TenantContext.setTenantId() on THIS virtual thread before
  //   calling any service that reads TenantContext (seeders do this internally).
  //   We MUST call TenantContext.clear() in finally to avoid ThreadLocal leaks.
  // ─────────────────────────────────────────────────────────────────────────
  private void loadSingleTenantAsync(MasterTenant t, AtomicInteger successCount, AtomicInteger failCount) {
    String tenantId = t.getTenantId();

    // STEP 1: Build HikariDataSource
    HikariDataSource ds;
    try {
      ds = buildDataSource(t);
    } catch (Exception e) {
      System.err.printf("❌ [%s] Failed to build DataSource: %s%n", tenantId, e.getMessage());
      failCount.incrementAndGet();
      return;
    }

    // STEP 2: Liquibase migrations — runs in parallel on each virtual thread
    try {
      schemaCreator.ensureSchema(ds, t);
      System.out.printf("✅ [%s] Schema migrated%n", tenantId);
    } catch (Exception e) {
      System.err.printf("❌ [%s] Schema migration failed: %s%n", tenantId, e.getMessage());
      // Don't return — still register the tenant so requests get proper DB errors
    }

    // STEP 3: Register in shared map FIRST, and refresh routing
    // This is required before seeding because JPA (TenantRoutingDataSource)
    // needs the new DataSource to be in the resolved data sources to open transactions.
    DataSource oldDs = map.put(tenantId, ds);
    if (oldDs instanceof HikariDataSource old) {
      old.close(); // close previous pool if this is a reload
    }
    refreshRouting(); // synchronize and update routing table immediately
    System.out.printf("✅ [%s] Registered in routing map%n", tenantId);

    // STEP 4: Seed default data
    // TenantContext is ThreadLocal — MUST set explicitly on this virtual thread
    try {
      TenantContext.setTenantId(tenantId);

      defaultRoleSeeder.seedForCurrentTenant();
      System.out.printf("✅ [%s] CRM roles seeded%n", tenantId);

      defaultDegreeSeeder.seedForCurrentTenant();
      System.out.printf("✅ [%s] ATS degrees seeded%n", tenantId);

    } catch (Exception e) {
      System.err.printf("❌ [%s] Seeding failed: %s%n", tenantId, e.getMessage());
    } finally {
      TenantContext.clear(); // MUST clear on THIS thread — prevents ThreadLocal memory leak
    }

    successCount.incrementAndGet();
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RUNTIME ADD/UPDATE — called from admin API when a new tenant is provisioned
  // e.g., POST /api/master/tenants triggers this
  // Still synchronized for individual adds (no concurrent admin adds expected)
  // ─────────────────────────────────────────────────────────────────────────
  public synchronized void addOrUpdateTenant(MasterTenant t) {
    AtomicInteger s = new AtomicInteger();
    AtomicInteger f = new AtomicInteger();
    loadSingleTenantAsync(t, s, f);
    refreshRouting(); // refresh routing right away for single adds
  }

  public synchronized void removeTenant(String tenantId) {
    DataSource ds = map.remove(tenantId);
    if (ds instanceof HikariDataSource h) h.close();
    refreshRouting();
  }

  public Map<Object, Object> asTargetMap() {
    return new HashMap<>(map);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // HELPERS
  // ─────────────────────────────────────────────────────────────────────────

  private HikariDataSource buildDataSource(MasterTenant t) {
    HikariDataSource ds = new HikariDataSource();

    String url = t.getJdbcUrl();
    if (url != null && !url.contains("createDatabaseIfNotExist")) {
      url += url.contains("?")
          ? "&createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true"
          : "?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true";
    }

    ds.setPoolName("HikariPool-" + t.getTenantId()); // named pools → easier to debug in logs
    ds.setJdbcUrl(url);
    ds.setUsername(t.getUsername());
    ds.setPassword(t.getPassword());

    ds.setMaximumPoolSize(3);         // 50 tenants x 3 = 150 connections (under MySQL 151 limit)
    ds.setMinimumIdle(1);             // Release idle connections quickly to save MySQL slots
    ds.setConnectionTimeout(30_000);  // 30s max wait before failing
    ds.setIdleTimeout(600_000);       // 10 min before closing idle connections
    ds.setMaxLifetime(1_800_000);     // 30 min max connection lifetime
    ds.setKeepaliveTime(60_000);      // 1 min ping to prevent MySQL from closing idle connections

    return ds;
  }

  // Called ONCE after all parallel work is done.
  // synchronized so no concurrent routing state corruption.
  private synchronized void refreshRouting() {
    if (routing == null) return;
    routing.setTargetDataSources(asTargetMap());
    routing.afterPropertiesSet();
  }
}
