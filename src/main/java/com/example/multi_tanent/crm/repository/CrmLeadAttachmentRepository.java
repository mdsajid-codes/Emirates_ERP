package com.example.multi_tanent.crm.repository;

import com.example.multi_tanent.crm.entity.CrmLeadAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CrmLeadAttachmentRepository extends JpaRepository<CrmLeadAttachment, Long> {
    List<CrmLeadAttachment> findByLead_Id(Long leadId);
    List<CrmLeadAttachment> findByLead_IdAndTenant_Id(Long leadId, Long tenantId);
}
