package com.example.multi_tanent.master.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "my_bank_details")
@Data
public class MyBankDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "my_company_info_id", nullable = false)
    @JsonIgnore
    @ToString.Exclude
    @EqualsAndHashCode.Exclude
    private MyCompanyInfo myCompanyInfo;

    @Column(nullable = false, name = "bank_name")
    private String bankName;

    @Column(nullable = false, name = "account_number")
    private String accountNumber;

    @Column(nullable = false, name = "ifsc_code")
    private String ifscCode;

    @Column(name = "account_holder_name")
    private String accountHolderName;

    @Column(name = "branch_name")
    private String branchName;

    @Column(name = "swift_code")
    private String swiftCode; // Added for international transfers if needed

    @Column(name = "iban")
    private String iban; // International Bank Account Number

    @Column(name = "is_primary")
    private boolean isPrimary; // For the primary salary disbursement account
}
