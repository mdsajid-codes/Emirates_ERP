package com.example.multi_tanent.warehouse.repository;

import com.example.multi_tanent.warehouse.entity.WareHouse;
import com.example.multi_tanent.warehouse.enums.WarehouseType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WareHouseRepository extends JpaRepository<WareHouse, Long> {
    List<WareHouse> findByEnterpriseId(Long tenantId);

    Optional<WareHouse> findByIdAndEnterpriseId(Long id, Long tenantId);

    Optional<WareHouse> findByCodeAndEnterpriseId(String code, Long tenantId);

    List<WareHouse> findByIsActiveAndEnterpriseId(Boolean isActive, Long tenantId);

    List<WareHouse> findByWarehouseTypeAndEnterpriseId(WarehouseType warehouseType, Long tenantId);

    @org.springframework.data.jpa.repository.Query("SELECT w FROM WareHouse w WHERE w.enterprise = :tenant")
    List<WareHouse> fetchByTenant(
            @org.springframework.data.repository.query.Param("tenant") com.example.multi_tanent.spersusers.enitity.Tenant tenant);
}
