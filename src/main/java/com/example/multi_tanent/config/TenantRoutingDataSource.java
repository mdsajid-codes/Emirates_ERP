package com.example.multi_tanent.config;

import org.springframework.jdbc.datasource.lookup.AbstractRoutingDataSource;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

public class TenantRoutingDataSource extends AbstractRoutingDataSource {
    private static final Logger logger = LoggerFactory.getLogger(TenantRoutingDataSource.class);

    @Override
    protected Object determineCurrentLookupKey() {
        String tenantId = TenantContext.getTenantId();
        if (tenantId == null) {
            logger.warn("No Tenant ID found in TenantContext. Routing may fail or use default if configured.");
        } else {
            logger.debug("Routing to DataSource for Tenant ID: {}", tenantId);
        }
        return tenantId;
    }
}
