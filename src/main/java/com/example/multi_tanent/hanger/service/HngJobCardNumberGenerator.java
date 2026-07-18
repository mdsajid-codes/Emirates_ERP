package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.repository.HngJobCardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HngJobCardNumberGenerator {

    private final HngJobCardRepository repo;

    public String generate(Long tenantId) {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        long count = repo.count() + 1; // Simplistic count, ideally tenant-scoped
        return String.format("JC-%d%02d-%03d", year, month, count);
    }
}
