package com.example.multi_tanent.production.repository;

import com.example.multi_tanent.production.entity.ProParameter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProParameterRepository extends JpaRepository<ProParameter, Long> {
    List<ProParameter> findByTenantIdOrderByNameAsc(Long tenantId);
    Optional<ProParameter> findByTenantIdAndId(Long tenantId, Long id);
}