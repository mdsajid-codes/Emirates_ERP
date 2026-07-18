package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.FixedAssetGLAccount;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FixedAssetGLAccountRepository extends JpaRepository<FixedAssetGLAccount, Long> {

    @Query("SELECT f FROM FixedAssetGLAccount f WHERE f.tenant.id = :tenantId")
    List<FixedAssetGLAccount> findAllByTenant(@Param("tenantId") Long tenantId);

    @Query("SELECT f FROM FixedAssetGLAccount f WHERE f.fixedAssetId = :fixedAssetId AND f.tenant.id = :tenantId")
    Optional<FixedAssetGLAccount> findByFixedAssetIdAndTenantId(@Param("fixedAssetId") Long fixedAssetId, @Param("tenantId") Long tenantId);
}
