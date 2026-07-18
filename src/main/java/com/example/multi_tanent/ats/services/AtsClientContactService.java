package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientContactRequest;
import com.example.multi_tanent.ats.dto.AtsClientContactResponse;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientContact;
import com.example.multi_tanent.ats.entity.AtsCountry;
import com.example.multi_tanent.ats.entity.AtsState;
import com.example.multi_tanent.ats.repository.AtsClientContactRepository;
import com.example.multi_tanent.ats.repository.AtsClientRepository;
import com.example.multi_tanent.ats.repository.AtsCountryRepository;
import com.example.multi_tanent.ats.repository.AtsStateRepository;
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
public class AtsClientContactService {

    private final AtsClientContactRepository contactRepository;
    private final AtsClientRepository clientRepository;
    private final AtsCountryRepository countryRepository;
    private final AtsStateRepository stateRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsClientContactResponse create(Long clientId, AtsClientContactRequest request) {
        Tenant tenant = currentTenant();

        AtsClient client = clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id: " + clientId));

        Employee primaryOwner = employeeRepository.findByIdAndUser_Tenant_Id(request.getPrimaryOwnerId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Employee (PrimaryOwner) not found with id: " + request.getPrimaryOwnerId()));

        AtsCountry country = null;
        if (request.getCountryId() != null) {
            country = countryRepository.findById(request.getCountryId())
                    .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + request.getCountryId()));
        }

        AtsState state = null;
        if (request.getStateId() != null) {
            state = stateRepository.findById(request.getStateId())
                    .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + request.getStateId()));
        }

        AtsClientContact contact = AtsClientContact.builder()
                .tenant(tenant)
                .client(client)
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .designation(request.getDesignation())
                .officeNumber(request.getOfficeNumber())
                .officeExtension(request.getOfficeExtension())
                .mobileNumber(request.getMobileNumber())
                .emailId(request.getEmailId())
                .secondaryEmailId(request.getSecondaryEmailId())
                .primaryOwner(primaryOwner)
                .ownership(request.getOwnership())
                .allowAccessToAllUsers(request.getAllowAccessToAllUsers() != null ? request.getAllowAccessToAllUsers() : false)
                .address1(request.getAddress1())
                .address2(request.getAddress2())
                .country(country)
                .state(state)
                .city(request.getCity())
                .zipCode(request.getZipCode())
                .linkedinProfileUrl(request.getLinkedinProfileUrl())
                .facebookProfileUrl(request.getFacebookProfileUrl())
                .twitterProfileUrl(request.getTwitterProfileUrl())
                .googlePlusProfileUrl(request.getGooglePlusProfileUrl())
                .status(request.getStatus())
                .clientGroup(request.getClientGroup())
                .aboutTheContact(request.getAboutTheContact())
                .build();

        AtsClientContact saved = contactRepository.save(contact);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsClientContactResponse> getAll(Long clientId) {
        Tenant tenant = currentTenant();
        // verify client exists
        if (!clientRepository.existsById(clientId)) {
            throw new EntityNotFoundException("Client not found with id: " + clientId);
        }
        return contactRepository.findByClientIdAndTenantId(clientId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientContactResponse getById(Long clientId, Long id) {
        Tenant tenant = currentTenant();
        return contactRepository.findByIdAndClientIdAndTenantId(id, clientId, tenant.getId())
                .map(this::toResponse)
                .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + id));
    }

    public AtsClientContactResponse update(Long clientId, Long id, AtsClientContactRequest request) {
        Tenant tenant = currentTenant();
        AtsClientContact contact = contactRepository.findByIdAndClientIdAndTenantId(id, clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + id));

        Employee primaryOwner = employeeRepository.findByIdAndUser_Tenant_Id(request.getPrimaryOwnerId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Employee (PrimaryOwner) not found with id: " + request.getPrimaryOwnerId()));

        AtsCountry country = null;
        if (request.getCountryId() != null) {
            country = countryRepository.findById(request.getCountryId())
                    .orElseThrow(() -> new EntityNotFoundException("Country not found with id: " + request.getCountryId()));
        }

        AtsState state = null;
        if (request.getStateId() != null) {
            state = stateRepository.findById(request.getStateId())
                    .orElseThrow(() -> new EntityNotFoundException("State not found with id: " + request.getStateId()));
        }

        contact.setFirstName(request.getFirstName());
        contact.setLastName(request.getLastName());
        contact.setDesignation(request.getDesignation());
        contact.setOfficeNumber(request.getOfficeNumber());
        contact.setOfficeExtension(request.getOfficeExtension());
        contact.setMobileNumber(request.getMobileNumber());
        contact.setEmailId(request.getEmailId());
        contact.setSecondaryEmailId(request.getSecondaryEmailId());
        contact.setPrimaryOwner(primaryOwner);
        contact.setOwnership(request.getOwnership());
        if (request.getAllowAccessToAllUsers() != null) {
            contact.setAllowAccessToAllUsers(request.getAllowAccessToAllUsers());
        }
        contact.setAddress1(request.getAddress1());
        contact.setAddress2(request.getAddress2());
        contact.setCountry(country);
        contact.setState(state);
        contact.setCity(request.getCity());
        contact.setZipCode(request.getZipCode());
        contact.setLinkedinProfileUrl(request.getLinkedinProfileUrl());
        contact.setFacebookProfileUrl(request.getFacebookProfileUrl());
        contact.setTwitterProfileUrl(request.getTwitterProfileUrl());
        contact.setGooglePlusProfileUrl(request.getGooglePlusProfileUrl());
        contact.setStatus(request.getStatus());
        contact.setClientGroup(request.getClientGroup());
        contact.setAboutTheContact(request.getAboutTheContact());

        AtsClientContact updated = contactRepository.save(contact);
        return toResponse(updated);
    }

    public void delete(Long clientId, Long id) {
        Tenant tenant = currentTenant();
        AtsClientContact contact = contactRepository.findByIdAndClientIdAndTenantId(id, clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Contact not found with id: " + id));
        contactRepository.delete(contact);
    }

    public AtsClientContactResponse toResponse(AtsClientContact contact) {
        return AtsClientContactResponse.builder()
                .id(contact.getId())
                .clientId(contact.getClient().getId())
                .firstName(contact.getFirstName())
                .lastName(contact.getLastName())
                .designation(contact.getDesignation())
                .officeNumber(contact.getOfficeNumber())
                .officeExtension(contact.getOfficeExtension())
                .mobileNumber(contact.getMobileNumber())
                .emailId(contact.getEmailId())
                .secondaryEmailId(contact.getSecondaryEmailId())
                .primaryOwnerId(contact.getPrimaryOwner() != null ? contact.getPrimaryOwner().getId() : null)
                .primaryOwnerName(contact.getPrimaryOwner() != null ? 
                        (contact.getPrimaryOwner().getFirstName() + " " + contact.getPrimaryOwner().getLastName()) : null)
                .ownership(contact.getOwnership())
                .allowAccessToAllUsers(contact.getAllowAccessToAllUsers())
                .address1(contact.getAddress1())
                .address2(contact.getAddress2())
                .countryId(contact.getCountry() != null ? contact.getCountry().getId() : null)
                .countryName(contact.getCountry() != null ? contact.getCountry().getName() : null)
                .stateId(contact.getState() != null ? contact.getState().getId() : null)
                .stateName(contact.getState() != null ? contact.getState().getName() : null)
                .city(contact.getCity())
                .zipCode(contact.getZipCode())
                .linkedinProfileUrl(contact.getLinkedinProfileUrl())
                .facebookProfileUrl(contact.getFacebookProfileUrl())
                .twitterProfileUrl(contact.getTwitterProfileUrl())
                .googlePlusProfileUrl(contact.getGooglePlusProfileUrl())
                .status(contact.getStatus())
                .clientGroup(contact.getClientGroup())
                .aboutTheContact(contact.getAboutTheContact())
                .build();
    }
}
