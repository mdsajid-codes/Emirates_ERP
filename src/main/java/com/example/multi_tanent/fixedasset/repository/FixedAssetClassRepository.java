package com.example.multi_tanent.fixedasset.repository;

import com.example.multi_tanent.fixedasset.entity.FixedAssetClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FixedAssetClassRepository extends JpaRepository<FixedAssetClass, Long> {
    List<FixedAssetClass> findByTenant_Id(Long tenantId);
}
