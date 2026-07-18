package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurRequestForQuotationItem;

import java.util.List;

public interface PurRequestForQuotationItemRepository extends JpaRepository<PurRequestForQuotationItem, Long> {
    List<PurRequestForQuotationItem> findByRfqId(Long rfqId);
}
