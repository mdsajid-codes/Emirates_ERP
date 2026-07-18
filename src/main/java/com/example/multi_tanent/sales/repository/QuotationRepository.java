package com.example.multi_tanent.sales.repository;

import com.example.multi_tanent.sales.entity.Quotation;
import com.example.multi_tanent.sales.enums.SalesStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<Quotation> {
    Page<Quotation> findByTenantId(Long tenantId, Pageable pageable);

    Optional<Quotation> findByIdAndTenantId(Long id, Long tenantId);

    Optional<Quotation> findByQuotationNumberAndTenantId(String quotationNumber, Long tenantId);

    long countByTenantIdAndStatus(Long tenantId, SalesStatus status);

    @Query("SELECT SUM(q.netTotal) FROM Quotation q WHERE q.tenant.id = :tenantId AND q.status IN :statuses")
    BigDecimal sumNetTotalByTenantIdAndStatusIn(@Param("tenantId") Long tenantId, @Param("statuses") List<SalesStatus> statuses);

    List<Quotation> findTop5ByTenantIdOrderByCreatedAtDesc(Long tenantId);
}
