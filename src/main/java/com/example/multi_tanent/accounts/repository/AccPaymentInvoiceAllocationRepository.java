package com.example.multi_tanent.accounts.repository;

import com.example.multi_tanent.accounts.entity.AccPaymentInvoiceAllocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AccPaymentInvoiceAllocationRepository extends JpaRepository<AccPaymentInvoiceAllocation, Long> {
    List<AccPaymentInvoiceAllocation> findByPaymentId(Long paymentId);
}
