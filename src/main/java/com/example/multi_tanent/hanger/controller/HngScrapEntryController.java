package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HngScrapEntryRequest;
import com.example.multi_tanent.hanger.dto.HngScrapEntryRequest;
import com.example.multi_tanent.hanger.dto.HngScrapEntryResponse;
import com.example.multi_tanent.hanger.dto.HngScrapSummaryResponse;
import com.example.multi_tanent.hanger.dto.HngScrapSummaryResponse;
import com.example.multi_tanent.hanger.entity.HngScrapEntry;
import com.example.multi_tanent.hanger.repository.HngScrapEntryRepository;
import com.example.multi_tanent.hanger.service.HngScrapEntryService;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/hanger/scrap-entries")
@RequiredArgsConstructor
@RequiresHangerModule
public class HngScrapEntryController {

    private final HngScrapEntryService scrapService;

    @PostMapping
    public ResponseEntity<HngScrapEntryResponse> create(@RequestBody HngScrapEntryRequest request) {
        return ResponseEntity.ok(scrapService.create(request));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngScrapEntryResponse>> getByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(scrapService.getByBatch(batchId));
    }

    @GetMapping("/by-batch/{batchId}/summary")
    public ResponseEntity<HngScrapSummaryResponse> getSummary(@PathVariable Long batchId) {
        return ResponseEntity.ok(scrapService.getSummaryByBatch(batchId));
    }
}
