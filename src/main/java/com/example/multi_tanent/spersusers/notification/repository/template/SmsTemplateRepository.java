package com.example.multi_tanent.spersusers.notification.repository.template;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.notification.entity.template.SmsTemplate;

import java.util.List;
import java.util.Optional;

@Repository
public interface SmsTemplateRepository extends JpaRepository<SmsTemplate, Long> {
    List<SmsTemplate> findByTenantId(Long tenantId);

    Optional<SmsTemplate> findByTenantIdAndTemplateIdAndActiveTrue(Long tenantId, String templateId);
}
