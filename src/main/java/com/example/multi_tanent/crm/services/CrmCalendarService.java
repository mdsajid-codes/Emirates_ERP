package com.example.multi_tanent.crm.services;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.crm.dto.*;
import com.example.multi_tanent.crm.entity.*;
import com.example.multi_tanent.crm.enums.CrmEntityType;
import com.example.multi_tanent.crm.repository.*;
import com.example.multi_tanent.spersusers.dto.NotificationRequest;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.spersusers.service.NotificationService;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class CrmCalendarService {

    private final CrmTaskRepository taskRepo;
    private final CrmEventRepository eventRepo;
    private final CrmReminderRepository reminderRepo;
    private final TenantRepository tenantRepo;
    private final NotificationService notificationService;

    private Tenant currentTenant() {
        String key = TenantContext.getTenantId();
        return tenantRepo.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new IllegalStateException("Tenant not resolved for key: " + key));
    }

    @Transactional(readOnly = true)
    public List<CalendarItemDto> getCalendarItems() {
        Tenant t = currentTenant();
        List<CalendarItemDto> items = new ArrayList<>();

        // Add Tasks
        taskRepo.findByTenantIdOrderByDueDateAscIdAsc(t.getId()).forEach(task -> {
            items.add(CalendarItemDto.builder()
                    .id(task.getId())
                    .type("TASK")
                    .title(task.getSubject().toString())
                    .description(task.getComments())
                    .date(task.getDueDate())
                    .startTime(task.getCallTime())
                    .status(task.getStatus())
                    .leadName(task.getLead() != null ? (task.getLead().getFirstName() + " " + task.getLead().getLastName()).trim() : null)
                    .build());
        });

        // Add Events
        eventRepo.findByTenantIdOrderByDateDescFromTimeDesc(t.getId()).forEach(event -> {
            items.add(CalendarItemDto.builder()
                    .id(event.getId())
                    .type("EVENT")
                    .title(event.getSubject().toString())
                    .description(event.getDescription())
                    .date(event.getDate())
                    .startTime(event.getFromTime())
                    .endTime(event.getToTime())
                    .status(event.getStatus().toString())
                    .priority(event.getPriority().toString())
                    .leadName(event.getLead() != null ? (event.getLead().getFirstName() + " " + event.getLead().getLastName()).trim() : null)
                    .build());
        });

        // Attach reminder info if exists
        items.forEach(item -> {
            reminderRepo.findByEntityTypeAndEntityIdAndTenantId(
                CrmEntityType.valueOf(item.getType()), item.getId(), t.getId())
                .ifPresent(r -> {
                    item.setReminderId(r.getId());
                    item.setRemindAt(r.getRemindAt());
                    item.setReminderDismissed(r.isDismissed());
                });
        });

        return items;
    }

    @Transactional(readOnly = true)
    public List<CrmReminderResponse> getDueReminders() {
        Tenant t = currentTenant();
        LocalDateTime cutoff = LocalDateTime.now().plusMinutes(15);
        
        return reminderRepo.findDueReminders(t.getId(), cutoff).stream()
                .map(this::toReminderResponse)
                .collect(Collectors.toList());
    }

    public CrmReminderResponse createReminder(CrmReminderRequest req) {
        Tenant t = currentTenant();
        
        // Remove existing reminder for the same entity if any
        reminderRepo.findByEntityTypeAndEntityIdAndTenantId(req.getEntityType(), req.getEntityId(), t.getId())
                .ifPresent(reminderRepo::delete);

        CrmReminder r = CrmReminder.builder()
                .tenant(t)
                .entityType(req.getEntityType())
                .entityId(req.getEntityId())
                .remindAt(req.getRemindAt())
                .channels(req.getChannels() != null ? String.join(",", req.getChannels()) : null)
                .recipient(req.getRecipient())
                .dismissed(false)
                .build();
        
        return toReminderResponse(reminderRepo.save(r));
    }

    public void dismissReminder(Long id) {
        Tenant t = currentTenant();
        CrmReminder r = reminderRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Reminder not found: " + id));
        r.setDismissed(true);
        reminderRepo.save(r);
    }

    public void deleteReminder(Long id) {
        Tenant t = currentTenant();
        CrmReminder r = reminderRepo.findByIdAndTenantId(id, t.getId())
                .orElseThrow(() -> new EntityNotFoundException("Reminder not found: " + id));
        reminderRepo.delete(r);
    }

    @Transactional
    public void dispatchDueReminders(Long tenantId) {
        LocalDateTime now = LocalDateTime.now();
        // Look for reminders due between 5 mins ago and now that haven't been dismissed
        List<CrmReminder> due = reminderRepo.findByTenantIdAndDismissedFalseAndRemindAtBetween(tenantId, now.minusMinutes(5), now);
        
        for (CrmReminder r : due) {
            if (r.getChannels() == null || r.getChannels().isEmpty()) continue;
            
            Set<String> channels = new HashSet<>(Arrays.asList(r.getChannels().split(",")));
            CrmReminderResponse resp = toReminderResponse(r);
            
            Map<String, Object> metadata = new HashMap<>();
            metadata.put("title", resp.getEntityTitle());
            metadata.put("date", r.getRemindAt().toLocalDate().toString());
            metadata.put("time", r.getRemindAt().toLocalTime().format(DateTimeFormatter.ofPattern("HH:mm")));
            metadata.put("description", "Strategic engagement alert scheduled in your CRM.");

            NotificationRequest req = NotificationRequest.builder()
                    .tenantId(tenantId)
                    .recipient(r.getRecipient())
                    .templateId("crm_reminder_alert")
                    .channels(channels)
                    .metadata(metadata)
                    .build();

            try {
                notificationService.sendNotification(req);
                r.setDismissed(true); // Auto-dismiss after sending via multi-channels
                reminderRepo.save(r);
            } catch (Exception e) {
                // Log error silently and proceed to next
            }
        }
    }

    private CrmReminderResponse toReminderResponse(CrmReminder r) {
        String title = "Notification";
        if (r.getEntityType() == CrmEntityType.TASK) {
            title = taskRepo.findById(r.getEntityId())
                    .map(tk -> tk.getSubject().toString())
                    .orElse("Task");
        } else if (r.getEntityType() == CrmEntityType.EVENT) {
            title = eventRepo.findById(r.getEntityId())
                    .map(ev -> ev.getSubject().toString())
                    .orElse("Event");
        }

        Set<String> channels = r.getChannels() != null ? 
            new HashSet<>(Arrays.asList(r.getChannels().split(","))) : 
            new HashSet<>();

        return CrmReminderResponse.builder()
                .id(r.getId())
                .entityType(r.getEntityType())
                .entityId(r.getEntityId())
                .entityTitle(title)
                .remindAt(r.getRemindAt())
                .dismissed(r.isDismissed())
                .channels(channels)
                .recipient(r.getRecipient())
                .build();
    }
}
