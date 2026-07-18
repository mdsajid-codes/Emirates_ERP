package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.pos.dto.SaleItemRequest;
import com.example.multi_tanent.pos.entity.*;
import com.example.multi_tanent.pos.repository.ProductVariantRepository;
import com.example.multi_tanent.pos.repository.SaleItemRepository;
import com.example.multi_tanent.pos.repository.SaleRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@Transactional("tenantTx")
public class SaleItemService {

    private final SaleRepository saleRepository;
    private final SaleItemRepository saleItemRepository;
    private final ProductVariantRepository productVariantRepository;
    private final TenantRepository tenantRepository;

    public SaleItemService(SaleRepository saleRepository, SaleItemRepository saleItemRepository, ProductVariantRepository productVariantRepository, TenantRepository tenantRepository) {
        this.saleRepository = saleRepository;
        this.saleItemRepository = saleItemRepository;
        this.productVariantRepository = productVariantRepository;
        this.tenantRepository = tenantRepository;
    }

    private Tenant getCurrentTenant() {
        return tenantRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant context not found."));
    }

    private Sale getSaleForCurrentTenant(Long saleId) {
        Tenant currentTenant = getCurrentTenant();
        return saleRepository.findByIdAndTenantId(saleId, currentTenant.getId())
                .orElseThrow(() -> new RuntimeException("Sale not found with id: " + saleId));
    }

    @Transactional(readOnly = true)
    public List<SaleItem> getAllItemsForSale(Long saleId) {
        Sale sale = getSaleForCurrentTenant(saleId);
        return sale.getItems();
    }

    @Transactional(readOnly = true)
    public Optional<SaleItem> getItemById(Long saleId, Long itemId) {
        getSaleForCurrentTenant(saleId); // Ensures sale exists for the tenant
        return saleItemRepository.findByIdAndSaleId(itemId, saleId);
    }

    public SaleItem updateSaleItem(Long saleId, Long itemId, SaleItemRequest itemRequest) {
        Sale sale = getSaleForCurrentTenant(saleId);
        if ("completed".equals(sale.getStatus()) || "refunded".equals(sale.getStatus())) {
            throw new IllegalStateException("Cannot update items in a completed or refunded sale.");
        }

        SaleItem saleItem = saleItemRepository.findByIdAndSaleId(itemId, saleId)
                .orElseThrow(() -> new RuntimeException("SaleItem not found with id: " + itemId));

        // Update quantity and recalculate line totals
        saleItem.setQuantity(itemRequest.getQuantity());
        ProductVariant variant = saleItem.getProductVariant();
        saleItem.setUnitPriceCents(variant.getPriceCents());
        saleItem.setLineTotalCents(variant.getPriceCents() * itemRequest.getQuantity());

        long lineTax = 0L;
        if (variant.getTaxRate() != null) {
            lineTax = (saleItem.getLineTotalCents() * variant.getTaxRate().getPercent().longValue()) / 100;
        }
        saleItem.setTaxCents(lineTax);

        recalculateSaleTotals(sale);
        // The sale is the aggregate root, so we save it.
        saleRepository.save(sale);  
        return saleItem;
    }

    public void removeSaleItem(Long saleId, Long itemId) {
        Sale sale = getSaleForCurrentTenant(saleId);
        if ("completed".equals(sale.getStatus()) || "refunded".equals(sale.getStatus())) {
            throw new IllegalStateException("Cannot remove items from a completed or refunded sale.");
        }

        boolean removed = sale.getItems().removeIf(item -> item.getId().equals(itemId));
        if (!removed) {
            throw new RuntimeException("SaleItem not found with id: " + itemId + " in sale " + saleId);
        }

        recalculateSaleTotals(sale);
        saleRepository.save(sale);
    }

    private void recalculateSaleTotals(Sale sale) {
        long subtotal = 0L;
        long totalTax = 0L;

        for (SaleItem item : sale.getItems()) {
            subtotal += item.getLineTotalCents();
            totalTax += item.getTaxCents();
        }

        sale.setSubtotalCents(subtotal);
        sale.setTaxCents(totalTax);
        // Sale-level discount is preserved
        sale.setTotalCents(subtotal + totalTax - sale.getDiscountCents());

        // You might also want to re-evaluate payment status here
    }
}