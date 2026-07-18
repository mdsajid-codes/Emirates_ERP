package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.WareTaxRequest;
import com.example.multi_tanent.warehouse.dto.WareTaxResponse;
import com.example.multi_tanent.warehouse.entity.WareTax;
import com.example.multi_tanent.warehouse.repository.WareTaxRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class WareTaxService {

    private final WareTaxRepository taxRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found"));
    }

    @Transactional(readOnly = true)
    public List<WareTaxResponse> list() {
        Tenant t = getCurrentTenant();
        return taxRepository.findByEnterpriseId(t.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WareTaxResponse create(WareTaxRequest req) {
        Tenant t = getCurrentTenant();
        WareTax tax = WareTax.builder()
                .name(req.getName())
                .percentage(req.getPercentage())
                .enterprise(t)
                .build();
        return toResponse(taxRepository.save(tax));
    }

    public WareTaxResponse update(Long id, WareTaxRequest req) {
        WareTax tax = taxRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Tax not found"));
        tax.setName(req.getName());
        tax.setPercentage(req.getPercentage());
        return toResponse(taxRepository.save(tax));
    }

    public void delete(Long id) {
        taxRepository.deleteById(id);
    }

    private WareTaxResponse toResponse(WareTax t) {
        return WareTaxResponse.builder()
                .id(t.getId())
                .name(t.getName())
                .percentage(t.getPercentage())
                .build();
    }
}
