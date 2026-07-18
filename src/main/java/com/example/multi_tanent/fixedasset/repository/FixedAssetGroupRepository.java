package com.example.multi_tanent.fixedasset.repository;

import com.example.multi_tanent.fixedasset.entity.FixedAssetGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FixedAssetGroupRepository extends JpaRepository<FixedAssetGroup, Long> {
    List<FixedAssetGroup> findByTenant_Id(Long tenantId);
}
