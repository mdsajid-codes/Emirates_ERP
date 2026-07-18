package com.example.multi_tanent.hanger.service;

import com.example.multi_tanent.hanger.repository.HngCoatingLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class HngCoatingLogNumberGenerator {

    private final HngCoatingLogRepository repo;

    public String generate(Long tenantId) {
        LocalDate now = LocalDate.now();
        int year = now.getYear();
        int month = now.getMonthValue();
        long count = repo.count() + 1;
        return String.format("CL-%d%02d-%03d", year, month, count);
    }
}
