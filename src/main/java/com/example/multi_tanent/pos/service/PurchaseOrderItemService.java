package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.PurchaseOrderItemDto;
import com.example.multi_tanent.pos.dto.PurchaseOrderItemRequest;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.ProductVariantRepository;
import com.example.multi_tanent.pos.repository.PurchaseOrderItemRepository;
import com.example.multi_tanent.pos.repository.PurchaseOrderRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional("tenantTx")
public class PurchaseOrderItemService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final PurchaseOrderItemRepository purchaseOrderItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final TenantRepository tenantRepository;

    public PurchaseOrderItemService(PurchaseOrderRepository purchaseOrderRepository,
                                    PurchaseOrderItemRepository purchaseOrderItemRepository,
                                    ProductVariantRepository productVariantRepository,
                                    TenantRepository tenantRepository) {
        this.purchaseOrderRepository = purchaseOrderRepository;
        this.purchaseOrderItemRepository = purchaseOrderItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    private PurchaseOrder getPurchaseOrderForCurrentTenant(Long purchaseOrderId) {
        Tenant currentTenant = getCurrentTenant();
        return purchaseOrderRepository.findByIdAndTenantId(purchaseOrderId, currentTenant.getId())
                .orElseThrow(() -> new RuntimeException("PurchaseOrder not found with id: " + purchaseOrderId));
    }

    public PurchaseOrderItemDto addItem(Long purchaseOrderId, PurchaseOrderItemRequest request) {
        PurchaseOrder po = getPurchaseOrderForCurrentTenant(purchaseOrderId);
        checkIfPurchaseOrderIsMutable(po);

        ProductVariant variant = productVariantRepository.findById(request.getProductVariantId())
                .orElseThrow(() -> new RuntimeException("ProductVariant not found with id: " + request.getProductVariantId()));

        if (!variant.getProduct().getTenant().getId().equals(po.getTenant().getId())) {
            throw new SecurityException("Attempted to add a product from another tenant.");
        }

        PurchaseOrderItem item = new PurchaseOrderItem();
        item.setPurchaseOrder(po);
        item.setProductVariant(variant);
        item.setQuantityOrdered(request.getQuantityOrdered());
        item.setUnitCostCents(request.getUnitCostCents());

        return toDto(purchaseOrderItemRepository.save(item));
    }

    @Transactional(readOnly = true)
    public List<PurchaseOrderItemDto> getItemsForPurchaseOrder(Long purchaseOrderId) {
        PurchaseOrder po = getPurchaseOrderForCurrentTenant(purchaseOrderId);
        return po.getItems().stream().map(this::toDto).collect(Collectors.toList());
    }

    public PurchaseOrderItemDto updateItem(Long purchaseOrderId, Long itemId, PurchaseOrderItemRequest request) {
        PurchaseOrder po = getPurchaseOrderForCurrentTenant(purchaseOrderId);
        checkIfPurchaseOrderIsMutable(po);

        PurchaseOrderItem item = purchaseOrderItemRepository.findByIdAndPurchaseOrderId(itemId, purchaseOrderId)
                .orElseThrow(() -> new RuntimeException("PurchaseOrderItem not found with id: " + itemId));

        item.setQuantityOrdered(request.getQuantityOrdered());
        item.setUnitCostCents(request.getUnitCostCents());

        return toDto(purchaseOrderItemRepository.save(item));
    }

    public void deleteItem(Long purchaseOrderId, Long itemId) {
        PurchaseOrder po = getPurchaseOrderForCurrentTenant(purchaseOrderId);
        checkIfPurchaseOrderIsMutable(po);

        boolean removed = po.getItems().removeIf(item -> item.getId().equals(itemId));
        if (!removed) {
            throw new RuntimeException("PurchaseOrderItem not found with id: " + itemId + " in purchase order " + purchaseOrderId);
        }
        // Since orphanRemoval=true on the PurchaseOrder entity, JPA will delete the item.
        // We just need to save the parent entity to trigger the removal.
        purchaseOrderRepository.save(po);
    }

    private void checkIfPurchaseOrderIsMutable(PurchaseOrder po) {
        String status = po.getStatus();
        if ("closed".equals(status) || "cancelled".equals(status) || "received".equals(status)) {
            throw new IllegalStateException("Cannot modify a purchase order with status: " + status);
        }
    }

    private PurchaseOrderItemDto toDto(PurchaseOrderItem item) {
        PurchaseOrderItemDto dto = new PurchaseOrderItemDto();
        dto.setId(item.getId());
        if (item.getProductVariant() != null) {
            dto.setProductVariantId(item.getProductVariant().getId());
            dto.setProductVariantSku(item.getProductVariant().getSku());
            if (item.getProductVariant().getProduct() != null) {
                dto.setProductName(item.getProductVariant().getProduct().getName());
            }
        }
        dto.setQuantityOrdered(item.getQuantityOrdered());
        dto.setUnitCostCents(item.getUnitCostCents());
        return dto;
    }
}