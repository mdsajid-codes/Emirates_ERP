package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.template.EmailTemplate;
import com.example.multi_tanent.spersusers.notification.dto.EmailTemplateDto;
import com.example.multi_tanent.spersusers.notification.repository.template.EmailTemplateRepository;
import com.example.multi_tanent.spersusers.interfaces.NotificationChannel;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(transactionManager = "tenantTx")
public class EmailTemplateService {

    private final TenantService tenantService;
    private final EmailTemplateRepository emailTemplateRepository;
    private final NotificationChannel emailChannel;

    public EmailTemplateService(TenantService tenantService, 
                               EmailTemplateRepository emailTemplateRepository,
                               @Qualifier("emailChannel") NotificationChannel emailChannel) {
        this.tenantService = tenantService;
        this.emailTemplateRepository = emailTemplateRepository;
        this.emailChannel = emailChannel;
    }

    private Tenant getCurrentTenant() {
        return tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
    }

    public List<EmailTemplateDto> getTemplates() {
        Tenant tenant = getCurrentTenant();
        return emailTemplateRepository.findByTenantId(tenant.getId()).stream()
                .map(t -> EmailTemplateDto.builder()
                        .id(t.getId())
                        .templateId(t.getTemplateId())
                        .name(t.getName())
                        .subject(t.getSubject())
                        .body(t.getBody())
                        .active(t.getActive())
                        .build())
                .toList();
    }

    public void saveTemplate(EmailTemplateDto dto) {
        Tenant tenant = getCurrentTenant();
        EmailTemplate tpl = (dto.getId() != null)
                ? emailTemplateRepository.findById(dto.getId()).orElseThrow()
                : EmailTemplate.builder().tenant(tenant).build();
        tpl.setTemplateId(dto.getTemplateId());
        tpl.setName(dto.getName());
        tpl.setSubject(dto.getSubject());
        tpl.setBody(dto.getBody());
        tpl.setActive(dto.getActive());
        emailTemplateRepository.save(tpl);
    }

    public void deleteTemplate(Long id) {
        emailTemplateRepository.deleteById(id);
    }

    public void testTemplate(EmailTemplateDto dto, String recipient) {
        Tenant tenant = getCurrentTenant();
        NotificationRequest request = NotificationRequest.builder()
                .tenantId(tenant.getId())
                .recipient(recipient)
                .subject("[TEST] " + dto.getSubject())
                .body(dto.getBody())
                .build();
        emailChannel.send(request);
    }
}
