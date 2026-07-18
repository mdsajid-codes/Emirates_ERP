package com.example.multi_tanent.fixedasset.repository;

import com.example.multi_tanent.fixedasset.entity.FixedAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FixedAssetRepository extends JpaRepository<FixedAsset, Long> {
    List<FixedAsset> findByTenant_Id(Long tenantId);

    Optional<FixedAsset> findByAssetNumberAndTenant_Id(String assetNumber, Long tenantId);
}
