package com.example.multi_tanent.materials.repository;

import com.example.multi_tanent.materials.entity.MaterialReservation;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface MaterialReservationRepository
        extends JpaRepository<MaterialReservation, Long>, JpaSpecificationExecutor<MaterialReservation> {
    @Query("SELECT m FROM MaterialReservation m LEFT JOIN FETCH m.materialRequisition WHERE m.tenant = :tenant")
    Page<MaterialReservation> findByTenant(@Param("tenant") Tenant tenant, Pageable pageable);

    @Query("SELECT m FROM MaterialReservation m LEFT JOIN FETCH m.materialRequisition WHERE m.id = :id AND m.tenant = :tenant")
    Optional<MaterialReservation> findByIdAndTenant(@Param("id") Long id, @Param("tenant") Tenant tenant);

    boolean existsByReservationNoAndTenant(String reservationNo, Tenant tenant);
}
