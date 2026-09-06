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
                    // Ensure notifications table exists in tenant database
                    String createNotificationsSql = """
                        CREATE TABLE IF NOT EXISTS notifications (
                            id BIGINT AUTO_INCREMENT PRIMARY KEY,
                            recipient_user_id BIGINT NOT NULL,
                            type VARCHAR(100) NOT NULL,
                            title VARCHAR(255) NOT NULL,
                            message TEXT NOT NULL,
                            action_url VARCHAR(255),
                            reference_id BIGINT,
                            reference_type VARCHAR(100),
                            priority VARCHAR(50) DEFAULT 'MEDIUM',
                            is_read BOOLEAN NOT NULL DEFAULT FALSE,
                            read_at DATETIME,
                            created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                            INDEX idx_recipient_created (recipient_user_id, created_at),
                            INDEX idx_recipient_unread (recipient_user_id, is_read)
                        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
                    """;
                    jdbcTemplate.execute(createNotificationsSql);
                    logger.info("Ensured notifications table exists for tenant: {}", tenant.getTenantId());

                    try {
                        jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN from_percent DOUBLE");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN to_percent DOUBLE");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN color VARCHAR(50)");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges ADD COLUMN location_id BIGINT NULL");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges MODIFY COLUMN min_value DECIMAL(19,2) NULL");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("ALTER TABLE crm_kpi_ranges MODIFY COLUMN max_value DECIMAL(19,2) NULL");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS crm_todo_labels_link (todo_id BIGINT NOT NULL, label_id BIGINT NOT NULL, PRIMARY KEY (todo_id, label_id))");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS crm_todo_employees (todo_id BIGINT NOT NULL, employee_id BIGINT NOT NULL, PRIMARY KEY (todo_id, employee_id))");
                    } catch (Exception ignored) {}
                    try {
                        jdbcTemplate.execute("CREATE TABLE IF NOT EXISTS crm_todo_contacts (todo_id BIGINT NOT NULL, contact_id BIGINT NOT NULL, PRIMARY KEY (todo_id, contact_id))");
                    } catch (Exception ignored) {}
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
