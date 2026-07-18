package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.tenant.payroll.entity.EmployeeBenefitProvision;
import com.example.multi_tanent.tenant.payroll.enums.ProvisionStatus;
import com.example.multi_tanent.tenant.payroll.repository.EmployeeBenefitProvisionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BenefitProvisionScheduledService {

    private static final Logger logger = LoggerFactory.getLogger(BenefitProvisionScheduledService.class);
    private final EmployeeBenefitProvisionRepository provisionRepository;

    public BenefitProvisionScheduledService(EmployeeBenefitProvisionRepository provisionRepository) {
        this.provisionRepository = provisionRepository;
    }

    /**
     * Runs every day at 2 AM to check for and expire unused benefit provisions.
     */
    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional(transactionManager = "tenantTx")
    public void expireUnusedProvisions() {
        logger.info("Running scheduled task to expire unused benefit provisions...");
        List<EmployeeBenefitProvision> provisionsToExpire = provisionRepository.findByStatusAndCycleEndDateBefore(ProvisionStatus.ACCRUING, LocalDate.now());

        for (EmployeeBenefitProvision provision : provisionsToExpire) {
            provision.setStatus(ProvisionStatus.EXPIRED);
        }

        provisionRepository.saveAll(provisionsToExpire);
        logger.info("Expired {} benefit provisions.", provisionsToExpire.size());
    }
}