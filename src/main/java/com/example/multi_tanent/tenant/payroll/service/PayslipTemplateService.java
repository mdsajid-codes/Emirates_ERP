package com.example.multi_tanent.tenant.payroll.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.payroll.dto.PayslipTemplateRequest;
import com.example.multi_tanent.tenant.payroll.dto.PayslipTemplateResponse;
import com.example.multi_tanent.tenant.payroll.entity.PayslipTemplate;
import com.example.multi_tanent.tenant.payroll.repository.PayslipTemplateRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PayslipTemplateService {

    private final PayslipTemplateRepository templateRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found: " + tenantId));
    }

    public PayslipTemplateResponse create(PayslipTemplateRequest request) {
        Tenant tenant = getCurrentTenant();
        PayslipTemplate template = new PayslipTemplate();
        template.setTenant(tenant);
        mapRequestToEntity(request, template);

        if (Boolean.TRUE.equals(template.getIsDefault())) {
            unsetCurrentDefault(tenant.getId(), template.getId());
        }

        return PayslipTemplateResponse.fromEntity(templateRepository.save(template));
    }

    public PayslipTemplateResponse update(Long id, PayslipTemplateRequest request) {
        Tenant tenant = getCurrentTenant();
        PayslipTemplate template = templateRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip template not found: " + id));

        mapRequestToEntity(request, template);

        if (Boolean.TRUE.equals(template.getIsDefault())) {
            unsetCurrentDefault(tenant.getId(), template.getId());
        }

        return PayslipTemplateResponse.fromEntity(templateRepository.save(template));
    }

    public void delete(Long id) {
        if (!templateRepository.existsById(id)) {
            throw new EntityNotFoundException("Payslip template not found: " + id);
        }
        templateRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public List<PayslipTemplateResponse> getAllForTenant() {
        return templateRepository.findByTenantIdOrderByNameAsc(getCurrentTenant().getId())
                .stream()
                .map(PayslipTemplateResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public PayslipTemplateResponse getById(Long id) {
        return templateRepository.findByTenantIdAndId(getCurrentTenant().getId(), id)
                .map(PayslipTemplateResponse::fromEntity)
                .orElseThrow(() -> new EntityNotFoundException("Payslip template not found: " + id));
    }

    public PayslipTemplateResponse setDefault(Long id) {
        Tenant tenant = getCurrentTenant();
        PayslipTemplate template = templateRepository.findByTenantIdAndId(tenant.getId(), id)
                .orElseThrow(() -> new EntityNotFoundException("Payslip template not found: " + id));

        unsetCurrentDefault(tenant.getId(), template.getId());
        template.setIsDefault(true);
        return PayslipTemplateResponse.fromEntity(templateRepository.save(template));
    }

    private void mapRequestToEntity(PayslipTemplateRequest request, PayslipTemplate entity) {
        entity.setName(request.getName());
        entity.setTemplateContent(request.getTemplateContent());
        entity.setIsDefault(request.getIsDefault());
    }

    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.REQUIRES_NEW)
    private void unsetCurrentDefault(Long tenantId, Long newDefaultTemplateId) {
        templateRepository.findByTenantIdAndIsDefaultTrue(tenantId).ifPresent(currentDefault -> {
            // Only unset the old default if it's not the same template we are currently setting as default
            if (!currentDefault.getId().equals(newDefaultTemplateId)) {
                currentDefault.setIsDefault(false);
                templateRepository.save(currentDefault);
            }
        });
    }
}