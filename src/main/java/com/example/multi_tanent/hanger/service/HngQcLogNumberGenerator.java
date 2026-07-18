package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.repository.HngQcLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HngQcLogNumberGenerator {

    private final HngQcLogRepository repo;

    public String generate(Long tenantId) {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        long count = repo.count() + 1;
        return String.format("QC-%d%02d-%03d", year, month, count);
    }
}
