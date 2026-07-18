package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurRequestForQuotation;

import java.util.List;
import java.util.Optional;

public interface PurRequestForQuotationRepository extends JpaRepository<PurRequestForQuotation, Long> {
    List<PurRequestForQuotation> findByTenderingId(Long tenderingId);
    Optional<PurRequestForQuotation> findByRfqNumber(String rfqNumber);
}
