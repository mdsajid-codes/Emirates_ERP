package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.repository.HngProductionBatchRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HngBatchNumberGenerator {

    private final HngProductionBatchRepository repo;

    /**
     * Generates a unique, sequential batch number for the given tenant ID.
     * Format: BATCH-{YEAR}-{SEQUENCE} (e.g., BATCH-2026-0042)
     */
    public String generate(Long tenantId) {
        int year = LocalDate.now().getYear();
        long nextSequence = repo.countByTenantId(tenantId) + 1;
        return String.format("BATCH-%d-%04d", year, nextSequence);
    }
}
