package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccBankAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccBankAccountRepository extends JpaRepository<AccBankAccount, Long> {
    List<AccBankAccount> findByTenantId(String tenantId);
    List<AccBankAccount> findByBankIdAndTenantId(Long bankId, String tenantId);
}
