package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccPayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccPaymentRepository extends JpaRepository<AccPayment, Long> {
    List<AccPayment> findByTenantId(String tenantId);
    Long countByTenantIdAndPaymentNumberStartingWith(String tenantId, String prefix);
}
