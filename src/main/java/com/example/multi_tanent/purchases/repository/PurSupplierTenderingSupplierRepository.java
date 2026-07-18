package com.example.multi_tanent.purchases.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.multi_tanent.purchases.entity.PurSupplierTenderingSupplier;

import java.util.List;

public interface PurSupplierTenderingSupplierRepository extends JpaRepository<PurSupplierTenderingSupplier, Long> {
    List<PurSupplierTenderingSupplier> findByTenderingId(Long tenderingId);
}
