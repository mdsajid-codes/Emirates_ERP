package com.example.multi_tanent.tenant.notification.scheduler;

import com.example.multi_tanent.config.TenantContext;
import com.example.multi_tanent.master.enums.Role;
import com.example.multi_tanent.spersusers.enitity.Employee;
import com.example.multi_tanent.spersusers.enitity.User;
import com.example.multi_tanent.spersusers.enums.EmployeeStatus;
import com.example.multi_tanent.spersusers.repository.UserRepository;
import com.example.multi_tanent.tenant.attendance.entity.AttendanceRecord;
import com.example.multi_tanent.tenant.attendance.repository.AttendanceRecordRepository;
import com.example.multi_tanent.tenant.employee.entity.EmployeeDocument;
import com.example.multi_tanent.tenant.employee.repository.EmployeeDocumentRepository;
import com.example.multi_tanent.tenant.employee.repository.EmployeeRepository;
import com.example.multi_tanent.tenant.notification.enums.NotificationPriority;
import com.example.multi_tanent.tenant.notification.enums.NotificationType;
import com.example.multi_tanent.tenant.notification.service.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.List;

import com.example.multi_tanent.tenant.employee.entity.JobDetails;
import com.example.multi_tanent.tenant.employee.repository.JobDetailsRepository;

@Component
@RequiredArgsConstructor
@Slf4j
public class HrmsNotificationScheduler {

    private final NotificationService notificationService;
    private final AttendanceRecordRepository attendanceRecordRepository;
    private final EmployeeDocumentRepository employeeDocumentRepository;
    private final EmployeeRepository employeeRepository;
    private final UserRepository userRepository;
    private final JobDetailsRepository jobDetailsRepository;

    @Value("${app.default-tenant-id:emirateserp}")
    private String defaultTenantId;

    // ── 1. Attendance Reminder ───────────────────────────────────────────────
    // Monday–Friday at 17:30 Dubai time (Asia/Dubai = UTC+4)
    @Scheduled(cron = "0 30 17 * * MON-FRI", zone = "Asia/Dubai")
    public void attendanceReminder() {
        TenantContext.setTenantId(defaultTenantId);
        try {
            LocalDate today = LocalDate.now();
            log.info("Running attendance reminder scheduler for date: {}", today);

            List<AttendanceRecord> todayRecords =
                attendanceRecordRepository.findAllWithDetails().stream()
                    .filter(ar -> ar.getAttendanceDate() != null && ar.getAttendanceDate().equals(today))
                    .toList();

            for (AttendanceRecord record : todayRecords) {
                if (record.getCheckOut() == null && record.getEmployee() != null && record.getEmployee().getUser() != null) {
                    Employee emp = record.getEmployee();
                    Long userId = emp.getUser().getId();

                    notificationService.send(
                        userId,
                        NotificationType.ATTENDANCE_REMINDER,
                        "Attendance Reminder",
                        "You haven't marked your check-out for today (" + today +
                            "). Please ensure your attendance is recorded before end of day.",
                        "/attendance",
                        null,
                        null,
                        NotificationPriority.HIGH
                    );
                }
            }
            log.info("Attendance reminders processed for today");
        } finally {
            TenantContext.clear();
        }
    }

    // ── 2. Timesheet Reminder ────────────────────────────────────────────────
    // Every Friday at 12:00 Dubai time
    @Scheduled(cron = "0 0 12 * * FRI", zone = "Asia/Dubai")
    public void timesheetReminder() {
        TenantContext.setTenantId(defaultTenantId);
        try {
            LocalDate today = LocalDate.now();
            LocalDate weekStart = today.with(DayOfWeek.MONDAY);
            log.info("Running timesheet reminder for week {} to {}", weekStart, today);

            List<Employee> activeEmployees = employeeRepository.findByStatus(EmployeeStatus.ACTIVE);

            for (Employee emp : activeEmployees) {
                if (emp.getUser() != null) {
                    notificationService.send(
                        emp.getUser().getId(),
                        NotificationType.TIMESHEET_REMINDER,
                        "Weekly Timesheet Pending",
                        "Your timesheet for the week of " + weekStart +
                            " to " + today +
                            " is pending. Please submit it before end of day today.",
                        "/attendance",
                        null,
                        null,
                        NotificationPriority.MEDIUM
                    );
                }
            }
            log.info("Timesheet reminders sent to {} active employees", activeEmployees.size());
        } finally {
            TenantContext.clear();
        }
    }

    // ── 3. Document Expiry Check ─────────────────────────────────────────────
    // Daily at 07:00 Dubai time
    @Scheduled(cron = "0 0 7 * * *", zone = "Asia/Dubai")
    public void documentExpiryCheck() {
        TenantContext.setTenantId(defaultTenantId);
        try {
            LocalDate today    = LocalDate.now();
            LocalDate in7Days  = today.plusDays(7);
            LocalDate in30Days = today.plusDays(30);

            log.info("Running document expiry check for date: {}", today);

            List<User> hrManagers = userRepository.findActiveUsersByRole(Role.HR);
            List<User> hrAdmins   = userRepository.findActiveUsersByRole(Role.HRMS_ADMIN);

            // 7-day IMMINENT expiry
            List<EmployeeDocument> imminent =
                employeeDocumentRepository.findByEndDateBetween(today, in7Days);

            for (EmployeeDocument doc : imminent) {
                Employee emp = doc.getEmployee();
                if (emp == null) continue;

                String docTypeName = (doc.getDocumentType() != null && doc.getDocumentType().getName() != null) 
                        ? doc.getDocumentType().getName() : "Document";
                String empName = emp.getFirstName() + " " + (emp.getLastName() != null ? emp.getLastName() : "");

                if (emp.getUser() != null) {
                    notificationService.send(
                        emp.getUser().getId(),
                        NotificationType.DOCUMENT_EXPIRY_IMMINENT,
                        "URGENT: Document Expiring in 7 Days",
                        "Your " + docTypeName +
                            " (ID: " + (doc.getDocumentId() != null ? doc.getDocumentId() : "N/A") + ") expires on " +
                            doc.getEndDate() +
                            ". Please upload the renewed version immediately.",
                        "/employees",
                        doc.getId(),
                        "EMPLOYEE_DOCUMENT",
                        NotificationPriority.URGENT
                    );
                }

                String hrMsg = empName.trim() + "'s " + docTypeName +
                    " expires on " + doc.getEndDate() +
                    " (in 7 days). Immediate action required.";

                for (User hrUser : hrManagers) {
                    notificationService.send(hrUser.getId(),
                        NotificationType.DOCUMENT_EXPIRY_IMMINENT,
                        "URGENT: Employee Document Expiring",
                        hrMsg, "/employees",
                        doc.getId(), "EMPLOYEE_DOCUMENT", NotificationPriority.URGENT);
                }
                for (User hrAdmin : hrAdmins) {
                    notificationService.send(hrAdmin.getId(),
                        NotificationType.DOCUMENT_EXPIRY_IMMINENT,
                        "URGENT: Employee Document Expiring",
                        hrMsg, "/employees",
                        doc.getId(), "EMPLOYEE_DOCUMENT", NotificationPriority.URGENT);
                }
            }

            // 30-day WARNING expiry
            List<EmployeeDocument> warning =
                employeeDocumentRepository.findByEndDateBetween(in7Days.plusDays(1), in30Days);

            for (EmployeeDocument doc : warning) {
                Employee emp = doc.getEmployee();
                if (emp == null) continue;

                String docTypeName = (doc.getDocumentType() != null && doc.getDocumentType().getName() != null) 
                        ? doc.getDocumentType().getName() : "Document";

                if (emp.getUser() != null) {
                    notificationService.send(
                        emp.getUser().getId(),
                        NotificationType.DOCUMENT_EXPIRY_WARNING,
                        "Document Expiring Soon",
                        "Your " + docTypeName +
                            " (ID: " + (doc.getDocumentId() != null ? doc.getDocumentId() : "N/A") + ") expires on " +
                            doc.getEndDate() +
                            ". Please upload the renewed version before the expiry date.",
                        "/employees",
                        doc.getId(),
                        "EMPLOYEE_DOCUMENT",
                        NotificationPriority.HIGH
                    );
                }
            }

            log.info("Document expiry check finished: {} imminent, {} warning", imminent.size(), warning.size());
        } finally {
            TenantContext.clear();
        }
    }

    // ── 4. Probation Ending Alert (Daily at 07:30 Dubai Time) ────────────────
    @Scheduled(cron = "0 30 7 * * *", zone = "Asia/Dubai")
    public void probationEndingCheck() {
        TenantContext.setTenantId(defaultTenantId);
        try {
            LocalDate today = LocalDate.now();
            LocalDate in7Days = today.plusDays(7);

            log.info("Running probation ending check for range {} to {}", today, in7Days);

            List<JobDetails> endingProbations = jobDetailsRepository.findByProbationEndDateBetween(today, in7Days);

            for (JobDetails job : endingProbations) {
                Employee emp = job.getEmployee();
                if (emp == null || emp.getUser() == null) continue;

                String empName = emp.getFirstName() + " " + (emp.getLastName() != null ? emp.getLastName() : "");

                notificationService.send(
                    emp.getUser().getId(),
                    NotificationType.PROBATION_ENDING,
                    "Probation Period Ending Soon",
                    "Your probation period is ending on " + job.getProbationEndDate() + ". HR will complete your evaluation shortly.",
                    "/employees",
                    emp.getId(),
                    "EMPLOYEE",
                    NotificationPriority.HIGH
                );

                List<User> hrUsers = userRepository.findActiveUsersByRole(Role.HR);
                for (User hr : hrUsers) {
                    notificationService.send(
                        hr.getId(),
                        NotificationType.PROBATION_ENDING,
                        "Employee Probation Ending",
                        empName.trim() + "'s probation period ends on " + job.getProbationEndDate() + ". Please submit evaluation.",
                        "/employees",
                        emp.getId(),
                        "EMPLOYEE",
                        NotificationPriority.HIGH
                    );
                }
            }
        } finally {
            TenantContext.clear();
        }
    }

    // ── 5. Work Anniversary Celebration (Daily at 08:00 Dubai Time) ───────────
    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Dubai")
    public void workAnniversaryCheck() {
        TenantContext.setTenantId(defaultTenantId);
        try {
            LocalDate today = LocalDate.now();
            log.info("Running work anniversary check for month {} day {}", today.getMonthValue(), today.getDayOfMonth());

            List<JobDetails> anniversaries = jobDetailsRepository.findByDateOfJoiningMonthAndDay(
                today.getMonthValue(), today.getDayOfMonth()
            );

            for (JobDetails job : anniversaries) {
                Employee emp = job.getEmployee();
                if (emp == null || emp.getUser() == null || job.getDateOfJoining() == null) continue;

                int years = today.getYear() - job.getDateOfJoining().getYear();
                if (years <= 0) continue;

                notificationService.send(
                    emp.getUser().getId(),
                    NotificationType.WORK_ANNIVERSARY,
                    "Happy Work Anniversary! 🎉",
                    "Congratulations on completing " + years + " year" + (years > 1 ? "s" : "") + " with EmiratesERP! Thank you for your dedication.",
                    "/hrdashboard",
                    emp.getId(),
                    "EMPLOYEE",
                    NotificationPriority.LOW
                );
            }
        } finally {
            TenantContext.clear();
        }
    }

    // ── 6. Late Arrival Alert (Daily at 18:00 Dubai Time) ─────────────────────
    @Scheduled(cron = "0 0 18 * * MON-FRI", zone = "Asia/Dubai")
    public void lateArrivalCheck() {
        TenantContext.setTenantId(defaultTenantId);
        try {
            LocalDate today = LocalDate.now();
            log.info("Running late arrival check for date {}", today);

            List<AttendanceRecord> lateRecords = attendanceRecordRepository.findAllWithDetails().stream()
                .filter(ar -> ar.getAttendanceDate() != null && ar.getAttendanceDate().equals(today) && Boolean.TRUE.equals(ar.getIsLate()))
                .toList();

            for (AttendanceRecord record : lateRecords) {
                Employee emp = record.getEmployee();
                if (emp == null || emp.getUser() == null) continue;

                notificationService.send(
                    emp.getUser().getId(),
                    NotificationType.LATE_ARRIVAL_FLAGGED,
                    "Late Arrival Flagged",
                    "Your check-in at " + record.getCheckIn() + " on " + today + " was flagged as late.",
                    "/attendance",
                    record.getId(),
                    "ATTENDANCE",
                    NotificationPriority.MEDIUM
                );
            }
        } finally {
            TenantContext.clear();
        }
    }

    // ── 7. Monthly Emiratization Compliance Report Trigger (1st of month at 09:00) ──
    @Scheduled(cron = "0 0 9 1 * *", zone = "Asia/Dubai")
    public void emiratizationReportReminder() {
        TenantContext.setTenantId(defaultTenantId);
        try {
            log.info("Triggering monthly Emiratization compliance report alert");

            List<User> hrAdmins = userRepository.findActiveUsersByRole(Role.HRMS_ADMIN);
            for (User admin : hrAdmins) {
                notificationService.send(
                    admin.getId(),
                    NotificationType.EMIRATIZATION_REPORT_READY,
                    "Emiratization Report Due",
                    "Monthly Emiratization compliance report is due. Tap to view report details.",
                    "/reports",
                    null,
                    "COMPLIANCE_REPORT",
                    NotificationPriority.HIGH
                );
            }
        } finally {
            TenantContext.clear();
        }
    }
}
