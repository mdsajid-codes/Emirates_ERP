package com.example.multi_tanent.ats.repository;

import com.example.multi_tanent.ats.entity.AtsState;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AtsStateRepository extends JpaRepository<AtsState, Long> {
    Page<AtsState> findByTenantId(Long tenantId, Pageable pageable);
    List<AtsState> findByTenantId(Long tenantId);
    Optional<AtsState> findByIdAndTenantId(Long id, Long tenantId);
    boolean existsByNameAndCountryIdAndTenantId(String name, Long countryId, Long tenantId);
    Optional<AtsState> findByNameAndCountryIdAndTenantId(String name, Long countryId, Long tenantId);
}
