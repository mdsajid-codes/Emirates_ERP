package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.fleet.entity.TripVendor;
import com.example.multi_tanent.fleet.repository.TripVendorRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TripVendorService {
    private final TripVendorRepository repository;
    private final TenantRepository tenantRepository;

    @Transactional
    public TripVendor createVendor(TripVendor vendor) {
        vendor.setTenant(getCurrentTenant());
        return repository.save(vendor);
    }

    @Transactional(readOnly = true)
    public List<TripVendor> getAllActive() {
        return repository.findAllByTenantAndActiveTrue(getCurrentTenant());
    }

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId).orElseThrow();
    }
}
