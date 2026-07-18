package com.example.multi_tanent.tenant.base.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "work_type")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkType {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, length = 50, nullable = false)
    private String code;

    @Column(length = 150, nullable = false)
    private String name;
}
