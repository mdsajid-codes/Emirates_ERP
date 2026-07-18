package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.leave.dto.SickLeaveIntervalResponse;
import com.example.multi_tanent.tenant.leave.dto.SickLeaveTypeRequest;
import com.example.multi_tanent.tenant.leave.dto.SickLeaveTypeResponse;
import com.example.multi_tanent.tenant.leave.entity.SickLeaveType;
import com.example.multi_tanent.tenant.leave.service.SickLeaveTypeService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/sick-leave-types")
@CrossOrigin(origins = "*")
public class SickLeaveTypeController {

    private final SickLeaveTypeService sickLeaveTypeService;

    public SickLeaveTypeController(SickLeaveTypeService sickLeaveTypeService) {
        this.sickLeaveTypeService = sickLeaveTypeService;
    }

    @GetMapping
    public ResponseEntity<List<SickLeaveTypeResponse>> getAll() {
        List<SickLeaveTypeResponse> responses = sickLeaveTypeService.getAll().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/{id}")
    public ResponseEntity<SickLeaveTypeResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(mapToResponse(sickLeaveTypeService.getById(id)));
    }

    @PostMapping
    public ResponseEntity<SickLeaveTypeResponse> create(@RequestBody SickLeaveTypeRequest request) {
        return ResponseEntity.ok(mapToResponse(sickLeaveTypeService.create(request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<SickLeaveTypeResponse> update(@PathVariable Long id, @RequestBody SickLeaveTypeRequest request) {
        return ResponseEntity.ok(mapToResponse(sickLeaveTypeService.update(id, request)));
    }

    private SickLeaveTypeResponse mapToResponse(SickLeaveType entity) {
        SickLeaveTypeResponse resp = new SickLeaveTypeResponse();
        resp.setId(entity.getId());
        resp.setName(entity.getName());
        resp.setDescription(entity.getDescription());
        resp.setCalculationMethod(entity.getCalculationMethod());
        resp.setDailyEarningBase(entity.getDailyEarningBase());
        resp.setAveragingPeriodMonths(entity.getAveragingPeriodMonths());
        resp.setActive(entity.getActive());

        if (entity.getWorkTimeType() != null) {
            resp.setWorkTimeTypeId(entity.getWorkTimeType().getId());
            resp.setWorkTimeTypeName(entity.getWorkTimeType().getName());
        }

        if (entity.getEarningsType() != null) {
            resp.setEarningsTypeId(entity.getEarningsType().getId());
            resp.setEarningsTypeName(entity.getEarningsType().getName());
        }

        if (entity.getIntervals() != null) {
            resp.setIntervals(entity.getIntervals().stream().map(interval -> {
                SickLeaveIntervalResponse iResp = new SickLeaveIntervalResponse();
                iResp.setId(interval.getId());
                iResp.setFromDay(interval.getFromDay());
                iResp.setToDay(interval.getToDay());
                iResp.setPaymentPercent(interval.getPaymentPercent());
                return iResp;
            }).collect(Collectors.toList()));
        }

        return resp;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        sickLeaveTypeService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
