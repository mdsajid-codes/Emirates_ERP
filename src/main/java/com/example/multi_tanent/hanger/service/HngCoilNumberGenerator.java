package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.repository.HngCoilStockRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HngCoilNumberGenerator {

    private final HngCoilStockRepository coilStockRepo;

    /**
     * Generates a unique, sequential coil number for the given tenant.
     * Format: COIL-{YEAR}-{SEQUENCE} (e.g., COIL-2024-0042)
     */
    public String generate(Tenant tenant) {
        int year = LocalDate.now().getYear();
        long nextSequence = coilStockRepo.countByTenant(tenant) + 1;
        return String.format("COIL-%d-%04d", year, nextSequence);
    }
}
