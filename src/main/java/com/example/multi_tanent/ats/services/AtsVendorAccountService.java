package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorAccountRequest;
import com.example.multi_tanent.ats.dto.AtsVendorAccountResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorAccount;
import com.example.multi_tanent.ats.entity.AtsPaymentTerms;
import com.example.multi_tanent.ats.repository.AtsPaymentTermsRepository;
import com.example.multi_tanent.ats.dto.AtsPaymentTermsResponse;
import com.example.multi_tanent.ats.repository.AtsVendorAccountRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorAccountService {

    private final AtsVendorAccountRepository accountRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;
    private final AtsPaymentTermsRepository paymentTermsRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorAccountResponse get(Long vendorId) {
        Tenant tenant = currentTenant();
        AtsVendorAccount account = accountRepository.findByVendorIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Account details not found for vendor id " + vendorId));
        return toResponse(account);
    }

    public AtsVendorAccountResponse upsert(Long vendorId, AtsVendorAccountRequest request) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsPaymentTerms paymentTerm = null;
        if (request.getPaymentTermId() != null) {
            paymentTerm = paymentTermsRepository.findByIdAndTenantId(request.getPaymentTermId(), tenant.getId())
                    .orElseThrow(() -> new EntityNotFoundException("Payment term not found with id " + request.getPaymentTermId()));
        }

        Optional<AtsVendorAccount> existingOpt = accountRepository.findByVendorIdAndTenantId(vendorId, tenant.getId());

        AtsVendorAccount account;
        if (existingOpt.isPresent()) {
            account = existingOpt.get();
            account.setContactPerson(request.getContactPerson());
            account.setMobileNumber(request.getMobileNumber());
            account.setOfficeNumber(request.getOfficeNumber());
            account.setOfficeExtension(request.getOfficeExtension());
            account.setEmailId(request.getEmailId());
            account.setDesignation(request.getDesignation());
            account.setPaymentTerms(request.getPaymentTerms());
            account.setPaymentTerm(paymentTerm);
        } else {
            account = AtsVendorAccount.builder()
                    .tenant(tenant)
                    .vendor(vendor)
                    .contactPerson(request.getContactPerson())
                    .mobileNumber(request.getMobileNumber())
                    .officeNumber(request.getOfficeNumber())
                    .officeExtension(request.getOfficeExtension())
                    .emailId(request.getEmailId())
                    .designation(request.getDesignation())
                    .paymentTerms(request.getPaymentTerms())
                    .paymentTerm(paymentTerm)
                    .build();
        }

        AtsVendorAccount saved = accountRepository.save(account);
        return toResponse(saved);
    }

    public void delete(Long vendorId) {
        Tenant tenant = currentTenant();
        AtsVendorAccount account = accountRepository.findByVendorIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Account details not found for vendor id " + vendorId));
        accountRepository.delete(account);
    }

    private AtsVendorAccountResponse toResponse(AtsVendorAccount a) {
        AtsPaymentTermsResponse ptRes = null;
        if (a.getPaymentTerm() != null) {
            ptRes = AtsPaymentTermsResponse.builder()
                    .id(a.getPaymentTerm().getId())
                    .name(a.getPaymentTerm().getName())
                    .description(a.getPaymentTerm().getDescription())
                    .days(a.getPaymentTerm().getDays())
                    .isActive(a.getPaymentTerm().getIsActive())
                    .createdAt(a.getPaymentTerm().getCreatedAt())
                    .updatedAt(a.getPaymentTerm().getUpdatedAt())
                    .build();
        }

        return AtsVendorAccountResponse.builder()
                .id(a.getId())
                .contactPerson(a.getContactPerson())
                .mobileNumber(a.getMobileNumber())
                .officeNumber(a.getOfficeNumber())
                .officeExtension(a.getOfficeExtension())
                .emailId(a.getEmailId())
                .designation(a.getDesignation())
                .paymentTerms(a.getPaymentTerms())
                .paymentTerm(ptRes)
                .createdAt(a.getCreatedAt())
                .updatedAt(a.getUpdatedAt())
                .build();
    }
}
