package com.example.multi_tanent.tenant.employee.dto;

import com.example.multi_tanent.tenant.employee.entity.TimeAttendence;
import lombok.Data;

@Data
public class TimeAttendenceResponse {
    private Long id;
    private String employeeCode;
    private SimpleObjectDto timeType;
    private SimpleObjectDto workType;
    private SimpleObjectDto weeklyOffPolicy;
    private SimpleObjectDto leaveGroup;
    private SimpleObjectDto attendancePolicy;
    private String attendenceCaptureScheme;
    private String holidayList;
    private String expensePolicy;
    private Boolean isRosterBasedEmployee;

    @Data
    private static class SimpleObjectDto {
        private Long id;
        private String name;

        static SimpleObjectDto from(Long id, String name) {
            if (id == null) return null;
            SimpleObjectDto dto = new SimpleObjectDto();
            dto.setId(id);
            dto.setName(name);
            return dto;
        }
    }

    public static TimeAttendenceResponse fromEntity(TimeAttendence entity) {
        if (entity == null) {
            return null;
        }
        TimeAttendenceResponse dto = new TimeAttendenceResponse();
        dto.setId(entity.getId());
        if (entity.getEmployee() != null) {
            dto.setEmployeeCode(entity.getEmployee().getEmployeeCode());
        }
        if (entity.getTimeType() != null) {
            dto.setTimeType(SimpleObjectDto.from(entity.getTimeType().getId(), entity.getTimeType().getName()));
        }
        if (entity.getWorkType() != null) {
            dto.setWorkType(SimpleObjectDto.from(entity.getWorkType().getId(), entity.getWorkType().getName()));
        }
        if (entity.getWeeklyOffPolicy() != null) {
            dto.setWeeklyOffPolicy(SimpleObjectDto.from(entity.getWeeklyOffPolicy().getId(), entity.getWeeklyOffPolicy().getName()));
        }
        if (entity.getLeaveGroup() != null) {
            dto.setLeaveGroup(SimpleObjectDto.from(entity.getLeaveGroup().getId(), entity.getLeaveGroup().getName()));
        }
        if (entity.getAttendancePolicy() != null) {
            dto.setAttendancePolicy(SimpleObjectDto.from(entity.getAttendancePolicy().getId(), entity.getAttendancePolicy().getPolicyName()));
        }
        dto.setAttendenceCaptureScheme(entity.getAttendenceCaptureScheme());
        dto.setHolidayList(entity.getHolidayList());
        dto.setExpensePolicy(entity.getExpensePolicy());
        dto.setIsRosterBasedEmployee(entity.getIsRosterBasedEmployee());
        return dto;
    }
}
