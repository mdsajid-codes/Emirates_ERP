package com.example.multi_tanent.pos.repository;

import com.example.multi_tanent.pos.entity.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByTenantId(Long tenantId);

    Optional<Product> findByIdAndTenantId(Long id, Long tenantId);

    List<Product> findByTenantIdAndCategoryNameIgnoreCase(Long tenantId, String categoryName);

    @Query("SELECT COUNT(p) > 0 FROM Product p JOIN p.variants v WHERE LOWER(v.sku) = LOWER(:sku) AND p.tenant.id = :tenantId")
    boolean existsByVariantSku(@Param("sku") String sku, @Param("tenantId") Long tenantId);

}