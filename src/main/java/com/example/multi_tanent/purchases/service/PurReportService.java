package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.purchases.dto.BillDetailsReportItemDto;
import com.example.multi_tanent.purchases.dto.PaymentMadeReportItemDto;
import com.example.multi_tanent.purchases.dto.PurchaseOrderDetailsReportItemDto;
import com.example.multi_tanent.purchases.dto.PurchaseOrderReportItemDto;
import com.example.multi_tanent.purchases.dto.SupplierBalanceReportItemDto;
import com.example.multi_tanent.purchases.dto.SupplierSOAReportItemDto;
import com.example.multi_tanent.purchases.dto.PendingPurchaseReportItemDto;
import com.example.multi_tanent.purchases.entity.PurPurchaseInvoice;
import com.example.multi_tanent.purchases.entity.PurPurchaseOrder;
import com.example.multi_tanent.purchases.entity.PurPurchasePayment;
import com.example.multi_tanent.purchases.repository.PurPurchaseInvoiceRepository;
import com.example.multi_tanent.purchases.repository.PurPurchaseOrderRepository;
import com.example.multi_tanent.purchases.repository.PurPurchasePaymentRepository;
import com.example.multi_tanent.spersusers.enitity.BaseCustomer;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(value = "tenantTx", readOnly = true)
public class PurReportService {

    private final PurPurchaseInvoiceRepository invoiceRepo;
    private final PurPurchasePaymentRepository paymentRepo;
    private final PurPurchaseOrderRepository poRepo;
    private final TenantRepository tenantRepo;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findByTenantId(key)
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    public List<SupplierBalanceReportItemDto> getSupplierBalanceReport(LocalDate fromDate, LocalDate toDate,
            Long branchId) {
        Tenant tenant = currentTenant();

        // 1. Fetch Invoices and Payments in range
        // Note: Ideally repositories should support date range filtering.
        // Assuming we want balances "As On" a date, we usually need simpler logic:
        // Opening + Bill - Paid = Closing?
        // The image says "As On 31/12/2025" and shows "Bill Amount", "Received Amount",
        // "Balance".
        // Usually such reports show activity within a period OR total outstanding as of
        // date.
        // Given column "Bill Amount" and "Received Amount", it implies activity or
        // total.
        // Let's assume we want ALL historical data up to 'toDate' to get accurate
        // Balance?
        // OR if it's a "Period" report, we only show bills in that period.
        // BUT Balance must be total outstanding.
        // Let's implement looking at historical up to toDate for 'Balance', but 'Bill
        // Amount' might refer to range?
        // The UI has "This Month" dropdown. This usually implies:
        // Bill Amount = Bills in this month
        // Received Amount = Payments in this month
        // Balance Amount = Closing Balance as of end of this month (Cumulative)

        // However, to keep it simple and consistent with typical report requests:
        // "Bill Amount" = Sum of bills in the selected period?
        // "Balance Amount" = Total Outstanding (History). as of Today/End Date.
        // Let's assume:
        // Inputs: fromDate, toDate.
        // Bill Amount = sum(invoices.netTotal) where date between from/to.
        // Received Amount = sum(payments.amount) where date between from/to.
        // Balance Amount = Total Unpaid as of toDate. (Sum(All Bills) - Sum(All
        // Payments) up to toDate).

        // Let's fetch all relevant data and compute in memory for verified correctness,
        // filtering as needed.
        // Optimization: Fetch only needed data via custom queries later if performance
        // issues arise.

        List<PurPurchaseInvoice> allInvoices = invoiceRepo.findByTenantId(tenant.getId());
        List<PurPurchasePayment> allPayments = paymentRepo.findByTenantId(tenant.getId());

        // We filter for "Balance" calculation (up to toDate)
        List<PurPurchaseInvoice> invoicesUpToDate = allInvoices.stream()
                .filter(i -> i.getBillDate() != null && !i.getBillDate().isAfter(toDate))
                .collect(Collectors.toList());

        List<PurPurchasePayment> paymentsUpToDate = allPayments.stream()
                .filter(p -> p.getPaymentDate() != null && !p.getPaymentDate().isAfter(toDate))
                .collect(Collectors.toList());

        // Identify all unique suppliers
        Map<Long, BaseCustomer> suppliers = new HashMap<>();
        invoicesUpToDate.forEach(i -> {
            if (i.getSupplier() != null)
                suppliers.put(i.getSupplier().getId(), i.getSupplier());
        });
        paymentsUpToDate.forEach(p -> {
            if (p.getSupplier() != null)
                suppliers.put(p.getSupplier().getId(), p.getSupplier());
        });

        List<SupplierBalanceReportItemDto> report = new ArrayList<>();

        for (BaseCustomer supplier : suppliers.values()) {
            SupplierBalanceReportItemDto item = new SupplierBalanceReportItemDto();
            item.setSupplierName(supplier.getCompanyName()); // or getName()

            String currency = supplier.getCurrency();
            if (currency == null)
                currency = "INR"; // Default

            // filter for this supplier
            List<PurPurchaseInvoice> supInvoices = invoicesUpToDate.stream()
                    .filter(i -> i.getSupplier() != null && i.getSupplier().getId().equals(supplier.getId()))
                    .collect(Collectors.toList());
            List<PurPurchasePayment> supPayments = paymentsUpToDate.stream()
                    .filter(p -> p.getSupplier() != null && p.getSupplier().getId().equals(supplier.getId()))
                    .collect(Collectors.toList());

            // 1. Bill Amount (In Period)
            BigDecimal billAmt = supInvoices.stream()
                    .filter(i -> !i.getBillDate().isBefore(fromDate)) // Inside range [from, to]
                    .map(i -> i.getNetTotal() != null ? i.getNetTotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 2. Received (Paid) Amount (In Period)
            BigDecimal paidAmt = supPayments.stream()
                    .filter(p -> !p.getPaymentDate().isBefore(fromDate))
                    .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            // 3. Balance Amount (Cumulative as of `toDate`)
            // Balance = (Opening + Total Bills up to toDate) - (Total Payments up to
            // toDate)
            // Assuming Opening Balance is on Supplier entity or 0.
            BigDecimal opening = supplier.getOpeningBalance() != null ? supplier.getOpeningBalance() : BigDecimal.ZERO;
            // Adjust opening based on DR/CR type? Usually Positive for Payable (Credit).
            // Let's assume standard positive = payable for suppliers.

            BigDecimal totalBillsTillDate = supInvoices.stream()
                    .map(i -> i.getNetTotal() != null ? i.getNetTotal() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal totalPaidTillDate = supPayments.stream()
                    .map(p -> p.getAmount() != null ? p.getAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            BigDecimal balance = opening.add(totalBillsTillDate).subtract(totalPaidTillDate);

            // Assign to valid currency column
            switch (currency.toUpperCase()) {
                case "USD":
                    item.setBillAmountUsd(billAmt);
                    item.setReceivedAmountUsd(paidAmt);
                    item.setBalanceAmountUsd(balance);
                    break;
                case "KWD":
                    item.setBillAmountKwd(billAmt);
                    item.setReceivedAmountKwd(paidAmt);
                    item.setBalanceAmountKwd(balance);
                    break;
                case "CAD":
                    item.setBillAmountCad(billAmt);
                    item.setReceivedAmountCad(paidAmt);
                    item.setBalanceAmountCad(balance);
                    break;
                case "INR":
                default:
                    item.setBillAmountInr(billAmt);
                    item.setReceivedAmountInr(paidAmt);
                    item.setBalanceAmountInr(balance);
                    break;
            }

            report.add(item);
        }

        return report;
    }

    public List<BillDetailsReportItemDto> getBillDetailsReport(
            LocalDate fromDate, LocalDate toDate, Long branchId) {
        Tenant tenant = currentTenant();

        // Fetch invoices in range
        List<PurPurchaseInvoice> invoices = invoiceRepo.findByTenantId(tenant.getId()).stream()
                .filter(i -> i.getBillDate() != null
                        && !i.getBillDate().isBefore(fromDate)
                        && !i.getBillDate().isAfter(toDate))
                .collect(Collectors.toList());

        List<BillDetailsReportItemDto> report = new ArrayList<>();

        for (PurPurchaseInvoice inv : invoices) {
            BillDetailsReportItemDto item = new BillDetailsReportItemDto();
            item.setBillNumber(inv.getBillNumber());
            item.setBillDate(inv.getBillDate());
            item.setDueDate(inv.getDueDate());
            item.setReferenceNumber(inv.getOrderNumber()); // Or other reference logic
            item.setSupplierName(inv.getSupplier() != null ? inv.getSupplier().getCompanyName() : "");
            item.setBillAmount(inv.getNetTotal() != null ? inv.getNetTotal() : BigDecimal.ZERO);

            // Calculate Balance = Bill Amount - Allocated Payments
            BigDecimal allocatedTotal = BigDecimal.ZERO;
            if (inv.getPaymentAllocations() != null) {
                allocatedTotal = inv.getPaymentAllocations().stream()
                        .map(a -> a.getAllocatedAmount() != null ? a.getAllocatedAmount() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            BigDecimal balance = item.getBillAmount().subtract(allocatedTotal);
            item.setBalanceAmount(balance);

            // Logic for Status: Open vs Closed
            // If balance > 0 => Open, else Closed
            if (balance.compareTo(BigDecimal.ZERO) > 0) {
                item.setStatus("Open");
            } else {
                item.setStatus("Closed"); // or Paid
            }

            report.add(item);
        }

        // Sorting by Bill Date Descending or as required
        report.sort((a, b) -> b.getBillDate().compareTo(a.getBillDate()));

        return report;
    }

    public List<PaymentMadeReportItemDto> getPaymentMadeReport(
            LocalDate fromDate, LocalDate toDate, Long branchId) {
        Tenant tenant = currentTenant();

        List<PurPurchasePayment> payments = paymentRepo.findByTenantId(tenant.getId()).stream()
                .filter(p -> p.getPaymentDate() != null
                        && !p.getPaymentDate().isBefore(fromDate)
                        && !p.getPaymentDate().isAfter(toDate))
                .collect(Collectors.toList());

        List<PaymentMadeReportItemDto> report = new ArrayList<>();

        for (PurPurchasePayment p : payments) {
            PaymentMadeReportItemDto item = new PaymentMadeReportItemDto();
            item.setPaymentNumber(p.getId().toString()); // Assuming ID is Payment#
            item.setPaymentDate(p.getPaymentDate());
            item.setReferenceNumber(p.getReference());
            item.setSupplierName(p.getSupplier() != null ? p.getSupplier().getCompanyName() : "");
            item.setPaymentMethod(p.getPaymentMode());
            item.setAmount(p.getAmount());

            // Calculate Unused Amount
            // Assuming amountInExcess tracks this, otherwise calculate from allocations
            // Logic: Unused = Amount - Sum(Allocations)
            BigDecimal allocatedSum = BigDecimal.ZERO;
            if (p.getAllocations() != null) {
                allocatedSum = p.getAllocations().stream()
                        .map(a -> a.getAllocatedAmount() != null ? a.getAllocatedAmount() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            // Use amountInExcess if reliable, else calculated
            BigDecimal unused = p.getAmount().subtract(allocatedSum);
            if (unused.compareTo(BigDecimal.ZERO) < 0)
                unused = BigDecimal.ZERO; // Safety
            item.setUnusedAmount(unused);

            // Bill Numbers
            String bills = "";
            if (p.getAllocations() != null) {
                bills = p.getAllocations().stream()
                        .map(a -> a.getPurchaseInvoice() != null ? a.getPurchaseInvoice().getBillNumber() : "")
                        .filter(s -> !s.isEmpty())
                        .distinct()
                        .collect(Collectors.joining(", "));
            }
            item.setBillNumbers(bills);

            report.add(item);
        }

        // Sort by Date Desc
        report.sort((a, b) -> b.getPaymentDate().compareTo(a.getPaymentDate()));

        return report;
    }

    public List<PurchaseOrderReportItemDto> getPurchaseOrdersBySupplierReport(
            LocalDate fromDate, LocalDate toDate, Long branchId) {
        Tenant tenant = currentTenant();

        List<PurPurchaseOrder> orders = poRepo.findByTenantId(tenant.getId()).stream()
                .filter(o -> o.getDate() != null
                        && !o.getDate().isBefore(fromDate)
                        && !o.getDate().isAfter(toDate))
                .collect(Collectors.toList());

        Map<Long, List<PurPurchaseOrder>> ordersBySupplier = orders.stream()
                .filter(o -> o.getSupplier() != null)
                .collect(Collectors.groupingBy(o -> o.getSupplier().getId()));

        List<PurchaseOrderReportItemDto> report = new ArrayList<>();

        for (Map.Entry<Long, List<PurPurchaseOrder>> entry : ordersBySupplier.entrySet()) {
            List<PurPurchaseOrder> supplierOrders = entry.getValue();
            if (supplierOrders.isEmpty())
                continue;

            String supplierName = supplierOrders.get(0).getSupplier().getCompanyName();

            BigDecimal totalAmount = supplierOrders.stream()
                    .map(o -> o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO)
                    .reduce(BigDecimal.ZERO, BigDecimal::add);

            PurchaseOrderReportItemDto item = new PurchaseOrderReportItemDto();
            item.setSupplierName(supplierName);
            item.setPurchaseOrdersCount((long) supplierOrders.size());
            item.setAmount(totalAmount);

            report.add(item);
        }

        // Sort by Amount Descending
        report.sort((a, b) -> b.getAmount().compareTo(a.getAmount()));

        return report;
    }

    public List<PurchaseOrderDetailsReportItemDto> getPurchaseOrderDetailsReport(
            LocalDate fromDate, LocalDate toDate, Long branchId) {
        Tenant tenant = currentTenant();

        List<PurPurchaseOrder> orders = poRepo.findByTenantId(tenant.getId()).stream()
                .filter(o -> o.getDate() != null
                        && !o.getDate().isBefore(fromDate)
                        && !o.getDate().isAfter(toDate))
                .collect(Collectors.toList());

        List<PurchaseOrderDetailsReportItemDto> report = new ArrayList<>();

        for (PurPurchaseOrder o : orders) {
            PurchaseOrderDetailsReportItemDto item = new PurchaseOrderDetailsReportItemDto();
            item.setStatus(o.getStatus() != null ? o.getStatus() : "Open"); // Default to Open if null
            item.setPoNumber(o.getPoNumber());
            item.setDate(o.getDate());
            item.setDeliveryDate(o.getDate()); // Using PO Date as Delivery Date fallback
            item.setReference(o.getReference());
            item.setSupplierName(o.getSupplier() != null ? o.getSupplier().getCompanyName() : "");
            item.setAmount(o.getTotalAmount() != null ? o.getTotalAmount() : BigDecimal.ZERO);
            item.setAmountInDefaultCurrency(item.getAmount()); // Assuming same currency for now

            report.add(item);
        }

        // Sort by Date Desc
        report.sort((a, b) -> b.getDate().compareTo(a.getDate()));

        return report;
    }

    public List<SupplierSOAReportItemDto> getSupplierSOAReport(
            LocalDate fromDate, LocalDate toDate, Long supplierId, Long branchId) {
        Tenant tenant = currentTenant();

        if (supplierId == null) {
            return new ArrayList<>(); // Supplier is mandatory for SOA
        }

        List<PurPurchaseInvoice> allInvoices = invoiceRepo.findByTenantId(tenant.getId()).stream()
                .filter(i -> i.getSupplier() != null && i.getSupplier().getId().equals(supplierId)
                        && i.getBillDate() != null)
                .collect(Collectors.toList());

        List<SupplierSOAReportItemDto> report = new ArrayList<>();

        // 1. Calculate Opening Balance (Bills before fromDate)
        BigDecimal openingBalance = BigDecimal.ZERO;
        for (PurPurchaseInvoice inv : allInvoices) {
            if (inv.getBillDate().isBefore(fromDate)) {
                BigDecimal net = inv.getNetTotal() != null ? inv.getNetTotal() : BigDecimal.ZERO;
                BigDecimal alloc = BigDecimal.ZERO;
                if (inv.getPaymentAllocations() != null) {
                    alloc = inv.getPaymentAllocations().stream()
                            .map(a -> a.getAllocatedAmount() != null ? a.getAllocatedAmount() : BigDecimal.ZERO)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                }
                openingBalance = openingBalance.add(net.subtract(alloc));
            }
        }

        // Add Opening Row
        SupplierSOAReportItemDto openingRow = new SupplierSOAReportItemDto();
        openingRow.setDate(null); // or fromDate
        openingRow.setRefNo("Opening");
        openingRow.setOpeningAmount(openingBalance);
        openingRow.setReceivedAmount(BigDecimal.ZERO);
        openingRow.setPendingAmount(openingBalance);
        openingRow.setFinalBalance(openingBalance);
        openingRow.setPostDatedAmount(BigDecimal.ZERO);
        report.add(openingRow);

        // 2. Process In-Period Bills
        List<PurPurchaseInvoice> periodInvoices = allInvoices.stream()
                .filter(i -> !i.getBillDate().isBefore(fromDate) && !i.getBillDate().isAfter(toDate))
                .sorted((a, b) -> a.getBillDate().compareTo(b.getBillDate()))
                .collect(Collectors.toList());

        for (PurPurchaseInvoice inv : periodInvoices) {
            SupplierSOAReportItemDto item = new SupplierSOAReportItemDto();
            item.setDate(inv.getBillDate());
            item.setRefNo(inv.getBillNumber());

            BigDecimal net = inv.getNetTotal() != null ? inv.getNetTotal() : BigDecimal.ZERO;
            item.setOpeningAmount(net); // For Bill row, Opening = Bill Amount

            BigDecimal alloc = BigDecimal.ZERO;
            if (inv.getPaymentAllocations() != null) {
                alloc = inv.getPaymentAllocations().stream()
                        .map(a -> a.getAllocatedAmount() != null ? a.getAllocatedAmount() : BigDecimal.ZERO)
                        .reduce(BigDecimal.ZERO, BigDecimal::add);
            }
            item.setReceivedAmount(alloc);

            BigDecimal pending = net.subtract(alloc);
            item.setPendingAmount(pending);
            item.setFinalBalance(pending);
            item.setPostDatedAmount(BigDecimal.ZERO);

            item.setDueOn(inv.getDueDate());

            // Calculate overdue days
            if (inv.getDueDate() != null && LocalDate.now().isAfter(inv.getDueDate())
                    && pending.compareTo(BigDecimal.ZERO) > 0) {
                long days = java.time.temporal.ChronoUnit.DAYS.between(inv.getDueDate(), LocalDate.now());
                item.setOverdueDays(days);
            } else {
                item.setOverdueDays(0L);
            }

            report.add(item);
        }

        return report;
    }

    public List<PendingPurchaseReportItemDto> getPendingPurchaseReport(
            LocalDate fromDate, LocalDate toDate, Long supplierId, String poNumber, Long branchId) {
        Tenant tenant = currentTenant();

        List<PurPurchaseOrder> orders = poRepo.findByTenantId(tenant.getId()).stream()
                .filter(o -> o.getDate() != null
                        && !o.getDate().isBefore(fromDate)
                        && !o.getDate().isAfter(toDate))
                .collect(Collectors.toList());

        // Additional Filters
        if (supplierId != null) {
            orders = orders.stream()
                    .filter(o -> o.getSupplier() != null && o.getSupplier().getId().equals(supplierId))
                    .collect(Collectors.toList());
        }
        if (poNumber != null && !poNumber.isEmpty()) {
            orders = orders.stream()
                    .filter(o -> o.getPoNumber() != null
                            && o.getPoNumber().toLowerCase().contains(poNumber.toLowerCase()))
                    .collect(Collectors.toList());
        }
        if (branchId != null) {
            orders = orders.stream()
                    .filter(o -> o.getLocation() != null && o.getLocation().getId().equals(branchId))
                    .collect(Collectors.toList());
        }

        List<PendingPurchaseReportItemDto> report = new ArrayList<>();

        for (PurPurchaseOrder o : orders) {
            if ("Closed".equalsIgnoreCase(o.getStatus()) || "Cancelled".equalsIgnoreCase(o.getStatus())) {
                continue;
            }

            for (com.example.multi_tanent.purchases.entity.PurPurchaseOrderItem item : o.getItems()) {
                BigDecimal qty = item.getQuantity();
                BigDecimal received = item.getReceivedQuantity() != null ? item.getReceivedQuantity() : BigDecimal.ZERO;
                BigDecimal cancel = BigDecimal.ZERO;

                BigDecimal pending = qty.subtract(received).subtract(cancel);

                if (pending.compareTo(BigDecimal.ZERO) > 0) {
                    PendingPurchaseReportItemDto dto = new PendingPurchaseReportItemDto();
                    dto.setPoId(o.getId());
                    dto.setPoNumber(o.getPoNumber());
                    dto.setPoDate(o.getDate());
                    dto.setSupplierName(o.getSupplier() != null ? o.getSupplier().getCompanyName() : "");
                    dto.setDeliveryDate(o.getDate());

                    long days = 0;
                    if (dto.getDeliveryDate() != null) {
                        days = java.time.temporal.ChronoUnit.DAYS.between(LocalDate.now(), dto.getDeliveryDate());
                        if (days < 0)
                            days = 0;
                    }
                    dto.setLeftDays(days);

                    dto.setProductDescription(item.getDescription() != null ? item.getDescription()
                            : (item.getItem() != null ? item.getItem().getName() : ""));

                    dto.setUnit(item.getUnit() != null ? item.getUnit().getName() : "");

                    dto.setOrderQty(qty);
                    dto.setCancelQty(cancel);
                    dto.setOrderRate(item.getRate());
                    dto.setOrderValue(item.getAmount());

                    dto.setBilledQty(received);
                    dto.setBilledRate(item.getRate());
                    dto.setBilledValue(received.multiply(item.getRate() != null ? item.getRate() : BigDecimal.ZERO));

                    dto.setPendingQty(pending);
                    dto.setPendingRate(item.getRate());
                    dto.setPendingValue(pending.multiply(item.getRate() != null ? item.getRate() : BigDecimal.ZERO));

                    report.add(dto);
                }
            }
        }

        report.sort((a, b) -> b.getPoDate().compareTo(a.getPoDate()));

        return report;
    }
}
