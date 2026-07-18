package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.*;
import com.example.multi_tanent.ats.entity.*;
import com.example.multi_tanent.ats.enums.VendorStatus;
import com.example.multi_tanent.ats.repository.*;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorService {

    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;
    private final AtsStateRepository stateRepository;
    private final AtsCountryRepository countryRepository;
    private final AtsBusinessUnitRepository businessUnitRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsVendorDetailResponse create(AtsVendorRequest request) {
        Tenant tenant = currentTenant();

        if (vendorRepository.existsByPrimaryEmailAndTenantId(request.getPrimaryEmail(), tenant.getId())) {
            throw new IllegalArgumentException("Vendor with email '" + request.getPrimaryEmail() + "' already exists.");
        }

        if (request.getVendorCode() != null && !request.getVendorCode().trim().isEmpty() &&
                vendorRepository.existsByVendorCodeAndTenantId(request.getVendorCode(), tenant.getId())) {
            throw new IllegalArgumentException("Vendor with code '" + request.getVendorCode() + "' already exists.");
        }

        AtsVendor vendor = AtsVendor.builder()
                .tenant(tenant)
                .companyName(request.getCompanyName())
                .vendorCode(request.getVendorCode())
                .displayName(request.getDisplayName())
                .vendorType(request.getVendorType())
                .vendorStatus(request.getVendorStatus() != null ? request.getVendorStatus() : VendorStatus.ACTIVE)
                .isBlacklisted(false)
                .website(request.getWebsite())
                .primaryEmail(request.getPrimaryEmail())
                .alternateEmail(request.getAlternateEmail())
                .primaryPhone(request.getPrimaryPhone())
                .faxNumber(request.getFaxNumber())
                .taxId(request.getTaxId())
                .federalId(request.getFederalId())
                .address(request.getAddress())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .technologies(request.getTechnologies())
                .aboutVendor(request.getAboutVendor())
                .notes(request.getNotes())
                .ownership(request.getOwnership())
                .vendorVisibility(request.getVendorVisibility())
                .sendRequirement(request.getSendRequirement() != null ? request.getSendRequirement() : false)
                .sendHotlist(request.getSendHotlist() != null ? request.getSendHotlist() : false)
                .allowAccessToAllUsers(request.getAllowAccessToAllUsers() != null ? request.getAllowAccessToAllUsers() : false)
                .build();

        resolveFKs(vendor, request, tenant.getId());

        AtsVendor saved = vendorRepository.save(vendor);
        return toDetail(saved);
    }

    public AtsVendorDetailResponse update(Long id, AtsVendorRequest request) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + id));

        if (!vendor.getPrimaryEmail().equalsIgnoreCase(request.getPrimaryEmail()) &&
                vendorRepository.existsByPrimaryEmailAndTenantId(request.getPrimaryEmail(), tenant.getId())) {
            throw new IllegalArgumentException("Vendor with email '" + request.getPrimaryEmail() + "' already exists.");
        }

        if (request.getVendorCode() != null && !request.getVendorCode().trim().isEmpty() &&
                !request.getVendorCode().equalsIgnoreCase(vendor.getVendorCode()) &&
                vendorRepository.existsByVendorCodeAndTenantId(request.getVendorCode(), tenant.getId())) {
            throw new IllegalArgumentException("Vendor with code '" + request.getVendorCode() + "' already exists.");
        }

        vendor.setCompanyName(request.getCompanyName());
        vendor.setVendorCode(request.getVendorCode());
        vendor.setDisplayName(request.getDisplayName());
        vendor.setVendorType(request.getVendorType());
        if (request.getVendorStatus() != null) {
            vendor.setVendorStatus(request.getVendorStatus());
        }
        vendor.setWebsite(request.getWebsite());
        vendor.setPrimaryEmail(request.getPrimaryEmail());
        vendor.setAlternateEmail(request.getAlternateEmail());
        vendor.setPrimaryPhone(request.getPrimaryPhone());
        vendor.setFaxNumber(request.getFaxNumber());
        vendor.setTaxId(request.getTaxId());
        vendor.setFederalId(request.getFederalId());
        vendor.setAddress(request.getAddress());
        vendor.setCity(request.getCity());
        vendor.setZipCode(request.getZipCode());
        vendor.setTechnologies(request.getTechnologies());
        vendor.setAboutVendor(request.getAboutVendor());
        vendor.setNotes(request.getNotes());
        vendor.setOwnership(request.getOwnership());
        vendor.setVendorVisibility(request.getVendorVisibility());
        if (request.getSendRequirement() != null) vendor.setSendRequirement(request.getSendRequirement());
        if (request.getSendHotlist() != null) vendor.setSendHotlist(request.getSendHotlist());
        if (request.getAllowAccessToAllUsers() != null) vendor.setAllowAccessToAllUsers(request.getAllowAccessToAllUsers());

        resolveFKs(vendor, request, tenant.getId());

        AtsVendor saved = vendorRepository.save(vendor);
        return toDetail(saved);
    }

    private void resolveFKs(AtsVendor vendor, AtsVendorRequest request, Long tenantId) {
        if (request.getStateId() != null) {
            vendor.setState(stateRepository.findByIdAndTenantId(request.getStateId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("State not found")));
        } else {
            vendor.setState(null);
        }

        if (request.getCountryId() != null) {
            vendor.setCountry(countryRepository.findByIdAndTenantId(request.getCountryId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Country not found")));
        } else {
            vendor.setCountry(null);
        }

        if (request.getPrimaryBusinessUnitId() != null) {
            vendor.setPrimaryBusinessUnit(businessUnitRepository.findByIdAndTenantId(request.getPrimaryBusinessUnitId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Primary Business Unit not found")));
        } else {
            vendor.setPrimaryBusinessUnit(null);
        }

        if (request.getBusinessUnitIds() != null) {
            List<AtsBusinessUnit> bus = new ArrayList<>();
            for (Long buId : request.getBusinessUnitIds()) {
                bus.add(businessUnitRepository.findByIdAndTenantId(buId, tenantId)
                        .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id " + buId)));
            }
            vendor.setBusinessUnits(bus);
        } else {
            vendor.setBusinessUnits(new ArrayList<>());
        }

        if (request.getVendorLeadId() != null) {
            vendor.setVendorLead(employeeRepository.findByIdAndUser_Tenant_Id(request.getVendorLeadId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Vendor Lead not found")));
        } else {
            vendor.setVendorLead(null);
        }

        if (request.getOwnerId() != null) {
            Employee owner = employeeRepository.findByIdAndUser_Tenant_Id(request.getOwnerId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Owner not found"));
            vendor.setOwner(owner);
            if (vendor.getCreatedBy() == null) {
                vendor.setCreatedBy(owner);
            }
        } else {
            vendor.setOwner(null);
        }
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsVendorSummaryResponse> getPage(AtsVendorFilterRequest filter) {
        Tenant tenant = currentTenant();
        Sort.Direction direction = Sort.Direction.fromString(filter.getSortDir());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, filter.getSortBy()));

        Specification<AtsVendor> spec = AtsVendorSpecification.buildSpec(filter, tenant.getId());
        return vendorRepository.findAll(spec, pageable).map(this::toSummary);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorDetailResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + id));
        return toDetail(vendor);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + id));
        vendorRepository.delete(vendor);
    }

    public AtsVendorSummaryResponse changeStatus(Long id, VendorStatus status) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + id));
        vendor.setVendorStatus(status);
        AtsVendor saved = vendorRepository.save(vendor);
        return toSummary(saved);
    }

    public AtsVendorSummaryResponse blacklist(Long id, String reason) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + id));
        vendor.setIsBlacklisted(true);
        vendor.setBlacklistReason(reason);
        AtsVendor saved = vendorRepository.save(vendor);
        return toSummary(saved);
    }

    public AtsVendorSummaryResponse unblacklist(Long id) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + id));
        vendor.setIsBlacklisted(false);
        vendor.setBlacklistReason(null);
        AtsVendor saved = vendorRepository.save(vendor);
        return toSummary(saved);
    }

    public AtsVendorSummaryResponse toSummary(AtsVendor vendor) {
        return AtsVendorSummaryResponse.builder()
                .id(vendor.getId())
                .vendorCode(vendor.getVendorCode())
                .companyName(vendor.getCompanyName())
                .displayName(vendor.getDisplayName())
                .vendorType(vendor.getVendorType())
                .vendorStatus(vendor.getVendorStatus())
                .isBlacklisted(vendor.getIsBlacklisted())
                .primaryEmail(vendor.getPrimaryEmail())
                .primaryPhone(vendor.getPrimaryPhone())
                .city(vendor.getCity())
                .countryName(vendor.getCountry() != null ? vendor.getCountry().getName() : null)
                .primaryBusinessUnitName(vendor.getPrimaryBusinessUnit() != null ? vendor.getPrimaryBusinessUnit().getName() : null)
                .contactCount(vendor.getContacts() != null ? vendor.getContacts().size() : 0)
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt())
                .build();
    }

    public AtsVendorDetailResponse toDetail(AtsVendor vendor) {
        AtsVendorDetailResponse.AtsVendorDetailResponseBuilder builder = AtsVendorDetailResponse.builder()
                .id(vendor.getId())
                .vendorCode(vendor.getVendorCode())
                .companyName(vendor.getCompanyName())
                .displayName(vendor.getDisplayName())
                .vendorType(vendor.getVendorType())
                .vendorStatus(vendor.getVendorStatus())
                .isBlacklisted(vendor.getIsBlacklisted())
                .blacklistReason(vendor.getBlacklistReason())
                .primaryEmail(vendor.getPrimaryEmail())
                .alternateEmail(vendor.getAlternateEmail())
                .primaryPhone(vendor.getPrimaryPhone())
                .faxNumber(vendor.getFaxNumber())
                .website(vendor.getWebsite())
                .taxId(vendor.getTaxId())
                .federalId(vendor.getFederalId())
                .address(vendor.getAddress())
                .city(vendor.getCity())
                .stateId(vendor.getState() != null ? vendor.getState().getId() : null)
                .stateName(vendor.getState() != null ? vendor.getState().getName() : null)
                .countryId(vendor.getCountry() != null ? vendor.getCountry().getId() : null)
                .countryName(vendor.getCountry() != null ? vendor.getCountry().getName() : null)
                .zipCode(vendor.getZipCode())
                .primaryBusinessUnitId(vendor.getPrimaryBusinessUnit() != null ? vendor.getPrimaryBusinessUnit().getId() : null)
                .primaryBusinessUnitName(vendor.getPrimaryBusinessUnit() != null ? vendor.getPrimaryBusinessUnit().getName() : null)
                .vendorLeadId(vendor.getVendorLead() != null ? vendor.getVendorLead().getId() : null)
                .vendorLeadName(vendor.getVendorLead() != null ? (vendor.getVendorLead().getFirstName() + " " + vendor.getVendorLead().getLastName()) : null)
                .ownerId(vendor.getOwner() != null ? vendor.getOwner().getId() : null)
                .ownerName(vendor.getOwner() != null ? (vendor.getOwner().getFirstName() + " " + vendor.getOwner().getLastName()) : null)
                .createdById(vendor.getCreatedBy() != null ? vendor.getCreatedBy().getId() : null)
                .createdByName(vendor.getCreatedBy() != null ? (vendor.getCreatedBy().getFirstName() + " " + vendor.getCreatedBy().getLastName()) : null)
                .technologies(vendor.getTechnologies())
                .aboutVendor(vendor.getAboutVendor())
                .notes(vendor.getNotes())
                .ownership(vendor.getOwnership())
                .vendorVisibility(vendor.getVendorVisibility())
                .sendRequirement(vendor.getSendRequirement())
                .sendHotlist(vendor.getSendHotlist())
                .allowAccessToAllUsers(vendor.getAllowAccessToAllUsers())
                .createdAt(vendor.getCreatedAt())
                .updatedAt(vendor.getUpdatedAt());

        if (vendor.getBusinessUnits() != null) {
            builder.businessUnits(vendor.getBusinessUnits().stream()
                    .map(bu -> AtsVendorDetailResponse.BuRef.builder()
                            .id(bu.getId())
                            .name(bu.getName())
                            .code(bu.getCode())
                            .build())
                    .collect(Collectors.toList()));
        }

        if (vendor.getContacts() != null) {
            builder.contacts(vendor.getContacts().stream()
                    .map(c -> AtsVendorContactResponse.builder()
                            .id(c.getId())
                            .isPrimary(c.getIsPrimary())
                            .salutation(c.getSalutation())
                            .firstName(c.getFirstName())
                            .lastName(c.getLastName())
                            .title(c.getTitle())
                            .designation(c.getDesignation())
                            .email(c.getEmail())
                            .phone(c.getPhone())
                            .phoneExtension(c.getPhoneExtension())
                            .mobile(c.getMobile())
                            .address1(c.getAddress1())
                            .address2(c.getAddress2())
                            .countryId(c.getCountry() != null ? c.getCountry().getId() : null)
                            .countryName(c.getCountry() != null ? c.getCountry().getName() : null)
                            .stateId(c.getState() != null ? c.getState().getId() : null)
                            .stateName(c.getState() != null ? c.getState().getName() : null)
                            .city(c.getCity())
                            .zipCode(c.getZipCode())
                            .linkedinUrl(c.getLinkedinUrl())
                            .status(c.getStatus())
                            .technologies(c.getTechnologies())
                            .ownerId(c.getOwner() != null ? c.getOwner().getId() : null)
                            .ownerName(c.getOwner() != null ? (c.getOwner().getFirstName() + " " + c.getOwner().getLastName()) : null)
                            .allowAccessToAllUsers(c.getAllowAccessToAllUsers())
                            .comment(c.getComment())
                            .createdAt(c.getCreatedAt())
                            .updatedAt(c.getUpdatedAt())
                            .build())
                    .collect(Collectors.toList()));
        }

        if (vendor.getAccount() != null) {
            builder.account(AtsVendorAccountResponse.builder()
                    .id(vendor.getAccount().getId())
                    .contactPerson(vendor.getAccount().getContactPerson())
                    .mobileNumber(vendor.getAccount().getMobileNumber())
                    .officeNumber(vendor.getAccount().getOfficeNumber())
                    .officeExtension(vendor.getAccount().getOfficeExtension())
                    .emailId(vendor.getAccount().getEmailId())
                    .designation(vendor.getAccount().getDesignation())
                    .paymentTerms(vendor.getAccount().getPaymentTerms())
                    .createdAt(vendor.getAccount().getCreatedAt())
                    .updatedAt(vendor.getAccount().getUpdatedAt())
                    .build());
        }

        if (vendor.getSubmissionFormat() != null) {
            builder.submissionFormat(AtsVendorSubmissionFormatResponse.builder()
                    .id(vendor.getSubmissionFormat().getId())
                    .submissionDescription(vendor.getSubmissionFormat().getSubmissionDescription())
                    .mailDescription(vendor.getSubmissionFormat().getMailDescription())
                    .mailingSubject(vendor.getSubmissionFormat().getMailingSubject())
                    .body(vendor.getSubmissionFormat().getBody())
                    .createdAt(vendor.getSubmissionFormat().getCreatedAt())
                    .updatedAt(vendor.getSubmissionFormat().getUpdatedAt())
                    .build());
        }
        
        if (vendor.getBankAccounts() != null) {
            builder.bankAccounts(vendor.getBankAccounts().stream()
                    .map(ba -> AtsVendorBankAccountResponse.builder()
                            .id(ba.getId())
                            .vendorId(ba.getVendor().getId())
                            .beneficiaryName(ba.getBeneficiaryName())
                            .bankName(ba.getBankName())
                            .accountType(ba.getAccountType())
                            .ifscRouting(ba.getIfscRouting())
                            .accountNumber(ba.getAccountNumber())
                            .depositAmount(ba.getDepositAmount())
                            .priority(ba.getPriority())
                            .comments(ba.getComments())
                            .addressLine1(ba.getAddressLine1())
                            .addressLine2(ba.getAddressLine2())
                            .countryId(ba.getCountry() != null ? ba.getCountry().getId() : null)
                            .countryName(ba.getCountry() != null ? ba.getCountry().getName() : null)
                            .stateId(ba.getState() != null ? ba.getState().getId() : null)
                            .stateName(ba.getState() != null ? ba.getState().getName() : null)
                            .city(ba.getCity())
                            .zipCode(ba.getZipCode())
                            .cancelledChequePath(ba.getCancelledChequePath())
                            .cancelledChequeName(ba.getCancelledChequeName())
                            .recordStatus(ba.getRecordStatus())
                            .attachmentPath(ba.getAttachmentPath())
                            .attachmentName(ba.getAttachmentName())
                            .build())
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
