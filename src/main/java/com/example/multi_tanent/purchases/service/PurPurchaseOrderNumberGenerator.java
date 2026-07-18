package com.example.multi_tanent.purchases.service;

import com.example.multi_tanent.purchases.repository.PurPurchaseOrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class PurPurchaseOrderNumberGenerator {

    private final PurPurchaseOrderRepository repo;

    /**
     * Generates a unique, sequential PO number for the given tenant ID.
     * Format: PO-{YEAR}-{SEQUENCE} (e.g., PO-2024-0015)
     */
    public String generate(Long tenantId) {
        int year = LocalDate.now().getYear();
        long nextSequence = repo.countByTenantId(tenantId) + 1;
        return String.format("PO-%d-%04d", year, nextSequence);
    }
}
