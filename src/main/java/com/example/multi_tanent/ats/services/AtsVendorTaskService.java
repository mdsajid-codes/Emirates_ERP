package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsVendorTaskRequest;
import com.example.multi_tanent.ats.dto.AtsVendorTaskResponse;
import com.example.multi_tanent.ats.entity.AtsVendor;
import com.example.multi_tanent.ats.entity.AtsVendorTask;
import com.example.multi_tanent.ats.enums.TaskPriority;
import com.example.multi_tanent.ats.enums.TaskStatus;
import com.example.multi_tanent.ats.repository.AtsVendorRepository;
import com.example.multi_tanent.ats.repository.AtsVendorTaskRepository;
import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.Tenant;
import com.example.multi_tanent.spersusers.repository.TenantRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional("tenantTx")
public class AtsVendorTaskService {

    private final AtsVendorTaskRepository taskRepository;
    private final AtsVendorRepository vendorRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsVendorTaskResponse create(Long vendorId, AtsVendorTaskRequest request) {
        Tenant tenant = currentTenant();
        AtsVendor vendor = vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsVendorTask task = AtsVendorTask.builder()
                .tenant(tenant)
                .vendor(vendor)
                .taskTitle(request.getTaskTitle())
                .taskDescription(request.getTaskDescription())
                .taskStatus(request.getTaskStatus() != null ? request.getTaskStatus() : TaskStatus.PENDING)
                .priority(request.getPriority() != null ? request.getPriority() : TaskPriority.MEDIUM)
                .dueDate(request.getDueDate())
                .taskType(request.getTaskType())
                .taskCategory(request.getTaskCategory())
                .reminder(request.getReminder())
                .meetingLink(request.getMeetingLink())
                .build();

        resolveFKs(task, request, tenant.getId());

        AtsVendorTask saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public AtsVendorTaskResponse update(Long vendorId, Long taskId, AtsVendorTaskRequest request) {
        Tenant tenant = currentTenant();
        vendorRepository.findByIdAndTenantId(vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Vendor not found with id " + vendorId));

        AtsVendorTask task = taskRepository.findByIdAndVendorIdAndTenantId(taskId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found with id " + taskId));

        task.setTaskTitle(request.getTaskTitle());
        task.setTaskDescription(request.getTaskDescription());
        if (request.getTaskStatus() != null) {
            task.setTaskStatus(request.getTaskStatus());
            if (request.getTaskStatus() == TaskStatus.COMPLETED && task.getCompletedAt() == null) {
                task.setCompletedAt(OffsetDateTime.now());
            } else if (request.getTaskStatus() != TaskStatus.COMPLETED) {
                task.setCompletedAt(null);
            }
        }
        if (request.getPriority() != null) {
            task.setPriority(request.getPriority());
        }
        task.setDueDate(request.getDueDate());
        task.setTaskType(request.getTaskType());
        task.setTaskCategory(request.getTaskCategory());
        task.setReminder(request.getReminder());
        task.setMeetingLink(request.getMeetingLink());

        resolveFKs(task, request, tenant.getId());

        AtsVendorTask saved = taskRepository.save(task);
        return toResponse(saved);
    }

    private void resolveFKs(AtsVendorTask task, AtsVendorTaskRequest request, Long tenantId) {
        if (request.getAssignedToId() != null) {
            task.setAssignedTo(employeeRepository.findByIdAndUser_Tenant_Id(request.getAssignedToId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found to assign")));
        } else {
            task.setAssignedTo(null);
        }

        if (request.getEscalateToId() != null) {
            task.setEscalateTo(employeeRepository.findByIdAndUser_Tenant_Id(request.getEscalateToId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found to escalate to")));
        } else {
            task.setEscalateTo(null);
        }

        if (request.getOwnershipId() != null) {
            task.setOwnership(employeeRepository.findByIdAndUser_Tenant_Id(request.getOwnershipId(), tenantId)
                    .orElseThrow(() -> new EntityNotFoundException("Employee not found for ownership")));
        } else {
            task.setOwnership(null);
        }
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public List<AtsVendorTaskResponse> getAll(Long vendorId) {
        Tenant tenant = currentTenant();
        return taskRepository.findByVendorIdAndTenantId(vendorId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsVendorTaskResponse getById(Long vendorId, Long taskId) {
        Tenant tenant = currentTenant();
        AtsVendorTask task = taskRepository.findByIdAndVendorIdAndTenantId(taskId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        return toResponse(task);
    }

    public void delete(Long vendorId, Long taskId) {
        Tenant tenant = currentTenant();
        AtsVendorTask task = taskRepository.findByIdAndVendorIdAndTenantId(taskId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    public AtsVendorTaskResponse complete(Long vendorId, Long taskId) {
        Tenant tenant = currentTenant();
        AtsVendorTask task = taskRepository.findByIdAndVendorIdAndTenantId(taskId, vendorId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        task.setTaskStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(OffsetDateTime.now());
        AtsVendorTask saved = taskRepository.save(task);
        return toResponse(saved);
    }

    private AtsVendorTaskResponse toResponse(AtsVendorTask t) {
        return AtsVendorTaskResponse.builder()
                .id(t.getId())
                .taskTitle(t.getTaskTitle())
                .taskDescription(t.getTaskDescription())
                .taskStatus(t.getTaskStatus())
                .priority(t.getPriority())
                .dueDate(t.getDueDate())
                .taskType(t.getTaskType())
                .taskCategory(t.getTaskCategory())
                .escalateToId(t.getEscalateTo() != null ? t.getEscalateTo().getId() : null)
                .escalateToName(t.getEscalateTo() != null ? (t.getEscalateTo().getFirstName() + " " + t.getEscalateTo().getLastName()) : null)
                .ownershipId(t.getOwnership() != null ? t.getOwnership().getId() : null)
                .ownershipName(t.getOwnership() != null ? (t.getOwnership().getFirstName() + " " + t.getOwnership().getLastName()) : null)
                .reminder(t.getReminder())
                .meetingLink(t.getMeetingLink())
                .assignedToId(t.getAssignedTo() != null ? t.getAssignedTo().getId() : null)
                .assignedToName(t.getAssignedTo() != null ? (t.getAssignedTo().getFirstName() + " " + t.getAssignedTo().getLastName()) : null)
                .completedAt(t.getCompletedAt())
                .createdById(t.getCreatedBy() != null ? t.getCreatedBy().getId() : null)
                .createdByName(t.getCreatedBy() != null ? (t.getCreatedBy().getFirstName() + " " + t.getCreatedBy().getLastName()) : null)
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
