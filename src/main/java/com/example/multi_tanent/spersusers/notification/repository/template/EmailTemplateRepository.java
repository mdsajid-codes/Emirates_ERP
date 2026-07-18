package com.example.multi_tanent.spersusers.notification.repository.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.template.EmailTemplate;

import java.util.List;
import java.util.Optional;

@Repository
public interface EmailTemplateRepository extends JpaRepository<EmailTemplate, Long> {
    List<EmailTemplate> findByTenantId(Long tenantId);

    Optional<EmailTemplate> findByTenantIdAndTemplateIdAndActiveTrue(Long tenantId, String templateId);
}
