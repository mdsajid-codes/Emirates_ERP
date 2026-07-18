package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.*;
import com.example.multi_tanent.ats.entity.*;
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
public class AtsClientService {

    private final AtsClientRepository clientRepository;
    private final TenantRepository tenantRepository;
    private final AtsStateRepository stateRepository;
    private final AtsCountryRepository countryRepository;
    private final AtsBusinessUnitRepository businessUnitRepository;
    private final EmployeeRepository employeeRepository;
    private final AtsDocumentTypeRepository documentTypeRepository;
    private final AtsPaymentTermsRepository paymentTermsRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsClientDetailResponse create(AtsClientRequest request) {
        Tenant tenant = currentTenant();

        if (clientRepository.existsByClientNameAndTenantId(request.getClientName(), tenant.getId())) {
            throw new IllegalArgumentException("Client with name '" + request.getClientName() + "' already exists.");
        }

        AtsClient client = AtsClient.builder()
                .tenant(tenant)
                .clientName(request.getClientName())
                .clientVisibility(request.getClientVisibility())
                .clientFacilities(request.getClientFacilities())
                .vmsClientName(request.getVmsClientName())
                .federalId(request.getFederalId())
                .contactNumber(request.getContactNumber())
                .emailId(request.getEmailId())
                .address(request.getAddress())
                .notifyUserNearLocation(request.getNotifyUserNearLocation() != null ? request.getNotifyUserNearLocation() : false)
                .city(request.getCity())
                .postalCode(request.getPostalCode())
                .website(request.getWebsite())
                .sendRequirement(request.getSendRequirement() != null ? request.getSendRequirement() : false)
                .sendHotlist(request.getSendHotlist() != null ? request.getSendHotlist() : false)
                .fax(request.getFax())
                .industry(request.getIndustry())
                .status(request.getStatus())
                .category(request.getCategory())
                .ownership(request.getOwnership())
                .allowAccessToAllUsers(request.getAllowAccessToAllUsers() != null ? request.getAllowAccessToAllUsers() : false)
                .displayOnJob(request.getDisplayOnJob() != null ? request.getDisplayOnJob() : true)
                .practice(request.getPractice())
                .aboutCompany(request.getAboutCompany())
                .stopSubmitEmailNotification(request.getStopSubmitEmailNotification() != null ? request.getStopSubmitEmailNotification() : false)
                .defaultAddressForJobs(request.getDefaultAddressForJobs() != null ? request.getDefaultAddressForJobs() : false)
                .clientShortName(request.getClientShortName())
                .build();

        resolveFKs(client, request, tenant.getId());

        AtsClient saved = clientRepository.save(client);
        return toDetail(saved);
    }

    public AtsClientDetailResponse update(Long id, AtsClientRequest request) {
        Tenant tenant = currentTenant();
        AtsClient client = clientRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + id));

        if (!client.getClientName().equalsIgnoreCase(request.getClientName()) &&
                clientRepository.existsByClientNameAndTenantId(request.getClientName(), tenant.getId())) {
            throw new IllegalArgumentException("Client with name '" + request.getClientName() + "' already exists.");
        }

        client.setClientName(request.getClientName());
        client.setClientVisibility(request.getClientVisibility());
        client.setClientFacilities(request.getClientFacilities());
        client.setVmsClientName(request.getVmsClientName());
        client.setFederalId(request.getFederalId());
        client.setContactNumber(request.getContactNumber());
        client.setEmailId(request.getEmailId());
        client.setAddress(request.getAddress());
        if (request.getNotifyUserNearLocation() != null) client.setNotifyUserNearLocation(request.getNotifyUserNearLocation());
        client.setCity(request.getCity());
        client.setPostalCode(request.getPostalCode());
        client.setWebsite(request.getWebsite());
        if (request.getSendRequirement() != null) client.setSendRequirement(request.getSendRequirement());
        if (request.getSendHotlist() != null) client.setSendHotlist(request.getSendHotlist());
        client.setFax(request.getFax());
        client.setIndustry(request.getIndustry());
        client.setStatus(request.getStatus());
        client.setCategory(request.getCategory());
        client.setOwnership(request.getOwnership());
        if (request.getAllowAccessToAllUsers() != null) client.setAllowAccessToAllUsers(request.getAllowAccessToAllUsers());
        if (request.getDisplayOnJob() != null) client.setDisplayOnJob(request.getDisplayOnJob());
        client.setPractice(request.getPractice());
        client.setAboutCompany(request.getAboutCompany());
        if (request.getStopSubmitEmailNotification() != null) client.setStopSubmitEmailNotification(request.getStopSubmitEmailNotification());
        if (request.getDefaultAddressForJobs() != null) client.setDefaultAddressForJobs(request.getDefaultAddressForJobs());
        client.setClientShortName(request.getClientShortName());

        resolveFKs(client, request, tenant.getId());

        AtsClient saved = clientRepository.save(client);
        return toDetail(saved);
    }

    private void resolveFKs(AtsClient client, AtsClientRequest request, Long tenantId) {
        if (request.getStateId() != null) {
            client.setState(stateRepository.findByIdAndTenantId(request.getStateId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("State not found")));
        } else {
            client.setState(null);
        }

        if (request.getCountryId() != null) {
            client.setCountry(countryRepository.findByIdAndTenantId(request.getCountryId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Country not found")));
        } else {
            client.setCountry(null);
        }

        if (request.getPrimaryBusinessUnitId() != null) {
            client.setPrimaryBusinessUnit(businessUnitRepository.findByIdAndTenantId(request.getPrimaryBusinessUnitId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Primary Business Unit not found")));
        } else {
            client.setPrimaryBusinessUnit(null);
        }

        if (request.getBusinessUnitIds() != null) {
            List<AtsBusinessUnit> bus = new ArrayList<>();
            for (Long buId : request.getBusinessUnitIds()) {
                bus.add(businessUnitRepository.findByIdAndTenantId(buId, tenantId)
                        .orElseThrow(() -> new EntityNotFoundException("Business Unit not found with id " + buId)));
            }
            client.setBusinessUnits(bus);
        } else {
            client.setBusinessUnits(new ArrayList<>());
        }

        if (request.getParentClientId() != null) {
            client.setParentClient(clientRepository.findByIdAndTenantId(request.getParentClientId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Parent Client not found")));
        } else {
            client.setParentClient(null);
        }

        if (request.getPrimaryOwnerId() != null) {
            client.setPrimaryOwner(employeeRepository.findByIdAndUser_Tenant_Id(request.getPrimaryOwnerId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Primary Owner not found")));
        } else {
            client.setPrimaryOwner(null);
        }

        if (request.getClientLeadId() != null) {
            client.setClientLead(employeeRepository.findByIdAndUser_Tenant_Id(request.getClientLeadId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Client Lead not found")));
        } else {
            client.setClientLead(null);
        }

        if (request.getPaymentTermsId() != null) {
            client.setPaymentTerms(paymentTermsRepository.findByIdAndTenantId(request.getPaymentTermsId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Payment Terms not found")));
        } else {
            client.setPaymentTerms(null);
        }

        if (request.getRequiredDocumentTypeIds() != null) {
            List<AtsDocumentType> docs = new ArrayList<>();
            for (Long docId : request.getRequiredDocumentTypeIds()) {
                docs.add(documentTypeRepository.findByIdAndTenantId(docId, tenantId)
                        .orElseThrow(() -> new EntityNotFoundException("Document Type not found with id " + docId)));
            }
            client.setRequiredDocuments(docs);
        } else {
            client.setRequiredDocuments(new ArrayList<>());
        }
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public Page<AtsClientSummaryResponse> getPage(AtsClientFilterRequest filter) {
        Tenant tenant = currentTenant();
        Sort.Direction direction = Sort.Direction.fromString(filter.getSortDir());
        Pageable pageable = PageRequest.of(filter.getPage(), filter.getSize(), Sort.by(direction, filter.getSortBy()));

        Specification<AtsClient> spec = AtsClientSpecification.buildSpec(filter, tenant.getId());
        return clientRepository.findAll(spec, pageable).map(this::toSummary);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientDetailResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsClient client = clientRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + id));
        return toDetail(client);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsClient client = clientRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + id));
        clientRepository.delete(client);
    }

    public AtsClientSummaryResponse toSummary(AtsClient client) {
        return AtsClientSummaryResponse.builder()
                .id(client.getId())
                .clientName(client.getClientName())
                .clientShortName(client.getClientShortName())
                .emailId(client.getEmailId())
                .contactNumber(client.getContactNumber())
                .status(client.getStatus())
                .website(client.getWebsite())
                .city(client.getCity())
                .countryName(client.getCountry() != null ? client.getCountry().getName() : null)
                .primaryOwnerName(client.getPrimaryOwner() != null ? (client.getPrimaryOwner().getFirstName() + " " + client.getPrimaryOwner().getLastName()) : null)
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt())
                .build();
    }

    public AtsClientDetailResponse toDetail(AtsClient client) {
        AtsClientDetailResponse.AtsClientDetailResponseBuilder builder = AtsClientDetailResponse.builder()
                .id(client.getId())
                .clientName(client.getClientName())
                .clientShortName(client.getClientShortName())
                .clientVisibility(client.getClientVisibility())
                .clientFacilities(client.getClientFacilities())
                .vmsClientName(client.getVmsClientName())
                .federalId(client.getFederalId())
                .contactNumber(client.getContactNumber())
                .emailId(client.getEmailId())
                .address(client.getAddress())
                .parentClientId(client.getParentClient() != null ? client.getParentClient().getId() : null)
                .parentClientName(client.getParentClient() != null ? client.getParentClient().getClientName() : null)
                .notifyUserNearLocation(client.getNotifyUserNearLocation())
                .countryId(client.getCountry() != null ? client.getCountry().getId() : null)
                .countryName(client.getCountry() != null ? client.getCountry().getName() : null)
                .stateId(client.getState() != null ? client.getState().getId() : null)
                .stateName(client.getState() != null ? client.getState().getName() : null)
                .city(client.getCity())
                .postalCode(client.getPostalCode())
                .website(client.getWebsite())
                .sendRequirement(client.getSendRequirement())
                .sendHotlist(client.getSendHotlist())
                .fax(client.getFax())
                .industry(client.getIndustry())
                .status(client.getStatus())
                .category(client.getCategory())
                .primaryOwnerId(client.getPrimaryOwner() != null ? client.getPrimaryOwner().getId() : null)
                .primaryOwnerName(client.getPrimaryOwner() != null ? (client.getPrimaryOwner().getFirstName() + " " + client.getPrimaryOwner().getLastName()) : null)
                .ownership(client.getOwnership())
                .clientLeadId(client.getClientLead() != null ? client.getClientLead().getId() : null)
                .clientLeadName(client.getClientLead() != null ? (client.getClientLead().getFirstName() + " " + client.getClientLead().getLastName()) : null)
                .allowAccessToAllUsers(client.getAllowAccessToAllUsers())
                .displayOnJob(client.getDisplayOnJob())
                .paymentTermsId(client.getPaymentTerms() != null ? client.getPaymentTerms().getId() : null)
                .paymentTermsName(client.getPaymentTerms() != null ? client.getPaymentTerms().getName() : null)
                .practice(client.getPractice())
                .aboutCompany(client.getAboutCompany())
                .stopSubmitEmailNotification(client.getStopSubmitEmailNotification())
                .defaultAddressForJobs(client.getDefaultAddressForJobs())
                .primaryBusinessUnitId(client.getPrimaryBusinessUnit() != null ? client.getPrimaryBusinessUnit().getId() : null)
                .primaryBusinessUnitName(client.getPrimaryBusinessUnit() != null ? client.getPrimaryBusinessUnit().getName() : null)
                .createdAt(client.getCreatedAt())
                .updatedAt(client.getUpdatedAt());

        if (client.getBusinessUnits() != null) {
            builder.businessUnits(client.getBusinessUnits().stream()
                    .map(bu -> AtsClientDetailResponse.BuRef.builder()
                            .id(bu.getId())
                            .name(bu.getName())
                            .code(bu.getCode())
                            .build())
                    .collect(Collectors.toList()));
        }

        if (client.getRequiredDocuments() != null) {
            builder.requiredDocuments(client.getRequiredDocuments().stream()
                    .map(d -> AtsClientDetailResponse.DocTypeRef.builder()
                            .id(d.getId())
                            .name(d.getName())
                            .build())
                    .collect(Collectors.toList()));
        }

        return builder.build();
    }
}
