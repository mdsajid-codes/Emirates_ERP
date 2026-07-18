package com.example.multi_tanent.hanger.controller;

import com.example.multi_tanent.hanger.annotation.RequiresHangerModule;
import com.example.multi_tanent.hanger.dto.HngDowntimeLogRequest;
import com.example.multi_tanent.hanger.dto.HngDowntimeLogResponse;
import com.example.multi_tanent.hanger.service.HngMachineDowntimeLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/hanger/downtime-logs")
@RequiredArgsConstructor
@RequiresHangerModule
public class HngMachineDowntimeLogController {

    private final HngMachineDowntimeLogService downtimeService;

    @PostMapping
    public ResponseEntity<HngDowntimeLogResponse> createLog(@RequestBody HngDowntimeLogRequest request) {
        return ResponseEntity.ok(downtimeService.createLog(request));
    }

    @GetMapping("/by-batch/{batchId}")
    public ResponseEntity<List<HngDowntimeLogResponse>> getLogsByBatch(@PathVariable Long batchId) {
        return ResponseEntity.ok(downtimeService.getLogsByBatch(batchId));
    }

    @GetMapping("/by-workstation/{workstationId}")
    public ResponseEntity<List<HngDowntimeLogResponse>> getLogsByWorkStation(@PathVariable Long workstationId) {
        return ResponseEntity.ok(downtimeService.getLogsByWorkStation(workstationId));
    }
}
