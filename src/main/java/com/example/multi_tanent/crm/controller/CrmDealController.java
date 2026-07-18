package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmDealSummaryDto;
import com.example.multi_tanent.sales.entity.Quotation;
import com.example.multi_tanent.sales.repository.QuotationRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/crm/deals")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class CrmDealController {

    private final QuotationRepository quotationRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @GetMapping
    @PreAuthorize("@crmAccess.canView('DEAL')")
    public ResponseEntity<Page<CrmDealSummaryDto>> getDeals(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "1000") int size
    ) {
        Tenant tenant = currentTenant();
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Quotation> quotations = quotationRepository.findByTenantId(tenant.getId(), pageable);
        Page<CrmDealSummaryDto> summary = quotations.map(this::toSummaryDto);

        return ResponseEntity.ok(summary);
    }

    private CrmDealSummaryDto toSummaryDto(Quotation q) {
        String customerName = "Unknown Customer";
        if (q.getCustomer() != null) {
            customerName = q.getCustomer().getCompanyName();
        }

        String salespersonName = "Unassigned";
        if (q.getSalesperson() != null) {
            salespersonName = q.getSalesperson().getFirstName() + " " + q.getSalesperson().getLastName();
        }

        return CrmDealSummaryDto.builder()
                .id(q.getId())
                .quotationNumber(q.getQuotationNumber())
                .customerName(customerName)
                .salespersonName(salespersonName)
                .netTotal(q.getNetTotal())
                .status(q.getStatus())
                .createdAt(q.getCreatedAt())
                .build();
    }
}
