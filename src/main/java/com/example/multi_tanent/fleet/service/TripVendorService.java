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
        if (vendor.getContactPersonName() != null && vendor.getContactPerson() == null) {
            vendor.setContactPerson(vendor.getContactPersonName());
        }
        return repository.save(vendor);
    }

    @Transactional
    public TripVendor updateVendor(Long id, TripVendor updated) {
        TripVendor existing = repository.findById(id).orElseThrow();
        existing.setCompanyName(updated.getCompanyName());
        existing.setContactPerson(updated.getContactPersonName() != null ? updated.getContactPersonName() : updated.getContactPerson());
        existing.setContactPersonName(updated.getContactPersonName());
        existing.setPhone(updated.getPhone());
        existing.setEmail(updated.getEmail());
        existing.setVendorType(updated.getVendorType());
        existing.setServiceCategory(updated.getServiceCategory());
        existing.setTrnNumber(updated.getTrnNumber());
        existing.setTradeLicenseNumber(updated.getTradeLicenseNumber());
        existing.setDesignation(updated.getDesignation());
        existing.setPaymentTermsDays(updated.getPaymentTermsDays());
        existing.setBankName(updated.getBankName());
        existing.setIbanNumber(updated.getIbanNumber());
        existing.setBillingAddress(updated.getBillingAddress());
        existing.setEmirate(updated.getEmirate());
        existing.setCountry(updated.getCountry());
        existing.setNotes(updated.getNotes());
        existing.setStatus(updated.getStatus());
        return repository.save(existing);
    }

    @Transactional(readOnly = true)
    public TripVendor getVendorById(Long id) {
        return repository.findById(id).orElse(null);
    }

    @Transactional
    public void deleteVendor(Long id) {
        repository.deleteById(id);
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
