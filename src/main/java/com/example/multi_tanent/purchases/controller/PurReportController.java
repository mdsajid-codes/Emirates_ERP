package com.example.multi_tanent.purchases.controller;

import com.example.multi_tanent.purchases.dto.BillDetailsReportItemDto;
import com.example.multi_tanent.purchases.dto.PaymentMadeReportItemDto;
import com.example.multi_tanent.purchases.dto.PurchaseOrderDetailsReportItemDto;
import com.example.multi_tanent.purchases.dto.PurchaseOrderReportItemDto;
import com.example.multi_tanent.purchases.dto.SupplierBalanceReportItemDto;
import com.example.multi_tanent.purchases.dto.SupplierSOAReportItemDto;
import com.example.multi_tanent.purchases.dto.PendingPurchaseReportItemDto;
import com.example.multi_tanent.purchases.service.PurReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/purchases/reports")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class PurReportController {

    private final PurReportService reportService;

    @GetMapping("/supplier-balance")
    public ResponseEntity<List<SupplierBalanceReportItemDto>> getSupplierBalanceReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getSupplierBalanceReport(fromDate, toDate, branchId));
    }

    @GetMapping("/bill-details")
    public ResponseEntity<List<BillDetailsReportItemDto>> getBillDetailsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getBillDetailsReport(fromDate, toDate, branchId));
    }

    @GetMapping("/payments-made")
    public ResponseEntity<List<PaymentMadeReportItemDto>> getPaymentMadeReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getPaymentMadeReport(fromDate, toDate, branchId));
    }

    @GetMapping("/purchase-orders-by-supplier")
    public ResponseEntity<List<PurchaseOrderReportItemDto>> getPurchaseOrdersBySupplierReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getPurchaseOrdersBySupplierReport(fromDate, toDate, branchId));
    }

    @GetMapping("/purchase-order-details")
    public ResponseEntity<List<PurchaseOrderDetailsReportItemDto>> getPurchaseOrderDetailsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getPurchaseOrderDetailsReport(fromDate, toDate, branchId));
    }

    @GetMapping("/supplier-soa")
    public ResponseEntity<List<SupplierSOAReportItemDto>> getSupplierSOAReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam Long supplierId,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity.ok(reportService.getSupplierSOAReport(fromDate, toDate, supplierId, branchId));
    }

    @GetMapping("/pending-purchase")
    public ResponseEntity<List<PendingPurchaseReportItemDto>> getPendingPurchaseReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fromDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate toDate,
            @RequestParam(required = false) Long supplierId,
            @RequestParam(required = false) String poNumber,
            @RequestParam(required = false) Long branchId) {
        return ResponseEntity
                .ok(reportService.getPendingPurchaseReport(fromDate, toDate, supplierId, poNumber, branchId));
    }
}
