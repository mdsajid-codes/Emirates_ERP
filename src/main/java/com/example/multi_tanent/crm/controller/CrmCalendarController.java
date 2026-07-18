package com.example.multi_tanent.crm.controller;

import com.example.multi_tanent.crm.dto.CalendarItemDto;
import com.example.multi_tanent.crm.dto.CrmReminderRequest;
import com.example.multi_tanent.crm.dto.CrmReminderResponse;
import com.example.multi_tanent.crm.services.CrmCalendarService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/crm/calendar")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class CrmCalendarController {

    private final CrmCalendarService service;

    @GetMapping("/events")
    @PreAuthorize("@crmAccess.canView('EVENT')")
    public ResponseEntity<List<CalendarItemDto>> getCalendarItems() {
        return ResponseEntity.ok(service.getCalendarItems());
    }

    @GetMapping("/due-reminders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<CrmReminderResponse>> getDueReminders() {
        return ResponseEntity.ok(service.getDueReminders());
    }

    @PostMapping("/reminders")
    @PreAuthorize("@crmAccess.canCreate('EVENT')")
    public ResponseEntity<CrmReminderResponse> createReminder(@RequestBody CrmReminderRequest req) {
        return ResponseEntity.ok(service.createReminder(req));
    }

    @PutMapping("/reminders/{id}/dismiss")
    @PreAuthorize("@crmAccess.canUpdate('EVENT')")
    public ResponseEntity<Void> dismissReminder(@PathVariable Long id) {
        service.dismissReminder(id);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/reminders/{id}")
    @PreAuthorize("@crmAccess.canDelete('EVENT')")
    public ResponseEntity<Void> deleteReminder(@PathVariable Long id) {
        service.deleteReminder(id);
        return ResponseEntity.ok().build();
    }
}
