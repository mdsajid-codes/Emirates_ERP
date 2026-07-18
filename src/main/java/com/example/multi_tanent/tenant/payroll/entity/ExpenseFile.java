package com.example.multi_tanent.tenant.payroll.entity;

import com.fasterxml.jackson.annotation.JsonBackReference;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "expense_files")
@Data
public class ExpenseFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "expense_id", nullable = false)
    @JsonBackReference
    private Expense expense;

    @Column(nullable = false, name = "file_path")
    private String filePath;

    @Column(nullable = false, name = "original_filename")
    private String originalFilename;
}