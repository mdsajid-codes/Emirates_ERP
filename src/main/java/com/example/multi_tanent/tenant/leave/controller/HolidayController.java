package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.base.entity.Holiday;
import com.example.multi_tanent.tenant.leave.dto.HolidayRequest;
import com.example.multi_tanent.tenant.leave.service.HolidayService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/holidays")
@CrossOrigin(origins = "*")
public class HolidayController {

    private final HolidayService holidayService;

    public HolidayController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @PutMapping("/{holidayId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Holiday> updateHoliday(@PathVariable Long holidayId, @Valid @RequestBody HolidayRequest request) {
        return ResponseEntity.ok(holidayService.updateHoliday(holidayId, request));
    }

    @DeleteMapping("/{holidayId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Void> deleteHoliday(@PathVariable Long holidayId) {
        holidayService.deleteHoliday(holidayId);
        return ResponseEntity.noContent().build();
    }
}
