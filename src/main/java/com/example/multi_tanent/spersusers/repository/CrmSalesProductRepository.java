package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CrmSalesProductRepository extends JpaRepository<CrmSalesProduct, Long> {
    List<CrmSalesProduct> findByTenantId(Long tenantId);

    Page<CrmSalesProduct> findByTenantId(Long tenantId, Pageable pageable);

    Optional<CrmSalesProduct> findByIdAndTenantId(Long id, Long tenantId);
}
