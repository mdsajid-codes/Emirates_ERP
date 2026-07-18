package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorContactRequest;
import com.example.multi_tanent.ats.dto.AtsVendorContactResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorContact;
import com.example.multi_tanent.ats.repository.AtsCountryRepository;
import com.example.multi_tanent.ats.repository.AtsStateRepository;
import com.example.multi_tanent.ats.repository.AtsVendorContactRepository;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorContactService {

    private final AtsVendorContactRepository contactRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;
    private final AtsStateRepository stateRepository;
    private final AtsCountryRepository countryRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsVendorContactResponse create(Long vendorId, AtsVendorContactRequest request) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        if (request.getIsPrimary() != null && request.getIsPrimary()) {
            resetPrimaryContact(vendorId, tenant.getId());
        }

        AtsVendorContact contact = AtsVendorContact.builder()
                .tenant(tenant)
                .vendor(vendor)
                .isPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false)
                .salutation(request.getSalutation())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .title(request.getTitle())
                .designation(request.getDesignation())
                .email(request.getEmail())
                .phone(request.getPhone())
                .phoneExtension(request.getPhoneExtension())
                .mobile(request.getMobile())
                .address1(request.getAddress1())
                .address2(request.getAddress2())
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .linkedinUrl(request.getLinkedinUrl())
                .facebookUrl(request.getFacebookUrl())
                .twitterUrl(request.getTwitterUrl())
                .googlePlusUrl(request.getGooglePlusUrl())
                .status(request.getStatus())
                .technologies(request.getTechnologies())
                .allowAccessToAllUsers(request.getAllowAccessToAllUsers() != null ? request.getAllowAccessToAllUsers() : false)
                .comment(request.getComment())
                .sendRequirement(request.getSendRequirement() != null ? request.getSendRequirement() : false)
                .sendHotlist(request.getSendHotlist() != null ? request.getSendHotlist() : false)
                .vendorContactType(request.getVendorContactType())
                .vendorGroup(request.getVendorGroup())
                .build();

        resolveFKs(contact, request, tenant.getId());

        AtsVendorContact saved = contactRepository.save(contact);
        return toResponse(saved);
    }

    public AtsVendorContactResponse update(Long vendorId, Long contactId, AtsVendorContactRequest request) {
        Tenant tenant = currentTenant();
        vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsVendorContact contact = contactRepository.findByIdAndVendorIdAndTenantId(contactId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found with id " + contactId));

        if (request.getIsPrimary() != null && request.getIsPrimary() && !contact.getIsPrimary()) {
            resetPrimaryContact(vendorId, tenant.getId());
        }

        contact.setIsPrimary(request.getIsPrimary() != null ? request.getIsPrimary() : false);
        contact.setSalutation(request.getSalutation());
        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setTitle(request.getTitle());
        contact.setDesignation(request.getDesignation());
        contact.setEmail(request.getEmail());
        contact.setPhone(request.getPhone());
        contact.setPhoneExtension(request.getPhoneExtension());
        contact.setMobile(request.getMobile());
        contact.setAddress1(request.getAddress1());
        contact.setAddress2(request.getAddress2());
        contact.setCity(request.getCity());
        contact.setZipCode(request.getZipCode());
        contact.setLinkedinUrl(request.getLinkedinUrl());
        contact.setFacebookUrl(request.getFacebookUrl());
        contact.setTwitterUrl(request.getTwitterUrl());
        contact.setGooglePlusUrl(request.getGooglePlusUrl());
        contact.setStatus(request.getStatus());
        contact.setTechnologies(request.getTechnologies());
        if (request.getAllowAccessToAllUsers() != null) {
            contact.setAllowAccessToAllUsers(request.getAllowAccessToAllUsers());
        }
        contact.setComment(request.getComment());
        if (request.getSendRequirement() != null) {
            contact.setSendRequirement(request.getSendRequirement());
        }
        if (request.getSendHotlist() != null) {
            contact.setSendHotlist(request.getSendHotlist());
        }
        contact.setVendorContactType(request.getVendorContactType());
        contact.setVendorGroup(request.getVendorGroup());

        resolveFKs(contact, request, tenant.getId());

        AtsVendorContact saved = contactRepository.save(contact);
        return toResponse(saved);
    }

    private void resetPrimaryContact(Long vendorId, Long tenantId) {
        List<AtsVendorContact> contacts = contactRepository.findByVendorIdAndTenantId(vendorId, tenantId);
        for (AtsVendorContact c : contacts) {
            if (c.getIsPrimary()) {
                c.setIsPrimary(false);
                contactRepository.save(c);
            }
        }
    }

    private void resolveFKs(AtsVendorContact contact, AtsVendorContactRequest request, Long tenantId) {
        if (request.getStateId() != null) {
            contact.setState(stateRepository.findByIdAndTenantId(request.getStateId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("State not found")));
        } else {
            contact.setState(null);
        }

        if (request.getCountryId() != null) {
            contact.setCountry(countryRepository.findByIdAndTenantId(request.getCountryId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Country not found")));
        } else {
            contact.setCountry(null);
        }

        if (request.getOwnerId() != null) {
            Employee owner = employeeRepository.findByIdAndUser_Tenant_Id(request.getOwnerId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Owner not found"));
            contact.setOwner(owner);
        } else {
            contact.setOwner(null);
        }
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsVendorContactResponse> getAll(Long vendorId) {
        Tenant tenant = currentTenant();
        return contactRepository.findByVendorIdAndTenantId(vendorId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorContactResponse getById(Long vendorId, Long contactId) {
        Tenant tenant = currentTenant();
        AtsVendorContact contact = contactRepository.findByIdAndVendorIdAndTenantId(contactId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        return toResponse(contact);
    }

    public void delete(Long vendorId, Long contactId) {
        Tenant tenant = currentTenant();
        AtsVendorContact contact = contactRepository.findByIdAndVendorIdAndTenantId(contactId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        contactRepository.delete(contact);
    }

    public AtsVendorContactResponse setPrimary(Long vendorId, Long contactId) {
        Tenant tenant = currentTenant();
        resetPrimaryContact(vendorId, tenant.getId());

        AtsVendorContact contact = contactRepository.findByIdAndVendorIdAndTenantId(contactId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found"));
        contact.setIsPrimary(true);
        AtsVendorContact saved = contactRepository.save(contact);
        return toResponse(saved);
    }

    private AtsVendorContactResponse toResponse(AtsVendorContact c) {
        return AtsVendorContactResponse.builder()
                .id(c.getId())
                .vendorId(c.getVendor() != null ? c.getVendor().getId() : null)
                .vendorName(c.getVendor() != null ? c.getVendor().getCompanyName() : null)
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
                .facebookUrl(c.getFacebookUrl())
                .twitterUrl(c.getTwitterUrl())
                .googlePlusUrl(c.getGooglePlusUrl())
                .status(c.getStatus())
                .technologies(c.getTechnologies())
                .ownerId(c.getOwner() != null ? c.getOwner().getId() : null)
                .ownerName(c.getOwner() != null ? (c.getOwner().getFirstName() + " " + c.getOwner().getLastName()) : null)
                .allowAccessToAllUsers(c.getAllowAccessToAllUsers())
                .comment(c.getComment())
                .sendRequirement(c.getSendRequirement())
                .sendHotlist(c.getSendHotlist())
                .vendorContactType(c.getVendorContactType())
                .vendorGroup(c.getVendorGroup())
                .createdAt(c.getCreatedAt())
                .updatedAt(c.getUpdatedAt())
                .build();
    }
}
