package com.example.multi_tanent.spersusers.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.example.multi_tanent.spersusers.enitity.Store;

import java.util.List;
import java.util.Optional;

@Repository
public interface StoreRepository extends JpaRepository<Store, Long> {
    List<Store> findByTenantId(Long tenantId);

    Optional<Store> findByIdAndTenantId(Long id, Long tenantId);
}