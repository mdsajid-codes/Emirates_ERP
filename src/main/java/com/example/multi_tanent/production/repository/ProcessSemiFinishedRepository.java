package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProcessSemiFinished;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ProcessSemiFinishedRepository extends JpaRepository<ProcessSemiFinished, Long> {
    Page<ProcessSemiFinished> findByTenantId(Long tenantId, Pageable pageable);

    Optional<ProcessSemiFinished> findByIdAndTenantId(Long id, Long tenantId);

    Optional<ProcessSemiFinished> findByTenantIdAndItemId(Long tenantId, Long itemId);
}
