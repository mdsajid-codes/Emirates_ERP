package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.crm.dto.CrmLeadRequest;
import com.example.multi_tanent.crm.dto.LeadIntakeDto;
import com.example.multi_tanent.crm.entity.CrmCompany;
import com.example.multi_tanent.crm.entity.LeadSource;
import com.example.multi_tanent.crm.repository.CrmCompanyRepository;
import com.example.multi_tanent.crm.repository.CrmLeadStageRepository;
import com.example.multi_tanent.crm.repository.LeadSourceRepository;
import com.example.multi_tanent.pos.service.TenantService;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class LeadIntakeService {

    private final CrmLeadService leadService;
    private final CrmCompanyRepository companyRepository;
    private final LeadSourceRepository leadSourceRepository;
    private final CrmLeadStageRepository leadStageRepository;
    private final TenantService tenantService;

    @Transactional(transactionManager = "tenantTx")
    public void processIntake(LeadIntakeDto dto) {
        Tenant tenant = tenantService.getCurrentTenant()
                .orElseThrow(() -> new IllegalStateException("No tenant in context for lead intake"));

        CrmLeadRequest leadReq = new CrmLeadRequest();
        leadReq.setFirstName(dto.getFirstName());
        leadReq.setLastName(dto.getLastName());
        leadReq.setEmail(dto.getEmail());
        leadReq.setPhone(dto.getPhone());
        leadReq.setRequirements(dto.getRequirements());
        leadReq.setNotes(dto.getNotes() + (StringUtils.hasText(dto.getCampaign()) ? "\nCampaign: " + dto.getCampaign() : ""));
        
        // Use a generated lead number or similar if required by your system
        leadReq.setLeadNo("AUTO-" + System.currentTimeMillis());

        // 1. Handle Company (Look up or skip if missing)
        if (StringUtils.hasText(dto.getCompany())) {
            Optional<CrmCompany> company = companyRepository.findByNameAndTenantId(dto.getCompany(), tenant.getId());
            if (company.isPresent()) {
                leadReq.setCompanyId(company.get().getId());
            } else {
                // Create new company if it doesn't exist
                CrmCompany newCompany = CrmCompany.builder()
                        .name(dto.getCompany())
                        .tenant(tenant)
                        .build();
                leadReq.setCompanyId(companyRepository.save(newCompany).getId());
            }
        } else {
            // If missing, we might need a default company or handle it as per user's "skip" rule
            // However, CrmLeadRequest has @NotNull on companyId in some versions I saw.
            // Let's check the DTO I cat-ed earlier.
            // It had @NotNull on companyId.
            // If we "skip", we might need a "General" company.
            Optional<CrmCompany> general = companyRepository.findByNameAndTenantId("General / Unspecified", tenant.getId());
            if (general.isPresent()) {
                leadReq.setCompanyId(general.get().getId());
            } else {
                CrmCompany newCompany = CrmCompany.builder()
                        .name("General / Unspecified")
                        .tenant(tenant)
                        .build();
                leadReq.setCompanyId(companyRepository.save(newCompany).getId());
            }
        }

        // 2. Handle Lead Source
        String sourceName = StringUtils.hasText(dto.getSource()) ? dto.getSource() : "External Webhook";
        LeadSource source = leadSourceRepository.findByNameAndTenantId(sourceName, tenant.getId())
                .orElseGet(() -> leadSourceRepository.save(LeadSource.builder().name(sourceName).tenant(tenant).build()));
        leadReq.setLeadSourceId(source.getId());

        // 3. Handle Default Stage (usually the first one)
        leadStageRepository.findByTenantId(tenant.getId()).stream()
                .findFirst()
                .ifPresent(stage -> leadReq.setCurrentStageId(stage.getId()));

        // 4. Owner is left null as per user request
        leadReq.setOwnerId(null);

        // 5. Save the lead
        leadService.createLead(leadReq);
        log.info("Lead captured automatically: {} {} from {}", dto.getFirstName(), dto.getLastName(), sourceName);
    }
}
