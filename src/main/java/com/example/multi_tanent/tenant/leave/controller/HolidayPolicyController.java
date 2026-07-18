package com.example.multi_tanent.tenant.leave.controller;

import com.example.multi_tanent.tenant.base.entity.Holiday;
import com.example.multi_tanent.tenant.base.entity.HolidayPolicy;
import com.example.multi_tanent.tenant.leave.dto.HolidayPolicyRequest;
import com.example.multi_tanent.tenant.leave.dto.HolidayRequest;
import com.example.multi_tanent.tenant.leave.service.HolidayService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/holiday-policies")
@CrossOrigin(origins = "*")
public class HolidayPolicyController {

    private final HolidayService holidayService;

    public HolidayPolicyController(HolidayService holidayService) {
        this.holidayService = holidayService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<HolidayPolicy> createHolidayPolicy(@Valid @RequestBody HolidayPolicyRequest request) {
        HolidayPolicy createdPolicy = holidayService.createHolidayPolicy(request);
        return ResponseEntity.created(URI.create("/api/holiday-policies/" + createdPolicy.getId())).body(createdPolicy);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<HolidayPolicy>> getAllHolidayPolicies() {
        return ResponseEntity.ok(holidayService.getAllHolidayPolicies());
    }

    @PutMapping("/{policyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<HolidayPolicy> updateHolidayPolicy(@PathVariable Long policyId, @Valid @RequestBody HolidayPolicyRequest request) {
        return ResponseEntity.ok(holidayService.updateHolidayPolicy(policyId, request));
    }

    @DeleteMapping("/{policyId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Void> deleteHolidayPolicy(@PathVariable Long policyId) {
        holidayService.deleteHolidayPolicy(policyId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{policyId}/holidays")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'HRMS_ADMIN')")
    public ResponseEntity<Holiday> addHolidayToPolicy(@PathVariable Long policyId, @Valid @RequestBody HolidayRequest request) {
        Holiday newHoliday = holidayService.addHolidayToPolicy(policyId, request);
        return ResponseEntity.created(URI.create("/api/holidays/" + newHoliday.getId())).body(newHoliday);
    }
}