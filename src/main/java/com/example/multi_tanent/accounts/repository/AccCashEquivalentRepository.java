package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccCashEquivalent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccCashEquivalentRepository extends JpaRepository<AccCashEquivalent, Long> {
    List<AccCashEquivalent> findByTenantId(String tenantId);
}
