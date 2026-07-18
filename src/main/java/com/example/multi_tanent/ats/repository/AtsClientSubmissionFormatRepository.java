package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientSubmissionFormat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AtsClientSubmissionFormatRepository extends JpaRepository<AtsClientSubmissionFormat, Long> {
    Optional<AtsClientSubmissionFormat> findByClientIdAndTenantId(Long clientId, Long tenantId);
}
