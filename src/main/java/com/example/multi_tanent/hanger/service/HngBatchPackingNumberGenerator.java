package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.repository.HngBatchPackingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class HngBatchPackingNumberGenerator {

    private final HngBatchPackingRepository packingRepo;

    public synchronized String generate(Long tenantId) {
        String prefix = "PKG-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";

        // This is a simple implementation. In production, consider a database sequence
        // or dedicated counter table.
        long count = packingRepo.countByTenant_Id(tenantId);
        return prefix + String.format("%03d", count + 1);
    }
}
