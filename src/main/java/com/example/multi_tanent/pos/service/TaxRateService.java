package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.TaxRateRequest;
import com.example.multi_tanent.pos.entity.TaxRate;
import com.example.multi_tanent.pos.repository.TaxRateRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class TaxRateService {

    private final TaxRateRepository taxRateRepository;
    private final TenantRepository tenantRepository;

    public TaxRateService(TaxRateRepository taxRateRepository, TenantRepository tenantRepository) {
        this.taxRateRepository = taxRateRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found. Cannot perform tax rate operations."));
    }

    public TaxRate createTaxRate(TaxRateRequest request) {
        Tenant currentTenant = getCurrentTenant();

        TaxRate taxRate = new TaxRate();
        taxRate.setTenant(currentTenant);
        taxRate.setName(request.getName());
        taxRate.setPercent(request.getPercent());
        taxRate.setCompound(request.isCompound());

        return taxRateRepository.save(taxRate);
    }

    @Transactional(readOnly = true)
    public List<TaxRate> getAllTaxRatesForCurrentTenant() {
        Tenant currentTenant = getCurrentTenant();
        return taxRateRepository.findByTenantId(currentTenant.getId());
    }

    @Transactional(readOnly = true)
    public Optional<TaxRate> getTaxRateById(Long id) {
        Tenant currentTenant = getCurrentTenant();
        return taxRateRepository.findByIdAndTenantId(id, currentTenant.getId());
    }

    public TaxRate updateTaxRate(Long id, TaxRateRequest request) {
        TaxRate taxRate = getTaxRateById(id)
                .orElseThrow(() -> new RuntimeException("TaxRate not found with id: " + id));

        taxRate.setName(request.getName());
        taxRate.setPercent(request.getPercent());
        taxRate.setCompound(request.isCompound());

        return taxRateRepository.save(taxRate);
    }

    public void deleteTaxRate(Long id) {
        TaxRate taxRate = getTaxRateById(id)
                .orElseThrow(() -> new RuntimeException("TaxRate not found with id: " + id));
        taxRateRepository.delete(taxRate);
    }
}