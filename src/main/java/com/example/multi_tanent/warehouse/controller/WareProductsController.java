package com.example.multi_tanent.warehouse.controller;

import com.example.multi_tanent.warehouse.dto.PaginatedResponse;
import com.example.multi_tanent.warehouse.dto.WareProductRequest;
import com.example.multi_tanent.warehouse.dto.WareProductResponse;
import com.example.multi_tanent.warehouse.service.WareExcelService;
import com.example.multi_tanent.warehouse.service.WareProductsService;
import com.example.multi_tanent.warehouse.service.WareStorageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api/warehouse/products")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class WareProductsController {

    private final WareProductsService productService;
    private final WareExcelService excelService;
    private final WareStorageService storageService;

    @GetMapping
    public ResponseEntity<List<WareProductResponse>> list() {
        return ResponseEntity.ok(productService.list());
    }

    @GetMapping("/paginated")
    public ResponseEntity<PaginatedResponse<WareProductResponse>> listPaginated(
            @PageableDefault(size = 10) Pageable pageable) {
        return ResponseEntity.ok(productService.listPaginated(pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<WareProductResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(productService.getById(id));
    }

    @GetMapping("/barcode/{barcode}")
    public ResponseEntity<WareProductResponse> getByBarcode(@PathVariable String barcode) {
        return ResponseEntity.ok(productService.getByBarcode(barcode));
    }

    @PostMapping
    public ResponseEntity<WareProductResponse> create(@Valid @RequestBody WareProductRequest req) {
        return ResponseEntity.ok(productService.create(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WareProductResponse> update(@PathVariable Long id,
            @Valid @RequestBody WareProductRequest req) {
        return ResponseEntity.ok(productService.update(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        productService.delete(id);
        return ResponseEntity.noContent().build();
    }

    // --- Stock Alerts ---
    
    @GetMapping("/alerts/low-stock")
    public ResponseEntity<List<WareProductResponse>> getLowStockProducts() {
        return ResponseEntity.ok(productService.getLowStockProducts());
    }

    @GetMapping("/alerts/overstock")
    public ResponseEntity<List<WareProductResponse>> getOverstockProducts() {
        return ResponseEntity.ok(productService.getOverstockProducts());
    }

    @GetMapping(value = "/template", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> downloadTemplate() throws IOException {
        byte[] template = excelService.generateTemplate();
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"products_template.xlsx\"")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(template);
    }

    @GetMapping(value = "/export", produces = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet")
    public ResponseEntity<byte[]> exportProducts() throws IOException {
        List<WareProductResponse> products = productService.list();
        byte[] excel = excelService.exportToExcel(products);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"products_export.xlsx\"")
                .contentType(
                        MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"))
                .body(excel);
    }

    @PostMapping("/import")
    public ResponseEntity<String> importProducts(@RequestParam("file") MultipartFile file) throws IOException {
        List<WareProductRequest> requests = excelService.parseExcel(file);
        productService.importProducts(requests);
        return ResponseEntity.ok("Import processed successfully");
    }

    @GetMapping("/images/**")
    public ResponseEntity<Resource> serveFile(jakarta.servlet.http.HttpServletRequest request) {
        String path = request.getRequestURI().split("/images/")[1];
        Resource resource = storageService.loadFileAsResource(path);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_TYPE, MediaType.IMAGE_PNG_VALUE)
                .body(resource);
    }
}
