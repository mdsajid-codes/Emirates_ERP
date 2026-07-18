package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsCountry;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsCountryRepository extends JpaRepository<AtsCountry, Long> {
    Page<AtsCountry> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsCountry> findByTenantId(Long tenantId);
    Optional<AtsCountry> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByNameAndTenantId(String name, Long tenantId);
    Optional<AtsCountry> findByNameAndTenantId(String name, Long tenantId);
}
