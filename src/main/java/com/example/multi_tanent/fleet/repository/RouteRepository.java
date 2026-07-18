package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.fleet.entity.Route;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<Route, Long> {
    
    List<Route> findByEnterpriseId(Long tenantId);
    
    List<Route> findByDriverIdAndRouteDate(Long driverId, LocalDate date);

    @Query("""
        SELECT r FROM Route r
        WHERE r.enterprise.id = :tenantId
        AND (:query IS NULL 
             OR LOWER(r.routeName) LIKE :query 
             OR LOWER(r.driver.name) LIKE :query 
             OR LOWER(r.vehicle.plateNumber) LIKE :query)
        ORDER BY r.routeDate DESC
    """)
    Page<Route> findAllFiltered(
        @Param("tenantId") Long tenantId,
        @Param("query") String query,
        Pageable pageable);
}
