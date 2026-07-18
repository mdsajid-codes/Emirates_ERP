package com.example.multi_tanent.warehouse.service;

import com.example.multi_tanent.warehouse.dto.WareProductSerialRequest;
import com.example.multi_tanent.warehouse.dto.WareProductSerialResponse;
import com.example.multi_tanent.warehouse.entity.WareProductBatch;
import com.example.multi_tanent.warehouse.entity.WareProductSerial;
import com.example.multi_tanent.warehouse.repository.WareProductBatchRepository;
import com.example.multi_tanent.warehouse.repository.WareProductSerialRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class WareProductSerialService {

    private final WareProductSerialRepository serialRepository;
    private final WareProductBatchRepository batchRepository;

    public WareProductSerialResponse create(WareProductSerialRequest req) {
        if (serialRepository.existsBySerialNumber(req.getSerialNumber())) {
            throw new IllegalArgumentException("Serial number already exists");
        }

        WareProductBatch batch = batchRepository.findById(req.getBatchId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found"));

        WareProductSerial s = WareProductSerial.builder()
                .serialNumber(req.getSerialNumber())
                .batch(batch)
                .build();
        return toResponse(serialRepository.save(s));
    }

    public WareProductSerialResponse update(Long id, WareProductSerialRequest req) {
        WareProductSerial s = serialRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Serial not found"));

        if (!s.getSerialNumber().equals(req.getSerialNumber())
                && serialRepository.existsBySerialNumber(req.getSerialNumber())) {
            throw new IllegalArgumentException("Serial number already exists");
        }

        WareProductBatch batch = batchRepository.findById(req.getBatchId())
                .orElseThrow(() -> new EntityNotFoundException("Batch not found"));

        s.setSerialNumber(req.getSerialNumber());
        s.setBatch(batch);
        return toResponse(serialRepository.save(s));
    }

    public void delete(Long id) {
        serialRepository.deleteById(id);
    }

    @Transactional(readOnly = true)
    public Optional<WareProductSerialResponse> findBySerial(String serial) {
        return serialRepository.findBySerialNumber(serial).map(this::toResponse);
    }

    private WareProductSerialResponse toResponse(WareProductSerial s) {
        return WareProductSerialResponse.builder()
                .id(s.getId())
                .serialNumber(s.getSerialNumber())
                .batchId(s.getBatch().getId())
                .batchNumber(s.getBatch().getBatchNumber())
                .createdAt(s.getCreatedAt())
                .build();
    }
}
