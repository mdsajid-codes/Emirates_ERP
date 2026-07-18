package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantRepository extends JpaRepository<Tenant, Long> {
    Optional<Tenant> findFirstByOrderByIdAsc();
    Optional<Tenant> findByName(String name); // Assuming the tenantId field is 'name' in Tenant.java
    
    Optional<Tenant> findByTenantId(String tenantId);
}