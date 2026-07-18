package com.example.multi_tanent.spersusers.notification.repository.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.template.WhatsAppTemplate;

import java.util.List;
import java.util.Optional;

@Repository
public interface WhatsAppTemplateRepository extends JpaRepository<WhatsAppTemplate, Long> {
    List<WhatsAppTemplate> findByTenantId(Long tenantId);

    Optional<WhatsAppTemplate> findByTenantIdAndTemplateIdAndActiveTrue(Long tenantId, String templateId);
}
