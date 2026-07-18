package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProSemifinished;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProSemiFinishedRepository extends JpaRepository<ProSemifinished, Long> {
    Page<ProSemifinished> findByTenantId(Long tenantId, Pageable pageable);

    List<ProSemifinished> findByTenantId(Long tenantId);

    Optional<ProSemifinished> findByTenantIdAndId(Long tenantId, Long id);

    boolean existsByTenantIdAndItemCodeIgnoreCase(Long tenantId, String itemCode);

    Optional<ProSemifinished> findByTenantIdAndItemCodeIgnoreCase(Long tenantId, String itemCode);
}
