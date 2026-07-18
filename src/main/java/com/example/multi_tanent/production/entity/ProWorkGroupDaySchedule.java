package com.example.multi_tanent.production.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.DayOfWeek;
import java.time.LocalTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pro_work_group_day_schedules", uniqueConstraints = {
    @UniqueConstraint(columnNames = { "workgroup_id", "day_of_week" })
})
public class ProWorkGroupDaySchedule {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @ManyToOne(optional = false, fetch = FetchType.LAZY)
  @JoinColumn(name = "workgroup_id")
  private ProWorkGroup proworkgroup;

  @Enumerated(EnumType.STRING)
  @Column(name = "day_of_week", nullable = false, length = 9)
  private DayOfWeek dayOfWeek; // MONDAY ... SUNDAY

  /** empty fields in UI => nulls allowed */
  @Column(name = "start_time")
  private LocalTime startTime;

  @Column(name = "end_time")
  private LocalTime endTime;

  public Integer durationMinutes() {
    if (startTime == null || endTime == null)
      return null;
    return (int) java.time.Duration.between(startTime, endTime).toMinutes();
  }
}
