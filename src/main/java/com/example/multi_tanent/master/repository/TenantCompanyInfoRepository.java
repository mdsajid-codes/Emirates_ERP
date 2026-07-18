package com.example.multi_tanent.master.repository;

import com.example.multi_tanent.master.entity.TenantCompanyInfo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface TenantCompanyInfoRepository extends JpaRepository<TenantCompanyInfo, Long> {
    Optional<TenantCompanyInfo> findByMasterTenantId(Long masterTenantId);
}
