package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.CustomerRequest;
import com.example.multi_tanent.pos.entity.Customer;
import com.example.multi_tanent.pos.repository.CustomerRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final TenantRepository tenantRepository;

    public CustomerService(CustomerRepository customerRepository, TenantRepository tenantRepository) {
        this.customerRepository = customerRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform customer operations."));
    }

    public Customer createCustomer(CustomerRequest request) {
        Tenant currentTenant = getCurrentTenant();

        Customer customer = new Customer();
        customer.setTenant(currentTenant);
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        customer.setLoyaltyPoints(0L);

        return customerRepository.save(customer);
    }

    @Transactional(readOnly = true)
    public List<Customer> getAllCustomersForCurrentTenant() {
        Tenant currentTenant = getCurrentTenant();
        return customerRepository.findByTenantId(currentTenant.getId());
    }

    @Transactional(readOnly = true)
    public Optional<Customer> getCustomerById(Long id) {
        Tenant currentTenant = getCurrentTenant();
        return customerRepository.findByIdAndTenantId(id, currentTenant.getId());
    }

    public Customer updateCustomer(Long id, CustomerRequest request) {
        Customer customer = getCustomerById(id).orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        customer.setName(request.getName());
        customer.setEmail(request.getEmail());
        customer.setPhone(request.getPhone());
        return customerRepository.save(customer);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomerById(id).orElseThrow(() -> new RuntimeException("Customer not found with id: " + id));
        customerRepository.delete(customer);
    }
}