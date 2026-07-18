package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientAccountRequest;
import com.example.multi_tanent.ats.dto.AtsClientAccountResponse;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientAccount;
import com.example.multi_tanent.ats.repository.AtsClientAccountRepository;
import com.example.multi_tanent.ats.repository.AtsClientRepository;
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
public class AtsClientAccountService {

    private final AtsClientAccountRepository accountRepository;
    private final AtsClientRepository clientRepository;
    private final TenantRepository tenantRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsClientAccountResponse create(AtsClientAccountRequest request) {
        Tenant tenant = currentTenant();

        AtsClient client = clientRepository.findByIdAndTenantId(request.getClientId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + request.getClientId()));

        AtsClientAccount account = AtsClientAccount.builder()
                .tenant(tenant)
                .client(client)
                .contactPerson(request.getContactPerson())
                .mobileNumber(request.getMobileNumber())
                .officeNumber(request.getOfficeNumber())
                .officeExtension(request.getOfficeExtension())
                .emailId(request.getEmailId())
                .designation(request.getDesignation())
                .build();

        AtsClientAccount saved = accountRepository.save(account);
        return toResponse(saved);
    }

    public AtsClientAccountResponse update(Long id, AtsClientAccountRequest request) {
        Tenant tenant = currentTenant();

        AtsClientAccount account = accountRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client account not found with id " + id));

        AtsClient client = clientRepository.findByIdAndTenantId(request.getClientId(), tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + request.getClientId()));

        account.setClient(client);
        account.setContactPerson(request.getContactPerson());
        account.setMobileNumber(request.getMobileNumber());
        account.setOfficeNumber(request.getOfficeNumber());
        account.setOfficeExtension(request.getOfficeExtension());
        account.setEmailId(request.getEmailId());
        account.setDesignation(request.getDesignation());

        AtsClientAccount saved = accountRepository.save(account);
        return toResponse(saved);
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsClientAccountResponse> getByClientId(Long clientId) {
        Tenant tenant = currentTenant();
        // Verify client exists
        clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + clientId));

        return accountRepository.findByClientIdAndTenantId(clientId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientAccountResponse getById(Long id) {
        Tenant tenant = currentTenant();
        AtsClientAccount account = accountRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client account not found with id " + id));
        return toResponse(account);
    }

    public void delete(Long id) {
        Tenant tenant = currentTenant();
        AtsClientAccount account = accountRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client account not found with id " + id));
        accountRepository.delete(account);
    }

    public AtsClientAccountResponse toResponse(AtsClientAccount account) {
        return AtsClientAccountResponse.builder()
                .id(account.getId())
                .clientId(account.getClient().getId())
                .clientName(account.getClient().getClientName())
                .contactPerson(account.getContactPerson())
                .mobileNumber(account.getMobileNumber())
                .officeNumber(account.getOfficeNumber())
                .officeExtension(account.getOfficeExtension())
                .emailId(account.getEmailId())
                .designation(account.getDesignation())
                .createdAt(account.getCreatedAt())
                .updatedAt(account.getUpdatedAt())
                .build();
    }
}
