package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurGrn;
import java.util.List;

public interface PurGrnRepository extends JpaRepository<PurGrn, Long> {
    List<PurGrn> findByPurchaseOrderId(Long purchaseOrderId);
    
    long countByPurchaseOrder_Tenant_Id(Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT g FROM PurGrn g WHERE g.purchaseOrder.tenant.id = :tenantId")
    List<PurGrn> findByTenantId(@org.springframework.data.repository.query.Param("tenantId") Long tenantId);
}
