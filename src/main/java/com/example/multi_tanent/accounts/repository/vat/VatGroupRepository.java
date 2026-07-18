package com.example.multi_tanent.accounts.repository.vat;

import com.example.multi_tanent.accounts.entity.vat.VatGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VatGroupRepository extends JpaRepository<VatGroup, Long> {
    List<VatGroup> findByTenantId(String tenantId);
    Optional<VatGroup> findByIdAndTenantId(Long id, String tenantId);
}
