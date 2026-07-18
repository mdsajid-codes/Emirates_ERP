package com.example.multi_tanent.sales.controller;

import com.example.multi_tanent.sales.dto.ListOfDueBillsReportResponse;
import com.example.multi_tanent.sales.dto.ListOfDueInvoicesReportResponse;
import com.example.multi_tanent.sales.dto.SalesOrderByItemReportDto;
import com.example.multi_tanent.sales.service.SalReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalReportController {

    private final SalReportService reportService;

    @GetMapping("/sales-order-by-item")
    public ResponseEntity<List<SalesOrderByItemReportDto>> getSalesOrderByItemReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long itemId) {
        return ResponseEntity.ok(reportService.getSalesOrderByItemReport(fromDate, toDate, itemId));
    }

    @GetMapping("/sales-order-by-customer")
    public ResponseEntity<List<com.example.multi_tanent.sales.dto.SalesOrderByCustomerReportDto>> getSalesOrderByCustomerReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getSalesOrderByCustomerReport(fromDate, toDate, branchId));
    }

    @GetMapping("/due-bills")
    public ResponseEntity<ListOfDueBillsReportResponse> getListOfDueBillsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOnDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reportService.getListOfDueBillsReport(asOnDate, customerId, branchId, page, size));
    }

    @GetMapping("/due-invoices")
    public ResponseEntity<ListOfDueInvoicesReportResponse> getListOfDueInvoicesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate asOnDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(required = false) Long branchId,
            @RequestParam(required = false) String aging,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity
                .ok(reportService.getListOfDueInvoicesReport(asOnDate, customerId, branchId, aging, page, size));
    }

    @GetMapping("/sales-by-salesperson")
    public ResponseEntity<com.example.multi_tanent.sales.dto.SalesBySalesPersonReportResponse> getSalesBySalesPersonReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reportService.getSalesBySalesPersonReport(fromDate, toDate, page, size));
    }

    @GetMapping("/sales-by-item")
    public ResponseEntity<com.example.multi_tanent.sales.dto.SalesByItemReportResponse> getSalesByItemReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Long subCategoryId,
            @RequestParam(required = false) Long itemId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity
                .ok(reportService.getSalesByItemReport(fromDate, toDate, categoryId, subCategoryId, itemId, page,
                        size));
    }

    @GetMapping("/sales-by-customer")
    public ResponseEntity<com.example.multi_tanent.sales.dto.SalesByCustomerReportResponse> getSalesByCustomerReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reportService.getSalesByCustomerReport(fromDate, toDate, page, size));
    }

    @GetMapping("/delay-sales")
    public ResponseEntity<com.example.multi_tanent.sales.dto.DelaySalesReportResponse> getDelaySalesReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long customerId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(reportService.getDelaySalesReport(fromDate, toDate, customerId, page, size));
    }
}
