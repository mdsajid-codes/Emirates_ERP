package com.example.multi_tanent.ats.services;

import com.example.multi_tanent.ats.dto.AtsClientTaskRequest;
import com.example.multi_tanent.ats.dto.AtsClientTaskResponse;
import com.example.multi_tanent.ats.entity.AtsClient;
import com.example.multi_tanent.ats.entity.AtsClientTask;
import com.example.multi_tanent.ats.enums.TaskPriority;
import com.example.multi_tanent.ats.enums.TaskStatus;
import com.example.multi_tanent.ats.repository.AtsClientRepository;
import com.example.multi_tanent.ats.repository.AtsClientTaskRepository;
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
public class AtsClientTaskService {

    private final AtsClientTaskRepository taskRepository;
    private final AtsClientRepository clientRepository;
    private final TenantRepository tenantRepository;
    private final EmployeeRepository employeeRepository;

    private Tenant currentTenant() {
        String tenantId = TenantContext.getTenantId();
        return tenantRepository.findByTenantId(tenantId)
                .orElseThrow(() -> new IllegalStateException("Tenant not found for tenantId: " + tenantId));
    }

    public AtsClientTaskResponse create(Long clientId, AtsClientTaskRequest request) {
        Tenant tenant = currentTenant();
        AtsClient client = clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + clientId));

        AtsClientTask task = AtsClientTask.builder()
                .tenant(tenant)
                .client(client)
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

        AtsClientTask saved = taskRepository.save(task);
        return toResponse(saved);
    }

    public AtsClientTaskResponse update(Long clientId, Long taskId, AtsClientTaskRequest request) {
        Tenant tenant = currentTenant();
        clientRepository.findByIdAndTenantId(clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Client not found with id " + clientId));

        AtsClientTask task = taskRepository.findByIdAndClientIdAndTenantId(taskId, clientId, tenant.getId())
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

        AtsClientTask saved = taskRepository.save(task);
        return toResponse(saved);
    }

    private void resolveFKs(AtsClientTask task, AtsClientTaskRequest request, Long tenantId) {
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
    public List<AtsClientTaskResponse> getAll(Long clientId) {
        Tenant tenant = currentTenant();
        return taskRepository.findByClientIdAndTenantId(clientId, tenant.getId()).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Transactional(value = "tenantTx", readOnly = true)
    public AtsClientTaskResponse getById(Long clientId, Long taskId) {
        Tenant tenant = currentTenant();
        AtsClientTask task = taskRepository.findByIdAndClientIdAndTenantId(taskId, clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        return toResponse(task);
    }

    public void delete(Long clientId, Long taskId) {
        Tenant tenant = currentTenant();
        AtsClientTask task = taskRepository.findByIdAndClientIdAndTenantId(taskId, clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    public AtsClientTaskResponse complete(Long clientId, Long taskId) {
        Tenant tenant = currentTenant();
        AtsClientTask task = taskRepository.findByIdAndClientIdAndTenantId(taskId, clientId, tenant.getId())
                .orElseThrow(() -> new EntityNotFoundException("Task not found"));
        task.setTaskStatus(TaskStatus.COMPLETED);
        task.setCompletedAt(OffsetDateTime.now());
        AtsClientTask saved = taskRepository.save(task);
        return toResponse(saved);
    }

    private AtsClientTaskResponse toResponse(AtsClientTask t) {
        return AtsClientTaskResponse.builder()
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
