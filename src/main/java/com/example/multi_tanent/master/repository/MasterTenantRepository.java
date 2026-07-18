package com.example.multi_tanent.master.repository;

import com.example.multi_tanent.master.entity.MasterTenant;
import com.example.multi_tanent.master.entity.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface MasterTenantRepository extends JpaRepository<MasterTenant, Long> {
    Optional<MasterTenant> findByTenantId(String tenantId);
    List<MasterTenant> findBySubscriptionEndDateBeforeAndStatus(LocalDate date, SubscriptionStatus status);
}