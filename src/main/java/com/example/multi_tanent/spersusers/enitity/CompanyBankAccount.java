package com.example.multi_tanent.spersusers.enitity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.ToString;

@Entity
@Table(name = "company_bank_accounts")
@Data
public class CompanyBankAccount {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_info_id", nullable = false)
    @JsonIgnore // Avoid serialization loops
    @ToString.Exclude // Avoid recursion in toString()
    @EqualsAndHashCode.Exclude // Avoid recursion in equals/hashCode
    private CompanyInfo companyInfo;

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

    @Column(name = "is_primary")
    private Boolean isPrimary; // For the primary salary disbursement account
}