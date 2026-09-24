package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.crm.dto.CrmSalesProductRequest;
import com.example.multi_tanent.crm.dto.CrmSalesProductResponse;
import com.example.multi_tanent.spersusers.enitity.CrmSalesProduct;
import com.example.multi_tanent.spersusers.repository.CrmSalesProductRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.config.TenantContext;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import com.google.zxing.BarcodeFormat;
import com.google.zxing.client.j2se.MatrixToImageWriter;
import com.google.zxing.common.BitMatrix;
import com.google.zxing.oned.Code128Writer;
import java.io.ByteArrayOutputStream;

import com.example.multi_tanent.production.repository.ProCategoryRepository;
import com.example.multi_tanent.production.repository.ProSubCategoryRepository;

@Service
@RequiredArgsConstructor
@Transactional(value = "tenantTx")
public class CrmSalesProductService {

        private final CrmSalesProductRepository repository;
        private final TenantRepository tenantRepository;
        private final com.example.multi_tanent.tenant.service.FileStorageService fileStorageService;
        private final ProCategoryRepository proCategoryRepository;
        private final ProSubCategoryRepository proSubCategoryRepository;

        @Transactional(value = "tenantTx")
        public CrmSalesProductResponse createProduct(CrmSalesProductRequest request,
                        org.springframework.web.multipart.MultipartFile imageFile) {
                String tenantIdentifier = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));

                CrmSalesProduct product = new CrmSalesProduct();
                product.setTenant(tenant);
                mapRequestToEntity(request, product);

                if (imageFile != null && !imageFile.isEmpty()) {
                        try {
                                String cleanFileName = org.springframework.util.StringUtils
                                                .cleanPath(imageFile.getOriginalFilename());
                                String fileName = System.currentTimeMillis() + "_"
                                                + cleanFileName.replaceAll("[^a-zA-Z0-9._-]", "");
                                String imageUrl = fileStorageService.storeFile(imageFile, "product", fileName, true);
                                product.setImageUrl(imageUrl);
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to store image file", e);
                        }
                }

                // Barcode Generation
                try {
                        String barcodeText = product.getItemCode() != null ? product.getItemCode()
                                        : "PROD-" + System.currentTimeMillis();
                        product.setBarcode(barcodeText);

                        byte[] barcodeImage = generateBarcodeImage(barcodeText, 300, 150);
                        String barcodeFileName = "barcode_" + System.currentTimeMillis() + ".png";
                        String barcodeUrl = fileStorageService.storeFile(barcodeImage, "barcodes", barcodeFileName);
                        product.setBarcodeUrl(barcodeUrl);
                } catch (Exception e) {
                        throw new RuntimeException("Failed to generate barcode", e);
                }

                CrmSalesProduct savedProduct = repository.save(product);
                return mapEntityToResponse(savedProduct);
        }

        @Transactional(value = "tenantTx", readOnly = true)
        public List<CrmSalesProductResponse> getAllProducts() {
                String tenantIdentifier = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
                return repository.findByTenantId(tenant.getId()).stream()
                                .map(this::mapEntityToResponse)
                                .collect(Collectors.toList());
        }

        @Transactional(value = "tenantTx", readOnly = true)
        public org.springframework.data.domain.Page<CrmSalesProductResponse> getAllProducts(
                        org.springframework.data.domain.Pageable pageable) {
                String tenantIdentifier = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
                return repository.findByTenantId(tenant.getId(), pageable)
                                .map(this::mapEntityToResponse);
        }

        @Transactional(value = "tenantTx", readOnly = true)
        public CrmSalesProductResponse getProductById(Long id) {
                String tenantIdentifier = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
                CrmSalesProduct product = repository.findByIdAndTenantId(id, tenant.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
                return mapEntityToResponse(product);
        }

        @Transactional
        public CrmSalesProductResponse updateProduct(Long id, CrmSalesProductRequest request,
                        org.springframework.web.multipart.MultipartFile imageFile) {
                String tenantIdentifier = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
                CrmSalesProduct product = repository.findByIdAndTenantId(id, tenant.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

                if (request != null) {
                        mapRequestToEntity(request, product);
                }

                if (imageFile != null && !imageFile.isEmpty()) {
                        try {
                                String cleanFileName = org.springframework.util.StringUtils
                                                .cleanPath(imageFile.getOriginalFilename());
                                String fileName = System.currentTimeMillis() + "_"
                                                + cleanFileName.replaceAll("[^a-zA-Z0-9._-]", "");
                                String imageUrl = fileStorageService.storeFile(imageFile, "product", fileName, true);
                                product.setImageUrl(imageUrl);
                        } catch (Exception e) {
                                throw new RuntimeException("Failed to store image file", e);
                        }
                }

                CrmSalesProduct updatedProduct = repository.save(product);
                return mapEntityToResponse(updatedProduct);
        }

        @Transactional
        public void deleteProduct(Long id) {
                String tenantIdentifier = TenantContext.getTenantId();
                Tenant tenant = tenantRepository.findByTenantId(tenantIdentifier)
                                .orElseThrow(() -> new EntityNotFoundException("Tenant not found"));
                CrmSalesProduct product = repository.findByIdAndTenantId(id, tenant.getId())
                                .orElseThrow(() -> new EntityNotFoundException("Product not found"));
                repository.delete(product);
        }

        public org.springframework.core.io.Resource loadFileAsResource(String fileName) {
                return fileStorageService.loadFileAsResource(fileName, true);
        }

        private void mapRequestToEntity(CrmSalesProductRequest request, CrmSalesProduct product) {
                if (request.getItemType() != null)
                        product.setItemType(request.getItemType());
                if (request.getIsPurchase() != null)
                        product.setIsPurchase(request.getIsPurchase());
                if (request.getIsSales() != null)
                        product.setIsSales(request.getIsSales());
                if (request.getItemCode() != null)
                        product.setItemCode(request.getItemCode());
                if (request.getName() != null)
                        product.setName(request.getName());
                if (request.getDescription() != null)
                        product.setDescription(request.getDescription());
                if (request.getImageUrl() != null)
                        product.setImageUrl(request.getImageUrl());
                if (request.getUnitOfMeasure() != null)
                        product.setUnitOfMeasure(request.getUnitOfMeasure());
                if (request.getReorderLimit() != null)
                        product.setReorderLimit(request.getReorderLimit());
                if (request.getVatClassificationCode() != null)
                        product.setVatClassificationCode(request.getVatClassificationCode());
                if (request.getPurchasePrice() != null)
                        product.setPurchasePrice(request.getPurchasePrice());
                if (request.getSalesPrice() != null)
                        product.setSalesPrice(request.getSalesPrice());
                if (request.getTax() != null)
                        product.setTax(request.getTax());
                if (request.getTaxRate() != null)
                        product.setTaxRate(request.getTaxRate());
                if (request.getCategoryId() != null) {
                        product.setCategory(proCategoryRepository.findById(request.getCategoryId()).orElse(null));
                }
                if (request.getSubCategoryId() != null) {
                        product.setSubCategory(proSubCategoryRepository.findById(request.getSubCategoryId()).orElse(null));
                }
        }

        private byte[] generateBarcodeImage(String text, int width, int height) throws Exception {
                Code128Writer writer = new Code128Writer();
                BitMatrix bitMatrix = writer.encode(text, BarcodeFormat.CODE_128, width, height);
                ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
                MatrixToImageWriter.writeToStream(bitMatrix, "PNG", outputStream);
                return outputStream.toByteArray();
        }

        private CrmSalesProductResponse mapEntityToResponse(CrmSalesProduct product) {
                CrmSalesProductResponse response = new CrmSalesProductResponse();
                response.setId(product.getId());
                response.setItemType(product.getItemType());
                response.setIsPurchase(product.getIsPurchase());
                response.setIsSales(product.getIsSales());
                response.setItemCode(product.getItemCode());
                response.setName(product.getName());
                response.setDescription(product.getDescription());
                response.setImageUrl(product.getImageUrl());
                response.setUnitOfMeasure(product.getUnitOfMeasure());
                response.setReorderLimit(product.getReorderLimit());
                response.setVatClassificationCode(product.getVatClassificationCode());
                response.setPurchasePrice(product.getPurchasePrice());
                response.setSalesPrice(product.getSalesPrice());
                response.setTax(product.getTax());
                response.setBarcode(product.getBarcode());
                response.setBarcodeUrl(product.getBarcodeUrl());
                response.setTaxRate(product.getTaxRate());
                if (product.getCategory() != null) {
                        response.setCategoryId(product.getCategory().getId());
                        response.setCategoryName(product.getCategory().getName());
                }
                if (product.getSubCategory() != null) {
                        response.setSubCategoryId(product.getSubCategory().getId());
                        response.setSubCategoryName(product.getSubCategory().getName());
                }
                response.setCreatedAt(product.getCreatedAt());
                response.setUpdatedAt(product.getUpdatedAt());
                return response;
        }
}
