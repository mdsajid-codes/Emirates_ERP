package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.enitity.Theme;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ThemeRepository extends JpaRepository<Theme, Long> {
    List<Theme> findByTenantId(Long tenantId);

    Optional<Theme> findByTenantIdAndIsActiveTrue(Long tenantId);

    Optional<Theme> findFirstByIsActiveTrue();

    Optional<Theme> findByTenantIdAndId(Long tenantId, Long id);
}
