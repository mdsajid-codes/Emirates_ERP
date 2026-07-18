package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.Floor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FloorRepository extends JpaRepository<Floor, Long> {
    List<Floor> findByWarehouseEnterpriseId(Long enterpriseId);

    Optional<Floor> findByIdAndWarehouseEnterpriseId(Long id, Long enterpriseId);

    List<Floor> findByIsActiveAndWarehouseEnterpriseId(Boolean isActive, Long enterpriseId);

    List<Floor> findByWarehouseIdAndWarehouseEnterpriseId(Long warehouseId, Long enterpriseId);
}
