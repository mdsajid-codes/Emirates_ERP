package com.example.multi_tanent.config;

import com.example.multi_tanent.master.entity.MasterTenant;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.orm.jpa.LocalContainerEntityManagerFactoryBean;
import org.springframework.orm.jpa.vendor.HibernateJpaVendorAdapter;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import com.example.multi_tanent.master.entity.ServiceModule;
import java.util.Properties;
import java.util.Set;

@Component
public class TenantSchemaCreator {

    private final TenantLiquibaseService liquibaseService;

    public TenantSchemaCreator(TenantLiquibaseService liquibaseService) {
        this.liquibaseService = liquibaseService;
    }

    private void createOrUpdateSchema(DataSource ds, MasterTenant tenant) {
        // We ignore packagesToScan as Liquibase handles schema based on changelog
        liquibaseService.runUpdate(ds, "db/changelog/db.changelog-tenant.xml");
    }

    private void migrateData(DataSource ds, MasterTenant masterTenant) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(ds);
        try {
            // First, ensure a tenant record exists for this specific tenantId.
            int tenantMatchCount = jdbcTemplate.queryForObject(
                    "SELECT count(*) FROM tenants WHERE tenant_id = ?", Integer.class, masterTenant.getTenantId());
            
            if (tenantMatchCount == 0) {
                // Check if any other tenant record exists (might be a cloned database)
                int totalTenantCount = jdbcTemplate.queryForObject("SELECT count(*) FROM tenants", Integer.class);
                
                if (totalTenantCount == 0) {
                    System.out.println("INFO: No tenant record found. Seeding for: " + masterTenant.getTenantId());
                    jdbcTemplate.update("INSERT INTO tenants (tenant_id, name, created_at) VALUES (?, ?, NOW())",
                            masterTenant.getTenantId(), 
                            masterTenant.getCompanyName() != null ? masterTenant.getCompanyName() : "Migrated Tenant");
                } else {
                    System.out.println("WARN: Database has tenant records but none match: " + masterTenant.getTenantId() + ". Adding correct record.");
                    jdbcTemplate.update("INSERT INTO tenants (tenant_id, name, created_at) VALUES (?, ?, NOW())",
                            masterTenant.getTenantId(), 
                            masterTenant.getCompanyName() != null ? masterTenant.getCompanyName() : "Migrated Tenant");
                }
            }

            // Find the ID of the single tenant record in this database.
            Long tenantRecordId = jdbcTemplate.queryForObject("SELECT id FROM tenants LIMIT 1", Long.class);

            if (tenantRecordId != null && tenantRecordId > 0) {
                // Update all users that don't have a tenant_id set yet.
                String sql = "UPDATE users SET tenant_id = ? WHERE tenant_id IS NULL";
                int rowsAffected = jdbcTemplate.update(sql, tenantRecordId);
                if (rowsAffected > 0) {
                    System.out.println("INFO: Migrated " + rowsAffected + " users to tenant_id: " + tenantRecordId);
                }
            }

            // FIX: Manually relax the quotation_id constraint for FollowUps to allow nulls
            try {
                jdbcTemplate.execute("ALTER TABLE rental_quotation_followups MODIFY quotation_id BIGINT NULL");
                System.out.println("INFO: Relaxed quotation_id constraint on rental_quotation_followups");
            } catch (Exception e) {
                // Ignore if table doesn't exist or other error, it might be fine on fresh
                // install
                System.out
                        .println("INFO: Could not relax quotation_id constraint (might be fresh install or unrelated): "
                                + e.getMessage());
            }
        } catch (Exception e) {
            System.err.println(
                    "WARN: Data migration for tenant_id failed. This might be expected if the tables don't exist yet. Error: "
                            + e.getMessage());
        }
    }

    public void ensureSchema(DataSource ds, MasterTenant tenant) {
        if (tenant == null || tenant.getServiceModules() == null || tenant.getServiceModules().isEmpty()) {
            System.err.println("WARNING: No modules specified for tenant '"
                    + (tenant != null ? tenant.getTenantId() : "null") + "'. Skipping schema creation.");
            return;
        }
        // Step 1: Run update to add new columns as nullable
        createOrUpdateSchema(ds, tenant);
        // Step 2: Run data migration to populate the new non-nullable columns
        migrateData(ds, tenant);
        // Step 3: Run update again to apply NOT NULL constraints
        createOrUpdateSchema(ds, tenant);

        // Step 4: Fix Foreign Key constraints
        fixDeliveryOrderForeignKey(ds, tenant.getTenantId());

        // Step 5: Cleanup orphaned columns from inventory table collision
        fixInventoryTableSchema(ds, tenant.getTenantId());
    }

    private void fixInventoryTableSchema(DataSource ds, String tenantId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(ds);
        try {
            // Check and drop item_id if it exists in inventory (orphaned from Warehouse
            // collision)
            String checkItemIdSql = "SELECT count(*) FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory' AND COLUMN_NAME = 'item_id'";
            Integer itemIdExists = jdbcTemplate.queryForObject(checkItemIdSql, Integer.class);
            if (itemIdExists != null && itemIdExists > 0) {
                System.out.println("[" + tenantId + "] Dropping orphaned column 'item_id' from 'inventory' table...");
                // First try to drop FK if exists
                try {
                    // We need the constraint name. It's usually auto-generated but might be
                    // standardized or we can find it.
                    // The error log showed 'FKrflym5lxj6xhmu4ok3ohmun5a'.
                    // Let's look it up dynamically.
                    String findFkSql = "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE " +
                            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory' AND COLUMN_NAME = 'item_id' "
                            +
                            "AND REFERENCED_TABLE_NAME IS NOT NULL";
                    java.util.List<String> fks = jdbcTemplate.queryForList(findFkSql, String.class);
                    for (String fk : fks) {
                        jdbcTemplate.execute("ALTER TABLE inventory DROP FOREIGN KEY " + fk);
                        System.out.println("[" + tenantId + "] Dropped orphaned FK: " + fk);
                    }
                } catch (Exception e) {
                    System.out.println("[" + tenantId + "] Warning: Could not drop FK for item_id: " + e.getMessage());
                }
                jdbcTemplate.execute("ALTER TABLE inventory DROP COLUMN item_id");
                System.out.println("[" + tenantId + "] Successfully dropped orphaned column 'item_id'");
            }

            // Check and drop location_id if it exists in inventory
            String checkLocationIdSql = "SELECT count(*) FROM information_schema.COLUMNS " +
                    "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory' AND COLUMN_NAME = 'location_id'";
            Integer locationIdExists = jdbcTemplate.queryForObject(checkLocationIdSql, Integer.class);
            if (locationIdExists != null && locationIdExists > 0) {
                System.out
                        .println("[" + tenantId + "] Dropping orphaned column 'location_id' from 'inventory' table...");
                try {
                    String findFkSql = "SELECT CONSTRAINT_NAME FROM information_schema.KEY_COLUMN_USAGE " +
                            "WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'inventory' AND COLUMN_NAME = 'location_id' "
                            +
                            "AND REFERENCED_TABLE_NAME IS NOT NULL";
                    java.util.List<String> fks = jdbcTemplate.queryForList(findFkSql, String.class);
                    for (String fk : fks) {
                        jdbcTemplate.execute("ALTER TABLE inventory DROP FOREIGN KEY " + fk);
                        System.out.println("[" + tenantId + "] Dropped orphaned FK: " + fk);
                    }
                } catch (Exception e) {
                    System.out.println(
                            "[" + tenantId + "] Warning: Could not drop FK for location_id: " + e.getMessage());
                }
                jdbcTemplate.execute("ALTER TABLE inventory DROP COLUMN location_id");
                System.out.println("[" + tenantId + "] Successfully dropped orphaned column 'location_id'");
            }

        } catch (Exception e) {
            System.err.println("[" + tenantId + "] Failed to cleanup inventory table schema: " + e.getMessage());
        }
    }

    private void fixDeliveryOrderForeignKey(DataSource ds, String tenantId) {
        JdbcTemplate jdbcTemplate = new JdbcTemplate(ds);
        try {
            System.out.println("Checking schema for tenant: " + tenantId);

            // 1. Identify if the wrong constraint exists
            String findWrongConstraintSql = "SELECT CONSTRAINT_NAME " +
                    "FROM information_schema.KEY_COLUMN_USAGE " +
                    "WHERE TABLE_NAME = 'delivery_orders' " +
                    "AND REFERENCED_TABLE_NAME = 'sales_customers' " +
                    "AND TABLE_SCHEMA = DATABASE()";

            java.util.List<String> wrongConstraints = jdbcTemplate.queryForList(findWrongConstraintSql, String.class);

            if (!wrongConstraints.isEmpty()) {
                for (String constraintName : wrongConstraints) {
                    System.out.println("[" + tenantId + "] Found invalid Foreign Key constraint: " + constraintName
                            + " referencing sales_customers. Dropping it...");
                    String dropSql = "ALTER TABLE delivery_orders DROP FOREIGN KEY " + constraintName;
                    jdbcTemplate.execute(dropSql);
                    System.out.println("[" + tenantId + "] Successfully dropped constraint: " + constraintName);
                }

                // 2. Add the correct constraint
                String findCorrectConstraintSql = "SELECT CONSTRAINT_NAME " +
                        "FROM information_schema.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_NAME = 'delivery_orders' " +
                        "AND REFERENCED_TABLE_NAME = 'base_customers' " +
                        "AND TABLE_SCHEMA = DATABASE()";

                java.util.List<String> correctConstraints = jdbcTemplate.queryForList(findCorrectConstraintSql,
                        String.class);

                if (correctConstraints.isEmpty()) {
                    System.out.println("[" + tenantId + "] Adding correct Foreign Key constraint to base_customers...");
                    String addSql = "ALTER TABLE delivery_orders " +
                            "ADD CONSTRAINT fk_delivery_orders_base_customers " +
                            "FOREIGN KEY (customer_id) REFERENCES base_customers (id)";
                    jdbcTemplate.execute(addSql);
                    System.out.println(
                            "[" + tenantId + "] Successfully added constraint: fk_delivery_orders_base_customers");
                }
            } else {
                String findCorrectConstraintSql = "SELECT CONSTRAINT_NAME " +
                        "FROM information_schema.KEY_COLUMN_USAGE " +
                        "WHERE TABLE_NAME = 'delivery_orders' " +
                        "AND REFERENCED_TABLE_NAME = 'base_customers' " +
                        "AND TABLE_SCHEMA = DATABASE()";

                java.util.List<String> correctConstraints = jdbcTemplate.queryForList(findCorrectConstraintSql,
                        String.class);
                if (correctConstraints.isEmpty()) {
                    System.out.println(
                            "[" + tenantId + "] Adding correct Foreign Key constraint to base_customers (missing)...");
                    try {
                        String addSql = "ALTER TABLE delivery_orders " +
                                "ADD CONSTRAINT fk_delivery_orders_base_customers " +
                                "FOREIGN KEY (customer_id) REFERENCES base_customers (id)";
                        jdbcTemplate.execute(addSql);
                        System.out.println(
                                "[" + tenantId + "] Successfully added constraint: fk_delivery_orders_base_customers");
                    } catch (Exception e) {
                        System.err.println("[" + tenantId
                                + "] Could not add base_customers constraint. Maybe data inconsistency? Error: "
                                + e.getMessage());
                    }
                }
            }

        } catch (Exception e) {
            System.err
                    .println("[" + tenantId + "] Failed to execute schema fix for delivery_orders: " + e.getMessage());
        }
    }
}
