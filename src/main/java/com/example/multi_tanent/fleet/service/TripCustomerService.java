package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.fleet.dtos.TripCustomerResponse;
import com.example.multi_tanent.fleet.entity.TripCustomer;
import com.example.multi_tanent.fleet.repository.TripCustomerRepository;
import com.example.multi_tanent.warehouse.service.WareStorageService;
import org.springframework.web.multipart.MultipartFile;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripCustomerService {
    private final TripCustomerRepository repository;
    private final TenantRepository tenantRepository;
    private final WareStorageService storageService;
    private final com.example.multi_tanent.fleet.repository.CustomerFollowUpRepository followUpRepository;

    @Transactional
    public TripCustomer createCustomer(TripCustomer customer, MultipartFile file) {
        customer.setTenant(getCurrentTenant());
        if (customer.getCustomerCode() == null || customer.getCustomerCode().isEmpty()) {
            customer.setCustomerCode(generateCustomerCode());
        }
        if (file != null && !file.isEmpty()) {
            try {
                String path = storageService.storeFile(file, "customers/contracts", getCurrentTenant().getTenantId());
                customer.setContractDocumentPath(path);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to store contract document", e);
            }
        }
        return repository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<TripCustomer> getAllActive() {
        return repository.findAllByTenantAndActiveTrue(getCurrentTenant());
    }

    @Transactional(readOnly = true)
    public TripCustomerResponse getTripCustomerById(Long id) {
        Tenant tenant = getCurrentTenant();
        TripCustomer customer = repository.findByTenantAndId(tenant, id)
                .orElseThrow(() -> new EntityNotFoundException("TripCustomer not found with ID: " + id));
        return TripCustomerResponse.fromEntity(customer);
    }

    @Transactional
    public TripCustomer updateCustomer(Long id, TripCustomer update, MultipartFile file) {
        TripCustomer existing = repository.findByTenantAndId(getCurrentTenant(), id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        
        existing.setCompanyName(update.getCompanyName());
        existing.setContactPerson(update.getContactPerson());
        existing.setPhone(update.getPhone());
        existing.setEmail(update.getEmail());
        existing.setTrnNumber(update.getTrnNumber());
        existing.setAddress(update.getAddress());
        existing.setCreditLimit(update.getCreditLimit());
        existing.setPaymentTermsDays(update.getPaymentTermsDays());
        existing.setContractStartDate(update.getContractStartDate());
        existing.setContractEndDate(update.getContractEndDate());
        existing.setCustomerType(update.getCustomerType());
        
        if (file != null && !file.isEmpty()) {
            try {
                String path = storageService.storeFile(file, "customers/contracts", getCurrentTenant().getTenantId());
                existing.setContractDocumentPath(path);
            } catch (java.io.IOException e) {
                throw new RuntimeException("Failed to store contract document", e);
            }
        }
        
        return repository.save(existing);
    }

    @Transactional
    public void deactivateCustomer(Long id) {
        TripCustomer customer = repository.findByTenantAndId(getCurrentTenant(), id)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        customer.setActive(false);
        repository.save(customer);
    }

    @Transactional
    public com.example.multi_tanent.fleet.entity.CustomerFollowUp logFollowUp(Long customerId, com.example.multi_tanent.fleet.entity.CustomerFollowUp followUp) {
        TripCustomer customer = repository.findByTenantAndId(getCurrentTenant(), customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        
        followUp.setCustomer(customer);
        followUp.setTenant(getCurrentTenant());
        return followUpRepository.save(followUp);
    }

    @Transactional(readOnly = true)
    public List<com.example.multi_tanent.fleet.entity.CustomerFollowUp> getFollowUps(Long customerId) {
        // Verify customer exists and belongs to tenant
        repository.findByTenantAndId(getCurrentTenant(), customerId)
                .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
        
        return followUpRepository.findByCustomerIdOrderByFollowUpDateDesc(customerId);
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<TripCustomerResponse> listCustomers(String search, org.springframework.data.domain.Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        org.springframework.data.domain.Page<TripCustomer> customers;
        if (search != null && !search.trim().isEmpty()) {
            String query = "%" + search.trim().toLowerCase() + "%";
            customers = repository.searchCustomers(tenant, query, pageable);
        } else {
            customers = repository.findAllByTenantAndActiveTrue(tenant, pageable);
        }
        return customers.map(TripCustomerResponse::fromEntity);
    }

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId).orElseThrow();
    }

    private String generateCustomerCode() {
        long count = repository.countByTenant(getCurrentTenant());
        return String.format("CUST-%04d", count + 1);
    }
}
