package com.example.multi_tanent.purchases.repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurRfqQuestion;

import java.util.List;
import java.util.Optional;

public interface PurRfqQuestionRepository extends JpaRepository<PurRfqQuestion, Long> {
    Page<PurRfqQuestion> findByTenantId(Long tenantId, Pageable pageable);
    List<PurRfqQuestion> findByTenantId(Long tenantId);
    Optional<PurRfqQuestion> findByIdAndTenantId(Long id, Long tenantId);
}
