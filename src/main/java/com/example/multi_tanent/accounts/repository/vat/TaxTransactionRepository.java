package com.example.multi_tanent.accounts.repository.vat;

import com.example.multi_tanent.accounts.entity.vat.TaxTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface TaxTransactionRepository extends JpaRepository<TaxTransaction, Long> {
    List<TaxTransaction> findByTenantId(String tenantId);
    List<TaxTransaction> findByTenantIdAndTransactionDateBetween(String tenantId, LocalDate fromDate, LocalDate toDate);
    Optional<TaxTransaction> findByIdAndTenantId(Long id, String tenantId);
}
