package com.example.multi_tanent.crm.repository;



import org.springframework.data.jpa.repository.JpaRepository;

import com.example.multi_tanent.crm.entity.CrmEvent;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

public interface CrmEventRepository extends JpaRepository<CrmEvent, Long> {
    List<CrmEvent> findByTenantIdOrderByDateDescFromTimeDesc(Long tenantId);

    // simple availability query (same date overlap)
    List<CrmEvent> findByTenantIdAndDateAndEmployees_IdAndFromTimeLessThanAndToTimeGreaterThan(
            Long tenantId, LocalDate date, Long employeeId, LocalTime end, LocalTime start);

    List<CrmEvent> findByTenantIdAndLeadIdOrderByDateDescFromTimeDesc(Long tenantId, Long leadId);
}
