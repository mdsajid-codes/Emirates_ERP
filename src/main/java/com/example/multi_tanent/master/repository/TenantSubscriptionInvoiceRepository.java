package com.example.multi_tanent.master.repository;

import com.example.multi_tanent.master.entity.TenantSubscriptionInvoice;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TenantSubscriptionInvoiceRepository extends JpaRepository<TenantSubscriptionInvoice, Long> {
    List<TenantSubscriptionInvoice> findByMasterTenantId(Long masterTenantId);
}
