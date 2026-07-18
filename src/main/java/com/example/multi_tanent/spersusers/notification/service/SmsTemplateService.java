package com.example.multi_tanent.spersusers.notification.service;

import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.enitity.notification.entity.template.SmsTemplate;
import com.example.multi_tanent.spersusers.notification.dto.SmsTemplateDto;
import com.example.multi_tanent.spersusers.notification.repository.template.SmsTemplateRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(transactionManager = "tenantTx")
public class SmsTemplateService {

    private final TenantService tenantService;
    private final SmsTemplateRepository smsTemplateRepository;

    private Tenant getCurrentTenant() {
        return tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in current context"));
    }

    public List<SmsTemplateDto> getTemplates() {
        Tenant tenant = getCurrentTenant();
        return smsTemplateRepository.findByTenantId(tenant.getId()).stream()
                .map(t -> SmsTemplateDto.builder()
                        .id(t.getId())
                        .templateId(t.getTemplateId())
                        .name(t.getName())
                        .body(t.getBody())
                        .active(t.getActive())
                        .build())
                .toList();
    }

    public void saveTemplate(SmsTemplateDto dto) {
        Tenant tenant = getCurrentTenant();
        SmsTemplate tpl = (dto.getId() != null)
                ? smsTemplateRepository.findById(dto.getId()).orElseThrow()
                : SmsTemplate.builder().tenant(tenant).build();
        tpl.setTemplateId(dto.getTemplateId());
        tpl.setName(dto.getName());
        tpl.setBody(dto.getBody());
        tpl.setActive(dto.getActive());
        smsTemplateRepository.save(tpl);
    }

    public void deleteTemplate(Long id) {
        smsTemplateRepository.deleteById(id);
    }
}
