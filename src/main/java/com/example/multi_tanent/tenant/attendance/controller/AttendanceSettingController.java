package com.example.multi_tanent.tenant.attendance.controller;

import com.example.multi_tanent.tenant.attendance.dto.AttendanceSettingRequest;
import com.example.multi_tanent.tenant.attendance.entity.AttendanceSetting;
import com.example.multi_tanent.tenant.attendance.service.AttendanceSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/attendance-settings")
@CrossOrigin(origins = "*")
public class AttendanceSettingController {
    private final AttendanceSettingService settingService;

    public AttendanceSettingController(AttendanceSettingService settingService) {
        this.settingService = settingService;
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<AttendanceSetting> createSetting(@RequestBody AttendanceSettingRequest request) {
        AttendanceSetting createdSetting = settingService.createSetting(request);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest()
                .path("/{id}")
                .buildAndExpand(createdSetting.getId()).toUri();
        return ResponseEntity.created(location).body(createdSetting);
    }

    @GetMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<AttendanceSetting>> getAllSettings() {
        return ResponseEntity.ok(settingService.getAllSettings());
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AttendanceSetting> getSettingById(@PathVariable Long id) {
        return settingService.getSettingById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<AttendanceSetting> updateSetting(@PathVariable Long id, @RequestBody AttendanceSettingRequest request) {
        AttendanceSetting updatedSetting = settingService.updateSetting(id, request);
        return ResponseEntity.ok(updatedSetting);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN','HRMS_ADMIN','HR','MANAGER')")
    public ResponseEntity<Void> deleteSetting(@PathVariable Long id) {
        settingService.deleteSetting(id);
        return ResponseEntity.noContent().build();
    }
}
