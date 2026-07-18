package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.InvoiceDto;
import com.example.multi_tanent.pos.dto.SaleDto;
import com.example.multi_tanent.pos.dto.SaleRequest;

import com.example.multi_tanent.pos.service.SaleService;
import com.example.multi_tanent.pos.service.InvoiceService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/pos/sales")
@CrossOrigin(origins = "*")
public class SaleController {

    private final SaleService saleService;
    private final InvoiceService invoiceService;

    public SaleController(SaleService saleService, InvoiceService invoiceService) {
        this.saleService = saleService;
        this.invoiceService = invoiceService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SaleDto> createSale(@Valid @RequestBody SaleRequest saleRequest) {
        SaleDto createdSale = saleService.createSale(saleRequest);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}").buildAndExpand(createdSale.getId()).toUri();
        return ResponseEntity.created(location).body(createdSale);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SaleDto>> getAllSales() {
        return ResponseEntity.ok(saleService.getAllSalesForCurrentTenant());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SaleDto> getSaleById(@PathVariable Long id) {
        return saleService.getSaleDtoById(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/invoice")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<InvoiceDto> getSaleInvoice(@PathVariable Long id) {
        return invoiceService.generateInvoiceForSale(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/{id}/invoice/pdf")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<byte[]> downloadSaleInvoicePdf(@PathVariable Long id) {
        return invoiceService.generateInvoicePdf(id)
 .map(pdfBytes -> {
                    String filename = "invoice-" + id + ".pdf";
                    HttpHeaders headers = new HttpHeaders();
                    headers.setContentType(MediaType.APPLICATION_PDF);
                    // "inline" suggests preview, "attachment" forces download
                    headers.setContentDispositionFormData("inline", filename);
                    return ResponseEntity.ok().headers(headers).body(pdfBytes);
                })
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','POS_ADMIN')")
    public ResponseEntity<Void> deleteSale(@PathVariable Long id) {
        saleService.deleteSale(id);
        return ResponseEntity.noContent().build();
    }
}
