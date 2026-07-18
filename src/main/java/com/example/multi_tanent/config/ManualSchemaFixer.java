package com.example.multi_tanent.config;

import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import com.zaxxer.hikari.HikariDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class ManualSchemaFixer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(ManualSchemaFixer.class);

    private final MasterTenantRepository masterTenantRepository;

    public ManualSchemaFixer(MasterTenantRepository masterTenantRepository) {
        this.masterTenantRepository = masterTenantRepository;
    }

    @Override
    public void run(String... args) throws Exception {
        logger.info("Starting Manual Schema Fixer for ManufacturingOrder item_id...");

        List<MasterTenant> tenants = masterTenantRepository.findAll();
        for (MasterTenant tenant : tenants) {
            logger.info("Processing tenant: {}", tenant.getTenantId());
            try (HikariDataSource ds = createDataSource(tenant)) {
                JdbcTemplate jdbcTemplate = new JdbcTemplate(ds);
                try {
                    // Check if table exists
                    jdbcTemplate.execute("SELECT 1 FROM manufacturing_orders LIMIT 1");

                    // Execute ALTER
                    String sql = "ALTER TABLE manufacturing_orders MODIFY COLUMN item_id BIGINT NULL";
                    jdbcTemplate.execute(sql);
                    logger.info("Successfully altered manufacturing_orders.item_id for tenant: {}",
                            tenant.getTenantId());
                } catch (Exception e) {
                    boolean tableMissing = false;
                    Throwable cause = e;
                    while (cause != null) {
                        if (cause.getMessage() != null && cause.getMessage().contains("doesn't exist")) {
                            tableMissing = true;
                            break;
                        }
                        cause = cause.getCause();
                    }

                    if (tableMissing) {
                        logger.warn("Table manufacturing_orders does not exist for tenant: {}", tenant.getTenantId());
                    } else {
                        logger.error("Failed to alter schema for tenant: " + tenant.getTenantId(), e);
                    }
                }
            } catch (Exception e) {
                logger.error("Failed to connect to tenant: " + tenant.getTenantId(), e);
            }
        }
        logger.info("Manual Schema Fixer completed.");
    }

    private HikariDataSource createDataSource(MasterTenant tenant) {
        HikariDataSource ds = new HikariDataSource();
        ds.setJdbcUrl(tenant.getJdbcUrl());
        ds.setUsername(tenant.getUsername());
        ds.setPassword(tenant.getPassword());
        ds.setMaximumPoolSize(2);
        ds.setMinimumIdle(0);
        return ds;
    }
}
