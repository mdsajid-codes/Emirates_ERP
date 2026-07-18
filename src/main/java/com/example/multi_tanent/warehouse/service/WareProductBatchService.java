package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.WareProductBatchRequest;
import com.example.multi_tanent.warehouse.dto.WareProductBatchResponse;
import com.example.multi_tanent.warehouse.entity.WareProductBatch;
import com.example.multi_tanent.warehouse.entity.WareProducts;
import com.example.multi_tanent.warehouse.repository.WareProductBatchRepository;
import com.example.multi_tanent.warehouse.repository.WareProductsRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class WareProductBatchService {

    private final WareProductBatchRepository batchRepository;
    private final WareProductsRepository productRepository;

    @Transactional(readOnly = true)
    public List<WareProductBatchResponse> listByProduct(Long productId) {
        return batchRepository.findByProductId(productId)
                .stream().map(this::toResponse).collect(Collectors.toList());
    }

    public WareProductBatchResponse create(WareProductBatchRequest req) {
        WareProducts product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        WareProductBatch b = WareProductBatch.builder()
                .batchNumber(req.getBatchNumber())
                .mfgDate(req.getMfgDate())
                .expiryDate(req.getExpiryDate())
                .product(product)
                .build();
        return toResponse(batchRepository.save(b));
    }

    public WareProductBatchResponse update(Long id, WareProductBatchRequest req) {
        WareProductBatch b = batchRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Batch not found"));
        WareProducts product = productRepository.findById(req.getProductId())
                .orElseThrow(() -> new EntityNotFoundException("Product not found"));

        b.setBatchNumber(req.getBatchNumber());
        b.setMfgDate(req.getMfgDate());
        b.setExpiryDate(req.getExpiryDate());
        b.setProduct(product);
        return toResponse(batchRepository.save(b));
    }

    public void delete(Long id) {
        batchRepository.deleteById(id);
    }

    private WareProductBatchResponse toResponse(WareProductBatch b) {
        return WareProductBatchResponse.builder()
                .id(b.getId())
                .batchNumber(b.getBatchNumber())
                .mfgDate(b.getMfgDate())
                .expiryDate(b.getExpiryDate())
                .productId(b.getProduct().getId())
                .productName(b.getProduct().getName())
                .createdAt(b.getCreatedAt())
                .build();
    }
}
