package com.example.multi_tanent.pos.controller;

import com.example.multi_tanent.pos.dto.ProductVariantDto;
import com.example.multi_tanent.pos.service.ProductVariantService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/public/products")
@CrossOrigin(origins = "*")
public class PublicProductController {

    private final ProductVariantService productVariantService;

    public PublicProductController(ProductVariantService productVariantService) {
        this.productVariantService = productVariantService;
    }

    /**
     * Public endpoint to get product variant details by its SKU.
     * This is the URL that will be encoded in the QR code.
     * Note: This endpoint is public and does not require authentication.
     * It finds the variant across all tenants.
     *
     * @param sku The SKU of the product variant.
     * @return A DTO with the product variant's information.
     */
    @GetMapping("/by-sku/{sku}")
    public ResponseEntity<ProductVariantDto> getProductVariantBySku(@PathVariable String sku) {
        return productVariantService.findVariantBySkuGlobally(sku)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}
