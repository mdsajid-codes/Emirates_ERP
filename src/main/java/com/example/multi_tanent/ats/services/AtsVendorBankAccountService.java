package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorBankAccountRequest;
import com.example.multi_tanent.ats.dto.AtsVendorBankAccountResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorBankAccount;
import com.example.multi_tanent.ats.entity.AtsCountry;
import com.example.multi_tanent.ats.entity.AtsState;
import com.example.multi_tanent.ats.repository.AtsVendorBankAccountRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.ats.repository.AtsCountryRepository;
import com.example.multi_tanent.ats.repository.AtsStateRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorBankAccountService {

    private final AtsVendorBankAccountRepository bankAccountRepository;
    private final AtsVendorRepository vendorRepository;
    private final AtsCountryRepository countryRepository;
    private final AtsStateRepository stateRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public String uploadFile(Long vendorId, MultipartFile file) {
        try {
            Path uploadPath = Paths.get("uploads", "ats", "vendor_bank_" + vendorId);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
            Path targetLocation = uploadPath.resolve(file.getOriginalFilename());
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
            return "/uploads/ats/vendor_bank_" + vendorId + "/" + file.getOriginalFilename();
        } catch (IOException ex) {
            throw new RuntimeException("Could not store file. Error: " + ex.getMessage(), ex);
        }
    }

    public AtsVendorBankAccountResponse create(Long vendorId, AtsVendorBankAccountRequest request) {
        Tenant tenant = currentTenant();

        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id: " + vendorId));

        AtsCountry country = request.getCountryId() != null ? countryRepository.findById(request.getCountryId()).orElse(null) : null;
        AtsState state = request.getStateId() != null ? stateRepository.findById(request.getStateId()).orElse(null) : null;

        AtsVendorBankAccount bankAccount = AtsVendorBankAccount.builder()
                .tenant(tenant)
                .vendor(vendor)
                .beneficiaryName(request.getBeneficiaryName())
                .bankName(request.getBankName())
                .accountType(request.getAccountType())
                .ifscRouting(request.getIfscRouting())
                .accountNumber(request.getAccountNumber())
                .depositAmount(request.getDepositAmount())
                .priority(request.getPriority())
                .comments(request.getComments())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .country(country)
                .state(state)
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .cancelledChequePath(request.getCancelledChequePath())
                .cancelledChequeName(request.getCancelledChequeName())
                .recordStatus(request.getRecordStatus())
                .attachmentPath(request.getAttachmentPath())
                .attachmentName(request.getAttachmentName())
                .build();

        AtsVendorBankAccount saved = bankAccountRepository.save(bankAccount);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsVendorBankAccountResponse> getAllForVendor(Long vendorId) {
        Tenant tenant = currentTenant();
        if (!vendorRepository.existsById(vendorId)) {
            throw new EntityNotFoundException("Vendor not found with id: " + vendorId);
        }
        return bankAccountRepository.findByVendorIdAndTenantId(vendorId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorBankAccountResponse getById(Long vendorId, Long id) {
        Tenant tenant = currentTenant();
        return bankAccountRepository.findByIdAndVendorIdAndTenantId(id, vendorId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Bank account not found with id: " + id));
    }

    public AtsVendorBankAccountResponse update(Long vendorId, Long id, AtsVendorBankAccountRequest request) {
        Tenant tenant = currentTenant();
        AtsVendorBankAccount bankAccount = bankAccountRepository.findByIdAndVendorIdAndTenantId(id, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Bank account not found with id: " + id));

        AtsCountry country = request.getCountryId() != null ? countryRepository.findById(request.getCountryId()).orElse(null) : null;
        AtsState state = request.getStateId() != null ? stateRepository.findById(request.getStateId()).orElse(null) : null;

        bankAccount.setBeneficiaryName(request.getBeneficiaryName());
        bankAccount.setBankName(request.getBankName());
        bankAccount.setAccountType(request.getAccountType());
        bankAccount.setIfscRouting(request.getIfscRouting());
        bankAccount.setAccountNumber(request.getAccountNumber());
        bankAccount.setDepositAmount(request.getDepositAmount());
        bankAccount.setPriority(request.getPriority());
        bankAccount.setComments(request.getComments());
        bankAccount.setAddressLine1(request.getAddressLine1());
        bankAccount.setAddressLine2(request.getAddressLine2());
        bankAccount.setCountry(country);
        bankAccount.setState(state);
        bankAccount.setCity(request.getCity());
        bankAccount.setZipCode(request.getZipCode());
        bankAccount.setCancelledChequePath(request.getCancelledChequePath());
        bankAccount.setCancelledChequeName(request.getCancelledChequeName());
        bankAccount.setRecordStatus(request.getRecordStatus());
        bankAccount.setAttachmentPath(request.getAttachmentPath());
        bankAccount.setAttachmentName(request.getAttachmentName());

        AtsVendorBankAccount updated = bankAccountRepository.save(bankAccount);
        return toResponse(updated);
    }

    public void delete(Long vendorId, Long id) {
        Tenant tenant = currentTenant();
        AtsVendorBankAccount bankAccount = bankAccountRepository.findByIdAndVendorIdAndTenantId(id, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Bank account not found with id: " + id));
        bankAccountRepository.delete(bankAccount);
    }

    public AtsVendorBankAccountResponse toResponse(AtsVendorBankAccount bankAccount) {
        return AtsVendorBankAccountResponse.builder()
                .id(bankAccount.getId())
                .vendorId(bankAccount.getVendor().getId())
                .beneficiaryName(bankAccount.getBeneficiaryName())
                .bankName(bankAccount.getBankName())
                .accountType(bankAccount.getAccountType())
                .ifscRouting(bankAccount.getIfscRouting())
                .accountNumber(bankAccount.getAccountNumber())
                .depositAmount(bankAccount.getDepositAmount())
                .priority(bankAccount.getPriority())
                .comments(bankAccount.getComments())
                .addressLine1(bankAccount.getAddressLine1())
                .addressLine2(bankAccount.getAddressLine2())
                .countryId(bankAccount.getCountry() != null ? bankAccount.getCountry().getId() : null)
                .countryName(bankAccount.getCountry() != null ? bankAccount.getCountry().getName() : null)
                .stateId(bankAccount.getState() != null ? bankAccount.getState().getId() : null)
                .stateName(bankAccount.getState() != null ? bankAccount.getState().getName() : null)
                .city(bankAccount.getCity())
                .zipCode(bankAccount.getZipCode())
                .cancelledChequePath(bankAccount.getCancelledChequePath())
                .cancelledChequeName(bankAccount.getCancelledChequeName())
                .recordStatus(bankAccount.getRecordStatus())
                .attachmentPath(bankAccount.getAttachmentPath())
                .attachmentName(bankAccount.getAttachmentName())
                .build();
    }
}
