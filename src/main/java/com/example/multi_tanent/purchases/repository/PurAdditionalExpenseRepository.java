package com.example.multi_tanent.purchases.repository;

import com.example.multi_tanent.purchases.entity.PurAdditionalExpense;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PurAdditionalExpenseRepository extends JpaRepository<PurAdditionalExpense, Long> {
    Page<PurAdditionalExpense> findByTenantId(Long tenantId, Pageable pageable);
    Optional<PurAdditionalExpense> findByTenantIdAndId(Long tenantId, Long id);
}
