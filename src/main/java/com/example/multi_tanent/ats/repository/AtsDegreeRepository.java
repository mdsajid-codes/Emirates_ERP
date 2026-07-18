package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsDegree;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsDegreeRepository extends JpaRepository<AtsDegree, Long> {
    Page<AtsDegree> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsDegree> findByTenantId(Long tenantId);
    Optional<AtsDegree> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByNameAndTenantId(String name, Long tenantId);
}
