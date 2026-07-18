package com.example.multi_tanent.crm.services;



import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.CrmTaskStageRequest;
import com.example.multi_tanent.crm.dto.CrmTaskStageResponse;
import com.example.multi_tanent.crm.entity.CrmTaskStage;
import com.example.multi_tanent.crm.repository.CrmTaskStageRepository;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmTaskStageService {

    private final CrmTaskStageRepository repo;
    private final TenantRepository tenantRepo;
    private final LocationRepository locationRepository;

    /** Swap this with your real resolver (by key/header/etc). */
    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId(); // if you store key, fetch by key
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    @Transactional(readOnly = true, transactionManager = "tenantTx")
    public List<CrmTaskStageResponse> getAll() {
        Tenant t = currentTenant();
        return repo.findByTenantIdOrderBySortOrderAscIdAsc(t.getId())
                   .stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true, transactionManager = "tenantTx")
    public CrmTaskStageResponse getById(Long id) {
        Tenant t = currentTenant();
        CrmTaskStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task stage not found: " + id));
        return toResponse(e);
    }

    public CrmTaskStageResponse create(CrmTaskStageRequest req) {
        Tenant t = currentTenant();
        String name = req.getStatusName().trim();

        if (repo.existsByTenantIdAndStatusNameIgnoreCase(t.getId(), name)) {
            throw new IllegalArgumentException("Task stage already exists: " + name);
        }

        int nextOrder = repo.findFirstByTenantIdOrderBySortOrderDesc(t.getId())
                .map(s -> s.getSortOrder() + 1).orElse(1);

        Location location = null;
        if (req.getLocationId() != null) {
            location = locationRepository.findById(req.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + req.getLocationId()));
        }

        CrmTaskStage e = CrmTaskStage.builder()
                .tenant(t)
                .location(location)
                .statusName(name)
                .completed(req.isCompleted())
                .isDefault(req.isDefault())
                .sortOrder(req.getSortOrder() != null ? req.getSortOrder() : nextOrder)
                .build();

        // ensure single default per tenant
        if (e.isDefault()) {
            repo.findFirstByTenantIdAndIsDefaultTrue(t.getId())
                    .ifPresent(prev -> { prev.setDefault(false); repo.save(prev); }); // Persist the change to the previous default
        }

        return toResponse(repo.save(e));
    }

    public CrmTaskStageResponse update(Long id, CrmTaskStageRequest req) {
        Tenant t = currentTenant();
        CrmTaskStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task stage not found: " + id));

        if (req.getStatusName() != null) {
            String newName = req.getStatusName().trim();
            if (!e.getStatusName().equalsIgnoreCase(newName)
                    && repo.existsByTenantIdAndStatusNameIgnoreCase(t.getId(), newName)) {
                throw new IllegalArgumentException("Status name already exists: " + newName);
            }
            e.setStatusName(newName);
        }

        if (req.getLocationId() != null) {
            Location location = locationRepository.findById(req.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found with id: " + req.getLocationId()));
            e.setLocation(location);
        } else {
            e.setLocation(null);
        }

        e.setCompleted(req.isCompleted());
        if (req.getSortOrder() != null) e.setSortOrder(req.getSortOrder());

        // handle default toggle
        if (req.isDefault() != e.isDefault()) {
            if (req.isDefault()) {
                repo.findFirstByTenantIdAndIsDefaultTrue(t.getId())
                        .ifPresent(prev -> { prev.setDefault(false); repo.save(prev); });
                e.setDefault(true);
            } else {
                e.setDefault(false);
            }
        }

        return toResponse(repo.save(e));
    }

    public void delete(Long id) {
        Tenant t = currentTenant();
        CrmTaskStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task stage not found: " + id));
        repo.delete(e);
    }

    /** Move up (swap with previous by sortOrder). */
    public CrmTaskStageResponse moveUp(Long id) {
        Tenant t = currentTenant();
        CrmTaskStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task stage not found: " + id));

        var prev = repo.findFirstByTenantIdAndSortOrderLessThanOrderBySortOrderDesc(t.getId(), e.getSortOrder()).orElse(null);
        if (prev == null) return toResponse(e);

        int tmp = e.getSortOrder();
        e.setSortOrder(prev.getSortOrder());
        prev.setSortOrder(tmp);
        repo.save(prev);
        return toResponse(repo.save(e));
    }

    /** Move down (swap with next by sortOrder). */
    public CrmTaskStageResponse moveDown(Long id) {
        Tenant t = currentTenant();
        CrmTaskStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task stage not found: " + id));

        var next = repo.findFirstByTenantIdAndSortOrderGreaterThanOrderBySortOrderAsc(t.getId(), e.getSortOrder()).orElse(null);
        if (next == null) return toResponse(e);

        int tmp = e.getSortOrder();
        e.setSortOrder(next.getSortOrder());
        next.setSortOrder(tmp);
        repo.save(next);
        return toResponse(repo.save(e));
    }

    /** Mark one as default (unset previous). */
    public CrmTaskStageResponse setDefault(Long id) {
        Tenant t = currentTenant();
        CrmTaskStage e = repo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new IllegalArgumentException("Task stage not found: " + id));

        repo.findFirstByTenantIdAndIsDefaultTrue(t.getId())
                .ifPresent(prev -> {
                    if (!prev.getId().equals(e.getId())) {
                        prev.setDefault(false);
                        repo.save(prev);
                    }
                });

        e.setDefault(true);
        return toResponse(repo.save(e));
    }

    private CrmTaskStageResponse toResponse(CrmTaskStage e) {
        CrmTaskStageResponse.CrmTaskStageResponseBuilder builder = CrmTaskStageResponse.builder()
                .id(e.getId())
                .statusName(e.getStatusName())
                .completed(e.isCompleted())
                .isDefault(e.isDefault())
                .sortOrder(e.getSortOrder())
                .tenantId(e.getTenant() != null ? e.getTenant().getId() : null);

        if (e.getLocation() != null) {
            builder.locationId(e.getLocation().getId());
            builder.locationName(e.getLocation().getName());
        }

        return builder.build();
    }
}