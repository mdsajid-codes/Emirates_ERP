package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientGuideline;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtsClientGuidelineRepository extends JpaRepository<AtsClientGuideline, Long> {
    Optional<AtsClientGuideline> findByClientIdAndTenantId(Long clientId, Long tenantId);
}
