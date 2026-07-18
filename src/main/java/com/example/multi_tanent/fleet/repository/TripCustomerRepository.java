package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.fleet.entity.TripCustomer;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TripCustomerRepository extends JpaRepository<TripCustomer, Long> {
    List<TripCustomer> findAllByTenantAndActiveTrue(Tenant tenant);
    Optional<TripCustomer> findByTenantAndId(Tenant tenant, Long id);
    Optional<TripCustomer> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByTenantAndCompanyName(Tenant tenant, String companyName);
    long countByTenant(Tenant tenant);

    org.springframework.data.domain.Page<TripCustomer> findAllByTenantAndActiveTrue(Tenant tenant, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT c FROM TripCustomer c WHERE c.tenant = :tenant AND c.active = true AND " +
            "(LOWER(c.companyName) LIKE :query OR LOWER(c.contactPerson) LIKE :query OR LOWER(c.email) LIKE :query OR LOWER(c.phone) LIKE :query)")
    org.springframework.data.domain.Page<TripCustomer> searchCustomers(
            @org.springframework.data.repository.query.Param("tenant") Tenant tenant,
            @org.springframework.data.repository.query.Param("query") String query,
            org.springframework.data.domain.Pageable pageable);
}
