package com.example.multi_tanent.sales.repository;

import com.example.multi_tanent.sales.dto.DelaySalesReportItemDto;
import com.example.multi_tanent.sales.dto.SalesByCustomerReportItemDto;
import com.example.multi_tanent.sales.dto.SalesByItemReportItemDto;
import com.example.multi_tanent.sales.dto.SalesBySalesPersonReportItemDto;
import com.example.multi_tanent.sales.entity.SalesInvoice;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.Optional;

@Repository
public interface SalesInvoiceRepository extends JpaRepository<SalesInvoice, Long> {

        Optional<SalesInvoice> findByIdAndTenantId(Long id, Long tenantId);

        @Query("SELECT s FROM SalesInvoice s WHERE s.tenant.id = :tenantId " +
                        "AND (:search IS NULL OR LOWER(s.invoiceNumber) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(s.reference) LIKE LOWER(CONCAT('%', :search, '%')) " +
                        "OR LOWER(s.customer.companyName) LIKE LOWER(CONCAT('%', :search, '%'))) " +
                        "AND (:fromDate IS NULL OR s.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR s.invoiceDate <= :toDate) " +
                        "AND (:salespersonId IS NULL OR s.salesperson.id = :salespersonId)")
        Page<SalesInvoice> searchSalesInvoices(Long tenantId, String search, LocalDate fromDate, LocalDate toDate,
                        Long salespersonId, Pageable pageable);

        @Query("SELECT s FROM SalesInvoice s WHERE s.tenant.id = :tenantId " +
                        "AND s.balanceDue > 0 " +
                        "AND (:asOnDate IS NULL OR s.invoiceDate <= :asOnDate) " +
                        "AND (:customerId IS NULL OR s.customer.id = :customerId)")
        Page<SalesInvoice> findDueBills(Long tenantId, LocalDate asOnDate, Long customerId, Pageable pageable);

        @Query("SELECT s FROM SalesInvoice s WHERE s.tenant.id = :tenantId " +
                        "AND s.balanceDue > 0 " +
                        "AND (:asOnDate IS NULL OR s.invoiceDate <= :asOnDate) " +
                        "AND (:dueDateStart IS NULL OR s.dueDate >= :dueDateStart) " +
                        "AND (:dueDateEnd IS NULL OR s.dueDate <= :dueDateEnd) " +
                        "AND (:customerId IS NULL OR s.customer.id = :customerId)")
        Page<SalesInvoice> findDueInvoicesWithAging(Long tenantId, LocalDate asOnDate, LocalDate dueDateStart,
                        LocalDate dueDateEnd, Long customerId, Pageable pageable);

        @Query("SELECT new com.example.multi_tanent.sales.dto.SalesBySalesPersonReportItemDto(" +
                        "CONCAT(d.salesperson.firstName, ' ', COALESCE(d.salesperson.lastName, '')), COUNT(d), SUM(d.netTotal)) "
                        +
                        "FROM SalesInvoice d WHERE d.tenant.id = :tenantId " +
                        "AND (:fromDate IS NULL OR d.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR d.invoiceDate <= :toDate) " +
                        "AND d.salesperson IS NOT NULL " +
                        "GROUP BY d.salesperson")
        Page<SalesBySalesPersonReportItemDto> getSalesBySalesPersonReport(Long tenantId, LocalDate fromDate,
                        LocalDate toDate,
                        Pageable pageable);

        @Query("SELECT new com.example.multi_tanent.sales.dto.SalesBySalesPersonReportItemDto(" +
                        "'Total', COUNT(d), SUM(d.netTotal)) " +
                        "FROM SalesInvoice d WHERE d.tenant.id = :tenantId " +
                        "AND (:fromDate IS NULL OR d.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR d.invoiceDate <= :toDate) " +
                        "AND d.salesperson IS NOT NULL")
        SalesBySalesPersonReportItemDto getSalesBySalesPersonReportTotal(Long tenantId, LocalDate fromDate,
                        LocalDate toDate);

        @Query("SELECT new com.example.multi_tanent.sales.dto.SalesByItemReportItemDto(" +
                        "i.itemName, SUM(i.invoiceQuantity), i.crmProduct.unitOfMeasure, SUM(i.amount)) " +
                        "FROM SalesInvoiceItem i JOIN i.salesInvoice s " +
                        "WHERE s.tenant.id = :tenantId " +
                        "AND (:fromDate IS NULL OR s.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR s.invoiceDate <= :toDate) " +
                        "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
                        "AND (:subCategoryId IS NULL OR i.subcategory.id = :subCategoryId) " +
                        "AND (:itemId IS NULL OR i.crmProduct.id = :itemId) " +
                        "GROUP BY i.itemName, i.crmProduct.unitOfMeasure")
        Page<SalesByItemReportItemDto> getSalesByItemReport(Long tenantId, LocalDate fromDate, LocalDate toDate,
                        Long categoryId, Long subCategoryId, Long itemId, Pageable pageable);

        @Query("SELECT new com.example.multi_tanent.sales.dto.SalesByItemReportItemDto(" +
                        "'Total', SUM(i.invoiceQuantity), '', SUM(i.amount)) " +
                        "FROM SalesInvoiceItem i JOIN i.salesInvoice s " +
                        "WHERE s.tenant.id = :tenantId " +
                        "AND (:fromDate IS NULL OR s.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR s.invoiceDate <= :toDate) " +
                        "AND (:categoryId IS NULL OR i.category.id = :categoryId) " +
                        "AND (:subCategoryId IS NULL OR i.subcategory.id = :subCategoryId) " +
                        "AND (:itemId IS NULL OR i.crmProduct.id = :itemId)")
        SalesByItemReportItemDto getSalesByItemReportTotal(Long tenantId, LocalDate fromDate, LocalDate toDate,
                        Long categoryId, Long subCategoryId, Long itemId);

        @Query("SELECT new com.example.multi_tanent.sales.dto.SalesByCustomerReportItemDto(" +
                        "d.customer.companyName, COUNT(d), SUM(d.netTotal)) " +
                        "FROM SalesInvoice d WHERE d.tenant.id = :tenantId " +
                        "AND (:fromDate IS NULL OR d.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR d.invoiceDate <= :toDate) " +
                        "AND d.customer IS NOT NULL " +
                        "GROUP BY d.customer")
        Page<SalesByCustomerReportItemDto> getSalesByCustomerReport(Long tenantId, LocalDate fromDate, LocalDate toDate,
                        Pageable pageable);

        @Query("SELECT new com.example.multi_tanent.sales.dto.SalesByCustomerReportItemDto(" +
                        "'Total', COUNT(d), SUM(d.netTotal)) " +
                        "FROM SalesInvoice d WHERE d.tenant.id = :tenantId " +
                        "AND (:fromDate IS NULL OR d.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR d.invoiceDate <= :toDate) " +
                        "AND d.customer IS NOT NULL")
        SalesByCustomerReportItemDto getSalesByCustomerReportTotal(Long tenantId, LocalDate fromDate, LocalDate toDate);

        @Query("SELECT new com.example.multi_tanent.sales.dto.DelaySalesReportItemDto(" +
                        "CONCAT(d.salesperson.firstName, ' ', COALESCE(d.salesperson.lastName, '')), " +
                        "d.orderNumber, " +
                        "(SELECT so.salesOrderDate FROM SalesOrder so WHERE so.salesOrderNumber = d.orderNumber AND so.tenant.id = :tenantId), "
                        +
                        "d.dateOfSupply, d.customer.companyName, d.invoiceNumber, d.invoiceDate, d.delayReason) " +
                        "FROM SalesInvoice d " +
                        "WHERE d.tenant.id = :tenantId " +
                        "AND (:fromDate IS NULL OR d.invoiceDate >= :fromDate) " +
                        "AND (:toDate IS NULL OR d.invoiceDate <= :toDate) " +
                        "AND (:customerId IS NULL OR d.customer.id = :customerId) " +
                        "AND d.delayReason IS NOT NULL AND d.delayReason <> ''")
        Page<DelaySalesReportItemDto> getDelaySalesReport(Long tenantId, LocalDate fromDate, LocalDate toDate,
                        Long customerId, Pageable pageable);

    Long countByTenantId(Long tenantId);

    @Query("SELECT SUM(s.netTotal) FROM SalesInvoice s WHERE s.tenant.id = :tenantId")
    java.math.BigDecimal sumNetTotalByTenantId(Long tenantId);

    Page<SalesInvoice> findByTenantId(Long tenantId, Pageable pageable);
}
