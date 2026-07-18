package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsClientAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsClientAccountRepository extends JpaRepository<AtsClientAccount, Long> {
    List<AtsClientAccount> findByClientIdAndTenantId(Long clientId, Long tenantId);
    Optional<AtsClientAccount> findByIdAndTenantId(Long id, Long tenantId);
}
