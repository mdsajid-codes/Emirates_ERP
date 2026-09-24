package com.example.multi_tanent.pos.service;

import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.dto.vat.TaxTransactionRequest;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.entity.enums.TaxPaymentType;
import com.example.multi_tanent.accounts.entity.enums.TaxTransactionType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import com.example.multi_tanent.accounts.service.vat.VatService;
import com.example.multi_tanent.pos.entity.Payment;
import com.example.multi_tanent.pos.entity.Sale;
import com.example.multi_tanent.pos.entity.SaleItem;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class PosAccountingIntegrationService {

    private final GLPostingEngine glPostingEngine;
    private final VatService vatService;

    /**
     * Posts POS sale revenue, payment asset, and Output VAT to the GL.
     * Uses REQUIRES_NEW so it runs in its own transaction — failure does NOT
     * roll back the POS checkout transaction.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long postSaleToLedger(Sale sale, Long tenantId) {
        try {
            log.info("Posting POS sale {} (Invoice: {}) to GL ledger...", sale.getId(), sale.getInvoiceNo());

            PostingRequest request = new PostingRequest();
            request.setDocumentType(DocumentType.POS_SALE);
            request.setReferenceId(sale.getId());
            request.setReferenceNumber(sale.getInvoiceNo());
            request.setEntryDate(sale.getInvoiceDate() != null ? sale.getInvoiceDate().toLocalDate() : LocalDate.now());
            request.setDescription("POS Sale Invoice: " + sale.getInvoiceNo());

            // Associate customer ID if present
            if (sale.getCustomer() != null) {
                request.setCompanyId(sale.getCustomer().getId());
            }

            // Populate split payment legs if present
            if (sale.getPayments() != null && !sale.getPayments().isEmpty()) {
                for (Payment p : sale.getPayments()) {
                    PostingRequest.PaymentLeg leg = new PostingRequest.PaymentLeg();
                    leg.setMethod(p.getMethod());
                    leg.setAmountCents(p.getAmountCents());
                    leg.setReference(p.getPaymentReference() != null ? p.getPaymentReference() : p.getReference());
                    request.getPaymentLegs().add(leg);
                }
                // Set primary payment method for backwards compatibility
                request.setPaymentMethod(sale.getPayments().get(0).getMethod());
            } else if ("unpaid".equalsIgnoreCase(sale.getPaymentStatus()) || "credit".equalsIgnoreCase(sale.getPaymentStatus())) {
                request.setPaymentMethod("credit");
            } else {
                request.setPaymentMethod("cash");
            }

            List<PostingRequest.Line> lines = new ArrayList<>();
            BigDecimal totalVatAmount = BigDecimal.ZERO;

            for (SaleItem item : sale.getItems()) {
                PostingRequest.Line line = new PostingRequest.Line();

                if (sale.getCustomer() != null) {
                    line.setDimCompanyId(sale.getCustomer().getId());
                }

                // Resolve product ID for GL account lookup
                Long productId = item.getProduct() != null ? item.getProduct().getId() : null;
                line.setItemId(productId);

                // Line subtotal (excluding VAT): lineTotalCents is already net item subtotal
                long lineTotalCentsVal = item.getLineTotalCents() != null ? item.getLineTotalCents() : 0L;
                long taxCentsVal = item.getTaxCents() != null ? item.getTaxCents() : 0L;

                BigDecimal lineSubtotal = BigDecimal.valueOf(lineTotalCentsVal)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                line.setAmount(lineSubtotal);

                // Tax amount for line
                BigDecimal lineTax = BigDecimal.valueOf(taxCentsVal)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                line.setTaxAmount(lineTax);

                String productName = item.getProduct() != null ? item.getProduct().getName() : "Item";
                line.setDescription("Sale Item: " + productName);
                line.setQuantity(BigDecimal.valueOf(item.getQuantity() != null ? item.getQuantity() : 1L));

                lines.add(line);
                totalVatAmount = totalVatAmount.add(lineTax);
            }

            request.setLines(lines);

            // Post document to GL
            PostingResult result = glPostingEngine.postDocument(request, "POS_SYSTEM");
            if (!result.isSuccess()) {
                log.error("Posting Engine returned error for POS sale {}: {}", sale.getId(), result.getMessage());
                return null;
            }

            Long journalEntryId = result.getJournalEntryId();
            log.info("Successfully posted POS sale {} to GL with Journal Entry ID: {}", sale.getId(), journalEntryId);

            // Record Output VAT in Tax Transactions for UAE VAT Return (Box 1)
            if (totalVatAmount.compareTo(BigDecimal.ZERO) > 0) {
                try {
                    TaxTransactionRequest taxReq = new TaxTransactionRequest();
                    taxReq.setTransactionDate(request.getEntryDate());
                    taxReq.setTransactionType(TaxTransactionType.PAYABLE_INCREASE);
                    taxReq.setPaymentType(TaxPaymentType.TAX);
                    taxReq.setAmount(totalVatAmount);
                    taxReq.setDescription("Output VAT for POS Sale: " + sale.getInvoiceNo());
                    vatService.createTaxTransaction(taxReq, String.valueOf(tenantId));
                    log.info("Recorded Output VAT of AED {} for sale {}", totalVatAmount, sale.getInvoiceNo());
                } catch (Exception e) {
                    log.warn("Failed to record tax transaction for sale {}: {}", sale.getInvoiceNo(), e.getMessage());
                }
            }

            return journalEntryId;
        } catch (Exception e) {
            log.error("Failed to post POS sale {} to ledger: {}", sale.getId(), e.getMessage(), e);
            return null; // Non-blocking: POS checkout succeeds even if GL posting fails
        }
    }

    /**
     * Posts COGS (Dr COGS Expense / Cr Inventory) for a completed POS sale.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Long postCogsToLedger(Sale sale, Long tenantId) {
        try {
            log.info("Posting POS COGS for sale {} (Invoice: {}) to GL ledger...", sale.getId(), sale.getInvoiceNo());

            PostingRequest request = new PostingRequest();
            request.setDocumentType(DocumentType.POS_COGS);
            request.setReferenceId(sale.getId());
            request.setReferenceNumber("COGS-" + sale.getInvoiceNo());
            request.setEntryDate(sale.getInvoiceDate() != null ? sale.getInvoiceDate().toLocalDate() : LocalDate.now());
            request.setDescription("POS COGS for Invoice: " + sale.getInvoiceNo());

            List<PostingRequest.Line> lines = new ArrayList<>();
            BigDecimal totalCogs = BigDecimal.ZERO;

            for (SaleItem item : sale.getItems()) {
                if (item.getProduct() == null) continue;

                // Use per-item costCents if populated on SaleItem, otherwise fall back to product purchasePrice
                long perUnitCostCents = 0L;
                if (item.getCostCents() != null && item.getCostCents() > 0) {
                    perUnitCostCents = item.getCostCents();
                } else if (item.getProduct().getPurchasePrice() != null) {
                    perUnitCostCents = item.getProduct().getPurchasePrice().multiply(BigDecimal.valueOf(100)).longValue();
                }

                if (perUnitCostCents <= 0) continue;

                long qty = item.getQuantity() != null ? item.getQuantity() : 1L;
                BigDecimal itemCogs = BigDecimal.valueOf(perUnitCostCents * qty)
                        .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

                if (itemCogs.compareTo(BigDecimal.ZERO) <= 0) continue;

                Long productId = item.getProduct().getId();

                PostingRequest.Line line = new PostingRequest.Line();
                line.setItemId(productId);
                line.setCogsAmount(itemCogs);
                line.setAmount(itemCogs);
                line.setQuantity(BigDecimal.valueOf(qty));
                line.setDescription("COGS: " + item.getProduct().getName());

                lines.add(line);
                totalCogs = totalCogs.add(itemCogs);
            }

            if (lines.isEmpty() || totalCogs.compareTo(BigDecimal.ZERO) <= 0) {
                log.info("No COGS cost data for sale {}, skipping COGS posting", sale.getId());
                return null;
            }

            request.setLines(lines);

            PostingResult result = glPostingEngine.postDocument(request, "POS_SYSTEM");
            if (!result.isSuccess()) {
                log.error("Posting Engine error for POS COGS sale {}: {}", sale.getId(), result.getMessage());
                return null;
            }

            log.info("Successfully posted POS COGS for sale {} with Journal Entry ID: {}", sale.getId(), result.getJournalEntryId());
            return result.getJournalEntryId();
        } catch (Exception e) {
            log.error("Failed to post POS COGS for sale {} to ledger: {}", sale.getId(), e.getMessage(), e);
            return null;
        }
    }

    /**
     * Reverses the GL journal entries for a deleted/voided POS sale.
     */
    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public void reverseSaleFromLedger(Sale sale, Long tenantId) {
        try {
            if (sale.getJournalEntryId() != null) {
                log.info("Reversing POS Sale Journal Entry {} for voided sale {}", sale.getJournalEntryId(), sale.getId());
                glPostingEngine.reverseDocument(sale.getJournalEntryId(), "POS_SYSTEM");
            }
            if (sale.getCogsJournalEntryId() != null) {
                log.info("Reversing POS COGS Journal Entry {} for voided sale {}", sale.getCogsJournalEntryId(), sale.getId());
                glPostingEngine.reverseDocument(sale.getCogsJournalEntryId(), "POS_SYSTEM");
            }
        } catch (Exception e) {
            log.error("Failed to reverse journal entries for sale {}: {}", sale.getId(), e.getMessage(), e);
        }
    }
}
