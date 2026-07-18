package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.BankGLAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BankGLAccountRepository extends JpaRepository<BankGLAccount, Long> {

    @Query("SELECT b FROM BankGLAccount b WHERE b.tenant.id = :tenantId")
    List<BankGLAccount> findAllByTenant(Long tenantId);

    @Query("SELECT b FROM BankGLAccount b WHERE b.bankAccountId = :bankAccountId AND b.tenant.id = :tenantId")
    Optional<BankGLAccount> findByBankAccountIdAndTenantId(Long bankAccountId, Long tenantId);
}
