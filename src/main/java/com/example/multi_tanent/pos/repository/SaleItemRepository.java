package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.SaleItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SaleItemRepository extends JpaRepository<SaleItem, Long> {
    Optional<SaleItem> findByIdAndSaleId(Long itemId, Long saleId);

    List<SaleItem> findBySaleId(Long saleId);

    boolean existsByProductId(Long productId);

    List<SaleItem> findByProductId(Long productId);
}