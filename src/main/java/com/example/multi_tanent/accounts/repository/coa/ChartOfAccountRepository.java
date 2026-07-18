package com.example.multi_tanent.accounts.repository.coa;

import com.example.multi_tanent.accounts.entity.coa.ChartOfAccount;
import com.example.multi_tanent.accounts.entity.enums.AccountSection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChartOfAccountRepository extends JpaRepository<ChartOfAccount, Long> {

    @Query("SELECT c FROM ChartOfAccount c WHERE c.accountCode = :accountCode AND c.tenant.id = :tenantId")
    Optional<ChartOfAccount> findByAccountCodeAndTenant(@Param("accountCode") String accountCode, @Param("tenantId") Long tenantId);

    @Query("SELECT c FROM ChartOfAccount c WHERE c.section = :section AND c.tenant.id = :tenantId")
    List<ChartOfAccount> findBySectionAndTenant(@Param("section") AccountSection section, @Param("tenantId") Long tenantId);

    @Query("SELECT c FROM ChartOfAccount c WHERE c.parentGroup = :parentGroup AND c.tenant.id = :tenantId")
    List<ChartOfAccount> findByParentGroupAndTenant(@Param("parentGroup") String parentGroup, @Param("tenantId") Long tenantId);

    @Query("SELECT c FROM ChartOfAccount c WHERE c.isActive = true AND c.tenant.id = :tenantId")
    List<ChartOfAccount> findByIsActiveTrueAndTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT COUNT(c) > 0 FROM ChartOfAccount c WHERE c.accountCode = :accountCode AND c.tenant.id = :tenantId")
    boolean existsByAccountCodeAndTenant(@Param("accountCode") String accountCode, @Param("tenantId") Long tenantId);

    @Query("SELECT c FROM ChartOfAccount c WHERE c.section IN :sections AND c.tenant.id = :tenantId")
    List<ChartOfAccount> findBySectionInAndTenant(@Param("sections") List<AccountSection> sections, @Param("tenantId") Long tenantId);

    @Query("SELECT c FROM ChartOfAccount c WHERE c.tenant.id = :tenantId")
    List<ChartOfAccount> findAllByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT DISTINCT c.parentGroup FROM ChartOfAccount c WHERE c.parentGroup IS NOT NULL AND c.tenant.id = :tenantId")
    List<String> findDistinctParentGroupsByTenant(@Param("tenantId") Long tenantId);
}
