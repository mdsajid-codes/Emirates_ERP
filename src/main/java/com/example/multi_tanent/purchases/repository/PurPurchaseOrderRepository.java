package com.example.multi_tanent.purchases.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.example.multi_tanent.purchases.entity.PurPurchaseOrder;

import jakarta.persistence.LockModeType;

import java.util.List;
import java.util.Optional;

public interface PurPurchaseOrderRepository extends JpaRepository<PurPurchaseOrder, Long> {
    Page<PurPurchaseOrder> findByTenantId(Long tenantId, Pageable pageable);

    List<PurPurchaseOrder> findByTenantId(Long tenantId);

    Optional<PurPurchaseOrder> findByIdAndTenantId(Long id, Long tenantId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM PurPurchaseOrder p LEFT JOIN FETCH p.items i WHERE p.id = :id")
    Optional<PurPurchaseOrder> findByIdWithItemsForUpdate(@Param("id") Long id);

    long countByTenantId(Long tenantId);

    // If you use tenant-scoped lookup method elsewhere (e.g. findByIdAndTenantId),
    // add a similar version that includes tenant id in WHERE clause and a join
    // fetch.

}
