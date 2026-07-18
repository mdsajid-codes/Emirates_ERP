package com.example.multi_tanent.sales.repository;

import com.example.multi_tanent.sales.entity.SalAdditionalExpense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SalAdditionalExpenseRepository extends JpaRepository<SalAdditionalExpense, Long> {
    Page<SalAdditionalExpense> findByTenantId(Long tenantId, Pageable pageable);
    Optional<SalAdditionalExpense> findByTenantIdAndId(Long tenantId, Long id);
}
