package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccPostDatedCheque;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccPostDatedChequeRepository extends JpaRepository<AccPostDatedCheque, Long> {
    List<AccPostDatedCheque> findByTenantId(String tenantId);
}
