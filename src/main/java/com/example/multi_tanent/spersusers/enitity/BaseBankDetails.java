package com.example.multi_tanent.spersusers.enitity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "base_bank_details")
@Getter
@Setter
public class BaseBankDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Relationship
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id")
    private BaseCustomer party;

    // Fields
    @Column(name = "bank_name")
    private String bankName;

    @Column(name = "account_number")
    private String accountNumber;

    @Column(name = "ifs_code")
    private String ifsCode;

    @Column(name = "iban_code")
    private String ibanCode;

    @Column(name = "corporate_id")
    private String corporateId;

    @Column(name = "location_branch")
    private String locationBranch;

    @Column(name = "branch_address", columnDefinition = "TEXT")
    private String branchAddress;

    @Column(name = "beneficiary_mail_id")
    private String beneficiaryMailId;
}
