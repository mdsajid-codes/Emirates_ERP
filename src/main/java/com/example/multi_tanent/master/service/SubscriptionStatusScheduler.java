package com.example.multi_tanent.master.service;

import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.entity.SubscriptionStatus;
import com.example.multi_tanent.master.repository.MasterTenantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class SubscriptionStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(SubscriptionStatusScheduler.class);
    private final MasterTenantRepository masterTenantRepository;

    public SubscriptionStatusScheduler(MasterTenantRepository masterTenantRepository) {
        this.masterTenantRepository = masterTenantRepository;
    }

    // Runs every day at 1 AM server time.
    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional(transactionManager = "masterTx")
    public void updateExpiredSubscriptions() {
        logger.info("Running scheduled task to check for expired tenant subscriptions...");
        LocalDate today = LocalDate.now();

        List<MasterTenant> expiredTenants = masterTenantRepository.findBySubscriptionEndDateBeforeAndStatus(today, SubscriptionStatus.ACTIVE);

        expiredTenants.forEach(tenant -> {
            logger.warn("Subscription for tenant '{}' ({}) has expired. Updating status to EXPIRED.", tenant.getTenantId(), tenant.getCompanyName());
            tenant.setStatus(SubscriptionStatus.EXPIRED);
        });

        masterTenantRepository.saveAll(expiredTenants);
        logger.info("Successfully updated status for {} expired tenants.", expiredTenants.size());
    }
}