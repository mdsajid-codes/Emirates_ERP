package com.example.multi_tanent.spersusers.repository;

import com.example.multi_tanent.spersusers.base.PartyBase.PartyType;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;

import java.util.List;
import java.util.Optional;

public interface PartyRepository extends JpaRepository<BaseCustomer, Long> {
    List<BaseCustomer> findByTenantId(Long tenantId);
    Page<BaseCustomer> findByTenantId(Long tenantId, Pageable pageable);
    Optional<BaseCustomer> findByTenantIdAndId(Long tenantId, Long id);
    Page<BaseCustomer> findByTenantIdAndPartyType(Long tenantId, PartyType partyType, Pageable pageable);

    boolean existsByTenantIdAndId(Long tenantId, Long id);
    Long countByTenantId(Long tenantId);
    Long countByTenantIdAndPartyType(Long tenantId, PartyType partyType);
}