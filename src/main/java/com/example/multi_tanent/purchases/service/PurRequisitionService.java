package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProUnit;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.production.repository.ProUnitRepository;
import com.example.multi_tanent.purchases.dto.*;
import com.example.multi_tanent.purchases.entity.PurRequisition;
import com.example.multi_tanent.purchases.entity.PurRequisitionItem;
import com.example.multi_tanent.purchases.repository.PurRequisitionRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurRequisitionService {

    private final PurRequisitionRepository requisitionRepo;
    private final TenantRepository tenantRepo;
    private final ProRawMaterialsRepository itemRepo;
    private final ProUnitRepository unitRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(key)
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    public PurRequisitionResponse create(PurRequisitionRequest req) {
        Tenant t = currentTenant();

        PurRequisition requisition = PurRequisition.builder()
                .requisitionNumber(req.getRequisitionNumber())
                .requisitionDate(req.getRequisitionDate())
                .requestedBy(req.getRequestedBy())
                .recipient(req.getRecipient())
                .requiredDate(req.getRequiredDate())
                .entity(req.getEntity())
                .status(req.getStatus())
                .basis(req.getBasis())
                .comment(req.getComment())
                .tenant(t)
                .createdBy(req.getCreatedBy())
                .createdAt(LocalDateTime.now())
                .items(new ArrayList<>())
                .build();

        if (req.getItems() != null) {
            for (PurRequisitionItemRequest ir : req.getItems()) {
                PurRequisitionItem item = mapItemRequest(ir);
                requisition.addItem(item);
            }
        }

        PurRequisition saved = requisitionRepo.save(requisition);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PurRequisitionResponse> list(Pageable pageable) {
        Tenant t = currentTenant();
        return requisitionRepo.findByTenantId(t.getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PurRequisitionResponse getById(Long id) {
        Tenant t = currentTenant();
        PurRequisition requisition = requisitionRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found: " + id));
        return toResponse(requisition);
    }

    public PurRequisitionResponse update(Long id, PurRequisitionRequest req) {
        Tenant t = currentTenant();
        PurRequisition requisition = requisitionRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found: " + id));

        requisition.setRequisitionDate(req.getRequisitionDate());
        requisition.setRequestedBy(req.getRequestedBy());
        requisition.setRecipient(req.getRecipient());
        requisition.setRequiredDate(req.getRequiredDate());
        requisition.setEntity(req.getEntity());
        requisition.setStatus(req.getStatus());
        requisition.setBasis(req.getBasis());
        requisition.setComment(req.getComment());

        // Replace items
        requisition.getItems().clear();
        if (req.getItems() != null) {
            for (PurRequisitionItemRequest ir : req.getItems()) {
                PurRequisitionItem item = mapItemRequest(ir);
                requisition.addItem(item);
            }
        }

        PurRequisition saved = requisitionRepo.save(requisition);
        return toResponse(saved);
    }

    public void delete(Long id) {
        Tenant t = currentTenant();
        PurRequisition requisition = requisitionRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found: " + id));
        requisitionRepo.delete(requisition);
    }

    public PurRequisitionResponse updateStatus(Long id, String status) {
        Tenant t = currentTenant();
        PurRequisition requisition = requisitionRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Requisition not found: " + id));
        requisition.setStatus(status);
        return toResponse(requisitionRepo.save(requisition));
    }

    private PurRequisitionItem mapItemRequest(PurRequisitionItemRequest ir) {
        PurRequisitionItem item = PurRequisitionItem.builder()
                .lineNumber(ir.getLineNumber())
                .description(ir.getDescription())
                .quantity(ir.getQuantity())
                .rate(ir.getRate())
                .amount(ir.getAmount())
                .build();

        if (ir.getItemId() != null) {
            ProRawMaterials rawMaterial = itemRepo.findById(ir.getItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Item not found: " + ir.getItemId()));
            item.setItem(rawMaterial);
        }

        if (ir.getUnitId() != null) {
            ProUnit unit = unitRepo.findById(ir.getUnitId())
                    .orElseThrow(() -> new EntityNotFoundException("Unit not found: " + ir.getUnitId()));
            item.setUnit(unit);
        }

        return item;
    }

    private PurRequisitionResponse toResponse(PurRequisition r) {
        return PurRequisitionResponse.builder()
                .id(r.getId())
                .requisitionNumber(r.getRequisitionNumber())
                .requisitionDate(r.getRequisitionDate())
                .requestedBy(r.getRequestedBy())
                .recipient(r.getRecipient())
                .requiredDate(r.getRequiredDate())
                .entity(r.getEntity())
                .status(r.getStatus())
                .basis(r.getBasis())
                .comment(r.getComment())
                .createdBy(r.getCreatedBy())
                .createdAt(r.getCreatedAt())
                .items(r.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .build();
    }

    private PurRequisitionItemResponse toItemResponse(PurRequisitionItem i) {
        return PurRequisitionItemResponse.builder()
                .id(i.getId())
                .lineNumber(i.getLineNumber())
                .itemId(i.getItem() != null ? i.getItem().getId() : null)
                .itemName(i.getItem() != null ? i.getItem().getName() : null)
                .description(i.getDescription())
                .quantity(i.getQuantity())
                .unitId(i.getUnit() != null ? i.getUnit().getId() : null)
                .unitName(i.getUnit() != null ? i.getUnit().getName() : null)
                .rate(i.getRate())
                .amount(i.getAmount())
                .build();
    }
}
