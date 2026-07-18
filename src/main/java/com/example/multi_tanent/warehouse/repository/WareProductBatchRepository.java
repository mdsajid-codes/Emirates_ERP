package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.WareProductBatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WareProductBatchRepository extends JpaRepository<WareProductBatch, Long> {
    List<WareProductBatch> findByProductId(Long productId);

    Optional<WareProductBatch> findByBatchNumberAndProductId(String batchNumber, Long productId);
    
    List<WareProductBatch> findByProduct_Enterprise_IdAndExpiryDateBefore(Long tenantId, java.time.LocalDate date);
}
