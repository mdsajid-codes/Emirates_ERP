package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.repository.HngReworkEntryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
public class HngReworkEntryNumberGenerator {

    private final HngReworkEntryRepository reworkRepo;

    public synchronized String generate(Long tenantId) {
        String prefix = "RWK-" + LocalDate.now().format(DateTimeFormatter.ofPattern("yyyyMM")) + "-";

        long count = reworkRepo.count();
        return prefix + String.format("%03d", count + 1);
    }
}
