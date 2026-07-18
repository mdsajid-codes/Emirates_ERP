package com.example.multi_tanent.sales.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.sales.dto.ListOfDueBillsReportItemDto;
import com.example.multi_tanent.sales.dto.ListOfDueBillsReportResponse;
import com.example.multi_tanent.sales.dto.DelaySalesReportItemDto;
import com.example.multi_tanent.sales.dto.DelaySalesReportResponse;
import com.example.multi_tanent.sales.dto.SalesByCustomerReportItemDto;
import com.example.multi_tanent.sales.dto.SalesByCustomerReportResponse;
import com.example.multi_tanent.sales.dto.SalesByItemReportItemDto;
import com.example.multi_tanent.sales.dto.SalesByItemReportResponse;
import com.example.multi_tanent.sales.dto.SalesBySalesPersonReportItemDto;
import com.example.multi_tanent.sales.dto.SalesBySalesPersonReportResponse;

import com.example.multi_tanent.sales.dto.ListOfDueInvoicesReportItemDto;
import com.example.multi_tanent.sales.dto.ListOfDueInvoicesReportResponse;
import com.example.multi_tanent.sales.dto.SalesOrderByItemReportDto;
import com.example.multi_tanent.sales.entity.SalesInvoice;
import com.example.multi_tanent.sales.repository.SalesInvoiceRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import com.example.multi_tanent.sales.entity.SalesOrder;
import com.example.multi_tanent.sales.entity.SalesOrderItem;
import com.example.multi_tanent.sales.repository.SalesOrderRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(value = "tenantTx", readOnly = true)
public class SalReportService {

    private final SalesOrderRepository salesOrderRepo;
    private final SalesInvoiceRepository salesInvoiceRepo;
    private final TenantRepository tenantRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    public List<SalesOrderByItemReportDto> getSalesOrderByItemReport(LocalDate fromDate, LocalDate toDate,
            Long itemId) {
        Tenant tenant = currentTenant();

        List<SalesOrder> orders = salesOrderRepo.findByTenantId(tenant.getId()).stream()
                .filter(o -> o.getSalesOrderDate() != null
                        && !o.getSalesOrderDate().isBefore(fromDate)
                        && !o.getSalesOrderDate().isAfter(toDate))
                .collect(Collectors.toList());

        // Map to store aggregation: CustomerId -> Dto
        Map<Long, SalesOrderByItemReportDto> aggregationMap = new HashMap<>();

        for (SalesOrder order : orders) {
            if (order.getItems() == null)
                continue;

            // Filter Items matching the itemId
            List<SalesOrderItem> matchingItems = order.getItems().stream()
                    .filter(i -> {
                        if (itemId == null)
                            return true; // If no item selected, maybe return all?
                        // Assuming itemId refers to CrmSalesProduct
                        // Also checking FinishedGood id just in case, though risky if IDs collide.
                        // Ideally checking CrmProduct is safer for Sales.
                        if (i.getCrmProduct() != null && i.getCrmProduct().getId().equals(itemId))
                            return true;

                        // Fallback: Check Finished Good if CrmProduct is null?
                        if (i.getFinishedGood() != null && i.getFinishedGood().getId().equals(itemId))
                            return true;

                        return false;
                    })
                    .collect(Collectors.toList());

            if (matchingItems.isEmpty())
                continue;

            BaseCustomer customer = order.getCustomer();
            if (customer == null)
                continue;

            SalesOrderByItemReportDto dto = aggregationMap.getOrDefault(customer.getId(),
                    new SalesOrderByItemReportDto());
            if (dto.getCustomerName() == null) {
                dto.setCustomerName(customer.getCompanyName());
                dto.setQuantity(0);
                dto.setAmount(BigDecimal.ZERO);
            }

            for (SalesOrderItem item : matchingItems) {
                Integer qty = item.getQuantity() != null ? item.getQuantity() : 0;
                BigDecimal amt = item.getAmount() != null ? item.getAmount() : BigDecimal.ZERO;

                dto.setQuantity(dto.getQuantity() + qty);
                dto.setAmount(dto.getAmount().add(amt));
            }

            aggregationMap.put(customer.getId(), dto);
        }

        List<SalesOrderByItemReportDto> report = new ArrayList<>(aggregationMap.values());

        // Calculate Average Price
        for (SalesOrderByItemReportDto item : report) {
            if (item.getQuantity() > 0) {
                item.setAveragePrice(
                        item.getAmount().divide(new BigDecimal(item.getQuantity()), 2, RoundingMode.HALF_UP));
            } else {
                item.setAveragePrice(BigDecimal.ZERO);
            }
        }

        // Sort by Customer Name? Or Quantity?
        report.sort((a, b) -> a.getCustomerName().compareToIgnoreCase(b.getCustomerName()));

        return report;
    }

    public List<com.example.multi_tanent.sales.dto.SalesOrderByCustomerReportDto> getSalesOrderByCustomerReport(
            LocalDate fromDate, LocalDate toDate, Long branchId) {
        Tenant tenant = currentTenant();

        List<SalesOrder> orders = salesOrderRepo.findByTenantId(tenant.getId()).stream()
                .filter(o -> o.getSalesOrderDate() != null
                        && !o.getSalesOrderDate().isBefore(fromDate)
                        && !o.getSalesOrderDate().isAfter(toDate))
                .collect(Collectors.toList());

        Map<Long, com.example.multi_tanent.sales.dto.SalesOrderByCustomerReportDto> map = new HashMap<>();

        for (SalesOrder o : orders) {
            if (o.getCustomer() == null)
                continue;
            Long customerId = o.getCustomer().getId();

            com.example.multi_tanent.sales.dto.SalesOrderByCustomerReportDto dto = map.getOrDefault(customerId,
                    new com.example.multi_tanent.sales.dto.SalesOrderByCustomerReportDto());

            if (dto.getCustomerName() == null) {
                dto.setCustomerName(o.getCustomer().getCompanyName());
                dto.setSalesCount(0L);
                dto.setSalesAmount(BigDecimal.ZERO);
            }

            dto.setSalesCount(dto.getSalesCount() + 1);

            BigDecimal amount = o.getNetTotal() != null ? o.getNetTotal() : BigDecimal.ZERO;
            dto.setSalesAmount(dto.getSalesAmount().add(amount));

            map.put(customerId, dto);
        }

        List<com.example.multi_tanent.sales.dto.SalesOrderByCustomerReportDto> report = new ArrayList<>(map.values());

        // Sort by Sales Amount Descending
        report.sort((a, b) -> b.getSalesAmount().compareTo(a.getSalesAmount()));

        return report;
    }

    public ListOfDueBillsReportResponse getListOfDueBillsReport(LocalDate asOnDate, Long customerId, Long branchId,
            int page, int size) {
        Tenant tenant = currentTenant();
        Pageable pageable = PageRequest.of(page, size, Sort.by("invoiceDate").descending());

        Page<SalesInvoice> invoicePage = salesInvoiceRepo.findDueBills(tenant.getId(), asOnDate, customerId, pageable);

        List<ListOfDueBillsReportItemDto> items = invoicePage.stream().map(inv -> {
            ListOfDueBillsReportItemDto item = new ListOfDueBillsReportItemDto();
            item.setId(inv.getId());
            item.setRefNo(inv.getInvoiceNumber());
            item.setCustomerName(inv.getCustomer() != null ? inv.getCustomer().getCompanyName() : "");
            item.setType("Sale");
            item.setDated(inv.getInvoiceDate());
            item.setTotalAmt(inv.getNetTotal() != null ? inv.getNetTotal() : BigDecimal.ZERO);
            item.setPendingAmt(inv.getBalanceDue() != null ? inv.getBalanceDue() : BigDecimal.ZERO);
            item.setDueDate(inv.getDueDate());

            long days = 0;
            if (asOnDate != null && inv.getDueDate() != null) {
                days = java.time.temporal.ChronoUnit.DAYS.between(inv.getDueDate(), asOnDate);
                if (days < 0)
                    days = 0;
            }
            item.setDays(days);

            return item;
        }).collect(Collectors.toList());

        ListOfDueBillsReportResponse response = new ListOfDueBillsReportResponse();
        response.setItems(items);
        response.setTotalElements(invoicePage.getTotalElements());
        response.setTotalPages(invoicePage.getTotalPages());
        response.setCurrentPage(invoicePage.getNumber());

        List<SalesInvoice> allMatching = salesInvoiceRepo
                .findDueBills(tenant.getId(), asOnDate, customerId, Pageable.unpaged()).getContent();

        BigDecimal totalAmount = allMatching.stream()
                .map(i -> i.getNetTotal() != null ? i.getNetTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = allMatching.stream()
                .map(i -> i.getBalanceDue() != null ? i.getBalanceDue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        response.setTotalAmount(totalAmount);
        response.setTotalPendingAmount(totalPending);

        return response;
    }

    public ListOfDueInvoicesReportResponse getListOfDueInvoicesReport(LocalDate asOnDate, Long customerId,
            Long branchId, String agingGroup, int page, int size) {
        Tenant tenant = currentTenant();
        Pageable pageable = PageRequest.of(page, size, Sort.by("invoiceDate").descending());

        LocalDate dueDateStart = null;
        LocalDate dueDateEnd = null;

        final LocalDate finalAsOnDate = (asOnDate == null) ? LocalDate.now() : asOnDate;

        if (agingGroup != null) {
            switch (agingGroup) {
                case "1-30":
                    dueDateEnd = finalAsOnDate.minusDays(1);
                    dueDateStart = finalAsOnDate.minusDays(30);
                    break;
                case "31-60":
                    dueDateEnd = finalAsOnDate.minusDays(31);
                    dueDateStart = finalAsOnDate.minusDays(60);
                    break;
                case "61-90":
                    dueDateEnd = finalAsOnDate.minusDays(61);
                    dueDateStart = finalAsOnDate.minusDays(90);
                    break;
                case "Over 90": // Over 90 means older than 90 days
                    dueDateEnd = finalAsOnDate.minusDays(91);
                    break;
                case "All":
                default:
                    // No filters
                    break;
            }
        }

        Page<SalesInvoice> invoicePage = salesInvoiceRepo.findDueInvoicesWithAging(tenant.getId(), finalAsOnDate,
                dueDateStart, dueDateEnd, customerId, pageable);

        List<ListOfDueInvoicesReportItemDto> items = invoicePage.stream().map(inv -> {
            ListOfDueInvoicesReportItemDto item = new ListOfDueInvoicesReportItemDto();
            item.setId(inv.getId());
            item.setRefNo(inv.getInvoiceNumber());
            item.setCustomerName(inv.getCustomer() != null ? inv.getCustomer().getCompanyName() : "");
            item.setType("Sale");
            item.setDated(inv.getInvoiceDate());
            item.setTotalAmt(inv.getNetTotal() != null ? inv.getNetTotal() : BigDecimal.ZERO);
            item.setPendingAmt(inv.getBalanceDue() != null ? inv.getBalanceDue() : BigDecimal.ZERO);
            item.setDueDate(inv.getDueDate());

            long days = 0;
            if (finalAsOnDate != null && inv.getDueDate() != null) {
                days = java.time.temporal.ChronoUnit.DAYS.between(inv.getDueDate(), finalAsOnDate);
                if (days < 0)
                    days = 0;
            }
            item.setDays(days);

            return item;
        }).collect(Collectors.toList());

        ListOfDueInvoicesReportResponse response = new ListOfDueInvoicesReportResponse();
        response.setItems(items);
        response.setTotalElements(invoicePage.getTotalElements());
        response.setTotalPages(invoicePage.getTotalPages());
        response.setCurrentPage(invoicePage.getNumber());

        // Calculate Totals for filter (Unpaged)
        List<SalesInvoice> allMatching = salesInvoiceRepo.findDueInvoicesWithAging(tenant.getId(), finalAsOnDate,
                dueDateStart, dueDateEnd, customerId, Pageable.unpaged()).getContent();

        BigDecimal totalAmount = allMatching.stream()
                .map(i -> i.getNetTotal() != null ? i.getNetTotal() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal totalPending = allMatching.stream()
                .map(i -> i.getBalanceDue() != null ? i.getBalanceDue() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        response.setTotalAmount(totalAmount);
        response.setTotalPendingAmount(totalPending);

        return response;
    }

    public SalesBySalesPersonReportResponse getSalesBySalesPersonReport(LocalDate fromDate, LocalDate toDate, int page,
            int size) {
        Long tenantId = currentTenant().getId();
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        Page<SalesBySalesPersonReportItemDto> itemPage = salesInvoiceRepo.getSalesBySalesPersonReport(tenantId,
                fromDate, toDate, pageable);

        SalesBySalesPersonReportItemDto totalItem = salesInvoiceRepo.getSalesBySalesPersonReportTotal(tenantId,
                fromDate, toDate);

        SalesBySalesPersonReportResponse response = new SalesBySalesPersonReportResponse();
        response.setItems(itemPage.getContent());
        response.setTotalCount(itemPage.getTotalElements());
        response.setTotalPages(itemPage.getTotalPages());
        response.setCurrentPage(itemPage.getNumber());

        if (totalItem != null) {
            response.setTotalInvoiceCount(totalItem.getInvoiceCount() != null ? totalItem.getInvoiceCount() : 0L);
            response.setTotalSalesAmount(
                    totalItem.getTotalSales() != null ? totalItem.getTotalSales() : BigDecimal.ZERO);
        } else {
            response.setTotalInvoiceCount(0L);
            response.setTotalSalesAmount(BigDecimal.ZERO);
        }

        return response;
    }

    public SalesByItemReportResponse getSalesByItemReport(LocalDate fromDate, LocalDate toDate, Long categoryId,
            Long subCategoryId, Long itemId, int page, int size) {
        Long tenantId = currentTenant().getId();
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        Page<SalesByItemReportItemDto> itemPage = salesInvoiceRepo.getSalesByItemReport(tenantId, fromDate, toDate,
                categoryId, subCategoryId, itemId, pageable);

        SalesByItemReportItemDto totalItem = salesInvoiceRepo.getSalesByItemReportTotal(tenantId, fromDate, toDate,
                categoryId, subCategoryId, itemId);

        // Calculate Average Price for each item
        itemPage.getContent().forEach(item -> {
            if (item.getQuantity() != null && item.getQuantity().compareTo(BigDecimal.ZERO) > 0) {
                item.setAveragePrice(item.getAmount().divide(item.getQuantity(), 2, RoundingMode.HALF_UP));
            } else {
                item.setAveragePrice(BigDecimal.ZERO);
            }
        });

        SalesByItemReportResponse response = new SalesByItemReportResponse();
        response.setItems(itemPage.getContent());
        response.setTotalCount(itemPage.getTotalElements());
        response.setTotalPages(itemPage.getTotalPages());
        response.setCurrentPage(itemPage.getNumber());

        if (totalItem != null) {
            response.setTotalQuantity(
                    totalItem.getQuantity() != null ? totalItem.getQuantity() : BigDecimal.ZERO);
            response.setTotalAmount(
                    totalItem.getAmount() != null ? totalItem.getAmount() : BigDecimal.ZERO);
        } else {
            response.setTotalQuantity(BigDecimal.ZERO);
            response.setTotalAmount(BigDecimal.ZERO);
        }

        return response;
    }

    public SalesByCustomerReportResponse getSalesByCustomerReport(LocalDate fromDate, LocalDate toDate,
            int page, int size) {
        Long tenantId = currentTenant().getId();
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        Page<SalesByCustomerReportItemDto> itemPage = salesInvoiceRepo.getSalesByCustomerReport(tenantId, fromDate,
                toDate, pageable);

        SalesByCustomerReportItemDto totalItem = salesInvoiceRepo.getSalesByCustomerReportTotal(tenantId, fromDate,
                toDate);

        SalesByCustomerReportResponse response = new SalesByCustomerReportResponse();
        response.setItems(itemPage.getContent());
        response.setTotalCount(itemPage.getTotalElements());
        response.setTotalPages(itemPage.getTotalPages());
        response.setCurrentPage(itemPage.getNumber());

        if (totalItem != null) {
            response.setTotalInvoiceCount(totalItem.getInvoiceCount() != null ? totalItem.getInvoiceCount() : 0L);
            response.setTotalSalesAmount(
                    totalItem.getTotalSales() != null ? totalItem.getTotalSales() : BigDecimal.ZERO);
        } else {
            response.setTotalInvoiceCount(0L);
            response.setTotalSalesAmount(BigDecimal.ZERO);
        }

        return response;
    }

    public DelaySalesReportResponse getDelaySalesReport(LocalDate fromDate, LocalDate toDate, Long customerId, int page,
            int size) {
        Long tenantId = currentTenant().getId();
        Pageable pageable = org.springframework.data.domain.PageRequest.of(page, size);

        Page<DelaySalesReportItemDto> itemPage = salesInvoiceRepo.getDelaySalesReport(tenantId, fromDate, toDate,
                customerId, pageable);

        DelaySalesReportResponse response = new DelaySalesReportResponse();
        response.setItems(itemPage.getContent());
        response.setTotalCount(itemPage.getTotalElements());
        response.setTotalPages(itemPage.getTotalPages());
        response.setCurrentPage(itemPage.getNumber());

        return response;
    }
}
