package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.purchases.dto.*;
import com.example.multi_tanent.purchases.entity.*;
import com.example.multi_tanent.purchases.repository.*;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurSupplierTenderingService {

    private final PurSupplierTenderingRepository tenderingRepo;
    private final PurSupplierTenderingItemRepository itemRepo;
    private final PurSupplierTenderingSupplierRepository supplierRepo;
    private final PurSupplierTenderingQuestionRepository questionRepo;
    private final PurRfqQuestionRepository rfqQuestionRepo;
    private final PurRequestForQuotationRepository rfqRepo;
    private final TenantRepository tenantRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(key)
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    public PurSupplierTenderingResponse create(PurSupplierTenderingRequest req, String tenderNumber) {
        Tenant t = currentTenant();

        PurSupplierTendering tendering = new PurSupplierTendering();
        tendering.setTenderNumber(tenderNumber);
        tendering.setStatus(req.getStatus());
        tendering.setTransactionType(req.getTransactionType());
        tendering.setInitiatedBy(req.getInitiatedBy());
        tendering.setRequiredDate(req.getRequiredDate());
        tendering.setProject(req.getProject());
        tendering.setEntity(req.getEntity());
        tendering.setTenderingCurrency(req.getTenderingCurrency());
        tendering.setBasisType(req.getBasisType());
        tendering.setBasisId(req.getBasisId());
        tendering.setWarehouseId(req.getWarehouseId());
        tendering.setTenant(t);
        tendering.setCreatedAt(LocalDateTime.now());
        // set createdBy...

        if (req.getItems() != null) {
            req.getItems().forEach(ir -> {
                PurSupplierTenderingItem item = new PurSupplierTenderingItem();
                item.setLineNumber(ir.getLineNumber());
                item.setItemId(ir.getItemId());
                item.setItemName(ir.getItemName());
                item.setContent(ir.getContent());
                item.setQuantity(ir.getQuantity());
                item.setUom(ir.getUom());
                tendering.addItem(item);
            });
        }

        if (req.getSuppliers() != null) {
            req.getSuppliers().forEach(sr -> {
                PurSupplierTenderingSupplier sup = new PurSupplierTenderingSupplier();
                sup.setSupplierId(sr.getSupplierId());
                sup.setSupplierName(sr.getSupplierName());
                sup.setContractType(sr.getContractType());
                sup.setContactPerson(sr.getContactPerson());
                sup.setEmail(sr.getEmail());

                if (sr.getSupplierItems() != null) {
                    sr.getSupplierItems().forEach(sir -> {
                        PurSupplierTenderingSupplierItem sItem = new PurSupplierTenderingSupplierItem();
                        sItem.setSelected(sir.getSelected());
                        // Actual item resolution occurs during update or distinct processing
                        sup.addSupplierItem(sItem);
                    });
                }
                tendering.addSupplier(sup);
            });
        }

        if (req.getQuestions() != null) {
            req.getQuestions().forEach(qr -> {
                PurSupplierTenderingQuestion q = new PurSupplierTenderingQuestion();
                q.setQuestionText(qr.getQuestionText());
                if (qr.getQuestionId() != null) {
                    PurRfqQuestion masterQ = rfqQuestionRepo.findById(qr.getQuestionId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Master Question not found: " + qr.getQuestionId()));
                    q.setQuestion(masterQ);
                }
                tendering.addQuestion(q);
            });
        }

        PurSupplierTendering saved = tenderingRepo.save(tendering);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public Page<PurSupplierTenderingResponse> list(Pageable pageable) {
        return tenderingRepo.findByTenantId(currentTenant().getId(), pageable).map(this::toResponse);
    }

    @Transactional(readOnly = true)
    public PurSupplierTenderingResponse getById(Long id) {
        PurSupplierTendering t = tenderingRepo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Tendering not found: " + id));
        return toResponse(t);
    }

    public PurSupplierTenderingResponse update(Long id, PurSupplierTenderingRequest req) {
        PurSupplierTendering tendering = tenderingRepo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Tendering not found: " + id));

        tendering.setStatus(req.getStatus());
        tendering.setTransactionType(req.getTransactionType());
        tendering.setInitiatedBy(req.getInitiatedBy());
        tendering.setRequiredDate(req.getRequiredDate());
        tendering.setProject(req.getProject());
        tendering.setEntity(req.getEntity());
        tendering.setTenderingCurrency(req.getTenderingCurrency());
        tendering.setBasisType(req.getBasisType());
        tendering.setBasisId(req.getBasisId());
        tendering.setWarehouseId(req.getWarehouseId());

        // Fully replace collections
        tendering.getItems().clear();
        tendering.getSuppliers().clear();
        tendering.getQuestions().clear();

        if (req.getItems() != null) {
            req.getItems().forEach(ir -> {
                PurSupplierTenderingItem item = new PurSupplierTenderingItem();
                item.setLineNumber(ir.getLineNumber());
                item.setItemId(ir.getItemId());
                item.setItemName(ir.getItemName());
                item.setContent(ir.getContent());
                item.setQuantity(ir.getQuantity());
                item.setUom(ir.getUom());
                tendering.addItem(item);
            });
        }

        if (req.getSuppliers() != null) {
            req.getSuppliers().forEach(sr -> {
                PurSupplierTenderingSupplier sup = new PurSupplierTenderingSupplier();
                sup.setSupplierId(sr.getSupplierId());
                sup.setSupplierName(sr.getSupplierName());
                sup.setContractType(sr.getContractType());
                sup.setContactPerson(sr.getContactPerson());
                sup.setEmail(sr.getEmail());

                if (sr.getSupplierItems() != null) {
                    sr.getSupplierItems().forEach(sir -> {
                        PurSupplierTenderingSupplierItem sItem = new PurSupplierTenderingSupplierItem();
                        sItem.setSelected(sir.getSelected());
                        sup.addSupplierItem(sItem);
                    });
                }
                tendering.addSupplier(sup);
            });
        }

        if (req.getQuestions() != null) {
            req.getQuestions().forEach(qr -> {
                PurSupplierTenderingQuestion q = new PurSupplierTenderingQuestion();
                q.setQuestionText(qr.getQuestionText());
                if (qr.getQuestionId() != null) {
                    PurRfqQuestion masterQ = rfqQuestionRepo.findById(qr.getQuestionId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Master Question not found: " + qr.getQuestionId()));
                    q.setQuestion(masterQ);
                }
                tendering.addQuestion(q);
            });
        }

        return toResponse(tenderingRepo.save(tendering));
    }

    public void delete(Long id) {
        PurSupplierTendering t = tenderingRepo.findByIdAndTenantId(id, currentTenant().getId())
                .orElseThrow(() -> new EntityNotFoundException("Tendering not found"));

        List<PurRequestForQuotation> rfqs = rfqRepo.findByTenderingId(id);
        if (!rfqs.isEmpty()) {
            rfqRepo.deleteAll(rfqs);
        }

        tenderingRepo.delete(t);
    }

    private PurSupplierTenderingResponse toResponse(PurSupplierTendering tendering) {
        return PurSupplierTenderingResponse.builder()
                .id(tendering.getId())
                .tenderNumber(tendering.getTenderNumber())
                .status(tendering.getStatus())
                .transactionType(tendering.getTransactionType())
                .initiatedBy(tendering.getInitiatedBy())
                .requiredDate(tendering.getRequiredDate())
                .project(tendering.getProject())
                .entity(tendering.getEntity())
                .tenderingCurrency(tendering.getTenderingCurrency())
                .basisType(tendering.getBasisType())
                .basisId(tendering.getBasisId())
                .warehouseId(tendering.getWarehouseId())
                .createdAt(tendering.getCreatedAt())
                .createdBy(tendering.getCreatedBy())
                .items(tendering.getItems().stream().map(this::toItemResponse).collect(Collectors.toList()))
                .suppliers(tendering.getSuppliers().stream().map(this::toSupplierResponse).collect(Collectors.toList()))
                .questions(tendering.getQuestions().stream().map(this::toQuestionResponse).collect(Collectors.toList()))
                .build();
    }

    private PurSupplierTenderingItemResponse toItemResponse(PurSupplierTenderingItem item) {
        return PurSupplierTenderingItemResponse.builder()
                .id(item.getId())
                .lineNumber(item.getLineNumber())
                .itemId(item.getItemId())
                .itemName(item.getItemName())
                .content(item.getContent())
                .quantity(item.getQuantity())
                .uom(item.getUom())
                .build();
    }

    private PurSupplierTenderingSupplierResponse toSupplierResponse(PurSupplierTenderingSupplier sup) {
        return PurSupplierTenderingSupplierResponse.builder()
                .id(sup.getId())
                .supplierId(sup.getSupplierId())
                .supplierName(sup.getSupplierName())
                .contractType(sup.getContractType())
                .contactPerson(sup.getContactPerson())
                .email(sup.getEmail())
                .build();
    }

    private PurSupplierTenderingQuestionResponse toQuestionResponse(PurSupplierTenderingQuestion q) {
        return PurSupplierTenderingQuestionResponse.builder()
                .id(q.getId())
                .questionId(q.getQuestion() != null ? q.getQuestion().getId() : null)
                .questionText(q.getQuestionText())
                .build();
    }
}
