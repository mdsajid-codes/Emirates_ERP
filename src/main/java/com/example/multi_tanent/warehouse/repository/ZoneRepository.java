package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.Zone;
import com.example.multi_tanent.warehouse.enums.ZoneType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ZoneRepository extends JpaRepository<Zone, Long> {
    List<Zone> findByWarehouseEnterpriseId(Long enterpriseId);

    Optional<Zone> findByIdAndWarehouseEnterpriseId(Long id, Long enterpriseId);

    List<Zone> findByIsActiveAndWarehouseEnterpriseId(Boolean isActive, Long enterpriseId);

    List<Zone> findByZoneTypeAndWarehouseEnterpriseId(ZoneType zoneType, Long enterpriseId);
}
