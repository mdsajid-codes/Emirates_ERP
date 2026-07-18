package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.warehouse.dto.UoMRequest;
import com.example.multi_tanent.warehouse.dto.UoMResponse;
import com.example.multi_tanent.warehouse.entity.UoM;
import com.example.multi_tanent.warehouse.repository.UoMRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class UoMService {

    private final UoMRepository uomRepository;
    private final TenantRepository tenantRepository;

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found"));
    }

    @Transactional(readOnly = true)
    public List<UoMResponse> list() {
        Tenant t = getCurrentTenant();
        return uomRepository.findByEnterpriseId(t.getId())
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public UoMResponse create(UoMRequest req) {
        Tenant t = getCurrentTenant();
        UoM u = UoM.builder()
                .name(req.getName())
                .shortName(req.getShortName())
                .enterprise(t)
                .build();
        return toResponse(uomRepository.save(u));
    }

    public UoMResponse update(Long id, UoMRequest req) {
        UoM u = uomRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("UoM not found"));

        u.setName(req.getName());
        u.setShortName(req.getShortName());
        return toResponse(uomRepository.save(u));
    }

    public void delete(Long id) {
        uomRepository.deleteById(id);
    }

    private UoMResponse toResponse(UoM u) {
        return UoMResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .shortName(u.getShortName())
                .build();
    }
}
