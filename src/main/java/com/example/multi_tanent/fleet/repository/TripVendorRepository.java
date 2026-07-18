package com.example.multi_tanent.fleet.repository;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.fleet.entity.TripVendor;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TripVendorRepository extends JpaRepository<TripVendor, Long> {
    List<TripVendor> findAllByTenantAndActiveTrue(Tenant tenant);
}
