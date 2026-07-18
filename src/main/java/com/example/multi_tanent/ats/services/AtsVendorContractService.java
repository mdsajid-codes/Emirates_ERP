package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorContractRequest;
import com.example.multi_tanent.ats.dto.AtsVendorContractResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorContract;
import com.example.multi_tanent.ats.enums.ContractStatus;
import com.example.multi_tanent.ats.repository.AtsVendorContractRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorContractService {

    private final AtsVendorContractRepository contractRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsVendorContractResponse create(Long vendorId, AtsVendorContractRequest request) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsVendorContract contract = AtsVendorContract.builder()
                .tenant(tenant)
                .vendor(vendor)
                .contractNumber(request.getContractNumber())
                .contractType(request.getContractType())
                .contractStatus(request.getContractStatus() != null ? request.getContractStatus() : ContractStatus.DRAFT)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .signedDate(request.getSignedDate())
                .paymentTerms(request.getPaymentTerms())
                .billRate(request.getBillRate())
                .payRate(request.getPayRate())
                .currency(request.getCurrency())
                .markupPercent(request.getMarkupPercent())
                .autoRenew(request.getAutoRenew() != null ? request.getAutoRenew() : false)
                .documentUrl(request.getDocumentUrl())
                .snapshot(request.getSnapshot())
                .contractNotes(request.getContractNotes())
                .build();

        AtsVendorContract saved = contractRepository.save(contract);
        return toResponse(saved);
    }

    public AtsVendorContractResponse update(Long vendorId, Long contractId, AtsVendorContractRequest request) {
        Tenant tenant = currentTenant();
        vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsVendorContract contract = contractRepository.findByIdAndVendorIdAndTenantId(contractId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contract not found with id " + contractId));

        contract.setContractNumber(request.getContractNumber());
        contract.setContractType(request.getContractType());
        if (request.getContractStatus() != null) {
            contract.setContractStatus(request.getContractStatus());
        }
        contract.setStartDate(request.getStartDate());
        contract.setEndDate(request.getEndDate());
        contract.setSignedDate(request.getSignedDate());
        contract.setPaymentTerms(request.getPaymentTerms());
        contract.setBillRate(request.getBillRate());
        contract.setPayRate(request.getPayRate());
        contract.setCurrency(request.getCurrency());
        contract.setMarkupPercent(request.getMarkupPercent());
        if (request.getAutoRenew() != null) {
            contract.setAutoRenew(request.getAutoRenew());
        }
        contract.setDocumentUrl(request.getDocumentUrl());
        contract.setSnapshot(request.getSnapshot());
        contract.setContractNotes(request.getContractNotes());

        AtsVendorContract saved = contractRepository.save(contract);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsVendorContractResponse> getAll(Long vendorId) {
        Tenant tenant = currentTenant();
        return contractRepository.findByVendorIdAndTenantId(vendorId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorContractResponse getById(Long vendorId, Long contractId) {
        Tenant tenant = currentTenant();
        AtsVendorContract contract = contractRepository.findByIdAndVendorIdAndTenantId(contractId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contract not found"));
        return toResponse(contract);
    }

    public void delete(Long vendorId, Long contractId) {
        Tenant tenant = currentTenant();
        AtsVendorContract contract = contractRepository.findByIdAndVendorIdAndTenantId(contractId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contract not found"));
        contractRepository.delete(contract);
    }

    private AtsVendorContractResponse toResponse(AtsVendorContract c) {
        return AtsVendorContractResponse.builder()
                .id(c.getId())
                .contractNumber(c.getContractNumber())
                .contractType(c.getContractType())
                .contractStatus(c.getContractStatus())
                .startDate(c.getStartDate())
                .endDate(c.getEndDate())
                .signedDate(c.getSignedDate())
                .paymentTerms(c.getPaymentTerms())
                .billRate(c.getBillRate())
                .payRate(c.getPayRate())
                .currency(c.getCurrency())
                .markupPercent(c.getMarkupPercent())
                .autoRenew(c.getAutoRenew())
                .documentUrl(c.getDocumentUrl())
                .snapshot(c.getSnapshot())
                .contractNotes(c.getContractNotes())
                .createdById(c.getCreatedBy() != null ? c.getCreatedBy().getId() : null)
                .createdByName(c.getCreatedBy() != null ? (c.getCreatedBy().getFirstName() + " " + c.getCreatedBy().getLastName()) : null)
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
