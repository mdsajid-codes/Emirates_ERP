package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.template.WhatsAppTemplate;
import com.example.multi_tanent.spersusers.notification.dto.WhatsAppTemplateDto;
import com.example.multi_tanent.spersusers.notification.repository.template.WhatsAppTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class WhatsAppTemplateService {

    private final TenantService tenantService;
    private final WhatsAppTemplateRepository whatsappTemplateRepository;

    private Tenant getCurrentTenant() {
        return tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
    }

    public List<WhatsAppTemplateDto> getTemplates() {
        Tenant tenant = getCurrentTenant();
        return whatsappTemplateRepository.findByTenantId(tenant.getId()).stream()
                .map(t -> WhatsAppTemplateDto.builder()
                        .id(t.getId())
                        .templateId(t.getTemplateId())
                        .name(t.getName())
                        .body(t.getBody())
                        .active(t.getActive())
                        .providerTemplateId(t.getWhatsappTemplateId())
                        .languageCode(t.getLanguageCode())
                        .build())
                .toList();
    }

    public void saveTemplate(WhatsAppTemplateDto dto) {
        Tenant tenant = getCurrentTenant();
        WhatsAppTemplate tpl = (dto.getId() != null)
                ? whatsappTemplateRepository.findById(dto.getId()).orElseThrow()
                : WhatsAppTemplate.builder().tenant(tenant).build();
        tpl.setTemplateId(dto.getTemplateId());
        tpl.setName(dto.getName());
        tpl.setBody(dto.getBody());
        tpl.setActive(dto.getActive());
        tpl.setWhatsappTemplateId(dto.getProviderTemplateId());
        tpl.setLanguageCode(dto.getLanguageCode());
        whatsappTemplateRepository.save(tpl);
    }

    public void deleteTemplate(Long id) {
        whatsappTemplateRepository.deleteById(id);
    }
}
