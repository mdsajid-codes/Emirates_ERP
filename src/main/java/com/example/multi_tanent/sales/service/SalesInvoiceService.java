package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.repository.CrmSalesProductRepository;
import com.example.multi_tanent.production.entity.*;
import com.example.multi_tanent.production.repository.*;
import com.example.multi_tanent.sales.dto.*;
import com.example.multi_tanent.sales.entity.SalesInvoice;
import com.example.multi_tanent.sales.entity.SalesInvoiceItem;
import com.example.multi_tanent.sales.repository.SalesInvoiceRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.spersusers.repository.PartyRepository;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.service.FileStorageService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import com.example.multi_tanent.accounts.dto.posting.PostingRequest;
import com.example.multi_tanent.accounts.dto.posting.PostingResult;
import com.example.multi_tanent.accounts.entity.enums.DocumentType;
import com.example.multi_tanent.accounts.service.posting.GLPostingEngine;
import org.springframework.web.multipart.MultipartFile;
import lombok.extern.slf4j.Slf4j;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SalesInvoiceService {

    private final SalesInvoiceRepository salesInvoiceRepository;
    private final TenantRepository tenantRepository;
    private final PartyRepository partyRepository;
    private final EmployeeRepository employeeRepository;
    private final CrmSalesProductRepository crmSalesProductRepository;
    private final FileStorageService fileStorageService;
    private final ProCategoryRepository proCategoryRepository;
    private final ProSubCategoryRepository proSubCategoryRepository;
    private final ProRawMaterialsRepository proRawMaterialsRepository;
    private final ProSemiFinishedRepository proSemiFinishedRepository;
    private final ProFinishedGoodRepository proFinishedGoodRepository;
    private final GLPostingEngine glPostingEngine;

    @Transactional("tenantTx")
    public SalesInvoiceResponse createSalesInvoice(SalesInvoiceRequest request, List<MultipartFile> files) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesInvoice invoice = new SalesInvoice();
        invoice.setTenant(tenant);

        if (request.getCustomerId() != null) {
            BaseCustomer customer = partyRepository.findByTenantIdAndId(tenant.getId(), request.getCustomerId())
                    .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
            invoice.setCustomer(customer);
        }

        invoice.setInvoiceNumber("INV-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        mapRequestToEntity(request, invoice, tenant.getId());

        if (files != null && !files.isEmpty()) {
            List<String> attachmentUrls = new ArrayList<>();
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = fileStorageService.storeFile(file, "sales_invoices", false);
                    attachmentUrls.add(fileName);
                }
            }
            invoice.setAttachments(attachmentUrls);
        }

        calculateTotals(invoice);

        invoice = salesInvoiceRepository.save(invoice);

        if (invoice.getStatus() == com.example.multi_tanent.sales.enums.SalesStatus.INVOICED) {
            postSalesInvoiceToGL(invoice, "system");
        }

        return mapEntityToResponse(invoice);
    }

    @Transactional("tenantTx")
    public SalesInvoiceResponse updateSalesInvoice(Long id, SalesInvoiceRequest request, List<MultipartFile> files) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesInvoice invoice = salesInvoiceRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Sales Invoice not found"));

        if (request.getCustomerId() != null) {
            BaseCustomer customer = partyRepository.findByTenantIdAndId(tenant.getId(), request.getCustomerId())
                    .orElseThrow(() -> new EntityNotFoundException("Customer not found"));
            invoice.setCustomer(customer);
        }

        mapRequestToEntity(request, invoice, tenant.getId());

        if (files != null && !files.isEmpty()) {
            if (invoice.getAttachments() == null) {
                invoice.setAttachments(new ArrayList<>());
            }
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    String fileName = fileStorageService.storeFile(file, "sales_invoices", false);
                    invoice.getAttachments().add(fileName);
                }
            }
        }

        calculateTotals(invoice);

        invoice = salesInvoiceRepository.save(invoice);

        if (invoice.getStatus() == com.example.multi_tanent.sales.enums.SalesStatus.INVOICED) {
            postSalesInvoiceToGL(invoice, "system");
        }

        return mapEntityToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public SalesInvoiceResponse getSalesInvoiceById(Long id) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesInvoice invoice = salesInvoiceRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Sales Invoice not found"));
        return mapEntityToResponse(invoice);
    }

    @Transactional(readOnly = true)
    public Page<SalesInvoiceResponse> getAllSalesInvoices(String search, LocalDate fromDate, LocalDate toDate,
            Long salespersonId, Pageable pageable) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        Page<SalesInvoice> invoices = salesInvoiceRepository.searchSalesInvoices(tenant.getId(), search,
                fromDate, toDate, salespersonId, pageable);
        return invoices.map(this::mapEntityToResponse);
    }

    @Transactional
    public void deleteSalesInvoice(Long id) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesInvoice invoice = salesInvoiceRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Sales Invoice not found"));
        salesInvoiceRepository.delete(invoice);
    }

    // Placeholder for PDF Generation
    public byte[] generatePdf(Long id) {
        return new byte[0]; // To be implemented
    }

    @Transactional("tenantTx")
    public SalesInvoiceResponse recordPayment(Long id, SalesInvoicePaymentRequest paymentRequest, String username) {
        String tenantIdentifier = TenantContext.getTenantId();
        Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

        SalesInvoice invoice = salesInvoiceRepository.findByIdAndTenantId(id, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Sales Invoice not found"));

        if (invoice.getStatus() != com.example.multi_tanent.sales.enums.SalesStatus.INVOICED
                && invoice.getStatus() != com.example.multi_tanent.sales.enums.SalesStatus.PARTIALLY_PAID) {
            throw new IllegalStateException("Payment can only be recorded for INVOICED or PARTIALLY_PAID invoices. Current status: " + invoice.getStatus());
        }

        BigDecimal amountPaid = paymentRequest.getAmountPaid();
        if (amountPaid == null || amountPaid.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Payment amount must be greater than zero.");
        }

        // Update running balance
        BigDecimal previousReceived = invoice.getAmountReceived() != null ? invoice.getAmountReceived() : BigDecimal.ZERO;
        BigDecimal newTotalReceived = previousReceived.add(amountPaid);
        BigDecimal invoiceTotal = invoice.getNetTotal() != null ? invoice.getNetTotal() : BigDecimal.ZERO;
        BigDecimal newBalanceDue = invoiceTotal.subtract(newTotalReceived);

        invoice.setAmountReceived(newTotalReceived);
        invoice.setBalanceDue(newBalanceDue.max(BigDecimal.ZERO));

        // Determine new status
        if (newBalanceDue.compareTo(BigDecimal.ZERO) <= 0) {
            invoice.setStatus(com.example.multi_tanent.sales.enums.SalesStatus.PAID);
        } else {
            invoice.setStatus(com.example.multi_tanent.sales.enums.SalesStatus.PARTIALLY_PAID);
        }

        // Post the receipt voucher to GL (Bank or Cash)
        DocumentType docType = "CASH".equalsIgnoreCase(paymentRequest.getPaymentMethod())
                ? DocumentType.RECEIPT_VOUCHER_CASH
                : DocumentType.RECEIPT_VOUCHER_BANK;

        PostingRequest req = new PostingRequest();
        req.setDocumentType(docType);
        req.setReferenceId(invoice.getId());
        req.setReferenceNumber(paymentRequest.getReferenceNumber() != null
                ? paymentRequest.getReferenceNumber()
                : invoice.getInvoiceNumber());
        req.setEntryDate(paymentRequest.getPaymentDate() != null ? paymentRequest.getPaymentDate() : LocalDate.now());
        req.setCompanyId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null);
        req.setLinkedInvoiceJeId(invoice.getJournalEntryId());
        req.setDescription("Receipt from " + (invoice.getCustomer() != null ? invoice.getCustomer().getCompanyName() : "customer")
                + " against Invoice: " + invoice.getInvoiceNumber());

        PostingRequest.Line paymentLine = new PostingRequest.Line();
        paymentLine.setAmount(amountPaid);
        paymentLine.setDescription("Payment received against " + invoice.getInvoiceNumber());
        paymentLine.setDimCompanyId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null);
        req.setLines(List.of(paymentLine));

        PostingResult result = glPostingEngine.postDocument(req, username != null ? username : "system");
        if (!result.isSuccess()) {
            log.warn("GL posting for customer payment failed for invoice {}: {}", invoice.getInvoiceNumber(), result.getMessage());
        }

        return mapEntityToResponse(invoice);
    }

    private void postSalesInvoiceToGL(SalesInvoice invoice, String username) {
        if (Boolean.TRUE.equals(invoice.getGlPosted())) return;

        PostingRequest req = new PostingRequest();
        req.setDocumentType(DocumentType.CUSTOMER_INVOICE);
        req.setReferenceId(invoice.getId());
        req.setReferenceNumber(invoice.getInvoiceNumber());
        req.setEntryDate(invoice.getInvoiceDate());
        req.setDueDate(invoice.getDueDate());
        req.setCompanyId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null);
        req.setDescription("Customer Invoice: " + invoice.getInvoiceNumber());

        List<PostingRequest.Line> lines = invoice.getItems().stream().map(item -> {
            PostingRequest.Line line = new PostingRequest.Line();
            line.setItemId(item.getCrmProduct() != null ? item.getCrmProduct().getId() : null);
            line.setAmount(item.getAmount());
            line.setQuantity(item.getInvoiceQuantity());
            line.setDescription(item.getItemName());
            line.setDimItemId(line.getItemId());
            line.setDimCompanyId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null);
            if (!item.isTaxExempt() && item.getTaxValue() != null && item.getTaxValue().compareTo(BigDecimal.ZERO) > 0) {
                line.setDimTaxTypeId(1L); // Placeholder for VAT output rule trigger
                line.setTaxPercentage(item.getTaxPercentage());
            }
            return line;
        }).collect(Collectors.toList());
        req.setLines(lines);

        PostingResult result = glPostingEngine.postDocument(req, username);
        if (result.isSuccess()) {
            invoice.setJournalEntryId(result.getJournalEntryId());
            invoice.setGlPosted(true);
            // No need to save manually, invoice is a managed entity and will be flushed.
        } else {
            log.warn("GL posting failed for invoice {}: {}", invoice.getInvoiceNumber(), result.getMessage());
        }
    }

    private void mapRequestToEntity(SalesInvoiceRequest request, SalesInvoice invoice, Long tenantId) {
        if (request.getInvoiceLedger() != null)
            invoice.setInvoiceLedger(request.getInvoiceLedger());
        if (request.getInvoiceDate() != null)
            invoice.setInvoiceDate(request.getInvoiceDate());
        if (request.getReference() != null)
            invoice.setReference(request.getReference());
        if (request.getOrderNumber() != null)
            invoice.setOrderNumber(request.getOrderNumber());
        if (request.getDueDate() != null)
            invoice.setDueDate(request.getDueDate());
        if (request.getDateOfSupply() != null)
            invoice.setDateOfSupply(request.getDateOfSupply());

        if (request.getCustomerPoNo() != null)
            invoice.setCustomerPoNo(request.getCustomerPoNo());
        if (request.getCustomerPoDate() != null)
            invoice.setCustomerPoDate(request.getCustomerPoDate());
        if (request.getSaleType() != null)
            invoice.setSaleType(request.getSaleType());

        // New Fields
        if (request.getEnableGrossNetWeight() != null)
            invoice.setEnableGrossNetWeight(request.getEnableGrossNetWeight());
        if (request.getDelayReason() != null)
            invoice.setDelayReason(request.getDelayReason());
        if (request.getAmountReceived() != null)
            invoice.setAmountReceived(request.getAmountReceived());
        if (request.getBalanceDue() != null)
            invoice.setBalanceDue(request.getBalanceDue());

        if (request.getSubTotal() != null)
            invoice.setSubTotal(request.getSubTotal());
        if (request.getTotalDiscount() != null)
            invoice.setTotalDiscount(request.getTotalDiscount());
        if (request.getOtherCharges() != null)
            invoice.setOtherCharges(request.getOtherCharges());

        if (request.getTermsAndConditions() != null)
            invoice.setTermsAndConditions(request.getTermsAndConditions());
        if (request.getNotes() != null)
            invoice.setNotes(request.getNotes());
        if (request.getTemplate() != null)
            invoice.setTemplate(request.getTemplate());
        if (request.getEmailTo() != null)
            invoice.setEmailTo(request.getEmailTo());
        if (request.getStatus() != null)
            invoice.setStatus(request.getStatus());

        if (request.getSalespersonId() != null) {
            Employee salesperson = employeeRepository.findById(request.getSalespersonId()).orElse(null);
            invoice.setSalesperson(salesperson);
        }

        if (request.getItems() != null) {
            if (invoice.getItems() != null) {
                invoice.getItems().clear();
            } else {
                invoice.setItems(new ArrayList<>());
            }

            for (SalesInvoiceItemRequest itemRequest : request.getItems()) {
                SalesInvoiceItem item = new SalesInvoiceItem();
                item.setSalesInvoice(invoice);

                if (itemRequest.getCrmProductId() != null) {
                    CrmSalesProduct product = crmSalesProductRepository
                            .findByIdAndTenantId(itemRequest.getCrmProductId(), tenantId)
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Product not found: " + itemRequest.getCrmProductId()));
                    item.setCrmProduct(product);
                    item.setItemCode(
                            itemRequest.getItemCode() != null ? itemRequest.getItemCode() : product.getItemCode());
                    item.setItemName(itemRequest.getItemName() != null ? itemRequest.getItemName() : product.getName());
                } else if (itemRequest.getRawMaterialId() != null) {
                    ProRawMaterials rawMaterial = proRawMaterialsRepository
                            .findByTenantIdAndId(tenantId, itemRequest.getRawMaterialId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Raw Material not found: " + itemRequest.getRawMaterialId()));
                    item.setProRawMaterial(rawMaterial);
                    item.setItemCode(
                            itemRequest.getItemCode() != null ? itemRequest.getItemCode() : rawMaterial.getItemCode());
                    item.setItemName(
                            itemRequest.getItemName() != null ? itemRequest.getItemName() : rawMaterial.getName());
                } else if (itemRequest.getSemiFinishedId() != null) {
                    ProSemifinished semiFinished = proSemiFinishedRepository
                            .findByTenantIdAndId(tenantId, itemRequest.getSemiFinishedId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Semi-Finished Good not found: " + itemRequest.getSemiFinishedId()));
                    item.setProSemifinished(semiFinished);
                    item.setItemCode(
                            itemRequest.getItemCode() != null ? itemRequest.getItemCode() : semiFinished.getItemCode());
                    item.setItemName(
                            itemRequest.getItemName() != null ? itemRequest.getItemName() : semiFinished.getName());
                } else if (itemRequest.getFinishedGoodId() != null) {
                    ProFinishedGood finishedGood = proFinishedGoodRepository
                            .findByTenantIdAndId(tenantId, itemRequest.getFinishedGoodId())
                            .orElseThrow(() -> new EntityNotFoundException(
                                    "Finished Good not found: " + itemRequest.getFinishedGoodId()));
                    item.setProFinishedGood(finishedGood);
                    item.setItemCode(
                            itemRequest.getItemCode() != null ? itemRequest.getItemCode() : finishedGood.getItemCode());
                    item.setItemName(
                            itemRequest.getItemName() != null ? itemRequest.getItemName() : finishedGood.getName());
                } else {
                    item.setItemCode(itemRequest.getItemCode());
                    item.setItemName(itemRequest.getItemName());
                }

                item.setDescription(itemRequest.getDescription());
                item.setPackingType(itemRequest.getPackingType());

                // Specific Quantities
                item.setQuantityGross(itemRequest.getQuantityGross());
                item.setQuantityNet(itemRequest.getQuantityNet());
                item.setSendQuantity(itemRequest.getSendQuantity());
                item.setInvoiceQuantity(itemRequest.getInvoiceQuantity());

                item.setRate(itemRequest.getRate());
                item.setTaxValue(itemRequest.getTaxValue());
                item.setTaxPercentage(itemRequest.getTaxPercentage());
                item.setTaxExempt(itemRequest.isTaxExempt());

                if (itemRequest.getCategoryId() != null) {
                    ProCategory category = proCategoryRepository
                            .findById(itemRequest.getCategoryId())
                            .orElse(null);
                    item.setCategory(category);
                }
                if (itemRequest.getSubcategoryId() != null) {
                    ProSubCategory subCategory = proSubCategoryRepository
                            .findById(itemRequest.getSubcategoryId()).orElse(null);
                    item.setSubcategory(subCategory);
                }

                // Item mapping handled above

                BigDecimal amount = BigDecimal.ZERO;
                // Prefer invoice quantity for calculation if present, else send, else net?
                // Assumption: invoiceQuantity is the billing quantity
                BigDecimal qty = item.getInvoiceQuantity() != null ? item.getInvoiceQuantity() : BigDecimal.ZERO;

                if (item.getRate() != null) {
                    amount = item.getRate().multiply(qty);
                }
                item.setAmount(amount);

                invoice.getItems().add(item);
            }
        }
    }

    private void calculateTotals(SalesInvoice invoice) {
        BigDecimal subTotal = BigDecimal.ZERO;
        BigDecimal totalTax = BigDecimal.ZERO;

        if (invoice.getItems() != null) {
            for (SalesInvoiceItem item : invoice.getItems()) {
                if (item.getAmount() != null) {
                    subTotal = subTotal.add(item.getAmount());
                }
                if (!item.isTaxExempt() && item.getTaxValue() != null) {
                    totalTax = totalTax.add(item.getTaxValue());
                }
            }
        }

        invoice.setSubTotal(subTotal);

        BigDecimal discount = invoice.getTotalDiscount() != null ? invoice.getTotalDiscount() : BigDecimal.ZERO;

        BigDecimal grossTotal = subTotal.subtract(discount);
        invoice.setGrossTotal(grossTotal);

        invoice.setTotalTax(totalTax);

        BigDecimal otherCharges = invoice.getOtherCharges() != null ? invoice.getOtherCharges() : BigDecimal.ZERO;

        invoice.setNetTotal(grossTotal.add(totalTax).add(otherCharges));

        // Updates balance based on amount received if provided by logic or UI
        // Here we just persist what is given or simple calc
        if (invoice.getAmountReceived() != null) {
            invoice.setBalanceDue(invoice.getNetTotal().subtract(invoice.getAmountReceived()));
        } else {
            invoice.setBalanceDue(invoice.getNetTotal());
        }
    }

    private SalesInvoiceResponse mapEntityToResponse(SalesInvoice invoice) {
        SalesInvoiceResponse response = new SalesInvoiceResponse();
        response.setId(invoice.getId());
        response.setInvoiceLedger(invoice.getInvoiceLedger());
        response.setInvoiceDate(invoice.getInvoiceDate());

        if (invoice.getCustomer() != null) {
            response.setCustomerId(invoice.getCustomer().getId());
            response.setCustomerName(invoice.getCustomer().getCompanyName());
        }

        response.setInvoiceNumber(invoice.getInvoiceNumber());
        response.setReference(invoice.getReference());
        response.setOrderNumber(invoice.getOrderNumber());
        response.setDueDate(invoice.getDueDate());
        response.setDateOfSupply(invoice.getDateOfSupply());
        response.setCustomerPoNo(invoice.getCustomerPoNo());
        response.setCustomerPoDate(invoice.getCustomerPoDate());
        response.setSaleType(invoice.getSaleType());

        if (invoice.getSalesperson() != null) {
            response.setSalespersonId(invoice.getSalesperson().getId());
            response.setSalespersonName(
                    invoice.getSalesperson().getFirstName() + " " + invoice.getSalesperson().getLastName());
        }

        response.setEnableGrossNetWeight(invoice.getEnableGrossNetWeight());
        response.setDelayReason(invoice.getDelayReason());
        response.setAmountReceived(invoice.getAmountReceived());
        response.setBalanceDue(invoice.getBalanceDue());

        response.setSubTotal(invoice.getSubTotal());
        response.setTotalDiscount(invoice.getTotalDiscount());
        response.setGrossTotal(invoice.getGrossTotal());
        response.setTotalTax(invoice.getTotalTax());
        response.setOtherCharges(invoice.getOtherCharges());
        response.setNetTotal(invoice.getNetTotal());

        response.setAttachments(invoice.getAttachments());
        response.setTermsAndConditions(invoice.getTermsAndConditions());
        response.setNotes(invoice.getNotes());
        response.setTemplate(invoice.getTemplate());
        response.setEmailTo(invoice.getEmailTo());
        response.setStatus(invoice.getStatus());

        response.setCreatedBy(invoice.getCreatedBy());
        response.setUpdatedBy(invoice.getUpdatedBy());

        if (invoice.getItems() != null) {
            response.setItems(invoice.getItems().stream().map(item -> {
                SalesInvoiceItemResponse itemResponse = new SalesInvoiceItemResponse();
                itemResponse.setId(item.getId());
                if (item.getCrmProduct() != null) {
                    itemResponse.setCrmProductId(item.getCrmProduct().getId());
                }
                itemResponse.setItemCode(item.getItemCode());
                itemResponse.setItemName(item.getItemName());
                itemResponse.setDescription(item.getDescription());
                itemResponse.setPackingType(item.getPackingType());

                itemResponse.setQuantityGross(item.getQuantityGross());
                itemResponse.setQuantityNet(item.getQuantityNet());
                itemResponse.setSendQuantity(item.getSendQuantity());
                itemResponse.setInvoiceQuantity(item.getInvoiceQuantity());

                itemResponse.setRate(item.getRate());
                itemResponse.setAmount(item.getAmount());
                itemResponse.setTaxValue(item.getTaxValue());
                itemResponse.setTaxExempt(item.isTaxExempt());
                itemResponse.setTaxPercentage(item.getTaxPercentage());

                if (item.getCategory() != null) {
                    itemResponse.setCategoryId(item.getCategory().getId());
                    itemResponse.setCategoryName(item.getCategory().getName());
                }
                if (item.getSubcategory() != null) {
                    itemResponse.setSubcategoryId(item.getSubcategory().getId());
                    itemResponse.setSubcategoryName(item.getSubcategory().getName());
                }

                if (item.getProRawMaterial() != null) {
                    itemResponse.setRawMaterialId(item.getProRawMaterial().getId());
                    itemResponse.setRawMaterialName(item.getProRawMaterial().getName());
                }
                if (item.getProSemifinished() != null) {
                    itemResponse.setSemiFinishedId(item.getProSemifinished().getId());
                    itemResponse.setSemiFinishedName(item.getProSemifinished().getName());
                }
                if (item.getProFinishedGood() != null) {
                    itemResponse.setFinishedGoodId(item.getProFinishedGood().getId());
                    itemResponse.setFinishedGoodName(item.getProFinishedGood().getName());
                }

                return itemResponse;
            }).collect(Collectors.toList()));
        }

        return response;
    }
}
