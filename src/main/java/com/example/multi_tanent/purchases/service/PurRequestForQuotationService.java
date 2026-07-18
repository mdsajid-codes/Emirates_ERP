package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.purchases.dto.*;
import com.example.multi_tanent.purchases.entity.*;
import com.example.multi_tanent.purchases.repository.*;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class PurRequestForQuotationService {

    private final PurRequestForQuotationRepository rfqRepo;
    private final PurSupplierTenderingRepository tenderingRepo;
    private final PurSupplierTenderingSupplierRepository tenderingSupplierRepo;
    private final TenantRepository tenantRepo;

    public PurRequestForQuotationResponse create(PurRequestForQuotationRequest req, String rfqNumber, Long tenderingId,
            Long supplierId) {

        PurSupplierTendering tendering = tenderingRepo.findById(tenderingId)
                .orElseThrow(() -> new EntityNotFoundException("Tendering not found"));

        PurSupplierTenderingSupplier supplier = tenderingSupplierRepo.findById(supplierId)
                .orElseThrow(() -> new EntityNotFoundException("Tendering Supplier not found"));

        PurRequestForQuotation rfq = new PurRequestForQuotation();
        rfq.setRfqNumber(rfqNumber);
        rfq.setTendering(tendering);
        rfq.setSupplier(supplier);
        rfq.setSentDate(LocalDateTime.now());
        // rfq.setOnlineFormUrl() // Gen URL maybe

        if (tendering.getItems() != null) {
            tendering.getItems().forEach(ti -> {
                PurRequestForQuotationItem rfqItem = new PurRequestForQuotationItem();
                rfqItem.setTenderingItemId(ti.getId());
                rfqItem.setItemId(ti.getItemId());
                rfqItem.setItemName(ti.getItemName());
                rfqItem.setQuantity(ti.getQuantity());
                rfqItem.setUom(ti.getUom());
                rfq.addItem(rfqItem);
            });
        }
        PurRequestForQuotation saved = rfqRepo.save(rfq);
        return toResponse(saved);
    }

    public List<PurRequestForQuotationResponse> listByTenderingId(Long tenderingId) {
        return rfqRepo.findByTenderingId(tenderingId).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    private PurRequestForQuotationResponse toResponse(PurRequestForQuotation rfq) {
        return PurRequestForQuotationResponse.builder()
                .id(rfq.getId())
                .rfqNumber(rfq.getRfqNumber())
                .tenderingId(rfq.getTendering().getId())
                .supplierId(rfq.getSupplier().getSupplierId())
                .supplierName(rfq.getSupplier().getSupplierName())
                .sentDate(rfq.getSentDate())
                .onlineFormUrl(rfq.getOnlineFormUrl())
                .items(rfq.getItems() != null ? rfq.getItems().stream().map(it -> PurRequestForQuotationItemResponse.builder()
                        .id(it.getId())
                        .tenderingItemId(it.getTenderingItemId())
                        .itemId(it.getItemId())
                        .itemName(it.getItemName())
                        .quantity(it.getQuantity())
                        .uom(it.getUom())
                        .build()).collect(Collectors.toList()) : null)
                .build();
    }
}
