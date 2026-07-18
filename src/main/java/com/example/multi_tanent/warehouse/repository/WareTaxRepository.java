package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.WareTax;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WareTaxRepository extends JpaRepository<WareTax, Long> {
    List<WareTax> findByEnterpriseId(Long tenantId);
}
