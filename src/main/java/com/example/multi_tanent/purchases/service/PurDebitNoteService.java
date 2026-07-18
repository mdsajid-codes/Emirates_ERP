package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.production.entity.ProRawMaterials;
import com.example.multi_tanent.production.entity.ProTax;
import com.example.multi_tanent.production.repository.ProRawMaterialsRepository;
import com.example.multi_tanent.production.repository.ProTaxRepository;
import com.example.multi_tanent.purchases.dto.PurDebitNoteItemRequest;
import com.example.multi_tanent.purchases.dto.PurDebitNoteItemResponse;
import com.example.multi_tanent.purchases.dto.PurDebitNoteRequest;
import com.example.multi_tanent.purchases.dto.PurDebitNoteResponse;
import com.example.multi_tanent.purchases.entity.PurDebitNote;
import com.example.multi_tanent.purchases.entity.PurDebitNoteItem;
import com.example.multi_tanent.purchases.repository.PurDebitNoteRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Location;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.LocationRepository;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.service.FileStorageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurDebitNoteService {

    private final PurDebitNoteRepository repo;
    private final TenantRepository tenantRepo;
    private final LocationRepository locationRepo;
    private final PartyRepository partyRepo;
    private final ProRawMaterialsRepository itemRepo;
    private final ProTaxRepository taxRepo;
    private final FileStorageService fileStorageService;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(key)
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    public PurDebitNoteResponse create(PurDebitNoteRequest req, MultipartFile[] files) {
        Tenant t = currentTenant();

        PurDebitNote dn = new PurDebitNote();
        dn.setTenant(t);
        dn.setBillLedger(req.getBillLedger());
        dn.setDebitNoteNumber(req.getDebitNoteNumber());
        dn.setBillNumber(req.getBillNumber());
        dn.setDebitNoteDate(req.getDebitNoteDate());
        dn.setDebitNoteDueDate(req.getDebitNoteDueDate());
        dn.setAmount(req.getAmount());
        dn.setTaxPercentage(req.getTaxPercentage());
        dn.setTermsAndConditions(req.getTermsAndConditions());
        dn.setNotes(req.getNotes());
        dn.setStatus(req.getStatus());
        dn.setBalanceDue(req.getBalanceDue());
        dn.setOtherReferences(req.getOtherReferences());
        dn.setBillOfLading(req.getBillOfLading());
        dn.setMotorVehicleNo(req.getMotorVehicleNo());
        dn.setTemplate(req.getTemplate());
        dn.setEmailTo(req.getEmailTo());
        dn.setCreatedBy(req.getCreatedBy());
        dn.setCreatedAt(OffsetDateTime.now());

        if (req.getLocationId() != null) {
            dn.setLocation(locationRepo.findById(req.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found: " + req.getLocationId())));
        }

        if (req.getSupplierId() != null) {
            dn.setSupplier(partyRepo.findById(req.getSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found: " + req.getSupplierId())));
        }

        if (req.getItems() != null) {
            for (PurDebitNoteItemRequest itemReq : req.getItems()) {
                PurDebitNoteItem item = mapItemRequest(itemReq);
                dn.addItem(item);
            }
        }

        if (files != null && files.length > 0) {
            String subDir = "debit_notes";
            for (MultipartFile file : files) {
                if (file.isEmpty())
                    continue;
                String path = fileStorageService.storeFile(file, subDir, true);
                dn.getAttachments().add(path);
            }
        }

        // Add manually provided attachment paths if any (e.g. from existing files
        // logic)
        if (req.getAttachments() != null) {
            dn.getAttachments().addAll(req.getAttachments());
        }

        PurDebitNote saved = repo.save(dn);
        return toResponse(saved);
    }

    public PurDebitNoteResponse update(Long id, PurDebitNoteRequest req, MultipartFile[] files) {
        PurDebitNote dn = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Debit Note not found: " + id));

        dn.setBillLedger(req.getBillLedger());
        dn.setDebitNoteNumber(req.getDebitNoteNumber());
        dn.setBillNumber(req.getBillNumber());
        dn.setDebitNoteDate(req.getDebitNoteDate());
        dn.setDebitNoteDueDate(req.getDebitNoteDueDate());
        dn.setAmount(req.getAmount());
        dn.setTaxPercentage(req.getTaxPercentage());
        dn.setTermsAndConditions(req.getTermsAndConditions());
        dn.setNotes(req.getNotes());
        dn.setStatus(req.getStatus());
        dn.setBalanceDue(req.getBalanceDue());
        dn.setOtherReferences(req.getOtherReferences());
        dn.setBillOfLading(req.getBillOfLading());
        dn.setMotorVehicleNo(req.getMotorVehicleNo());
        dn.setTemplate(req.getTemplate());
        dn.setEmailTo(req.getEmailTo());
        dn.setUpdatedBy(req.getCreatedBy()); // assuming createdBy field passed in update acts as modifier
        dn.setUpdatedAt(OffsetDateTime.now());

        if (req.getLocationId() != null) {
            dn.setLocation(locationRepo.findById(req.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found: " + req.getLocationId())));
        } else {
            dn.setLocation(null);
        }

        if (req.getSupplierId() != null) {
            dn.setSupplier(partyRepo.findById(req.getSupplierId())
                    .orElseThrow(() -> new EntityNotFoundException("Supplier not found: " + req.getSupplierId())));
        } else {
            dn.setSupplier(null);
        }

        // Replace items
        dn.getItems().clear();
        if (req.getItems() != null) {
            for (PurDebitNoteItemRequest itemReq : req.getItems()) {
                PurDebitNoteItem item = mapItemRequest(itemReq);
                dn.addItem(item);
            }
        }

        // Attachments
        if (req.getAttachments() != null) {
            // Keep provided paths
            dn.setAttachments(new ArrayList<>(req.getAttachments()));
        } else {
            dn.getAttachments().clear();
        }

        // Add new files
        if (files != null && files.length > 0) {
            String subDir = "debit_notes";
            for (MultipartFile file : files) {
                if (file.isEmpty())
                    continue;
                String path = fileStorageService.storeFile(file, subDir, true);
                dn.getAttachments().add(path);
            }
        }

        PurDebitNote saved = repo.save(dn);
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public PurDebitNoteResponse getById(Long id) {
        PurDebitNote dn = repo.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Debit Note not found: " + id));
        return toResponse(dn);
    }

    @Transactional(readOnly = true)
    public Page<PurDebitNoteResponse> list(Pageable pageable) {
        // Assuming naive list for now, filtering can be added later
        return repo.findAll(pageable).map(this::toResponse);
    }

    public void delete(Long id) {
        if (!repo.existsById(id)) {
            throw new EntityNotFoundException("Debit Note not found: " + id);
        }
        repo.deleteById(id);
    }

    private PurDebitNoteItem mapItemRequest(PurDebitNoteItemRequest req) {
        PurDebitNoteItem item = new PurDebitNoteItem();
        item.setQuantity(req.getQuantity());
        item.setRate(req.getRate());
        item.setDiscount(req.getDiscount());
        item.setAmount(req.getAmount());
        item.setTaxValue(req.getTaxValue());
        item.setTaxAmount(req.getTaxAmount());

        if (req.getItemId() != null) {
            item.setItem(itemRepo.findById(req.getItemId())
                    .orElseThrow(() -> new EntityNotFoundException("Item not found: " + req.getItemId())));
        }
        if (req.getLocationId() != null) {
            item.setLocation(locationRepo.findById(req.getLocationId())
                    .orElseThrow(() -> new EntityNotFoundException("Location not found: " + req.getLocationId())));
        }
        if (req.getTaxId() != null) {
            item.setTax(taxRepo.findById(req.getTaxId())
                    .orElseThrow(() -> new EntityNotFoundException("Tax not found: " + req.getTaxId())));
        }

        return item;
    }

    private PurDebitNoteResponse toResponse(PurDebitNote dn) {
        List<PurDebitNoteItemResponse> itemResponses = Optional.ofNullable(dn.getItems())
                .orElse(Collections.emptyList())
                .stream()
                .map(i -> PurDebitNoteItemResponse.builder()
                        .id(i.getId())
                        .itemId(i.getItem() != null ? i.getItem().getId() : null)
                        .itemName(i.getItem() != null ? i.getItem().getName() : null)
                        .locationId(i.getLocation() != null ? i.getLocation().getId() : null)
                        .locationName(i.getLocation() != null ? i.getLocation().getName() : null)
                        .quantity(i.getQuantity())
                        .rate(i.getRate())
                        .discount(i.getDiscount())
                        .amount(i.getAmount())
                        .taxId(i.getTax() != null ? i.getTax().getId() : null)
                        .taxName(i.getTax() != null ? i.getTax().getCode() : null) // Assuming Code or Name
                        .taxValue(i.getTaxValue())
                        .taxAmount(i.getTaxAmount())
                        .build())
                .collect(Collectors.toList());

        return PurDebitNoteResponse.builder()
                .id(dn.getId())
                .locationId(dn.getLocation() != null ? dn.getLocation().getId() : null)
                .locationName(dn.getLocation() != null ? dn.getLocation().getName() : null)
                .supplierId(dn.getSupplier() != null ? dn.getSupplier().getId() : null)
                .supplierName(dn.getSupplier() != null ? dn.getSupplier().getCompanyName() : null) // BaseCustomer
                                                                                                   // usually has
                                                                                                   // companyName
                .billLedger(dn.getBillLedger())
                .debitNoteNumber(dn.getDebitNoteNumber())
                .billNumber(dn.getBillNumber())
                .debitNoteDate(dn.getDebitNoteDate())
                .debitNoteDueDate(dn.getDebitNoteDueDate())
                .amount(dn.getAmount())
                .taxPercentage(dn.getTaxPercentage())
                .termsAndConditions(dn.getTermsAndConditions())
                .notes(dn.getNotes())
                .status(dn.getStatus())
                .balanceDue(dn.getBalanceDue())
                .attachments(dn.getAttachments())
                .items(itemResponses)
                .otherReferences(dn.getOtherReferences())
                .billOfLading(dn.getBillOfLading())
                .motorVehicleNo(dn.getMotorVehicleNo())
                .createdBy(dn.getCreatedBy())
                .updatedBy(dn.getUpdatedBy())
                .createdAt(dn.getCreatedAt())
                .updatedAt(dn.getUpdatedAt())
                .template(dn.getTemplate())
                .emailTo(dn.getEmailTo())
                .build();
    }
}
