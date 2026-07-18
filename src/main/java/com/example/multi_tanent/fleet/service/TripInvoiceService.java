package com.example.multi_tanent.fleet.service;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.fleet.dtos.InvoiceCreateRequest;
import com.example.multi_tanent.fleet.dtos.InvoicePaymentUpdateRequest;
import com.example.multi_tanent.fleet.entity.*;
import com.example.multi_tanent.fleet.enums.InvoiceStatus;
import com.example.multi_tanent.fleet.enums.TripStatus;
import com.example.multi_tanent.fleet.repository.*;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import com.example.multi_tanent.fleet.dtos.TripInvoiceResponse;

@Service
@RequiredArgsConstructor
@Slf4j
public class TripInvoiceService {

    private final TripInvoiceRepository invoiceRepository;
    private final TripRepository tripRepository;
    private final TripCustomerRepository customerRepository;
    private final TenantRepository tenantRepository;
    private final TripService tripService;

    @Transactional
    public TripInvoiceResponse generateInvoice(InvoiceCreateRequest request) {
        log.info("Starting invoice generation for customer: {} and trips: {}", request.getCustomerId(), request.getTripIds());
        try {
            Tenant tenant = getCurrentTenant();
            TripCustomer customer = customerRepository.findById(request.getCustomerId())
                    .orElseThrow(() -> new RuntimeException("Customer not found with ID: " + request.getCustomerId()));
            
            List<Trip> trips = tripRepository.findAllByIdInWithDriver(request.getTripIds());
            if (trips.isEmpty()) {
                throw new IllegalStateException("No trips found for IDs: " + request.getTripIds());
            }
            
            // Validations
            for (Trip trip : trips) {
                if (!trip.getTenant().getId().equals(tenant.getId())) {
                    throw new IllegalStateException("Cross-tenant trip detected for trip ID: " + trip.getId());
                }
                if (!trip.getCustomer().getId().equals(customer.getId())) {
                    throw new IllegalStateException("Trip " + trip.getId() + " belongs to different customer");
                }
                if (trip.getTripStatus() != TripStatus.DELIVERED && trip.getTripStatus() != TripStatus.COMPLETED && trip.getTripStatus() != TripStatus.INVOICED) {
                    throw new IllegalStateException("Only DELIVERED or COMPLETED trips can be invoiced. Trip " + trip.getId() + " is " + trip.getTripStatus());
                }
            }

            BigDecimal subTotal = BigDecimal.ZERO;
            BigDecimal tokenTotal = BigDecimal.ZERO;
            BigDecimal otherTotal = BigDecimal.ZERO;
            BigDecimal vatTotal = BigDecimal.ZERO;
            BigDecimal grandTotal = BigDecimal.ZERO;

            for (Trip trip : trips) {
                TripCharges c = trip.getCharges();
                if (c == null) {
                    log.warn("Trip {} has no charges data", trip.getId());
                    continue;
                }
                subTotal = subTotal.add(c.getAmount() != null ? c.getAmount() : BigDecimal.ZERO);
                tokenTotal = tokenTotal.add(c.getTokenAmount() != null ? c.getTokenAmount() : BigDecimal.ZERO);
                otherTotal = otherTotal.add(c.getOtherCharges() != null ? c.getOtherCharges() : BigDecimal.ZERO);
                vatTotal = vatTotal.add(c.getVatAmount() != null ? c.getVatAmount() : BigDecimal.ZERO);
                grandTotal = grandTotal.add(c.getTotalAmount() != null ? c.getTotalAmount() : BigDecimal.ZERO);
            }

            TripInvoice invoice = TripInvoice.builder()
                    .tenant(tenant)
                    .customer(customer)
                    .invoiceNumber(generateInvoiceNumber(tenant))
                    .invoiceDate(request.getInvoiceDate())
                    .dueDate(request.getDueDate())
                    .subTotalAmount(subTotal)
                    .totalTokenAmount(tokenTotal)
                    .totalOtherCharges(otherTotal)
                    .totalVatAmount(vatTotal)
                    .grandTotal(grandTotal)
                    .status(InvoiceStatus.ISSUED)
                    .notes(request.getNotes())
                    .trips(new ArrayList<>(trips))
                    .build();

            TripInvoice savedInvoice = invoiceRepository.save(invoice);

            // Update trips
            for (Trip trip : trips) {
                trip.setInvoice(savedInvoice);
                trip.setTripStatus(TripStatus.INVOICED);
            }
            tripRepository.saveAll(trips);

            log.info("Invoice generated successfully: {} for tenant: {}", savedInvoice.getInvoiceNumber(), tenant.getId());
            return mapToResponse(savedInvoice, true);
        } catch (Exception e) {
            log.error("Failed to generate invoice for customer {}: {}", request.getCustomerId(), e.getMessage(), e);
            throw e;
        }
    }

    @Transactional
    public TripInvoiceResponse updateInvoicePayment(Long invoiceId, InvoicePaymentUpdateRequest req) {
        TripInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        invoice.setStatus(req.getStatus());
        invoice.setPaymentReceivedDate(req.getPaymentReceivedDate());
        invoice.setPaymentMethod(req.getPaymentMethod());
        invoice.setChequeNumber(req.getChequeNumber());
        invoice.setOtherReference(req.getOtherReference());
        invoice.setNotes(req.getNotes());

        if (req.getStatus() == InvoiceStatus.PAID) {
            invoice.getTrips().forEach(trip -> {
                trip.setTripStatus(TripStatus.PAID);
            });
        }

        return mapToResponse(invoiceRepository.save(invoice), true);
    }

    @Transactional
    public TripInvoiceResponse cancelInvoice(Long invoiceId) {
        TripInvoice invoice = invoiceRepository.findById(invoiceId)
                .orElseThrow(() -> new RuntimeException("Invoice not found"));

        invoice.setStatus(InvoiceStatus.CANCELLED);
        invoice.getTrips().forEach(trip -> {
            trip.setTripStatus(TripStatus.COMPLETED);
            trip.setInvoice(null);
        });
        invoice.getTrips().clear();

        return mapToResponse(invoiceRepository.save(invoice), false);
    }

    public TripInvoiceResponse getInvoiceById(Long id) {
        return invoiceRepository.findById(id)
                .map(i -> mapToResponse(i, true))
                .orElseThrow(() -> new RuntimeException("Invoice not found"));
    }

    @Transactional(readOnly = true)
    public org.springframework.data.domain.Page<TripInvoiceResponse> getAllInvoices(
            InvoiceStatus status, Long customerId, java.time.LocalDate start, java.time.LocalDate end, 
            org.springframework.data.domain.Pageable pageable) {
        Tenant tenant = getCurrentTenant();
        return invoiceRepository.findFiltered(tenant.getId(), status, customerId, start, end, pageable)
                .map(i -> mapToResponse(i, false));
    }

    private TripInvoiceResponse mapToResponse(TripInvoice invoice, boolean includeTrips) {
        boolean isOverdue = invoice.getDueDate() != null 
                && invoice.getDueDate().isBefore(java.time.LocalDate.now()) 
                && invoice.getStatus() != InvoiceStatus.PAID;

        TripInvoiceResponse response = TripInvoiceResponse.builder()
                .id(invoice.getId())
                .invoiceNumber(invoice.getInvoiceNumber())
                .customerId(invoice.getCustomer() != null ? invoice.getCustomer().getId() : null)
                .customerName(invoice.getCustomer() != null ? invoice.getCustomer().getCompanyName() : null)
                .invoiceDate(invoice.getInvoiceDate())
                .dueDate(invoice.getDueDate())
                .subTotalAmount(invoice.getSubTotalAmount())
                .totalTokenAmount(invoice.getTotalTokenAmount())
                .totalOtherCharges(invoice.getTotalOtherCharges())
                .totalVatAmount(invoice.getTotalVatAmount())
                .grandTotal(invoice.getGrandTotal())
                .status(invoice.getStatus() != null ? invoice.getStatus().name() : null)
                .paymentReceivedDate(invoice.getPaymentReceivedDate())
                .paymentMethod(invoice.getPaymentMethod())
                .chequeNumber(invoice.getChequeNumber())
                .otherReference(invoice.getOtherReference())
                .notes(invoice.getNotes())
                .tripCount(invoice.getTrips() != null ? invoice.getTrips().size() : 0)
                .isOverdue(isOverdue)
                .build();
        
        if (includeTrips && invoice.getTrips() != null) {
            response.setTrips(invoice.getTrips().stream()
                    .map(tripService::mapToResponse)
                    .collect(Collectors.toList()));
        }
        
        return response;
    }

    private String generateInvoiceNumber(Tenant tenant) {
        Long count = invoiceRepository.countByTenant(tenant);
        return String.format("NKT-%06d", count + 1);
    }

    private Tenant getCurrentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId).orElseThrow();
    }
}
