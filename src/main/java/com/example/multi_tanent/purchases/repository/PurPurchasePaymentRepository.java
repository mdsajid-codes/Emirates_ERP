package com.example.multi_tanent.purchases.repository;

// package com.example.multi_tanent.purchases.repository;

import com.example.multi_tanent.purchases.entity.PurPurchasePayment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import java.util.Optional;

public interface PurPurchasePaymentRepository extends JpaRepository<PurPurchasePayment, Long> {
    Page<PurPurchasePayment> findByTenantId(Long tenantId, Pageable pageable);

    java.util.List<PurPurchasePayment> findByTenantId(Long tenantId);

    Optional<PurPurchasePayment> findByIdAndTenantId(Long id, Long tenantId);
}
