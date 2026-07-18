package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.CustomerFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CustomerFollowUpRepository extends JpaRepository<CustomerFollowUp, Long> {
    List<CustomerFollowUp> findByCustomerIdOrderByFollowUpDateDesc(Long customerId);
    List<CustomerFollowUp> findByTenantIdOrderByFollowUpDateDesc(Long tenantId);
}
