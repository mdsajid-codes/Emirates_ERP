package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.entity.UsageRecord;
import com.example.multi_tanent.pos.repository.UsageRecordRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class UsageRecordService {

    private final UsageRecordRepository usageRecordRepository;
    private final TenantRepository tenantRepository;

    public UsageRecordService(UsageRecordRepository usageRecordRepository, TenantRepository tenantRepository) {
        this.usageRecordRepository = usageRecordRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    public void recordUsage(String featureKey, Long amount) {
        Tenant currentTenant = getCurrentTenant();
        UsageRecord record = UsageRecord.builder()
                .tenant(currentTenant)
                .featureKey(featureKey)
                .amount(amount)
                .periodStart(OffsetDateTime.now()) // Simplified for this example
                .build();
        usageRecordRepository.save(record);
    }

    @Transactional(readOnly = true)
    public List<UsageRecord> getAllUsageRecordsForCurrentTenant() {
        return usageRecordRepository.findByTenantId(getCurrentTenant().getId());
    }

    @Transactional(readOnly = true)
    public Optional<UsageRecord> getUsageRecordById(Long id) {
        return usageRecordRepository.findByIdAndTenantId(id, getCurrentTenant().getId());
    }
}